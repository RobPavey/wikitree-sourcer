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
  constructor(ed) {
    super(ed);

    if (ed.recordType == "Birth Search") {
      this.recordType = RT.BirthRegistration;
    } else if (ed.recordType == "Death Search") {
      this.recordType = RT.DeathRegistration;
    } else if (ed.recordType == "Marriage Search") {
      this.recordType = RT.MarriageRegistration;
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

  getNameObj() {
    let givenNames = "";
    let familyName = "";

    if (this.recordType == RT.MarriageRegistration) {
      givenNames = this.ed.recordData["Bride's GivenName(s)"];
      familyName = this.ed.recordData["Bride's Family Name"];
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
      return "female";
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
    return "";
  }

  getSpouses() {
    if (this.recordType == RT.MarriageRegistration) {
      let groomGivenNames = this.ed.recordData["Groom's GivenName(s)"];
      let groomFamilyName = this.ed.recordData["Groom's Family Name"];
      let spouseNameObj = this.makeNameObjFromForenamesAndLastName(groomGivenNames, groomFamilyName);
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

  getCollectionData() {
    return undefined;
  }
}

export { NzbdmEdReader };
