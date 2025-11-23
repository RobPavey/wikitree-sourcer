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

import { DateUtils } from "../../../base/core/date_utils.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";

class SosmogovEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    if (ed.collectionName && ed.collectionName.includes("Death")) {
      this.recordType = RT.DeathRegistration;
      this.isDeath = true;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromFirstNamesAndLastName(firstNames, lastName) {
    if (firstNames || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setFirstNames(firstNames);
      return nameObj;
    }
  }

  makeNameObjFromFirstNameMiddleNameAndLastName(firstName, middleName, lastName) {
    if (firstName || middleName || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setMiddleName(middleName);
      nameObj.setFirstName(firstName);
      return nameObj;
    }
  }

  cleanDateString(dateString) {
    if (dateString) {
      return dateString.replace("_ _, ", "").replace(" _, ", " ");
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.ed.recordData) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  // getNameObj() {
  getNameObj(inputRole) {
    let role = "";
    if (!inputRole) {
      role = "Deceased";
    } else {
      role = inputRole;
    }
    //  ** chgd "Deceased" to role **
    let nameParts = [];
    if (this.ed.recordData[role]) {
      if (this.ed.recordData[role].indexOf("  ") >= 0) {
        // if 2 consecutive spaces exist, that means there is no middle name, and it's a delimiter for the first and last name strings
        nameParts = this.ed.recordData[role].split("  ");
        // console.log('nameParts = ' + nameParts);
        return this.makeNameObjFromFirstNamesAndLastName(nameParts[0], nameParts[1]);
      } else if (this.ed.recordData[role].split(" ").length == 3) {
        // if exactly 3 parts are separated by single spaces, then the parts are first, middle, and last names
        nameParts = this.ed.recordData[role].split(" ");
        // console.log('nameParts = ' + nameParts);
        return this.makeNameObjFromFirstNameMiddleNameAndLastName(nameParts[0], nameParts[1], nameParts[2]);
      } else {
        // otherwise, just set full name
        // console.log('set full name');
        return this.makeNameObjFromFullName(this.ed.recordData[role]);
      }
    } else {
      return undefined;
    }
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    if (this.ed.recordData["Date of Death"]) {
      let dateObj = this.makeDateObjFromDateString(this.cleanDateString(this.ed.recordData["Date of Death"]));
      dateObj.qualifier = dateQualifiers.EXACT;
      return dateObj;
    } else {
      return undefined;
    }
  }

  getEventPlaceObj() {
    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    let nameAtDeathObj = this.getNameObj();
    if (nameAtDeathObj && nameAtDeathObj.lastName) {
      return nameAtDeathObj.lastName;
    }
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
    if (this.ed.recordData["Date of Death"]) {
      let dateObj = this.makeDateObjFromDateString(this.cleanDateString(this.ed.recordData["Date of Death"]));
      dateObj.qualifier = dateQualifiers.EXACT;
      return dateObj;
    } else {
      return undefined;
    }
  }

  getDeathPlaceObj() {
    if (this.ed.recordData["County"]) {
      let placeString = this.ed.recordData["County"];
      if (placeString != "St. Louis City") {
        placeString += " County";
      }
      placeString += ", Missouri, United States of America";
      return this.makePlaceObjFromFullPlaceName(placeString);
    } else {
      return undefined;
    }
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    if (this.ed.recordData["Age"]) {
      return this.ed.recordData["Age"];
    } else {
      return "";
    }
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
    let spouseNameObj = this.getNameObj("Spouse");
    if (spouseNameObj) {
      let spouseObj = this.makeSpouseObj(spouseNameObj);
      if (spouseObj) {
        return [spouseObj];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getParents() {
    let parents = {};
    let fatherNameObj = this.getNameObj("Father");
    if (fatherNameObj) {
      parents.father = {};
      parents.father.name = fatherNameObj;
    }
    let motherNameObj = this.getNameObj("Mother");
    if (motherNameObj) {
      parents.mother = {};
      parents.mother.name = motherNameObj;
    }
    if (fatherNameObj || motherNameObj) {
      return parents;
    } else {
      return undefined;
    }
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { SosmogovEdReader };
