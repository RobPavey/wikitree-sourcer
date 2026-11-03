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

// The place a burial happened is the cemetery. The WikiTree category name ("Claquato Cemetery, Chehalis, Washington") has
// the town and state, the map's own title has only the cemetery name.
function getCemeteryFullName(ed) {
  return ed.cemeteryCategory || ed.cemeteryName || "";
}

class CemmapEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // A headstone marks a burial. Sourcer's burial sentence then reads "X died on <date> and was buried at <cemetery>".
    this.recordType = RT.Burial;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // The map shows "Mary (Jones) Smith": given names, the name at birth in brackets when it differs, then the last name.
  parseName() {
    let name = this.ed.name || "";
    let match = /^(.*?)\s*\(([^)]+)\)\s*(\S+)$/.exec(name);
    if (match) {
      return { forenames: match[1], maidenName: match[2], lastName: match[3] };
    }
    return { fullName: name };
  }

  getNameObj() {
    let parsed = this.parseName();
    if (parsed.fullName !== undefined) {
      return this.makeNameObjFromFullName(parsed.fullName);
    }
    return this.makeNameObjFromForenamesAndLastName(parsed.forenames, parsed.lastName);
  }

  getGender() {
    return "";
  }

  // The map gives only years, and the map cannot tell the date of burial, so there is no event date
  getEventDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
    let placeName = getCemeteryFullName(this.ed);
    return placeName ? this.makePlaceObjFromFullPlaceName(placeName) : undefined;
  }

  getLastNameAtBirth() {
    let parsed = this.parseName();
    return parsed.maidenName || "";
  }

  getLastNameAtDeath() {
    let parsed = this.parseName();
    if (parsed.lastName) {
      return parsed.lastName;
    }
    let nameObj = this.getNameObj();
    return nameObj ? nameObj.inferLastName() : "";
  }

  getBirthDateObj() {
    return this.ed.birthYear ? this.makeDateObjFromYear(this.ed.birthYear) : undefined;
  }

  getDeathDateObj() {
    return this.ed.deathYear ? this.makeDateObjFromYear(this.ed.deathYear) : undefined;
  }

  getDeathPlaceObj() {
    return this.ed.deathPlace ? this.makePlaceObjFromFullPlaceName(this.ed.deathPlace) : undefined;
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

export { CemmapEdReader };
