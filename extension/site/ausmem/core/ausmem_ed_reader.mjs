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

class AusmemEdReader extends ExtractedDataReader {
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
    if (this.ed.values["full name"]) {
      let name_split = this.ed.values["full name"].trim().split(" ");
      let last_name = name_split[0];
      last_name = last_name.replaceAll(";", " ");
      let first_names = name_split.slice(1).join(" ");
      first_names = first_names.replaceAll(";", " ");
      return this.makeNameObjFromForenamesAndLastName(first_names, last_name);
    }
    return undefined;
  }

  getGender() {
    return "";
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
    if (this.ed.values["date of birth"]) {
      return this.makeDateObjFromDdmmyyyyDate(this.ed.values["date of birth"], "-");
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.ed.values["place of birth"]) {
      return this.makePlaceObjFromFullPlaceName(this.ed.values["place of birth"]);
    }
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

export { AusmemEdReader };
