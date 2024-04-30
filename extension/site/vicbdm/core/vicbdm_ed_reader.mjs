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
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { NameObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

class VicbdmEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    if (ed.title) {
      if (ed.title == "birth certificate") {
        this.isBirth = true;
      } else if (ed.title == "death certificate") {
        this.isDeath = true;
      } else if (ed.title == "marriage certificate") {
        this.isMarriage = true;
      }
    } else {
      let event = this.getRecordDataValue("Event");
      if (event) {
        if (event == "births") {
          this.isBirth = true;
        } else if (event == "deaths") {
          this.isDeath = true;
        } else if (event == "marriages") {
          this.isMarriage = true;
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

    this.isPreReg = false;
    if (this.yearString) {
      let yearNum = Number(this.yearString);
      if (yearNum > 1800 && yearNum < 1853) {
        this.isPreReg = true;
      }
    }

    if (this.isPreReg) {
      if (this.isBirth) {
        this.recordType = RT.Birth;
      } else if (this.isDeath) {
        this.recordType = RT.Death;
      } else if (this.isMarriage) {
        this.recordType = RT.Marriage;
      }
    } else {
      if (this.isBirth) {
        this.recordType = RT.BirthRegistration;
      } else if (this.isDeath) {
        this.recordType = RT.DeathRegistration;
      } else if (this.isMarriage) {
        this.recordType = RT.MarriageRegistration;
      }
    }
  }

  getRecordDataValue(key) {
    if (key && this.ed.recordData) {
      return this.ed.recordData[key];
    }
  }

  getClickedRowDataValue(key) {
    if (key && this.ed.clickedRowData) {
      let rowData = this.ed.clickedRowData;
      return rowData[key];
    }
  }

  expandGivenNameAbbreviations(givenNamesString) {
    let newGivenNamesString = givenNamesString;
    if (givenNamesString) {
      let givenNamesArray = givenNamesString.split(" ");
      let newGivenNamesArray = [];
      for (let givenName of givenNamesArray) {
        givenName = givenName.trim();

        let full = NameUtils.convertEnglishGivenNameFromAbbrevationToFull(givenName);
        if (full) {
          givenName = full;
        }

        if (!newGivenNamesArray.includes(givenName)) {
          newGivenNamesArray.push(givenName);
        }
      }
      newGivenNamesString = newGivenNamesArray.join(" ");
    }

    return newGivenNamesString;
  }

  makeNameObjFromFamilyNameAndGivenNames(familyNameString, givenNamesString) {
    if (familyNameString && givenNamesString) {
      let cleanFamilyName = NameUtils.convertNameFromAllCapsToMixedCase(familyNameString);

      let nameObj = new NameObj();

      givenNamesString = this.expandGivenNameAbbreviations(givenNamesString);

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
          // Sometimes the familyNameString is something like:
          //  "<Unknown Family Name>, STANWAY George"
          let givenNamesArray = givenNamesString.split(" ");
          let numUppercaseWordsAtStart = 0;
          for (let givenName of givenNamesArray) {
            if (StringUtils.isWordAllUpperCase(givenName)) {
              numUppercaseWordsAtStart++;
            } else {
              break;
            }
          }
          if (numUppercaseWordsAtStart) {
            let newFamilyName = "";
            for (let index = 0; index < numUppercaseWordsAtStart; index++) {
              if (newFamilyName) {
                newFamilyName += " ";
              }
              newFamilyName += givenNamesArray[index];
            }
            let newGivenNames = "";
            for (let index = numUppercaseWordsAtStart; index < givenNamesArray.length; index++) {
              if (newGivenNames) {
                newGivenNames += " ";
              }
              newGivenNames += givenNamesArray[index];
            }
            familyNameString = newFamilyName;
            givenNamesString = newGivenNames;
          }
        }
        if (familyNameString || givenNamesString) {
          let cleanFamilyName = NameUtils.convertNameFromAllCapsToMixedCase(familyNameString);

          // Sometimes the given names has a name in all caps, in examples I have seen it is actually
          // the family name, so perhaps should check for that.
          let cleanGivenNames = NameUtils.convertNameFromAllCapsToMixedCase(givenNamesString);

          cleanGivenNames = this.expandGivenNameAbbreviations(cleanGivenNames);

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

  getGender() {
    let givenNames = this.getRecordDataValue("Given name(s)");
    return NameUtils.predictGenderFromGivenNames(givenNames);
  }

  getEventDateObj() {
    if (this.yearString) {
      return this.makeDateObjFromYear(this.yearString);
    }
    return undefined;
  }

  getEventPlaceObj() {
    /*
    let placeString = this.getRecordDataValue("Place of event");
    if (placeString) {

      let convertedPlaceName = expandVictoriaAbbreviations(placeString);
      return this.makePlaceObjFromFullPlaceName(convertedPlaceName);
    }
    */
    // Since we can't reliably interpret the place name abbreviations
    // just use this:

    // Sometimes the place might be outside of Victoria.
    // e.g. test case birth_1841_joseph_smith has
    //    "SYDNEY NEW SOUTH WALES, Australia"
    // This might only be the case for records before civil registration started
    // in 1853.
    let placeString = this.getRecordDataValue("Place of event");
    if (placeString) {
      let lcPlaceString = placeString.toLowerCase();
      if (this.isPreReg) {
        let usePlaceString = false;
        if (!lcPlaceString.includes("victoria") && !lcPlaceString.includes("vic,")) {
          if (lcPlaceString.includes("new south wales") || lcPlaceString.includes("nsw")) {
            usePlaceString = true;
          }
          if (lcPlaceString.includes("queensland") || lcPlaceString.includes("qld")) {
            usePlaceString = true;
          }
        }
        if (usePlaceString) {
          let cleanPlaceName = StringUtils.toInitialCapsEachWord(placeString);
          return this.makePlaceObjFromFullPlaceName(cleanPlaceName);
        }
      }

      // Events at sea after 1853 are OK as they will say
      // "was registered in ???? in Victoria, Australia"
      if (this.isPreReg) {
        if (lcPlaceString.includes("at sea")) {
          // Before 1853, if the ship name exists, then use it
          // e.g.: 'City Of Karachi, At Sea On Board " City Of Karachi ", Australia'
          // or: 'Unknown, At Sea On Board Ship " Unknown ",'
          let placeObj = new PlaceObj();
          placeObj.atSea = true;
          let shipName = placeString.replace(/^([^,]+)\, At Sea.*$/, "$1");
          if (shipName && shipName != placeString) {
            shipName = shipName.trim();
            if (shipName.toLowerCase() != "unknown") {
              placeObj.shipName = shipName;
            }
          }
          return placeObj;
        } else if (lcPlaceString.includes("on board")) {
          let placeObj = new PlaceObj();
          placeObj.atSea = true;
          let shipName = placeString.replace(/^([^,]+)\, ([\w\s]+) On Board.*$/, "$1");
          if (shipName && shipName != placeString) {
            let otherName = placeString.replace(/^([^,]+)\, ([\w\s]+) On Board.*$/, "$2");
            if (otherName && otherName != placeString) {
              shipName = shipName.trim();
              otherName = otherName.trim();
              if (shipName.toLowerCase() != "unknown") {
                placeObj.placeString = otherName;
                placeObj.shipName = shipName;
              }
            }
          }
          return placeObj;
        }
      }
    }
    return this.makePlaceObjFromFullPlaceName("Victoria, Australia");
  }

  getLastNameAtBirth() {
    if (this.isBirth) {
      let nameObj = this.getNameObj();
      if (nameObj && nameObj.lastName) {
        return nameObj.lastName;
      }
    }

    return "";
  }

  getLastNameAtDeath() {
    if (this.isDeath) {
      let nameObj = this.getNameObj();
      if (nameObj && nameObj.lastName) {
        return nameObj.lastName;
      }
    }

    return "";
  }

  getMothersMaidenName() {
    let mmn = this.getRecordDataValue("Mother's family name at birth");

    if (mmn && mmn != "UNKNOWN") {
      let cleanMmn = NameUtils.convertNameFromAllCapsToMixedCase(mmn);
      if (cleanMmn) {
        return cleanMmn;
      }
    }

    return "";
  }

  getBirthDateObj() {
    if (this.isBirth) {
      return this.getEventDateObj();
    }

    return undefined;
  }

  getBirthPlaceObj() {
    if (this.isBirth) {
      return this.getEventPlaceObj();
    } else if (this.isDeath) {
      let placeString = this.getClickedRowDataValue("Place of birth");
      if (placeString) {
        return this.makePlaceObjFromFullPlaceName(placeString);
      }
    }

    return undefined;
  }

  getDeathDateObj() {
    if (this.isDeath) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.isDeath) {
      return this.getEventPlaceObj();
    }
    return undefined;
  }

  getAgeAtEvent() {
    if (this.isDeath) {
      let age = this.getClickedRowDataValue("Age at Death");
      if (age) {
        return age;
      }
    }

    return "";
  }

  getAgeAtDeath() {
    if (this.isDeath) {
      let age = this.getClickedRowDataValue("Age at Death");
      if (age) {
        return age;
      }
    }

    return "";
  }

  getSpouses() {
    if (this.isMarriage) {
      let familyName = this.getRecordDataValue("Spouse's family name");
      let givenNames = this.getRecordDataValue("Spouse's given name(s)");

      let spouseNameObj = this.makeNameObjFromFamilyNameAndGivenNames(familyName, givenNames);

      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();

      let spouseObj = this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, "");
      if (spouseObj) {
        return [spouseObj];
      }
    } else if (this.isDeath) {
      let spouseNameString = this.getClickedRowDataValue("Spouse at Death");
      if (spouseNameString && spouseNameString != "<Unknown Family Name>") {
        let spouseNameObj = this.makeNameObjFromFamilyNameCommaGivenNames(spouseNameString);
        let spouseObj = this.makeSpouseObj(spouseNameObj);
        if (spouseObj) {
          return [spouseObj];
        }
      }
    }

    return undefined;
  }

  getParents() {
    let mothersName = this.getRecordDataValue("Mother's name");
    let mothersNameLnab = this.getRecordDataValue("Mother's family name at birth");
    let fathersName = this.getRecordDataValue("Father's Name");

    if (mothersNameLnab == "UNKNOWN") {
      mothersNameLnab = "";
    }

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
      if (mothersName) {
        let motherNameObj = this.makeNameObjFromFamilyNameCommaGivenNames(mothersName);
        if (motherNameObj) {
          if (cleanMmn) {
            motherNameObj.lastName = cleanMmn;
          }
          parents.mother = {};
          parents.mother.name = motherNameObj;
        }
      } else if (cleanMmn) {
        let motherNameObj = this.makeNameObjFromForenamesAndLastName("", cleanMmn);
        if (motherNameObj) {
          parents.mother = {};
          parents.mother.name = motherNameObj;
        }
      }

      if (this.isBirth && parents.father.name && !parents.father.name.lastName) {
        // there is no last name for father.
        // If there is a last name for mother this causes weird narratives
        // so if so then use the primary (child) persons last name as father's last name
        if (parents.mother.name && parents.mother.name.lastName) {
          let primaryNameObj = this.getNameObj();
          if (primaryNameObj && primaryNameObj.lastName) {
            parents.father.name.lastName = primaryNameObj.lastName;
          }
        }
      }
      return parents;
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
    let collectionData = { id: id, year: this.yearString, regNum: this.registrationNum };

    return collectionData;
  }
}

export { VicbdmEdReader };
