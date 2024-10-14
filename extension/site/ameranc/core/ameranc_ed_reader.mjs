/*
MIT License

Copyright (c) 2020 Robert M Pavey

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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

const recordTypeMatches = [
  {
    recordType: RT.Census,
    requiredFields: [["Census"]],
  },
  {
    recordType: RT.Census,
    collectionTitleMatches: [["Federal Census"]],
  },
];

class AmerancEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    let inputData = {
      collectionTitle: ed.title,
      recordData: ed.recordData,
    };

    this.recordType = this.determineRecordType(recordTypeMatches, inputData);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromAmerancFullName(fullNameString) {
    if (fullNameString) {
      if (StringUtils.isWordAllUpperCase(fullNameString)) {
        let fullName = NameUtils.convertNameFromAllCapsToMixedCase(fullNameString);
        return this.makeNameObjFromFullName(fullName);
      } else {
        let forenames = "";
        let lastName = "";
        let foundLastName = false;
        let parts = fullNameString.split(" ");
        for (let part of parts) {
          if (foundLastName || StringUtils.isWordAllUpperCase(part)) {
            foundLastName = true;
            if (lastName) {
              lastName += " ";
            }
            lastName += part;
          } else {
            if (forenames) {
              forenames += " ";
            }
            forenames += part;
          }
        }

        if (foundLastName) {
          lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);

          let nameObj = new NameObj();
          nameObj.setLastName(lastName);
          nameObj.setForenames(forenames);
          return nameObj;
        } else {
          return this.makeNameObjFromFullName(fullNameString);
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let name = this.getRecordDataValueForKeys(["Name"]);
    return this.makeNameObjFromAmerancFullName(name);
  }

  getGender() {
    let gender = this.getRecordDataValueForKeys(["Gender"]);
    if (gender) {
      return gender.toLowerCase();
    }
    return "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Census) {
      let year = this.getRecordDataValueForKeys(["Census"]);
      if (year) {
        return this.makeDateObjFromYear(year);
      }
    }
    return undefined;
  }

  getEventPlaceObj() {
    let location = this.getRecordDataValueForKeys(["Location"]);
    if (location) {
      if (this.recordType == RT.Census) {
        // sometimes the location has a district name like:
        // Queens (Districts 0001-0250), Queens, New York, United States
        const districtRegex = /^.+\(.+\), (.*)$/;
        if (districtRegex.test(location)) {
          location = location.replace(districtRegex, "$1");
        }
        const notStatedRegex = /^Not Stated, (.*)$/;
        if (notStatedRegex.test(location)) {
          location = location.replace(notStatedRegex, "$1");
        }
      }
      return this.makePlaceObjFromFullPlaceName(location);
    }
    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    let dateString = this.getRecordDataValueForKeys(["Date of Birth"]);
    return this.makeDateObjFromDateString(dateString);
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValueForKeys(["Birth Place"]);
    return this.makePlaceObjFromFullPlaceName(placeString);
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    return this.getRecordDataValueForKeys(["Age"]);
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return this.getRecordDataValueForKeys(["Relationship"]);
  }

  getMaritalStatus() {
    return this.getRecordDataValueForKeys(["Marital Status"]);
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

export { AmerancEdReader };
