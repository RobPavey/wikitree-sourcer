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
  if (string.length > 3) {
    string = string.substring(0, 3);
  }
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
  constructor(ed, primaryPersonIndex, spousePersonIndex) {
    super(ed);

    this.spousePersonIndex = spousePersonIndex;

    if (ed.format == "v2025") {
      let metaValue = this.getMetadataValue("RecordType");
      if (metaValue) {
        switch (metaValue) {
          case "Births":
            this.recordType = RT.BirthRegistration;
            break;
          case "Marriages":
            this.recordType = RT.MarriageRegistration;
            break;
          case "Deaths":
            this.recordType = RT.DeathRegistration;
            break;
        }
      }

      if (this.recordType == RT.Unclassified) {
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

  getMetadataValue(label) {
    let name = "freebmd." + label;
    if (this.ed.metadata) {
      return this.ed.metadata[name];
    }
    return "";
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
    let metaValue = this.getMetadataValue("Surname");
    if (metaValue) {
      return metaValue;
    }

    let parts = this.getSurnameAndGivenNames();
    return parts.surname;
  }

  getCorrectlyCasedGivenNames() {
    let metaValue = this.getMetadataValue("GivenName");
    if (metaValue) {
      return metaValue;
    }

    let parts = this.getSurnameAndGivenNames();
    return parts.givenNames;
  }

  getCorrectlyCasedRegistrationDistrict() {
    let metaValue = this.getMetadataValue("OfficialDistrict");
    if (!metaValue) {
      metaValue = this.getMetadataValue("DistrictInSource");
    }
    if (metaValue) {
      return metaValue;
    }

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

    let registrationDate = this.getMetadataValue("Quarter");
    let quarterRegex = /^([A-Z][a-z]+\s+to\s+[A-Z][a-z]+)\s+(\d\d\d\d)/;
    if (!registrationDate || !quarterRegex.test(registrationDate)) {
      let altRegistrationDate = getRecordDataText(this.ed, "Registration Date");
      if (altRegistrationDate) {
        registrationDate = altRegistrationDate;
      }
    }
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
        if (!spouseSurname.startsWith("No data") && !spouseSurname.startsWith("See Page")) {
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

    if (this.recordType == RT.MarriageRegistration && this.ed.recordData) {
      for (let key of Object.keys(this.ed.recordData)) {
        if (key.startsWith("Entries on page ")) {
          let data = this.ed.recordData[key];
          if (data.text && data.href) {
            // this should only happen if there is only one record on page (including this person)
            // so do nothing
          } else if (data.subValues && data.subValues.length == 2) {
            let index = -1;
            let givenNames = this.getCorrectlyCasedGivenNames();
            let surname = this.getCorrectlyCasedSurname();
            let testString = surname + " " + givenNames;
            if (data.subValues[0].text == testString) {
              index = 1;
            } else if (data.subValues[1].text == testString) {
              index = 0;
            }
            if (index != -1) {
              if (
                data.subValues[0].date == data.subValues[1].date &&
                data.subValues[0].district == data.subValues[1].district
              ) {
                let spouseNameString = data.subValues[index].text;
                if (spouseNameString) {
                  let surname = StringUtils.getFirstWord(spouseNameString);
                  let givenNames = StringUtils.getWordsAfterFirstWord(spouseNameString);
                  if (surname && givenNames) {
                    let spouseName = this.makeNameObjFromForenamesAndLastName(givenNames, surname);

                    let marriageDateObj = this.getEventDateObj();
                    let marriagePlaceObj = this.getEventPlaceObj();
                    let spouse = this.makeSpouseObj(spouseName, marriageDateObj, marriagePlaceObj);
                    return [spouse];
                  }
                }
              }
            }
          } else {
            if (this.spousePersonIndex !== undefined || this.spousePersonIndex != -1) {
              // the index is into an array that is missing this person.
              if (data.subValues && data.subValues.length > this.spousePersonIndex) {
                // add a list of names, not including this person's name
                let givenNames = this.getCorrectlyCasedGivenNames();
                let surname = this.getCorrectlyCasedSurname();
                let testString = surname + " " + givenNames;

                let options = [];

                let index = 0;
                for (let subValue of data.subValues) {
                  if (subValue.date == subValue.date && subValue.district == subValue.district) {
                    let spouseNameString = subValue.text;
                    if (spouseNameString && spouseNameString != testString) {
                      if (index == this.spousePersonIndex) {
                        let surname = StringUtils.getFirstWord(spouseNameString);
                        let givenNames = StringUtils.getWordsAfterFirstWord(spouseNameString);

                        if (surname && givenNames) {
                          let spouseName = this.makeNameObjFromForenamesAndLastName(givenNames, surname);

                          let marriageDateObj = this.getEventDateObj();
                          let marriagePlaceObj = this.getEventPlaceObj();
                          let spouse = this.makeSpouseObj(spouseName, marriageDateObj, marriagePlaceObj);
                          return [spouse];
                        }
                        break;
                      }
                      index++;
                    }
                  }
                }
              }
            }
          }
          break;
        }
      }
    }
  }

  getSpousePersonOptions() {
    if (this.recordType == RT.MarriageRegistration) {
      if (this.ed.recordData) {
        for (let key of Object.keys(this.ed.recordData)) {
          if (key.startsWith("Entries on page ")) {
            let data = this.ed.recordData[key];
            if (data.subValues && data.subValues.length > 2) {
              // add a list of names, not including this person's name
              let givenNames = this.getCorrectlyCasedGivenNames();
              let surname = this.getCorrectlyCasedSurname();
              let testString = surname + " " + givenNames;

              let options = [];

              for (let subValue of data.subValues) {
                if (subValue.date == subValue.date && subValue.district == subValue.district) {
                  let spouseNameString = subValue.text;
                  if (spouseNameString && spouseNameString != testString) {
                    options.push(spouseNameString);
                  }
                }
              }
              return options;
            }
          }
        }
      }
    }

    return undefined;
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
        let referenceVolume = this.getMetadataValue("Volume");
        if (!referenceVolume) {
          referenceVolume = getRecordDataText(this.ed, "Volume");
        }
        if (referenceVolume) {
          collectionData.volume = referenceVolume;
        }
        let referencePage = this.getMetadataValue("Page");
        if (!referencePage) {
          referencePage = getRecordDataText(this.ed, "Page");
        }
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
