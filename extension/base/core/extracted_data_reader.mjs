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

import { RT } from "./record_type.mjs";
import { NameObj, DateObj, PlaceObj } from "./generalize_data_utils.mjs";

// This is the base class for the EdReader for each site (that uses this pattern)
// The main reason for the base class is so that if the derived class doesn't define one of these functions
// there will not be an error, since the common code in commonGeneralizeData calls many of these functions
//
// The purpose of EdReader classes if to interpret the extracted data for each site.
// We try to keep the extractData code for each site as simple as possible because that runs in the content script.
// We the EdReader provides the code to interpret the extracted data. Mainly for the generalizeData function
// but also any other code that accesses the extracted data (like buildCitation or BuildHouseholdTable).
class ExtractedDataReader {
  constructor(ed) {
    this.ed = ed;

    this.recordType = RT.Unclassified;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions that are typically overridden when the site can provide this data
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // If this returns false none of the functions below will be called in commonGeneralizeData
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
    return undefined;
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
    return undefined;
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

  getSpouseObj(eventDateObj, eventPlaceObj) {
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions to reduce code in derived classes
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromFullName(fullNameString) {
    if (fullNameString) {
      let nameObj = new NameObj();
      nameObj.setFullName(fullNameString);
      return nameObj;
    }
  }

  makeNameObjFromForenamesAndLastName(forenames, lastName) {
    if (forenames || lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      nameObj.setForenames(forenames);
      return nameObj;
    }
  }

  makeDateObjFromDateString(dateString) {
    if (dateString) {
      let dateObj = new DateObj();
      dateObj.dateString = dateString;
      return dateObj;
    }
  }

  makeDateObjFromYear(yearString) {
    if (yearString) {
      let dateObj = new DateObj();
      dateObj.yearString = yearString;
      return dateObj;
    }
  }

  makeDateObjFromYearAndQuarter(yearString, quarterNum) {
    if (yearString) {
      let dateObj = new DateObj();
      dateObj.yearString = yearString;
      if (quarterNum) {
        dateObj.quarter = quarterNum;
      }
      return dateObj;
    }
  }

  makePlaceObjFromFullPlaceName(placeString) {
    if (placeString) {
      let placeObj = new PlaceObj();
      placeObj.placeString = placeString;
      return placeObj;
    }
  }

  makeSpouseObj(spouseNameObj, marriageDateObj, marriagePlaceObj, spouseAge) {
    let spouseObj = undefined;

    if (spouseNameObj || marriageDateObj || marriagePlaceObj) {
      spouseObj = {};

      if (spouseNameObj) {
        spouseObj.name = spouseNameObj;
      }
      if (marriageDateObj) {
        spouseObj.marriageDate = marriageDateObj;
      }
      if (marriagePlaceObj) {
        spouseObj.marriagePlace = marriagePlaceObj;
      }
      if (spouseAge) {
        spouseObj.age = spouseAge;
      }
    }
    return spouseObj;
  }

  makeParentsFromForenamesAndLastNames(fatherForenames, fatherLastName, motherForenames, motherLastName) {
    if (fatherForenames || fatherLastName || motherForenames || motherLastName) {
      let parents = {};
      if (fatherForenames || fatherLastName) {
        parents.father = {};
        parents.father.name = this.makeNameObjFromForenamesAndLastName(fatherForenames, fatherLastName);
      }
      if (motherForenames || motherLastName) {
        parents.mother = {};
        parents.mother.name = this.makeNameObjFromForenamesAndLastName(motherForenames, motherLastName);
      }
      return parents;
    }
  }

  makeParentsFromFullNames(fatherName, motherName) {
    if (fatherName || motherName) {
      let parents = {};
      if (fatherName) {
        parents.father = {};
        parents.father.name = this.makeNameObjFromFullName(fatherName);
      }
      if (motherName) {
        parents.mother = {};
        parents.mother.name = this.makeNameObjFromFullName(motherName);
      }
      return parents;
    }
  }

  makeParentsFromFatherFullName(fatherFullName) {
    if (fatherFullName) {
      let parents = {};
      parents.father = {};
      parents.father.name = this.makeNameObjFromFullName(fatherFullName);
      return parents;
    }
  }

  getFirstFoundProperty(dataObject, fieldNames) {
    let result = undefined;
    for (let fieldName of fieldNames) {
      result = dataObject[fieldName];
      if (result) {
        break;
      }
    }
    return result;
  }

  getRecordDataValueForKeys(keys) {
    if (keys && keys.length > 0) {
      for (let key of keys) {
        let value = this.ed.recordData[key];
        if (value) {
          return value;
        }
      }
    }
  }
}

export { ExtractedDataReader };
