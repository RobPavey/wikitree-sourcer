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

const recordTypeMatches = [
  {
    recordType: RT.Baptism,
    collectionIds: ["South Australian Church records - Baptisms"],
  },
  {
    recordType: RT.BirthRegistration,
    collectionIds: ["Birth Registrations"],
  },
  {
    recordType: RT.DeathRegistration,
    collectionIds: ["Death Registrations"],
  },
  {
    recordType: RT.MarriageRegistration,
    collectionIds: ["Marriage Registrations"],
  },
];

class GensauEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    let databaseName = ed.databaseName;
    if (databaseName) {
      let typeData = this.getRecordTypeMatch(recordTypeMatches, { collectionId: databaseName });
      if (typeData) {
        this.recordType = typeData.recordType;
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
    let lastName = this.ed.titleSurname;
    let givenNames = this.ed.titleGivenNames;

    if (!lastName) {
      lastName = this.getRecordDataValue("Surname");
    }
    if (!givenNames) {
      givenNames = this.getRecordDataValue("Given Names");
    }

    if (lastName) {
      lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);
    }

    return this.makeNameObjFromForenamesAndLastName(givenNames, lastName);
  }

  getGender() {
    return this.getGenderFromRecordData("Gender", ["M"], ["F"]);
  }

  getEventDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
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
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
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

export { GensauEdReader };
