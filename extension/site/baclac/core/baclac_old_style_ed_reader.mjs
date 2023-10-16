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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameObj, DateObj, PlaceObj, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

class BaclacOldStyleEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.url.includes("/census/")) {
      this.recordType = RT.Census;
    }
  }

  makeDateObjFromBaclacDateString(dateString) {
    if (/^\d\d\d\d\-\d\d\-\d\d$/.test(dateString)) {
      return this.makeDateObjFromYyyymmddDate(dateString, "-");
    } else if (/^\w+\s\d\d?\s\d\d\d\d\s\d\d?\:\d\d[AP]M$/.test(dateString)) {
      return this.makeDateObjFromMonthDdYyyyTimeDate(dateString);
    }
  }

  getCensusYearFromUrl() {
    const url = this.ed.url;
    const censusString = "/census/";
    let censusIndex = url.indexOf(censusString);
    if (censusIndex != -1) {
      let yearStartIndex = censusIndex + censusString.length;
      let yearEndIndex = url.indexOf("/", yearStartIndex);
      if (yearEndIndex != -1) {
        let yearString = url.substring(yearStartIndex, yearEndIndex);
        if (yearString) {
          return yearString;
        }
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

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let lastName = this.getRecordDataValue("Surname");
    let forenames = this.getRecordDataValue("Given Name");
    if (lastName && forenames) {
      return this.makeNameObjFromForenamesAndLastName(forenames, lastName);
    }
    if (this.ed.name) {
      return this.makeNameObjFromFullName(this.ed.name);
    }
  }

  getGender() {
    let gender = this.getRecordDataValue("Gender");
    if (gender) {
      return gender.toLowerCase();
    }
    return "";
  }

  getEventDateObj() {
    let yearString = this.getCensusYearFromUrl();
    if (yearString) {
      return this.makeDateObjFromYear(yearString);
    }
  }

  getEventPlaceObj() {
    let placeString = "";
    function addPart(part) {
      if (part) {
        if (placeString) {
          placeString += ", ";
        }
        placeString += part;
      }
    }

    if (this.recordType == RT.Census) {
      let province = this.getRecordDataValue("Province");
      let district = this.getRecordDataValue("District Name");
      let subDistrict = this.getRecordDataValue("Sub-District Name");

      // there is sometimes a "Sub-district description" and no "Sub-district name"
      // but the description doesn't work as part of the placeString except under a few cases
      if (!subDistrict) {
        let description = this.getRecordDataValue("Sub-District Description");
        if (description && description.length < 30) {
          if (/^Town of [^\,]+$/.test(description)) {
            let townName = description.replace(/^Town of ([^\,]+)$/, "$1");
            if (townName && townName != description) {
              if (townName != district) {
                subDistrict = townName;
              }
            }
          }
        }
      }

      addPart(subDistrict);
      addPart(district);
      addPart(province);
      addPart("Canada");
    }

    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    if (!placeObj) {
      placeObj = new PlaceObj();

      if (this.typeData.defaultEventPlace) {
        placeObj.placeString = this.typeData.defaultEventPlace;
      } else {
        placeObj.placeString = "Canada";
      }
    }
    placeObj.country = "Canada";

    return placeObj;
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
    let dateOfBirth = this.getRecordDataValue("Birth Date");
    if (dateOfBirth) {
      return this.makeDateObjFromBaclacDateString(dateOfBirth);
    }
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValue("Place of Birth");
    if (placeString) {
      return this.makePlaceObjFromFullPlaceName(placeString);
    }
    let countryString = this.getRecordDataValue("Birth Country");
    if (countryString) {
      return this.makePlaceObjFromCountryName(countryString);
    }
  }

  getDeathDateObj() {}

  getDeathPlaceObj() {}

  getAgeAtEvent() {
    let ageString = this.getRecordDataValue("Age");
    if (ageString) {
      const yearSuffix = " years";
      if (ageString.endsWith(yearSuffix)) {
        ageString = ageString.substring(0, ageString.length - yearSuffix.length);
      }
    }
    return ageString;
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return this.getRecordDataValue("Relationship");
  }

  getMaritalStatus() {
    let status = this.getRecordDataValue("Marital Status");
    if (status) {
      if (status == "Not indicated") {
        status = "";
      }
    }
    return status;
  }

  getOccupation() {
    return this.getRecordDataValue("Occupation");
  }

  getCollectionData() {
    if (this.recordType == RT.Census) {
      let yearString = this.getCensusYearFromUrl();
      if (yearString) {
        let collectionData = {
          id: "census" + yearString,
        };

        function addRef(fieldName, value) {
          if (value) {
            collectionData[fieldName] = value;
          }
        }

        addRef("district", this.getRecordDataValue("District Name"));
        addRef("districtNumber", this.getRecordDataValue("District Number"));
        addRef("subDistrict", this.getRecordDataValue("Sub-District Name"));
        addRef("subDistrictNumber", this.getRecordDataValue("Sub-District Number"));
        addRef("divisionNumber", this.getRecordDataValue("Division Number"));
        addRef("familyNumber", this.getRecordDataValue("Family Number"));
        addRef("page", this.getRecordDataValue("Page Number"));

        return collectionData;
      }
    }

    return undefined;
  }
}

export { BaclacOldStyleEdReader };
