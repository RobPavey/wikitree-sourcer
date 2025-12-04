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

class YadvashemEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
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
    if (this.ed.fields["last name"] && this.ed.fields["first name"]) {
      return this.makeNameObjFromForenamesAndLastName(
        this.ed.fields["first name"],
        this.ed.fields["last name"]
      );
    }
    else if (this.ed.fields["last name"]) {
      return this.makeNameObjFromLastName(this.ed.fields["last name"]);
    }
    else if (this.ed.fields["first name"]) {
      return this.makeNameObjFromForenames(this.ed.fields["first name"]);
    }
    return undefined;
  }

  getGender() {
    if (this.ed.fields["gender"]) {
      return this.ed.fields["gender"].toLowerCase();
    }
    return "";
  }

  getEventDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
    return undefined;
  }

  getLastNameAtBirth() {
    if (this.ed.fields["maiden name"]) {
      return this.ed.fields["maiden name"];
    }
    if (this.ed.fields["gender"].toLowerCase() == "male" && this.ed.fields["last name"]) {
      return this.ed.fields["last name"];
    }
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    if (this.ed.fields["date of birth"]) {
      return this.makeDateObjFromDdmmyyyyDate(this.ed.fields["date of birth"], "/");
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.ed.fields["place of birth"]) {
      return this.makePlaceObjFromFullPlaceName(this.ed.fields["place of birth"]);
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.ed.fields["date of death"]) {
      return this.makeDateObjFromDdmmyyyyDate(this.ed.fields["date of death"], "/");
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.ed.fields["place of death"]) {
      return this.makePlaceObjFromFullPlaceName(this.ed.fields["place of death"]);
    }
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
    if (this.ed.fields["spouse's first name"]) {
      if (this.ed.fields["gender"] && this.ed.fields["gender"].toLowerCase() == "female") {
        return [this.makeSpouseObj(this.makeNameObjFromForenamesAndLastName(this.ed.fields["spouse's first name"], this.ed.fields["last name"]))];
      }
      else {
        return [this.makeSpouseObj(this.makeNameObjFromForenamesAndLastName(this.ed.fields["spouse's first name"], this.ed.fields["spouse's last name"] || this.ed.fields["last name"]))];
      }
    }
    return undefined;
  }

  getParents() {
    let father, mother;
    if (this.ed.fields["father's first name"] || this.ed.fields["father's last name"]) {
      father = this.makeNameObjFromForenamesAndLastName(
        this.ed.fields["father's first name"] || "",
        this.ed.fields["father's last name"] || this.ed.fields["last name"] || ""
      );
    }
    if (this.ed.fields["mother's first name"] || this.ed.fields["mother's maiden name"]) {
      mother = this.makeNameObjFromForenamesAndLastName(
        this.ed.fields["mother's first name"] || "",
        this.ed.fields["mother's maiden name"] || ""
      );
    }
    if (father || mother) {
      let parents = {};
      if (father) {
        parents.father = {};
        parents.father.name = father;
      }
      if (mother) {
        parents.mother = {};
        parents.mother.name = mother;
      }
      return parents;
    }
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { YadvashemEdReader };
