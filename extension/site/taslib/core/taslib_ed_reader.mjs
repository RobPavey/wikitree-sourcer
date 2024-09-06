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

class TaslibEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.recordData) {
      let edType = ed.recordData["Record Type"];
      if (edType == "Births") {
        this.recordType = RT.Birth;
      } else if (edType == "Deaths") {
        let dateOfBurial = ed.recordData["Date of burial"];
        if (dateOfBurial) {
          this.recordType = RT.Burial;
        } else {
          this.recordType = RT.Death;
        }
      } else if (edType == "Marriages") {
        this.recordType = RT.Marriage;
      } else if (edType == "Convicts") {
        this.recordType = RT.ConvictTransportation;
      } else if (edType == "Departures") {
        this.recordType = RT.PassengerList;
      } else if (edType == "Divorces") {
        this.recordType = RT.Divorce;
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

    if (!this.ed.recordData) {
      return false;
    }

    if (!this.recordType) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let name1 = this.ed.recordData["Name"];

    if (this.recordType == RT.Divorce) {
      //   "Name": "Grice, Clarence Vernon - Petitioner",
      //   "Name2": "Grice, Kathleen Elizabeth - Respondent",
      const petitionerSuffix = " - Petitioner";
      if (name1.endsWith(petitionerSuffix)) {
        name1 = name1.substring(0, name1.length - petitionerSuffix.length);
      }
    }

    let nameObj = this.makeNameObjFromLastNameCommaForenames(name1);
    if (nameObj && nameObj.forenames == "Given Name Not Recorded") {
      nameObj.forenames = "";
    }
    return nameObj;
  }

  getGender() {
    let gender = this.ed.recordData["Gender"];
    if (gender) {
      let lcGender = gender.toLowerCase();
      if (lcGender == "male") {
        return "male";
      } else if (lcGender == "female") {
        return "female";
      }
    }
    return "";
  }

  getEventDateObj() {
    let dateString = "";
    if (this.recordType == RT.Birth) {
      dateString = this.ed.recordData["Date of birth"];
    } else if (this.recordType == RT.Death) {
      dateString = this.ed.recordData["Date of death"];
    } else if (this.recordType == RT.Marriage) {
      dateString = this.ed.recordData["Date of marriage"];
    } else if (this.recordType == RT.Burial) {
      dateString = this.ed.recordData["Date of burial"];
    } else if (this.recordType == RT.Divorce) {
      dateString = this.ed.recordData["Year"];
    }

    return this.makeDateObjFromDateString(dateString);
  }

  getEventPlaceObj() {
    let placeString = "";
    if (this.recordType == RT.Birth) {
      placeString = this.ed.recordData["Where born"];
    } else if (this.recordType == RT.Death) {
      placeString = this.ed.recordData["Where died"];
    } else if (this.recordType == RT.Marriage) {
      placeString = this.ed.recordData["Where married"];
    }

    // possibly separate out street address if present

    if (placeString && !placeString.includes("Tasmania") && !placeString.includes("Australia")) {
      placeString += ", Tasmania, Australia";
    }

    return this.makePlaceObjFromFullPlaceName(placeString);
  }

  getLastNameAtBirth() {
    if (this.recordType == RT.Birth) {
      let nameObj = this.getNameObj();
      if (nameObj && nameObj.lastName) {
        return nameObj.lastName;
      }
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.recordType == RT.Death) {
      let nameObj = this.getNameObj();
      if (nameObj && nameObj.lastName) {
        return nameObj.lastName;
      }
    }
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    if (this.recordType == RT.Birth) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Death) {
      return this.getEventDateObj();
    }

    if (this.recordType == RT.Burial) {
      let dateString = this.ed.recordData["Date of death"];
      return this.makeDateObjFromDateString(dateString);
    }

    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let age = this.ed.recordData["Age"];
    // age can be "Adult" or "Minor". Should we exclude these?
    return age;
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Death) {
      return this.getAgeAtEvent();
    }

    return "";
  }

  getRegistrationDistrict() {
    return this.ed.recordData["Registered"];
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
    if (this.recordType == RT.Marriage) {
      let spouseName = this.ed.recordData["Spouse"];
      if (spouseName) {
        let spouseNameObj = this.makeNameObjFromLastNameCommaForenames(spouseName);
        let spouseAge = this.ed.recordData["Age2"];
        let spouseGender = this.ed.recordData["Gender2"];
        let spouse = {
          name: spouseNameObj,
          gender: spouseGender,
          age: spouseAge,
        };
        let spouses = [spouse];
        return spouses;
      }
    } else if (this.recordType == RT.Divorce) {
      //   "Name": "Grice, Clarence Vernon - Petitioner",
      //   "Name2": "Grice, Kathleen Elizabeth - Respondent",

      let name2 = this.ed.recordData["Name2"];

      const responentSuffix = " - Respondent";
      if (name2 && name2.endsWith(responentSuffix)) {
        name2 = name2.substring(0, name2.length - responentSuffix.length);
      }
      let spouseNameObj = this.makeNameObjFromLastNameCommaForenames(name2);
      if (spouseNameObj) {
        let spouse = {
          name: spouseNameObj,
        };
        let spouses = [spouse];
        return spouses;
      }
    }
    return undefined;
  }

  getParents() {
    let fatherName = this.ed.recordData["Father"];
    let motherName = this.ed.recordData["Mother"];
    if (fatherName || motherName) {
      let parents = {};
      if (fatherName) {
        let fatherNameObj = this.makeNameObjFromLastNameCommaForenames(fatherName);
        parents.father = { name: fatherNameObj };
      }
      if (motherName) {
        let motherNameObj = this.makeNameObjFromLastNameCommaForenames(motherName);
        parents.mother = { name: motherNameObj };
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

export { TaslibEdReader };
