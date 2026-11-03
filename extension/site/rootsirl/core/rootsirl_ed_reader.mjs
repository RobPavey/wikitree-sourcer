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

import { RT } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

// The record type is given by the "type" parameter in the record URL. The page title also says it,
// but it can't be trusted on the reCAPTCHA page.
const recordTypeData = {
  bch: { recordType: RT.Baptism, isChurch: true, overrideRefTitle: "Church Baptism" },
  bcv: { recordType: RT.BirthRegistration, isChurch: false, overrideRefTitle: "Civil Birth Registration" },
  mch: { recordType: RT.Marriage, isChurch: true, overrideRefTitle: "Church Marriage" },
  mcv: { recordType: RT.MarriageRegistration, isChurch: false, overrideRefTitle: "Civil Marriage Registration" },
  dch: { recordType: RT.Burial, isChurch: true, overrideRefTitle: "Church Burial" },
  dcv: { recordType: RT.DeathRegistration, isChurch: false, overrideRefTitle: "Civil Death Registration" },
};

// The six counties of Northern Ireland, which used that name for records from 1922 onward
const northernIrelandCounties = ["Antrim", "Armagh", "Derry", "Londonderry", "Down", "Fermanagh", "Tyrone"];

// Lower-case words in tidied place names, e.g. "ARDAGH AND MOYDOW" becomes "Ardagh and Moydow"
const minorWords = ["and", "of", "the", "in", "on", "at", "by", "with"];

function tidyCapitals(text) {
  // Only change text that is all in capitals. Mixed case text was typed that way by the centre.
  if (!text || !StringUtils.isAllUppercase(text.replace(/[^A-Za-z]/g, ""))) {
    return text;
  }
  let words = text.toLowerCase().split(/(\s+|-)/);
  return words
    .map(function (word, index) {
      if (index > 0 && minorWords.includes(word)) {
        return word;
      }
      // keep abbreviations like "NO.2" or "CR.DED" readable: capitalise each letter run after a dot
      return word.replace(/(^|[.'(])([a-z])/g, function (match, before, letter) {
        return before + letter.toUpperCase();
      });
    })
    .join("");
}

function getCountyName(countyText) {
  // "Co. Kerry" or "Monaghan" becomes "Kerry"
  if (!countyText) {
    return "";
  }
  return countyText.replace(/^co\.?\s+/i, "").trim();
}

function parseAge(ageText) {
  // "42" and "76 Yrs" give a number; "Full Age (Over 21)" is not an exact age so it is not used
  if (!ageText) {
    return "";
  }
  let match = ageText.trim().match(/^(\d+)\s*(years?|yrs?)?\.?$/i);
  return match ? match[1] : "";
}

function makeDateString(dateText) {
  // The site writes dates as "13-Mar-1901". Sourcer's usual form is "13 Mar 1901".
  if (!dateText) {
    return "";
  }
  return dateText.trim().replace(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/, "$1 $2 $3");
}

function standardizeStatus(statusText) {
  // e.g. "Bachelor (Previously unmarried)", "Spinster", "Not Married", "Married", "Widow"
  if (!statusText) {
    return "";
  }
  let lc = statusText.toLowerCase();
  if (/^(bachelor|spinster|not married|single|unmarried)/.test(lc)) {
    return "single";
  }
  if (/^widow/.test(lc)) {
    return "widowed";
  }
  if (/^married/.test(lc)) {
    return "married";
  }
  return statusText;
}

class RootsirlEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);

    this.primaryPersonIndex = primaryPersonIndex;

    let typeData = recordTypeData[ed.recordTypeCode];
    if (typeData) {
      this.setRecordData(typeData);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  isChurchRecord() {
    return this.recordTypeData && this.recordTypeData.isChurch ? true : false;
  }

  isMarriage() {
    return this.recordType == RT.Marriage || this.recordType == RT.MarriageRegistration;
  }

  isWifePrimary() {
    return this.isMarriage() && this.primaryPersonIndex == 1;
  }

  getField(label) {
    return this.ed.recordData ? this.ed.recordData[label] : undefined;
  }

  getSection(heading) {
    return this.ed.sections ? this.ed.sections[heading] : undefined;
  }

  getPrimarySection() {
    return this.getSection(this.isWifePrimary() ? "Wife" : "Husband");
  }

  getSpouseSection() {
    return this.getSection(this.isWifePrimary() ? "Husband" : "Wife");
  }

  getSectionName(section, requireForenames = false) {
    if (!section || (!section.forenames && !section.surname)) {
      return undefined;
    }
    if (requireForenames && !section.forenames) {
      return undefined; // e.g. a father recorded only as "Smyth"
    }
    return this.makeNameObjFromForenamesAndLastName(section.forenames, section.surname);
  }

  getSectionFullName(section) {
    let parts = [];
    if (section && section.forenames) {
      parts.push(section.forenames);
    }
    if (section && section.surname) {
      parts.push(section.surname);
    }
    return parts.join(" ");
  }

  getCountry() {
    let county = getCountyName(this.getField("County"));
    if (northernIrelandCounties.includes(county)) {
      let dateObj = this.getEventDateObj();
      let year = dateObj ? Number(dateObj.getYearString()) : 0;
      if (year >= 1922) {
        return "Northern Ireland";
      }
    }
    return "Ireland";
  }

  makePlace(parts) {
    let usedParts = parts.filter(Boolean);
    let county = getCountyName(this.getField("County"));
    if (county) {
      usedParts.push("County " + county);
    }
    usedParts.push(this.getCountry());
    let placeObj = this.makePlaceObjFromFullPlaceName(usedParts.join(", "));
    if (placeObj && county) {
      placeObj.county = "County " + county;
    }
    return placeObj;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success || !this.recordTypeData) {
      return false;
    }
    return true;
  }

  getNameObj() {
    if (this.isMarriage()) {
      return this.getSectionName(this.getPrimarySection());
    }
    if (this.getField("Forenames") || this.getField("Surname")) {
      return this.makeNameObjFromForenamesAndLastName(this.getField("Forenames"), this.getField("Surname"));
    }
    return this.makeNameObjFromFullName(this.getField("Name"));
  }

  getGender() {
    if (this.isMarriage()) {
      return this.isWifePrimary() ? "female" : "male";
    }
    let sex = this.getField("Gender") || this.getField("Sex");
    if (sex) {
      if (/^m/i.test(sex)) {
        return "male";
      }
      if (/^f/i.test(sex)) {
        return "female";
      }
    }
    return "";
  }

  getEventDateObj() {
    let dateString = "";
    switch (this.recordType) {
      case RT.Baptism:
        dateString = this.getField("Date of Baptism") || this.getField("Date of Birth");
        break;
      case RT.BirthRegistration:
        dateString = this.getField("Date of Birth");
        break;
      case RT.Marriage:
      case RT.MarriageRegistration:
        dateString = this.getField("Date of Marriage");
        break;
      case RT.Burial:
      case RT.DeathRegistration:
        dateString = this.getField("Date of Death");
        break;
    }
    return dateString ? this.makeDateObjFromDateString(makeDateString(dateString)) : undefined;
  }

  getEventPlaceObj() {
    // A church record's parish is a place, so it is included. A civil record's "Parish / District" is a
    // registration district, which is returned by getRegistrationDistrict instead.
    let parish = this.getField("Parish / District");
    if (this.isChurchRecord() && parish) {
      let parts = [tidyCapitals(parish)];
      let graveyardSection = this.getSection("Graveyard");
      let graveyard = graveyardSection ? graveyardSection["Graveyard"] : "";
      if (this.recordType == RT.Burial && graveyard && graveyard.toLowerCase() != parish.toLowerCase()) {
        parts.unshift(tidyCapitals(graveyard));
      }
      return this.makePlace(parts);
    }
    return this.makePlace([]);
  }

  getLastNameAtBirth() {
    // On a marriage the wife is recorded under her maiden name
    if (this.isWifePrimary()) {
      let wife = this.getSection("Wife");
      return wife && wife.surname ? wife.surname : "";
    }
    return "";
  }

  getBirthDateObj() {
    if (this.recordType == RT.Baptism || this.recordType == RT.BirthRegistration) {
      let dateString = this.getField("Date of Birth");
      return dateString ? this.makeDateObjFromDateString(makeDateString(dateString)) : undefined;
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Burial || this.recordType == RT.DeathRegistration) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getResidencePlaceObj() {
    // Marriage addresses can be anywhere (e.g. "Glasgow"), so only use the address of births and deaths,
    // where it is a place in the county of the record
    if (this.isMarriage()) {
      return undefined;
    }
    let address = this.getField("Address");
    if (!address) {
      return undefined;
    }
    return this.makePlace([tidyCapitals(address.replace(/[\s.,]+$/, ""))]);
  }

  getAgeAtEvent() {
    if (this.isMarriage()) {
      let section = this.getPrimarySection();
      return section ? parseAge(section["Age"]) : "";
    }
    return "";
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Burial || this.recordType == RT.DeathRegistration) {
      return parseAge(this.getField("Age"));
    }
    return "";
  }

  getParishName() {
    // the church parish, e.g. "Ardagh and Moydow", for church records only
    let parish = this.getField("Parish / District");
    return this.isChurchRecord() && parish ? tidyCapitals(parish) : "";
  }

  getDistrictName() {
    // e.g. "GALWAY NO.2" or "NEWTOWNGORE CIVIL REGISTRATION DISTRICT". These are registrars' districts, which
    // Sourcer's standard wording ("Superintendent Registrar's District") does not fit, so this is used only in the
    // source reference and not returned from getRegistrationDistrict.
    let district = this.getField("Parish / District");
    if (this.recordTypeData && !this.isChurchRecord() && district) {
      return tidyCapitals(district.replace(/\s+civil registration district$/i, ""));
    }
    return "";
  }

  getMaritalStatus() {
    if (this.isMarriage()) {
      let section = this.getPrimarySection();
      return section ? standardizeStatus(section["Status"]) : "";
    }
    return standardizeStatus(this.getField("Status"));
  }

  getOccupation() {
    if (this.isMarriage()) {
      let section = this.getPrimarySection();
      return section ? tidyCapitals(section["Occupation"]) : "";
    }
    // on births the occupation is the father's, so it is not the person's occupation
    if (this.recordType == RT.Burial || this.recordType == RT.DeathRegistration) {
      return tidyCapitals(this.getField("Occupation"));
    }
    return "";
  }

  getSpouses() {
    if (!this.isMarriage()) {
      return undefined;
    }
    let spouseSection = this.getSpouseSection();
    let spouseNameObj = this.getSectionName(spouseSection);
    if (!spouseNameObj) {
      return undefined;
    }
    let spouse = this.makeSpouseObj(
      spouseNameObj,
      this.getEventDateObj(),
      this.getEventPlaceObj(),
      parseAge(spouseSection["Age"])
    );
    if (spouse) {
      spouse.personGender = this.isWifePrimary() ? "male" : "female";
    }
    return [spouse];
  }

  getParents() {
    if (this.isMarriage()) {
      let prefix = this.isWifePrimary() ? "Wife's" : "Husband's";
      let fatherNameObj = this.getSectionName(this.getSection(prefix + " Father"), true);
      let motherNameObj = this.getSectionName(this.getSection(prefix + " Mother"), true);
      if (fatherNameObj || motherNameObj) {
        return this.makeParentsFromNameObjs(fatherNameObj, motherNameObj);
      }
      return undefined;
    }
    if (this.recordType == RT.Baptism || this.recordType == RT.BirthRegistration) {
      let father = this.getField("Father");
      let mother = this.getField("Mother");
      if (father || mother) {
        return this.makeParentsFromFullNames(father, mother);
      }
    }
    return undefined;
  }

  getOtherPeople() {
    // Sponsors (baptisms), witnesses (marriages) and informants (births and deaths), as written on the record
    let result = [];
    if (this.isMarriage()) {
      for (let heading of ["Witness 1", "Witness 2"]) {
        let name = this.getSectionFullName(this.getSection(heading));
        if (name) {
          result.push({ role: "Witness", name: name });
        }
      }
      return result;
    }
    let informant = this.getSection("Informant");
    if (informant && informant["Name"]) {
      let name = informant["Name"];
      if (informant["Relationship"]) {
        name += " (" + informant["Relationship"].toLowerCase() + ")";
      }
      result.push({ role: "Informant", name: name });
      return result;
    }
    for (let label of ["Sponsor 1 / Informant 1", "Sponsor 2 / Informant 2"]) {
      let name = this.getField(label);
      if (name) {
        result.push({ role: this.recordType == RT.Baptism ? "Sponsor" : "Informant", name: name });
      }
    }
    return result;
  }

  getPrimaryPersonOptions() {
    if (!this.isMarriage()) {
      return undefined;
    }
    let husbandName = this.getSectionFullName(this.getSection("Husband"));
    let wifeName = this.getSectionFullName(this.getSection("Wife"));
    if (husbandName && wifeName) {
      return [husbandName + " (husband)", wifeName + " (wife)"];
    }
    return undefined;
  }
}

export { RootsirlEdReader };
