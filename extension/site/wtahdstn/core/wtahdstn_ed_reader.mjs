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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The worklist stores dates as YYYY-MM-DD with 00 for unknown parts, e.g. 1905-00-00 or 1919-02-12.
function worklistDateToString(iso) {
  let m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || "");
  if (!m || parseInt(m[1]) == 0) {
    return "";
  }
  let day = parseInt(m[3]);
  let month = parseInt(m[2]);
  if (month && day) {
    return day + " " + monthNames[month - 1] + " " + m[1];
  }
  return month ? monthNames[month - 1] + " " + m[1] : m[1];
}

class WtahdstnEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // A headstone marks a burial. Sourcer's burial sentence then reads "X died on <date> and was buried at <cemetery>".
    this.recordType = RT.Burial;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    let forenames = this.ed.givenNames;
    if (this.ed.suffix) {
      forenames += " " + this.ed.suffix;
    }
    let nameObj = this.makeNameObjFromForenamesAndLastName(forenames, this.ed.lastName);
    return nameObj;
  }

  getGender() {
    return "";
  }

  // The stone gives the date of death, not of the burial, so there is no event date (that is the burial date)
  getEventDateObj() {
    return undefined;
  }

  // The cemetery is the place the stone tells us about.
  getEventPlaceObj() {
    let c = this.ed.cemetery;
    if (!c) {
      return undefined;
    }
    let parts = [c.name, c.city, c.county, c.state, c.country].filter((p) => p);
    return parts.length ? this.makePlaceObjFromFullPlaceName(parts.join(", ")) : undefined;
  }

  getLastNameAtBirth() {
    return this.ed.maidenName || "";
  }

  getLastNameAtDeath() {
    return this.ed.lastName;
  }

  getBirthDateObj() {
    let dateString = worklistDateToString(this.ed.birthDate);
    return dateString ? this.makeDateObjFromDateString(dateString) : undefined;
  }

  getDeathDateObj() {
    let dateString = worklistDateToString(this.ed.deathDate);
    return dateString ? this.makeDateObjFromDateString(dateString) : undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    return "";
  }

  getOccupation() {
    return "";
  }

  getSpouses() {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { WtahdstnEdReader };
