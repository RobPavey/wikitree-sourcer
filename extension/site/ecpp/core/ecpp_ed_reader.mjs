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
import { PlaceObj } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

class EcppEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);

    //console.log("primaryPersonIndex = " + primaryPersonIndex);
    if (!primaryPersonIndex) {
      primaryPersonIndex = 0;
    }
    this.primaryPersonIndex = primaryPersonIndex;

    if (ed.url.includes("/baptismal/")) {
      this.recordType = RT.Baptism;
    } else if (ed.url.includes("/marriage/")) {
      this.recordType = RT.Marriage;
    } else if (ed.url.includes("/death/")) {
      this.recordType = RT.Burial;
    }
  }

  getFieldValueFromSection(section, fieldId) {
    if (section && section.fields) {
      let fields = section.fields;
      let field = fields[fieldId];
      if (field && field.value) {
        return field.value;
      }
    }
    return "";
  }

  getFieldValueFromSectionId(sectionId, fieldId) {
    if (this.ed && this.ed.sections) {
      let section = this.ed.sections[sectionId];
      return this.getFieldValueFromSection(section, fieldId);
    }
    return "";
  }

  getFieldValue(fieldId) {
    if (this.ed && this.ed.sections) {
      for (let sectionKey of Object.keys(this.ed.sections)) {
        let section = this.ed.sections[sectionKey];
        let value = this.getFieldValueFromSection(section, fieldId);
        if (value) {
          return value;
        }
      }
    }
    return "";
  }

  makeNameObjFromKeys(spanishNameKey, nativeNameKey, surnameKey) {
    let forenames = this.getFieldValue(spanishNameKey);
    let nativeName = this.getFieldValue(nativeNameKey);
    let surname = this.getFieldValue(surnameKey);

    if (nativeName && surname) {
      let nameObj = this.makeNameObjFromForenamesAndLastName(nativeName, surname);
      if (forenames) {
        nameObj.prefNames = forenames;
      }
      return nameObj;
    } else if (forenames && surname) {
      let nameObj = this.makeNameObjFromForenamesAndLastName(forenames, surname);
      return nameObj;
    } else if (nativeName) {
      let nameObj = this.makeNameObjFromForenames(nativeName);
      if (forenames) {
        nameObj.prefNames = forenames;
      }
      return nameObj;
    } else if (forenames) {
      let nameObj = this.makeNameObjFromForenames(forenames);
      return nameObj;
    } else if (surname) {
      let nameObj = this.makeNameObjFromFullName(surname);
      return nameObj;
    }
    return undefined;
  }

  makePlaceObjFromMissionCode(missionCode) {
    //console.log("makePlaceObjFromMissionCode");

    const codes = {
      BP: {
        placeString: "Santa Barbara Presidio",
        usCounty: "Santa Barbara",
      },
      LA: {
        placeString: "Los Angeles Plaza Church",
        usCounty: "Santa Barbara",
      },
      LPC: {
        placeString: "Mission La Purísima Concepcion",
        usCounty: "Santa Barbara",
      },
      SAP: {
        placeString: "Mission San Antonio de Padua",
        usCounty: "Santa Barbara",
      },
      SB: {
        placeString: "Mission Santa Barbara",
        usCounty: "Santa Barbara",
      },
    };

    const datesForPlaceNames = [
      {
        startDate: "28 Sep 1821",
        state: "Alta California",
        country: "Imperio Mexicano",
      },
      {
        startDate: "1 Nov 1823",
        state: "Alta California",
        country: "1st Estados Unidos Mexicanos",
      },
      {
        startDate: "23 Oct 1835",
        state: "Alta California",
        country: "Central Republic in Mexico",
      },
      {
        startDate: "22 Aug 1846",
        state: "Alta California",
        country: "2nd Estados Unidos Mexicano",
      },
      {
        startDate: "14 Jun 1846",
        state: "",
        country: "California Republic",
      },
      {
        startDate: "9 Jul 1846",
        state: "California",
        country: "United States",
        useCounty: true,
      },
    ];

    let dateObj = this.getEventDateObj();

    let placeObj = new PlaceObj();

    if (missionCode) {
      let missionData = codes[missionCode];
      if (missionData) {
        if (missionData.placeString) {
          placeObj.placeString = missionData.placeString;
          placeObj.prepositionHint = "at";
        }
      }
    }

    placeObj.country = "Nueva España";
    placeObj.state = "Las Californias";
    placeObj.county = "";

    if (dateObj) {
      //console.log("makePlaceObjFromMissionCode, have dateObj");

      let dateString = dateObj.getDateString();
      if (dateString) {
        let parsedDate = DateUtils.parseDateString(dateString);

        if (parsedDate.isValid) {
          //console.log("makePlaceObjFromMissionCode, parsedDate.isValid");

          for (let dateForPlaceIndex = datesForPlaceNames.length - 1; dateForPlaceIndex >= 0; dateForPlaceIndex--) {
            let dateForPlace = datesForPlaceNames[dateForPlaceIndex];
            let parsedStartDate = DateUtils.parseDateString(dateForPlace.startDate);

            if (parsedStartDate.isValid) {
              //console.log("Comparing dates:");
              //console.log(parsedStartDate);
              //console.log(parsedDate);
              let compareResult = DateUtils.compareParsedDates(parsedStartDate, parsedDate);
              //console.log("result is: " + compareResult);
              if (compareResult < 0) {
                placeObj.country = dateForPlace.country;
                placeObj.state = dateForPlace.state;

                if (dateForPlace.useCounty) {
                  if (missionCode) {
                    let missionData = codes[missionCode];
                    if (missionData) {
                      if (missionData.usCounty) {
                        placeObj.county = missionData.usCounty;
                      }
                    }
                  }
                }

                break;
              }
            }
          }
        }
      }
    }

    if (placeObj.placeString) {
      if (placeObj.county) {
        placeObj.placeString += ", " + placeObj.county;
      }
      if (placeObj.state) {
        placeObj.placeString += ", " + placeObj.state;
      }
      if (placeObj.country) {
        placeObj.placeString += ", " + placeObj.country;
      }
    }

    return placeObj;
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
    let spanishNameKey = "spanish-name";
    let nativeNameKey = "native-name";
    let surnameKey = "surname";

    if (this.recordType == RT.Marriage) {
      if (this.primaryPersonIndex == 0) {
        spanishNameKey = "groom_spanish-name";
        nativeNameKey = "groom_native-name";
        surnameKey = "groom_surname";
      } else if (this.primaryPersonIndex == 1) {
        spanishNameKey = "bride_spanish-name";
        nativeNameKey = "bride_native-name";
        surnameKey = "bride_surname";
      }
    }

    return this.makeNameObjFromKeys(spanishNameKey, nativeNameKey, surnameKey);
  }

  getGender() {
    let sex = this.getFieldValue("sex");
    if (sex == "M") {
      return "male";
    } else if (sex == "F") {
      return "female";
    }
    return "";
  }

  getEventDateObj() {
    let eventDate = this.getFieldValue("date");

    if (!eventDate) {
      if (this.recordType == RT.Burial) {
        eventDate = this.getFieldValue("burial-date");

        if (!eventDate) {
          eventDate = this.getFieldValue("death-date");
        }
      }
    }

    if (eventDate) {
      return this.makeDateObjFromDateString(eventDate);
    }
    return undefined;
  }

  getEventPlaceObj() {
    let missionCode = this.getFieldValue("mission");
    return this.makePlaceObjFromMissionCode(missionCode);
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
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let age = this.getFieldValue("age");
    let ageUnits = this.getFieldValue("unit");
    if (this.recordType == RT.Marriage) {
      if (this.primaryPersonIndex == 0) {
        age = this.getFieldValue("groom_age");
      } else if (this.primaryPersonIndex == 1) {
        age = this.getFieldValue("bride_age");
      }
    }
    if (age) {
      if (ageUnits) {
        if (ageUnits == "a") {
          return age;
        } else if (ageUnits == "m") {
          return age + " months";
        } else if (ageUnits == "d") {
          return age + " days";
        }
      } else {
        return age;
      }
    }
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

  getPrimaryPersonOptions() {
    if (this.recordType == RT.Marriage) {
      let groomNameObj = this.makeNameObjFromKeys("groom_spanish-name", "groom_native-name", "groom_surname");
      let brideNameObj = this.makeNameObjFromKeys("bride_spanish-name", "bride_native-name", "bride_surname");

      if (groomNameObj && brideNameObj) {
        let groomName = groomNameObj.inferFullName();
        let brideName = brideNameObj.inferFullName();
        if (brideName && groomName) {
          let options = [groomName + " (groom)", brideName + " (bride)"];
          return options;
        }
      }
    }

    return undefined;
  }
}

export { EcppEdReader };
