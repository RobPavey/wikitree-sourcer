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

// import { DateUtils } from "../../../base/core/date_utils.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";

class IlsosgovEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    function getNextWord(text, targetWord) {
      // Escapes special characters if targetWord contains them
      // const escapedWord = targetWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

      // Matches the target word, followed by 1 or more spaces, and captures the next word
      const regex = new RegExp(`\\b${targetWord}\\b\\s+(\\w+)`, "i");
      const match = text.match(regex);

      // Returns the captured group if found, otherwise null
      return match ? match[1] : null;
    }
    if (ed.collectionName) {
      this.recordType = getNextWord(ed.collectionName, "Statewide");
    }
    /*
    if (ed.collectionName && ed.collectionName.includes("Death")) {
      this.recordType = RT.DeathRegistration;
      this.isDeath = true;
    }
    */
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  toTitleCase(allCapsString) {
    const titleCaseString = allCapsString
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return titleCaseString;
  }

  makeNameObjFromFirstNamesAndLastName(firstNames, lastName) {
    if (firstNames || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setFirstNames(firstNames);
      return nameObj;
    }
  }

  makeNameObjFromFirstNameMiddleNameAndLastName(firstName, middleName, lastName) {
    if (firstName || middleName || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setMiddleName(middleName);
      nameObj.setFirstName(firstName);
      return nameObj;
    }
  }

  makeNameObjFromMiddleNameAndLastName(middleName, lastName) {
    if (middleName || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setMiddleName(middleName);
      return nameObj;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  // Note: there are default implementations in ExtractedDataReader and, if using a data-driven
  // style, you may not need to override them here.
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
    if (this.ed.recordData["Last Name"] && this.ed.recordData["Last Name"] !== "") {
      if (this.ed.recordData["First Name"] && this.ed.recordData["First Name"] !== "") {
        // if First Name exists
        if (this.ed.recordData["Middle Name"] && this.ed.recordData["Middle Name"] !== "") {
          return this.makeNameObjFromFirstNameMiddleNameAndLastName(
            this.ed.recordData["First Name"],
            this.ed.recordData["Middle Name"],
            this.ed.recordData["Last Name"]
          );
        } else {
          return this.makeNameObjFromFirstNamesAndLastName(
            this.ed.recordData["First Name"],
            this.ed.recordData["Last Name"]
          );
        }
      } else if (this.ed.recordData["Middle Name"] && this.ed.recordData["Middle Name"] !== "") {
        return this.makeNameObjFromMiddleNameAndLastName(
          this.ed.recordData["Middle Name"],
          this.ed.recordData["Last Name"]
        );
      }
    } else if (this.ed.recordData["Name of Deceased"] && this.ed.recordData["Name of Deceased"] !== "") {
      return this.makeNameObjFromLastNameCommaForenames(this.ed.recordData["Name of Deceased"]);
    } else if (this.ed.recordData["Groom"] && this.ed.recordData["Groom"] !== "") {
      return this.makeNameObjFromLastNameCommaForenames(this.ed.recordData["Groom"]);
    } else {
      return undefined;
    }
  }

  getGender() {
    if (this.ed.recordData["Sex"] && this.ed.recordData["Sex"] !== "") {
      if (this.ed.recordData["Sex"] == "M") {
        return "male";
      } else if (this.ed.recordData["Sex"] == "F") {
        return "female";
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getEventDateObj() {
    if (this.recordType == RT.Death) {
      if (this.ed.recordData["Death Date"] && this.ed.recordData["Death Date"] !== "-  -") {
        let dateObj = this.makeDateObjFromDateString(this.ed.recordData["Death Date"]);
        dateObj.qualifier = dateQualifiers.EXACT;
        return dateObj;
      } else if (this.ed.recordData["Date"] && this.ed.recordData["Date"] !== "") {
        let dateObj = this.makeDateObjFromDateString(this.ed.recordData["Date"]);
        dateObj.qualifier = dateQualifiers.EXACT;
        return dateObj;
      } else {
        return undefined;
      }
    } else if (this.recordType == RT.Marriage) {
      if (this.ed.recordData["Date"] && this.ed.recordData["Date"] !== "") {
        let dateObj = this.makeDateObjFromDateString(this.ed.recordData["Date"]);
        dateObj.qualifier = dateQualifiers.EXACT;
        return dateObj;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getDeathDateObj() {
    if (this.recordType == RT.Death) {
      if (this.ed.recordData["Death Date"] && this.ed.recordData["Death Date"] !== "-  -") {
        let dateObj = this.makeDateObjFromDateString(this.ed.recordData["Death Date"]);
        dateObj.qualifier = dateQualifiers.EXACT;
        return dateObj;
      } else if (this.ed.recordData["Date"] && this.ed.recordData["Date"] !== "") {
        let dateObj = this.makeDateObjFromDateString(this.ed.recordData["Date"]);
        dateObj.qualifier = dateQualifiers.EXACT;
        return dateObj;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    if (this.ed.recordData["Age"]) {
      const ageString = this.ed.recordData["Age"];
      if (
        ageString[0] == "H" ||
        ageString[0] == "D" ||
        ageString[0] == "M" ||
        ageString.slice(-2) === "SB" ||
        ageString.slice(-2) === "MN" ||
        ageString.slice(-2) === "HR" ||
        ageString.slice(-2) === "DA" ||
        ageString.slice(-2) === "WK" ||
        ageString.slice(-2) === "MO"
      ) {
        // age is stillborn, or in minutes, hours, days, weeks, or months
        return "0";
      }
      const match = ageString.match(/\d+/);
      if (match) {
        if (match[0]) {
          if (ageString[0] == "Y" || ageString.slice(-2) === "YR") {
            // age in years
            return match[0];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getDeathPlaceObj() {
    if (this.recordType == RT.Death) {
      let placeString = "";
      if (this.ed.recordData["County"] && this.ed.recordData["County"] !== "UNKNOWN") {
        if (this.ed.recordData["City"] && this.ed.recordData["City"] !== "UNKNOWN") {
          placeString += this.toTitleCase(this.ed.recordData["City"]) + ", ";
        }
        placeString += this.toTitleCase(this.ed.recordData["County"]) + " County, Illinois, United States of America";
      } else {
        placeString += "Illinois, United States of America";
      }
      return this.makePlaceObjFromFullPlaceName(placeString);
    } else {
      return undefined;
    }
  }

  getEventPlaceObj() {
    if (this.recordType == RT.Marriage) {
      let placeString = "";
      if (this.ed.recordData["County"] && this.ed.recordData["County"] !== "UNKNOWN") {
        if (this.ed.recordData["City"] && this.ed.recordData["City"] !== "UNKNOWN") {
          placeString += this.toTitleCase(this.ed.recordData["City"]) + ", ";
        }
        placeString += this.toTitleCase(this.ed.recordData["County"]) + " County, Illinois, United States of America";
      } else {
        placeString += "Illinois, United States of America";
      }
      return this.makePlaceObjFromFullPlaceName(placeString);
    } else {
      return undefined;
    }
  }

  getSpouses() {
    if (this.ed.recordData["Bride"] && this.ed.recordData["Bride"] !== "") {
      let spouseNameObj = this.makeNameObjFromLastNameCommaForenames(this.ed.recordData["Bride"]);
      if (spouseNameObj) {
        let eventDateObj = this.getEventDateObj();
        let eventPlaceObj = this.getEventPlaceObj();
        return [this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj)];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}

export { IlsosgovEdReader };
