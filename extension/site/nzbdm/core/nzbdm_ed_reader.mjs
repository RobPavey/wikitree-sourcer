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

class NzbdmEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);

    this.primaryPersonIndex = primaryPersonIndex;

    if (ed.recordType == "Birth Search") {
      this.recordType = RT.BirthRegistration;
    } else if (ed.recordType == "Death Search") {
      this.recordType = RT.DeathRegistration;
    } else if (ed.recordType == "Marriage Search") {
      this.recordType = RT.MarriageRegistration;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  isPrimaryTheSecond() {
    let result = false;

    if (this.primaryPersonIndex == 1) {
      result = true;
    }

    return result;
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

  getNameObj() {
    let givenNames = "";
    let familyName = "";

    if (this.recordType == RT.MarriageRegistration) {
      if (this.isPrimaryTheSecond()) {
        givenNames = this.ed.recordData["Groom's GivenName(s)"];
        familyName = this.ed.recordData["Groom's Family Name"];
      } else {
        givenNames = this.ed.recordData["Bride's GivenName(s)"];
        familyName = this.ed.recordData["Bride's Family Name"];
      }
    } else {
      givenNames = this.ed.recordData["Given Name(s)"];
      familyName = this.ed.recordData["Family Name"];
    }

    if (givenNames == "NR") {
      givenNames = "";
    }
    if (familyName == "NR") {
      familyName = "";
    }

    return this.makeNameObjFromForenamesAndLastName(givenNames, familyName);
  }

  getGender() {
    if (this.recordType == RT.MarriageRegistration) {
      if (this.isPrimaryTheSecond()) {
        return "male";
      } else {
        return "female";
      }
    }
    return "";
  }

  getEventDateObj() {
    // this is in format year/regNum. e.g. "1884/14727"
    let registrationString = this.ed.recordData["Registration Number"];

    let parts = registrationString.split("/");
    if (parts.length != 2) {
      return undefined;
    }

    let yearString = parts[0];
    if (yearString) {
      return this.makeDateObjFromYear(yearString);
    }
    return undefined;
  }

  getEventPlaceObj() {
    return this.makePlaceObjFromCountryName("New Zealand");
  }

  getLastNameAtBirth() {
    if (this.recordType == RT.BirthRegistration) {
      let familyName = this.ed.recordData["Family Name"];
      return familyName;
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.recordType == RT.DeathRegistration) {
      let familyName = this.ed.recordData["Family Name"];
      return familyName;
    }
    return "";
  }

  getBirthDateObj() {
    if (this.recordType == RT.DeathRegistration) {
      let dobAge = this.ed.recordData["Date of Birth/Age at Death"];
      if (/^\d+ \w+ \d\d\d\d$/.test(dobAge)) {
        // it is a date of birth
        return this.makeDateObjFromDateString(dobAge);
      }
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.recordType == RT.BirthRegistration) {
      return this.makePlaceObjFromCountryName("New Zealand");
    }
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.recordType == RT.DeathRegistration) {
      return this.makePlaceObjFromCountryName("New Zealand");
    }

    return undefined;
  }

  getAgeAtEvent() {
    if (this.recordType == RT.DeathRegistration) {
      let dobAge = this.ed.recordData["Date of Birth/Age at Death"];
      if (!/^\d+ \w+ \d\d\d\d$/.test(dobAge)) {
        // it is an age
        return dobAge;
      }
    }

    return "";
  }

  getAgeAtDeath() {
    if (this.recordType == RT.DeathRegistration) {
      let dobAge = this.ed.recordData["Date of Birth/Age at Death"];
      if (!/^\d+ \w+ \d\d\d\d$/.test(dobAge)) {
        // it is an age
        return dobAge;
      }
    }

    return "";
  }

  getSpouses() {
    if (this.recordType == RT.MarriageRegistration) {
      let spouseGivenNames = this.ed.recordData["Groom's GivenName(s)"];
      let spouseFamilyName = this.ed.recordData["Groom's Family Name"];
      if (this.isPrimaryTheSecond()) {
        spouseGivenNames = this.ed.recordData["Bride's GivenName(s)"];
        spouseFamilyName = this.ed.recordData["Bride's Family Name"];
      }
      let spouseNameObj = this.makeNameObjFromForenamesAndLastName(spouseGivenNames, spouseFamilyName);
      if (spouseNameObj) {
        let spouse = { name: spouseNameObj };
        spouse.personGender = "male";
        let marriageDateObj = this.getEventDateObj();
        if (marriageDateObj) {
          spouse.marriageDate = marriageDateObj;
        }
        return [spouse];
      }
    }

    return undefined;
  }

  getParents() {
    if (this.recordType == RT.BirthRegistration) {
      let familyName = this.ed.recordData["Family Name"];
      let motherGivenNames = this.ed.recordData["Mother's GivenName(s)"];
      let fatherGivenNames = this.ed.recordData["Father's GivenName(s)"];
      if (motherGivenNames == "NR") {
        motherGivenNames = "";
      }
      if (fatherGivenNames == "NR") {
        fatherGivenNames = "";
      }
      let fatherNameObj = undefined;
      let motherNameObj = undefined;

      if (fatherGivenNames) {
        fatherNameObj = this.makeNameObjFromForenamesAndLastName(fatherGivenNames, familyName);
      }

      if (motherGivenNames) {
        motherNameObj = this.makeNameObjFromForenamesAndLastName(motherGivenNames, familyName);
      }

      if (fatherNameObj || motherNameObj) {
        let parents = {};
        if (fatherNameObj) {
          parents.father = { name: fatherNameObj };
        }
        if (motherNameObj) {
          parents.mother = { name: motherNameObj };
        }
        return parents;
      }
    }

    return undefined;
  }

  getPrimaryPersonOptions() {
    if (this.recordType == RT.MarriageRegistration) {
      let spouseName = this.getRecordDataValueForKeys(["Spouse"]);
      if (!spouseName) {
        let brideGivenName = this.getRecordDataValueForKeys(["Bride's GivenName(s)"]);
        let brideFamilyName = this.getRecordDataValueForKeys(["Bride's Family Name"]);
        let groomGivenName = this.getRecordDataValueForKeys(["Groom's GivenName(s)"]);
        let groomFamilyName = this.getRecordDataValueForKeys(["Groom's Family Name"]);

        function makeFullName(givenName, familyName) {
          let fullName = "";
          if (givenName) {
            fullName += givenName;
          }
          if (familyName) {
            if (fullName) {
              fullName += " ";
            }
            fullName += familyName;
          }
          return fullName;
        }

        let brideName = makeFullName(brideGivenName, brideFamilyName);
        let groomName = makeFullName(groomGivenName, groomFamilyName);

        if (brideName && groomName) {
          let options = [brideName + " (bride)", groomName + " (groom)"];
          return options;
        }
      }
    }

    return undefined;
  }

  getCollectionData() {
    return undefined;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to support build citation
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCitationName() {
    let nameObj = this.getNameObj();
    if (nameObj) {
      let name = nameObj.inferFullName();
      if (name) {
        let spouses = this.getSpouses();
        if (spouses && spouses.length == 1 && spouses[0].name) {
          let spouseName = spouses[0].name.inferFullName();
          if (spouseName) {
            name = name + " and " + spouseName;
          }
        }
        return name;
      }
    }

    return "";
  }

  getCitationMotherGivenNames() {
    let motherGivenNames = this.ed.recordData["Mother's GivenName(s)"];
    if (motherGivenNames == "NR") {
      motherGivenNames = "";
    }
    return motherGivenNames;
  }

  getCitationFatherGivenNames() {
    let fatherGivenNames = this.ed.recordData["Father's GivenName(s)"];
    if (fatherGivenNames == "NR") {
      fatherGivenNames = "";
    }
    return fatherGivenNames;
  }

  getCitationAgeAtDeath() {
    return this.getAgeAtDeath();
  }

  getCitationDateOfBirth() {
    let birthDateObj = this.getBirthDateObj();
    if (birthDateObj) {
      return birthDateObj.getDateString();
    }
  }
}

export { NzbdmEdReader };
