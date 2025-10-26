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
    if (this.ed.person_data == null) return undefined;
    return this.makeNameObjFromForenamesAndLastName(this.ed.person_data["FirstName"], this.ed.person_data["LastName"]);
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
    if (this.ed.person_data == null) return "";

    let name = this.ed.person_data["MaidanName"];
    if (name == null) {
      name = this.ed.person_data["MaidenName"];
    }
    if (name == null) {
      return "";
    }
    return name;
  }

  getLastNameAtDeath() {
    if (this.ed.person_data == null) return "";

    let name = this.ed.person_data["LastName"];
    if (name == null) {
      return "";
    }
    return name;
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    if (this.ed.person_data == null) return undefined;
    return this.makeDateObjFromMmddyyyyDate(this.ed.person_data["Dob"], this.ed.date_sep ? this.ed.date_sep : "/");
  }

  getBirthPlaceObj() {
    if (this.ed.person_data == null) return undefined;
    return this.makePlaceObjFromFullPlaceName(this.ed.person_data["PlaceBirth"]);
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

export { ArolsenarchivesEdReader };
