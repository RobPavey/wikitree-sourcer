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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

const baseRecordTypeData = {
  rules: {
    fullName: {
      edKeys: ["name"],
    },
    forenames: {
      edKeys: ["forenames"],
    },
    lastName: {
      edKeys: ["surname"],
      convertNameFromAllCapsToMixedCase: true,
    },
    gender: {
      edKeys: ["sex"],
    },
    eventDate: {
      edKeys: ["burialDate"],
    },
  },
  advancedNameRules: {
    inFullNameLastNamesIsInUpperCase: true,
  },
};

const burialRecordTypeData = {
  recordType: RT.Burial,
};

function getCorrectlyCasedPlaceName(placeName) {
  if (placeName && StringUtils.isAllUppercase(placeName)) {
    return NameUtils.convertNameFromAllCapsToMixedCase(placeName);
  }
  return placeName;
}

class YorkshireburialsEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.baseRecordTypeData = baseRecordTypeData;
    this.recordTypeData = burialRecordTypeData;
    this.recordType = RT.Burial;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false;
    }
    return this.ed.name || this.ed.surname ? true : false;
  }

  getEventPlaceObj() {
    let parts = [];
    for (let part of [this.ed.cemetery, this.ed.parish, this.ed.county]) {
      if (part) {
        parts.push(getCorrectlyCasedPlaceName(part));
      }
    }
    if (!parts.length) {
      return undefined;
    }
    parts.push("England");

    let placeObj = this.makePlaceObjFromFullPlaceName(parts.join(", "));
    if (placeObj) {
      if (this.ed.county) {
        placeObj.county = this.ed.county;
      }
      placeObj.country = "England";
    }
    return placeObj;
  }

  getLastNameAtDeath() {
    let nameObj = this.getNameObj();
    if (nameObj) {
      return nameObj.inferLastName();
    }
    return "";
  }

  getBirthDateObj() {
    // The site's birth year is computed from the age at burial so only use it if there is no age
    if (!this.ed.age && this.ed.birthYear && /^\d\d\d\d$/.test(this.ed.birthYear)) {
      return this.makeDateObjFromYear(this.ed.birthYear);
    }
    return undefined;
  }

  getAgeAtDeath() {
    let age = this.ed.age;
    if (!age) {
      return "";
    }

    age = age.trim().toLowerCase();
    let yearsMatch = age.match(/^(\d+)\s*(?:years?|yrs?)?$/);
    if (yearsMatch) {
      return yearsMatch[1];
    }
    return age;
  }

  getOccupation() {
    return this.ed.trade;
  }
}

export { YorkshireburialsEdReader };
