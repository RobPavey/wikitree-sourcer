/*
MIT License

Copyright (c) 2024 Robert M Pavey

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
import { NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { expandVictoriaAbbreviations } from "./vicbdm_place_abbreviations.mjs";

class VicbdmEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    if (ed.title) {
      if (ed.title == "birth certificate") {
        this.recordType = RT.Birth;
      } else if (ed.title == "death certificate") {
        this.recordType = RT.Death;
      } else if (ed.title == "marriage certificate") {
        this.recordType = RT.Marriage;
      }
    } else {
      let event = this.getRecordDataValue("Event");
      if (event) {
        if (event == "births") {
          this.recordType = RT.Birth;
        } else if (event == "deaths") {
          this.recordType = RT.Death;
        } else if (event == "marriages") {
          this.recordType = RT.Marriage;
        }
      }
    }

    let registrationNumber = this.getRecordDataValue("Registration number");
    if (registrationNumber) {
      let slashIndex = registrationNumber.indexOf("/");
      if (slashIndex != -1) {
        let yearString = registrationNumber.substring(slashIndex + 1).trim();
        if (yearString.length == 4 && /^\d\d\d\d$/.test(yearString)) {
          this.yearString = yearString;
          this.registrationNum = registrationNumber.substring(0, slashIndex).trim();
        }
      }
    }
  }

  getRecordDataValue(key) {
    if (key && this.ed.recordData) {
      return this.ed.recordData[key];
    }
  }

  makeNameObjFromFamilyNameAndGivenNames(familyNameString, givenNamesString) {
    if (familyNameString && givenNamesString) {
      let cleanFamilyName = NameUtils.convertNameFromAllCapsToMixedCase(familyNameString);

      let nameObj = new NameObj();

      nameObj.setForenames(givenNamesString);
      nameObj.setLastName(cleanFamilyName);

      return nameObj;
    }
  }

  makeNameObjFromFamilyNameCommaGivenNames(nameString) {
    if (nameString) {
      let commaIndex = nameString.indexOf(",");
      if (commaIndex != -1) {
        let familyNameString = nameString.substring(0, commaIndex).trim();
        let givenNamesString = nameString.substring(commaIndex + 1).trim();

        if (familyNameString == "<Unknown Family Name>") {
          familyNameString = "";
        }
        if (familyNameString || givenNamesString) {
          let cleanFamilyName = NameUtils.convertNameFromAllCapsToMixedCase(familyNameString);

          // Sometimes the given names has a name in all caps, in examples I have seen it is actually
          // the family name, so perhaps should check for that.
          let cleanGivenNames = NameUtils.convertNameFromAllCapsToMixedCase(givenNamesString);

          let nameObj = new NameObj();

          nameObj.setForenames(cleanGivenNames);
          nameObj.setLastName(cleanFamilyName);

          return nameObj;
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

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let familyName = this.getRecordDataValue("Family name");
    let givenNames = this.getRecordDataValue("Given name(s)");

    return this.makeNameObjFromFamilyNameAndGivenNames(familyName, givenNames);
  }

  getEventDateObj() {
    if (this.yearString) {
      return this.makeDateObjFromYear(this.yearString);
    }
    return undefined;
  }

  getEventPlaceObj() {
    let placeString = this.getRecordDataValue("Place of event");
    if (placeString) {
      let convertedPlaceName = expandVictoriaAbbreviations(placeString);

      return this.makePlaceObjFromFullPlaceName(convertedPlaceName);
    }

    return undefined;
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
    let mmn = this.getRecordDataValue("Mother's family name at birth");

    if (mmn) {
      let cleanMmn = NameUtils.convertNameFromAllCapsToMixedCase(mmn);
      if (cleanMmn) {
        return cleanMmn;
      }
    }

    return "";
  }

  getBirthDateObj() {
    if (this.recordType == RT.Birth) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.recordType == RT.Birth) {
      return this.getEventPlaceObj();
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Death) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.recordType == RT.Death) {
      return this.getEventPlaceObj();
    }
    return undefined;
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getSpouses() {
    if (this.recordType == RT.Marriage) {
      let familyName = this.getRecordDataValue("Spouse's family name");
      let givenNames = this.getRecordDataValue("Spouse's given name(s)");

      let spouseNameObj = this.makeNameObjFromFamilyNameAndGivenNames(familyName, givenNames);

      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();

      let spouseObj = this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, "");
      if (spouseObj) {
        return [spouseObj];
      }
    }

    return undefined;
  }

  getParents() {
    let mothersName = this.getRecordDataValue("Mother's name");
    let mothersNameLnab = this.getRecordDataValue("Mother's family name at birth");
    let fathersName = this.getRecordDataValue("Father's Name");

    if (mothersName || fathersName || mothersNameLnab) {
      let cleanMmn = NameUtils.convertNameFromAllCapsToMixedCase(mothersNameLnab);

      let parents = {};
      if (fathersName) {
        let fatherNameObj = this.makeNameObjFromFamilyNameCommaGivenNames(fathersName);
        if (fatherNameObj) {
          parents.father = {};
          parents.father.name = fatherNameObj;
        }
      }
      if (mothersName || cleanMmn) {
        let motherNameObj = this.makeNameObjFromFamilyNameCommaGivenNames(mothersName);
        if (motherNameObj) {
          if (cleanMmn) {
            motherNameObj.lastName = cleanMmn;
          }
          parents.mother = {};
          parents.mother.name = motherNameObj;
        }
      } else {
        let motherNameObj = this.makeNameObjFromForenamesAndLastName("", cleanMmn);
        if (motherNameObj) {
          parents.mother = {};
          parents.mother.name = motherNameObj;
        }
      }
      return parents;
    }
    return undefined;
  }

  getCollectionData() {
    let collectionData = { year: this.yearString, regNum: this.registrationNum };

    return collectionData;
  }
}

export { VicbdmEdReader };
