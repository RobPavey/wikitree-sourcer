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

/*
 * ed.person_data should look like:
    {
      "__type": "ITSPannel.classes.PersData",
      "ObjId": 70496152,
      "LastName": "KARAKOSTA",
      "FirstName": "Wally",
      "MaidenName": "",
      "PlaceBirth": "",
      "Dob": "11/10/1925",
      "Year": null,
      "MoreDob": false,
      "PrisonerNumber": "",
      "AUCode": null,
      "DescId": "656591",
      "Counter": 0,
      "TreePath": null,
      "Signature": "2.1.1.2 - Nationality/origin of person listed : Various",
      "Father": "",
      "Mother": "",
      "Religion": "",
      "Nationality": "",
      "Occupaton": "",
      "Place_of_incarceration": "",
      "Date_of_decease": "",
      "Last_residence": "",
      "Last_residence_country": "",
      "Last_residence_district": "",
      "Last_residence_province": "",
      "Last_residence_town": "",
      "Last_residence_part_of_town": "",
      "Last_residence_street": "",
      "Last_residence_house_number": ""
    }
 */

class ArolsenarchivesEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex = 0) {
    super(ed);
    this.primaryPersonIndex = primaryPersonIndex;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getPrimaryPersonOptions() {
    let options = [];
    if (this.ed.person_data_list === undefined) return options;

    for (let entry of this.ed.person_data_list) {
      let text = "";
      if (entry["FirstName"]) {
        text += ", " + entry["FirstName"];
      }
      if (entry["LastName"]) {
        text += ", " + entry["LastName"];
      }
      if (entry["MaidanName"]) {
        text += ", born " + entry["MaidanName"];
      }
      if (entry["Dob"]) {
        text += ", born on " + entry["Dob"];
      }
      options.push(text.substring(2));
    }
    return options;
  }

  getSelectedRecord() {
    if (this.ed.person_data) {
      return this.ed.person_data;
    }
    if (this.ed.person_data_list === undefined || this.primaryPersonIndex === undefined) {
      return null;
    }
    if (this.ed.person_data_list.length == 1) {
      return this.ed.person_data_list[0];
    }
    return this.ed.person_data_list[this.primaryPersonIndex];
  }

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
    let person_data = this.getSelectedRecord();
    if (person_data == null) return undefined;
    return this.makeNameObjFromForenamesAndLastName(person_data["FirstName"], person_data["LastName"]);
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
    let person_data = this.getSelectedRecord();
    if (person_data == null) return "";

    let name = person_data["MaidanName"];
    if (name == null) {
      name = person_data["MaidenName"];
    }
    if (name == null) {
      return "";
    }
    return name;
  }

  getLastNameAtDeath() {
    let person_data = this.getSelectedRecord();
    if (person_data == null) return "";

    let name = person_data["LastName"];
    if (name == null) {
      return "";
    }
    return name;
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    let person_data = this.getSelectedRecord();
    if (person_data == null) return undefined;
    return this.makeDateObjFromMmddyyyyDate(person_data["Dob"], this.ed.date_sep ? this.ed.date_sep : "/");
  }

  getBirthPlaceObj() {
    let person_data = this.getSelectedRecord();
    if (person_data == null) return undefined;
    return this.makePlaceObjFromFullPlaceName(person_data["PlaceBirth"]);
  }

  getDeathDateObj() {
    // "Date_of_decease": "19441120",
    let person_data = this.getSelectedRecord();
    if (person_data == null) return undefined;
    if (!person_data["Date_of_decease"]) return undefined;
    const date = person_data["Date_of_decease"];
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return this.makeDateObjFromYyyymmddDate(year + "-" + month + "-" + day, "-");
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

export { ArolsenarchivesEdReader };
