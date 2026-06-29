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
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";

class NsvrEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);

    this.primaryPersonIndex = primaryPersonIndex;

    switch (ed.eventType) {
      case "birth":
        this.recordType = RT.BirthRegistration;
        break;
      case "marriage":
        this.recordType = RT.MarriageRegistration;
        this.isMarriage = true;
        break;
      case "death":
        this.recordType = RT.DeathRegistration;
        break;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  isPrimaryTheSecond() {
    let result = false;

    if (this.primaryPersonIndex == 1) {
      result = true;
    }

    return result;
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
    if (this.ed.eventType == "birth") {
      return this.makeNameObjFromFullName(this.ed.childName);
    } else if (this.ed.eventType == "marriage") {
      if (this.isPrimaryTheSecond()) {
        return this.makeNameObjFromFullName(this.ed.brideName);
      } else {
        return this.makeNameObjFromFullName(this.ed.groomName);
      }
    } else if (this.ed.eventType == "death") {
      return this.makeNameObjFromFullName(this.ed.deceasedName);
    }
  }

  getGender() {
    if (this.isMarriage) {
      if (this.isPrimaryTheSecond()) {
        return "female";
      } else {
        return "male";
      }
    }

    let nameObj = this.getNameObj();
    if (nameObj && nameObj.name) {
      let firstName = nameObj.name.split(" ")[0];
      return NameUtils.predictGenderFromGivenNames(firstName);
    }

    return "";
  }

  getEventDateObj() {
    if (this.ed.eventDate) {
      return this.makeDateObjFromDateString(this.ed.eventDate);
    } else {
      return this.makeDateObjFromYear(this.ed.eventYear);
    }
  }

  getBirthDateObj() {
    if (this.ed.eventType == "birth") {
      return this.getEventDateObj();
    }
  }

  getDeathDateObj() {
    if (this.ed.eventType == "death") {
      return this.getEventDateObj();
    }
  }

  getEventPlaceObj() {
    let fullPlaceName;
    if (this.ed.town && this.ed.county) {
      fullPlaceName = this.ed.town.concat(", ", this.ed.county, ", Nova Scotia");
    } else if (this.ed.county) {
      fullPlaceName = this.ed.county.concat(", Nova Scotia");
    }
    if (this.getEventDateObj() && this.getEventDateObj().yearNum > 1866) {
      // Canadian confederation occurred on 1 Jul 1867
      fullPlaceName = fullPlaceName.concat(", Canada");
    }
    return this.makePlaceObjFromFullPlaceName(fullPlaceName);
  }

  getBirthPlaceObj() {
    if (this.ed.eventType == "birth") {
      return this.getEventPlaceObj();
    }
  }

  getDeathPlaceObj() {
    if (this.ed.eventType == "death") {
      return this.getEventPlaceObj();
    }
  }

  getRegistrationDistrict() {
    if (this.ed.county) {
      return this.ed.county.concat(" County");
    }
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    return "";
  }

  getSpouses() {
    if (this.isMarriage) {
      let spouseFullName = this.ed.brideName;
      if (this.isPrimaryTheSecond()) {
        spouseFullName = this.ed.groomName;
      }
      let spouseNameObj = this.makeNameObjFromFullName(spouseFullName);
      if (spouseNameObj) {
        let spouse = { name: spouseNameObj };
        spouse.personGender = "female";
        if (this.isPrimaryTheSecond()) {
          spouse.personGender = "male";
        }
        let marriageDateObj = this.getEventDateObj();
        if (marriageDateObj) {
          spouse.marriageDate = marriageDateObj;
        }
        return [spouse];
      }
    }

    return undefined;
  }

  getPrimaryPersonOptions() {
    if (this.isMarriage) {
      let groomName = this.ed.groomName;
      let brideName = this.ed.brideName;

      if (groomName && brideName) {
        let options = [groomName + " (groom)", brideName + " (bride)"];
        return options;
      }
    }

    return undefined;
  }

  getCollectionData() {
    let collectionId = undefined;
    if (this.ed.eventType == "birth") {
      collectionId = "births";
    } else if (this.ed.eventType == "marriage") {
      collectionId = "marriages";
    } else if (this.ed.eventType == "death") {
      collectionId = "deaths";
    }

    // Collection
    if (collectionId) {
      let collectionData = { id: collectionId };
      collectionData.year = this.ed.regYear;
      if (this.ed.regBook) {
        collectionData.book = this.ed.regBook;
      }
      if (this.ed.regPage) {
        collectionData.page = this.ed.regPage;
      }
      collectionData.number = this.ed.regNumber;

      return collectionData;
    }
  }
}

export { NsvrEdReader };
