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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { convertDistrictCodeToName } from "./nswbdm_district_codes.mjs";

function cleanNameString(nameString) {
  return NameUtils.convertNameFromAllCapsToMixedCase(nameString);
}

class NswbdmEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.resultsType == "Births") {
      this.recordType = RT.BirthRegistration;
    } else if (ed.resultsType == "Deaths") {
      this.recordType = RT.DeathRegistration;
    } else if (ed.resultsType == "Marriages") {
      this.recordType = RT.MarriageRegistration;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecordDataField(keys) {
    for (let key of keys) {
      let lcKey = key.toLowerCase();
      for (let rdKey in this.ed.recordData) {
        let lcRdKey = rdKey.toLowerCase();
        if (lcKey == lcRdKey) {
          return this.ed.recordData[rdKey];
        }
      }
    }
  }

  getGivenNames() {
    if (this.recordType == RT.MarriageRegistration) {
      return cleanNameString(this.getRecordDataField(["Groom's GivenName(s)"]));
    } else {
      return cleanNameString(this.ed.firstName);
    }
  }

  getLastName() {
    if (this.recordType == RT.MarriageRegistration) {
      return cleanNameString(this.getRecordDataField(["Groom's Family Name"]));
    } else {
      return cleanNameString(this.ed.lastName);
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
    return this.makeNameObjFromForenamesAndLastName(this.getGivenNames(), this.getLastName());
  }

  getGender() {
    if (this.recordType == RT.MarriageRegistration) {
      return "male";
    }

    return NameUtils.predictGenderFromGivenNames(this.getGivenNames());
  }

  getEventDateObj() {
    // this is in format year/regNum. e.g. "1884/14727"
    let registrationNumberParts = this.ed.registrationNumberParts;
    if (!registrationNumberParts || registrationNumberParts.length < 2) {
      return undefined;
    }

    let yearString = registrationNumberParts[1];
    if (yearString) {
      return this.makeDateObjFromYear(yearString);
    }
    return undefined;
  }

  getEventPlaceObj() {
    return this.makePlaceObjFromFullPlaceName("New South Wales, Australia");
  }

  getLastNameAtBirth() {
    if (this.recordType == RT.BirthRegistration) {
      return this.getLastName();
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.recordType == RT.DeathRegistration) {
      return this.getLastName();
    }
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
    if (this.recordType == RT.DeathRegistration) {
      let placeString = "";
      let motherGivenNames = this.getRecordDataField(["Mother's Given name(s)"]);
      if (motherGivenNames && motherGivenNames.startsWith("DIED ")) {
        placeString = motherGivenNames.substring(5).trim();
      }

      if (placeString) {
        placeString = StringUtils.toInitialCapsEachWord(placeString);
        //placeString += ", New South Wales, Australia";
        return this.makePlaceObjFromFullPlaceName(placeString);
      }
    }

    return undefined;
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    if (this.recordType == RT.DeathRegistration) {
      // "Father's Given Name(s)": "AGE 77 YEARS",
      let possibleAgeString = this.getRecordDataField(["Father's Given Name(s)"]);
      if (possibleAgeString) {
        if (possibleAgeString.startsWith("AGE ")) {
          return possibleAgeString.substring(4).toLowerCase().trim();
        }
      }
    }

    return "";
  }

  getRegistrationDistrict() {
    let districtString = this.getRecordDataField(["District"]);

    if (districtString) {
      if (districtString.length <= 3) {
        return districtString;
      }
      let registrationDistrict = StringUtils.toInitialCapsEachWord(districtString);
      return registrationDistrict;
    }

    return "";
  }

  getSpouses() {
    if (this.recordType == RT.MarriageRegistration) {
      let brideGivenNames = cleanNameString(this.getRecordDataField(["Bride's Given Name(s)"]));
      let brideFamilyName = cleanNameString(this.getRecordDataField(["Bride's Family Name(s)"]));
      let spouseNameObj = this.makeNameObjFromForenamesAndLastName(brideGivenNames, brideFamilyName);
      if (spouseNameObj) {
        let spouse = { name: spouseNameObj };
        spouse.personGender = "female";
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
    if (this.recordType == RT.BirthRegistration || this.recordType == RT.DeathRegistration) {
      //let familyName = this.getLastName();
      let familyName = "";
      let motherGivenNames = this.getRecordDataField(["Mother's Given name(s)"]);
      let fatherGivenNames = this.getRecordDataField(["Father's Given name(s)"]);

      if (this.recordType == RT.DeathRegistration) {
        if (motherGivenNames && motherGivenNames.startsWith("DIED ")) {
          motherGivenNames = "";
        }
        if (fatherGivenNames && fatherGivenNames.startsWith("AGE ")) {
          fatherGivenNames = "";
        }
      }

      let fatherNameObj = undefined;
      let motherNameObj = undefined;

      if (fatherGivenNames) {
        fatherGivenNames = cleanNameString(fatherGivenNames);
        fatherNameObj = this.makeNameObjFromForenamesAndLastName(fatherGivenNames, familyName);
      }

      if (motherGivenNames) {
        motherGivenNames = cleanNameString(motherGivenNames);
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to support build citation
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCitationDistrict() {
    let district = this.getRecordDataField(["District"]);

    let convertedDistrict = convertDistrictCodeToName(district);
    if (convertedDistrict) {
      district = district + " (" + convertedDistrict + ")";
    } else {
      district = StringUtils.toInitialCapsEachWord(district);
    }

    return district;
  }

  getCitationDeathPlaceIfDifferentToDistrict() {
    if (this.recordType == RT.DeathRegistration) {
      let placeString = "";
      let motherGivenNames = this.getRecordDataField(["Mother's Given name(s)"]);
      let district = this.getRecordDataField(["District"]);

      if (motherGivenNames && motherGivenNames.startsWith("DIED ")) {
        placeString = motherGivenNames.substring(5).trim();
      }

      if (placeString && placeString != district) {
        placeString = StringUtils.toInitialCapsEachWord(placeString);

        let citationDistrict = this.getCitationDistrict();
        if (placeString != citationDistrict) {
          return placeString;
        }
      }
    }
  }
}

export { NswbdmEdReader };
