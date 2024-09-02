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
      this.isBirth = true;
    } else if (ed.resultsType == "Deaths") {
      this.recordType = RT.DeathRegistration;
      this.isDeath = true;
    } else if (ed.resultsType == "Marriages") {
      this.recordType = RT.MarriageRegistration;
      this.isMarriage = true;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecordDataFieldWithListNoCase(keys) {
    for (let key of keys) {
      let lcKey = key.toLowerCase();
      let lcNsKey = lcKey.replace(/\s+/g, "");
      for (let rdKey in this.ed.recordData) {
        let lcRdKey = rdKey.toLowerCase();
        if (lcKey == lcRdKey) {
          return this.ed.recordData[rdKey];
        }
        let lcRdNsKey = lcRdKey.replace(/\s+/g, "");
        if (lcNsKey == lcRdNsKey) {
          return this.ed.recordData[rdKey];
        }
      }
    }
  }

  getGivenNames() {
    if (this.isMarriage) {
      return cleanNameString(this.getRecordDataFieldWithListNoCase(["Groom's Given Name(s)"]));
    } else {
      let firstName = this.ed.firstName;
      if (firstName == "MALE" || firstName == "FEMALE" || firstName == "UNNAMED") {
        return "";
      }
      return cleanNameString(firstName);
    }
  }

  getLastName() {
    if (this.isMarriage) {
      return cleanNameString(this.getRecordDataFieldWithListNoCase(["Groom's Family Name"]));
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
    if (this.isMarriage) {
      return "male";
    }

    let firstName = this.ed.firstName;
    if (firstName == "MALE") {
      return "male";
    } else if (firstName == "FEMALE") {
      return "female";
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
    if (this.isBirth) {
      return this.getLastName();
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.isDeath) {
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
    if (this.isDeath) {
      let placeString = "";
      let motherGivenNames = this.getRecordDataFieldWithListNoCase(["Mother's Given name(s)"]);
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
    if (this.isDeath) {
      // "Father's Given Name(s)": "AGE 77 YEARS",
      let possibleAgeString = this.getRecordDataFieldWithListNoCase(["Father's Given Name(s)"]);
      if (possibleAgeString) {
        if (possibleAgeString.startsWith("AGE ")) {
          return possibleAgeString.substring(4).toLowerCase().trim();
        }
      }
    }

    return "";
  }

  getRegistrationDistrict() {
    let districtString = this.getRecordDataFieldWithListNoCase(["District"]);

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
    if (this.isMarriage) {
      let brideGivenNames = cleanNameString(this.getRecordDataFieldWithListNoCase(["Bride's Given Name(s)"]));
      let brideFamilyName = cleanNameString(this.getRecordDataFieldWithListNoCase(["Bride's Family Name(s)"]));
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
    if (this.isBirth || this.isDeath) {
      //let familyName = this.getLastName();
      let familyName = "";
      let motherGivenNames = this.getRecordDataFieldWithListNoCase(["Mother's Given name(s)"]);
      let fatherGivenNames = this.getRecordDataFieldWithListNoCase(["Father's Given name(s)"]);

      if (this.isDeath) {
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
    let id = "";
    if (this.isBirth) {
      id = "Births";
    } else if (this.isDeath) {
      id = "Deaths";
    } else if (this.isMarriage) {
      id = "Marriages";
    }
    let collectionData = { id: id };

    let registrationNumberParts = this.ed.registrationNumberParts;
    if (registrationNumberParts && registrationNumberParts.length >= 2) {
      collectionData.registrationNumber = registrationNumberParts[0];
      collectionData.year = registrationNumberParts[1];
    }

    return collectionData;
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
            name = name + " & " + spouseName;
          }
        }
        return name;
      }
    }
    return "";
  }

  getCitationDistrict() {
    let district = this.getRecordDataFieldWithListNoCase(["District"]);

    let convertedDistrict = convertDistrictCodeToName(district);
    if (convertedDistrict) {
      district = district + " (" + convertedDistrict + ")";
    } else {
      district = StringUtils.toInitialCapsEachWord(district);
    }

    return district;
  }

  getCitationDeathPlaceIfDifferentToDistrict() {
    if (this.isDeath) {
      let placeString = "";
      let motherGivenNames = this.getRecordDataFieldWithListNoCase(["Mother's Given name(s)"]);
      let district = this.getRecordDataFieldWithListNoCase(["District"]);

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

  getCitationDistrictPlusPossibleDeathPlace() {
    let district = this.getCitationDistrict();
    if (district) {
      if (this.recordType == RT.DeathRegistration) {
        let deathPlace = this.getCitationDeathPlaceIfDifferentToDistrict();
        if (deathPlace) {
          district += " (died in " + deathPlace + ")";
        }
      }
    }

    return district;
  }

  getCitationMotherGivenNames() {
    let parents = this.getParents();
    if (parents && parents.mother && parents.mother.name) {
      return parents.mother.name.forenames;
    }
  }

  getCitationFatherGivenNames() {
    let parents = this.getParents();
    if (parents && parents.father && parents.father.name) {
      return parents.father.name.forenames;
    }
  }

  getCitationAgeAtDeath() {
    return this.getAgeAtDeath();
  }
}

export { NswbdmEdReader };
