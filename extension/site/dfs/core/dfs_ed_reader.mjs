/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

const months = {
  januar: "Jan",
  jan: "Jan",
  februar: "Feb",
  feb: "Feb",
  marts: "Mar",
  mar: "Mar",
  april: "Apr",
  apr: "Apr",
  maj: "May",
  juni: "Jun",
  jun: "Jun",
  juli: "Jul",
  jul: "Jul",
  august: "Aug",
  aug: "Aug",
  september: "Sep",
  sept: "Sep",
  sep: "Sep",
  oktober: "Oct",
  okt: "Oct",
  octbr: "Oct",
  november: "Nov",
  nov: "Nov",
  december: "Dec",
  dec: "Dec",
};
function recordType(ed) {
  if (ed.imageOnly) return RT.Unclassified;
  if (ed.group === "census") return RT.Census;
  if (ed.group === "skoleprotokol") return RT.SchoolRecords;
  if (ed.group === "laegsruller") return RT.Military;
  const type = (ed.entryType || "").toLowerCase();
  if (/fød|fødsel/.test(type) && /døb|dåb/.test(type)) return RT.BirthOrBaptism;
  if (/død/.test(type) && /begrav/.test(type)) return RT.DeathOrBurial;
  if (/fød/.test(type)) return RT.Birth;
  if (/døb|dåb/.test(type)) return RT.Baptism;
  if (/konfirm/.test(type)) return RT.Confirmation;
  // An image headed Viede/Trolovede can contain betrothals as well as marriages.
  if (/trolov/.test(type)) return RT.OtherChurchEvent;
  if (/viel|viede|ægteviede/.test(type)) return RT.Marriage;
  if (/begrav/.test(type)) return RT.Burial;
  if (/død/.test(type)) return RT.Death;
  return ed.group === "churchbook" ? RT.OtherChurchEvent : RT.Unclassified;
}
class DfsEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.recordType = recordType(ed);
  }
  getSourceType() {
    return this.ed.imageOnly ? "image" : "record";
  }
  field(...keys) {
    for (const key of keys) if (this.ed.fields?.[key]) return this.ed.fields[key];
    return "";
  }
  readDate(value, approximate = false) {
    if (!value) return undefined;
    const normalized = String(value)
      .trim()
      .replace(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/, (_, day, month, year) =>
        DateUtils.getDateStringFromYearMonthDay(Number(year), Number(month), Number(day))
      )
      .replace(/([A-Za-zÆØÅæøå]+)\.?/g, (word) => months[word.replace(/\.$/, "").toLowerCase()] || word)
      .replace(/^(?:ca\.?|cirka)\s*/i, "about ");
    const date = this.makeDateObjFromDateString(normalized);
    if (!date || !DateUtils.parseDateString(date.getDateString()).isValid) return undefined;
    if (date && approximate) date.qualifier = dateQualifiers.ABOUT;
    return date;
  }
  getNameObj() {
    return this.ed.imageOnly ? undefined : this.makeNameObjFromFullName(this.ed.fullName);
  }
  getGender() {
    return { Mand: "male", M: "male", Kvinde: "female", K: "female" }[this.field("Køn")] || "";
  }
  getEventDateObj() {
    return this.ed.imageOnly ? undefined : this.readDate(this.ed.eventDate);
  }
  getEventPlaceObj() {
    return !this.ed.imageOnly && this.ed.locality ? this.makePlaceObjFromFullPlaceName(this.ed.locality) : undefined;
  }
  getBirthDateObj() {
    if (this.ed.imageOnly) return undefined;
    const explicit = this.field("Fødselsdato", "Født år");
    return (
      this.readDate(explicit, this.ed.group === "census" && /^\d{4}$/.test(explicit)) ||
      (this.recordType === RT.Birth ? this.getEventDateObj() : undefined)
    );
  }
  getDeathDateObj() {
    return this.readDate(this.field("Dødsdato")) || (this.recordType === RT.Death ? this.getEventDateObj() : undefined);
  }
  getBirthPlaceObj() {
    const place = this.field("Fødested", "Født sted");
    return place ? this.makePlaceObjFromFullPlaceName(place.replace(/^do\.?\s*\[([^\]]+)\]$/i, "$1")) : undefined;
  }
  getDeathPlaceObj() {
    const place = this.field("Dødssted");
    return place ? this.makePlaceObjFromFullPlaceName(place) : undefined;
  }
  getAgeAtEvent() {
    return this.field("Alder");
  }
  getOccupation() {
    return this.field("Erhverv");
  }
  getMaritalStatus() {
    return this.marital(this.field("Civilstand"));
  }
  marital(value) {
    return (
      { Gift: "married", Ugift: "single", Enke: "widowed", Enkemand: "widowed", Fraskilt: "divorced" }[value] || value
    );
  }
  getRelationshipToHead() {
    return this.relationship(this.field("Stilling i husstanden"), this.getGender());
  }
  relationship(value, gender) {
    if (/^Deres (barn|børn)$/i.test(value)) return gender === "male" ? "son" : gender === "female" ? "daughter" : value;
    // Translate only explicit relationships; occupations and ambiguous descriptions stay verbatim.
    return (
      {
        Husfader: "head",
        Husmoder: "head",
        "Hans kone": "wife",
        Hustru: "wife",
        "Deres søn": "son",
        "Deres datter": "daughter",
        Tjenestepige: "servant",
        Tjenestekarl: "servant",
        Logerende: "lodger",
      }[value] || value
    );
  }
  getParents() {
    return this.ed.imageOnly
      ? undefined
      : this.makeParentsFromFullNames(this.ed.fatherFullName, this.ed.motherFullName);
  }
  getSpouses() {
    if (!this.ed.spouseFullName || this.ed.imageOnly) return undefined;
    return [
      this.makeSpouseObj(
        this.makeNameObjFromFullName(this.ed.spouseFullName),
        this.recordType === RT.Marriage ? this.getEventDateObj() : undefined,
        this.recordType === RT.Marriage ? this.getEventPlaceObj() : undefined,
        ""
      ),
    ];
  }
  getHousehold() {
    if (this.recordType !== RT.Census || !this.ed.household?.length) return undefined;
    return {
      fields: ["name", "gender", "age", "birthYear", "maritalStatus", "relationship", "occupation"],
      members: this.ed.household.map((p) => ({
        name: p.Navn,
        gender: { Mand: "male", Kvinde: "female", M: "male", K: "female" }[p.Køn] || "",
        age: p.Alder || "",
        birthYear: p["Født år"] || "",
        maritalStatus: this.marital(p.Civilstand || ""),
        relationship: this.relationship(
          p.Information || "",
          { Mand: "male", Kvinde: "female", M: "male", K: "female" }[p.Køn]
        ),
        occupation: p.Erhverv || "",
        link: p.url,
        isSelected: "cid" + p.id === this.ed.recordId,
      })),
    };
  }
  setCustomFields(gd) {
    if (this.ed.group === "laegsruller") gd.overrideRefTitle = "Military levy registration";
  }
}
export { DfsEdReader, recordType };
