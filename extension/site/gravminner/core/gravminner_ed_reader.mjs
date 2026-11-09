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
import { DateObj } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

// A memorial is not proof of burial: Gravminner also records cenotaphs and other monuments.
class GravminnerEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.recordType = this.readDate(ed.burialDate) ? RT.Burial : RT.Memorial;
  }

  readDate(text) {
    if (!text) return undefined;
    if (/^\d{4}$/.test(text) && Number(text) > 0) return this.makeDateObjFromYear(text);
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
    if (!match) return undefined;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (!year || month > 12 || day > 31 || (day && !month)) return undefined;
    if (month && day) {
      const check = new Date(0);
      check.setUTCFullYear(year, month - 1, day);
      if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return undefined;
    }
    const result = new DateObj();
    result.dateString = DateUtils.getDateStringFromYearMonthDay(year, month || undefined, day || undefined);
    return result;
  }

  getNameObj() {
    return this.makeNameObjFromForenamesAndLastName(this.ed.forenames, this.ed.lastName);
  }
  getLastNameAtBirth() {
    return this.ed.maidenName || "";
  }
  getLastNameAtDeath() {
    return this.ed.lastName || "";
  }
  getBirthDateObj() {
    return this.readDate(this.ed.birthDate);
  }
  getDeathDateObj() {
    return this.readDate(this.ed.deathDate);
  }
  getEventDateObj() {
    return this.readDate(this.ed.burialDate);
  }
  getEventPlaceObj() {
    if (this.recordType !== RT.Burial) return undefined;
    const place = [this.ed.cemeteryName, this.ed.municipality, this.ed.county, this.ed.country]
      .filter(Boolean)
      .join(", ");
    return place ? this.makePlaceObjFromFullPlaceName(place) : undefined;
  }
  getBirthPlaceObj() {
    return this.ed.birthPlace ? this.makePlaceObjFromFullPlaceName(this.ed.birthPlace) : undefined;
  }
  getDeathPlaceObj() {
    return this.ed.deathPlace ? this.makePlaceObjFromFullPlaceName(this.ed.deathPlace) : undefined;
  }
  getGender() {
    return this.ed.gender === "Kvinne" ? "female" : this.ed.gender === "Mann" ? "male" : "";
  }
}

export { GravminnerEdReader };
