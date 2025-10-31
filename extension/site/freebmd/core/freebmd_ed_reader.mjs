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

function freebmdQuarterToGdQuarter(quarter) {
  if (!quarter) {
    return 0; // deaths 1984 and later do not have a quarter
  }
  let string = quarter.toLowerCase();
  switch (string) {
    case "mar":
      return 1;
    case "jun":
      return 2;
    case "sep":
      return 3;
    case "dec":
      return 4;
    default:
      return 0;
  }
}

function getRecordDataText(ed, label) {
  if (ed.recordData) {
    let value = ed.recordData[label];
    if (value) {
      return value.text;
    }
  }

  return "";
}

class FreebmdEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.format == "v2025") {
      let recordType = getRecordDataText(ed, "Record Type");
      switch (recordType) {
        case "Birth":
          this.recordType = RT.BirthRegistration;
          break;
        case "Marriage":
          this.recordType = RT.MarriageRegistration;
          break;
        case "Death":
          this.recordType = RT.DeathRegistration;
          break;
      }
    } else {
      switch (ed.eventType) {
        case "birth":
          this.recordType = RT.BirthRegistration;
          break;
        case "marriage":
          this.recordType = RT.MarriageRegistration;
          break;
        case "death":
          this.recordType = RT.DeathRegistration;
          break;
      }
    }
  }

  getSurnameAndGivenNames(convertToMixedCase = true) {
    let ed = this.ed;
    let surname = ed.surname;
    let givenNames = ed.givenNames;

    if (surname || givenNames) {
      if (StringUtils.isWordAllUpperCase(surname)) {
        surname = NameUtils.convertNameFromAllCapsToMixedCase(surname);
      }
      givenNames = NameUtils.convertNameFromAllCapsToMixedCase(givenNames);
    } else if (ed.name) {
      surname = "";
      givenNames = "";

      let fullName = ed.name;
      if (StringUtils.isWordAllUpperCase(fullName)) {
        fullName = NameUtils.convertNameFromAllCapsToMixedCase(fullName);

        let nameObj = this.makeNameObjFromFullName(fullName);
        surname = nameObj.inferLastName();
        givenNames = nameObj.inferForenames();
      } else {
        let nameParts = fullName.split(" ");
        for (let index = nameParts.length - 1; index >= 0; index--) {
          let namePart = nameParts[index].trim();
          if (StringUtils.isWordAllUpperCase(namePart)) {
            namePart = NameUtils.convertNameFromAllCapsToMixedCase(namePart);
            if (surname) {
              surname = " " + surname;
            }
            surname = namePart + surname;
          } else {
            // this part and previous ones are given names
            for (let givenIndex = 0; givenIndex <= index; givenIndex++) {
              namePart = nameParts[givenIndex].trim();
              if (givenNames) {
                givenNames += " ";
              }
              givenNames += namePart;
            }
            break;
          }
        }
      }
    }

    return { surname: surname, givenNames: givenNames };
  }

  getCorrectlyCasedSurname() {
    let parts = this.getSurnameAndGivenNames();
    return parts.surname;
  }

  getCorrectlyCasedGivenNames() {
    let parts = this.getSurnameAndGivenNames();
    return parts.givenNames;
  }

  getCorrectlyCasedRegistrationDistrict() {
    let rd = this.ed.registrationDistrict;
    if (rd) {
      rd = NameUtils.convertNameFromAllCapsToMixedCase(rd);
    } else {
      rd = getRecordDataText(this.ed, "District");
    }
    return rd;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (this.ed.format == "v2025") {
      if (!this.ed.name) {
        return false;
      }
      if (!this.ed.recordData) {
        return false;
      }
      let date = getRecordDataText(this.ed, "Registration Date");
      if (!date) {
        return false;
      }
    } else {
      if (!this.ed.eventYear) {
        return false; //the extract failed to get enough useful data
      }
    }
    return true;
  }

  getNameObj() {
    return this.makeNameObjFromForenamesAndLastName(
      this.getCorrectlyCasedGivenNames(),
      this.getCorrectlyCasedSurname()
    );
  }

  getEventDateObj() {
    if (this.ed.eventYear) {
      return this.makeDateObjFromYearAndQuarter(this.ed.eventYear, freebmdQuarterToGdQuarter(this.ed.eventQuarter));
    }

    let registrationDate = getRecordDataText(this.ed, "Registration Date");
    let registered = getRecordDataText(this.ed, "Registered");

    if (registered && registered.endsWith(registrationDate)) {
      return this.makeDateObjFromDateString(registered);
    } else if (registrationDate) {
      return this.makeDateObjFromDateString(registrationDate);
    }
  }

  getLastNameAtBirth() {
    if (this.ed.eventType == "birth") {
      return this.getCorrectlyCasedSurname();
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.ed.eventType == "death") {
      return this.getCorrectlyCasedSurname();
    }
    return "";
  }

  getMothersMaidenName() {
    if (this.ed.mothersMaidenName) {
      return this.ed.mothersMaidenName;
    }

    let mmn = getRecordDataText(this.ed, "Mother's Maiden Name");
    if (mmn) {
      if (!mmn.startsWith("No data")) {
        return mmn;
      }
    }

    return "";
  }

  getBirthDateObj() {
    if (this.ed.eventType == "birth") {
      return this.getEventDateObj();
    }

    if (this.ed.eventType == "death") {
      let date = this.ed.birthDate;
      if (date) {
        return this.makeDateObjFromDateString(date);
      }
    }
  }

  getDeathDateObj() {
    if (this.ed.eventType == "death") {
      return this.getEventDateObj();
    }
  }

  getAgeAtDeath() {
    let age = "";

    if (this.ed.eventType == "death") {
      let ageAtDeath = this.ed.ageAtDeath;
      if (ageAtDeath) {
        age = ageAtDeath;
      }
    }

    return age;
  }

  getRegistrationDistrict() {
    return this.getCorrectlyCasedRegistrationDistrict();
  }

  getSpouses() {
    let spouseName = undefined;
    if (this.ed.spouse) {
      spouseName = this.makeNameObjFromFullName(this.ed.spouse);
    } else {
      let spouseSurname = getRecordDataText(this.ed, "Spouse Surname");
      if (spouseSurname) {
        if (!spouseSurname.startsWith("No data")) {
          spouseName = this.makeNameObjFromForenamesAndLastName("", spouseSurname);
        }
      }
    }

    if (spouseName) {
      let marriageDateObj = this.getEventDateObj();
      let marriagePlaceObj = this.getEventPlaceObj();
      let spouse = this.makeSpouseObj(spouseName, marriageDateObj, marriagePlaceObj);
      return [spouse];
    }
  }

  getCollectionData() {
    let collectionId = undefined;
    if (this.recordType == RT.BirthRegistration) {
      collectionId = "births";
    } else if (this.recordType == RT.MarriageRegistration) {
      collectionId = "marriages";
    } else if (this.recordType == RT.DeathRegistration) {
      collectionId = "deaths";
    }

    // Collection
    if (collectionId) {
      let collectionData = {
        id: collectionId,
      };
      if (this.ed.format == "v2025") {
        let referenceVolume = getRecordDataText(this.ed, "Volume");
        if (referenceVolume) {
          collectionData.volume = referenceVolume;
        }
        let referencePage = getRecordDataText(this.ed, "Page");
        if (referencePage) {
          collectionData.page = referencePage;
        }
      } else {
        if (this.ed.referenceVolume) {
          collectionData.volume = this.ed.referenceVolume;
        }
        if (this.ed.referencePage) {
          collectionData.page = this.ed.referencePage;
        }
      }

      return collectionData;
    }
  }
}

export { FreebmdEdReader };
