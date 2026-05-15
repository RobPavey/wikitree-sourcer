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
import { DateUtils } from "./date_utils.mjs";
import { NameUtils } from "./name_utils.mjs";

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
    let forenames = this.getValueUsingRecordTypeData("forenames");
    let lastName = this.getValueUsingRecordTypeData("lastName");

    let advanced = this.getRecordTypeProperty("advancedNameRules");
    if (advanced) {
      let advanced = this.recordTypeData.advancedNameRules;
      if (advanced.canHaveHonorificAfterForenamesWithComma) {
        let parts = forenames.split(",");
        if (parts.length == 2) {
          forenames = parts[1].trim() + " " + parts[0].trim();
        }
      }
    }

    if (forenames && lastName) {
      return this.makeNameObjFromForenamesAndLastName(forenames, lastName);
    }

    let fullName = this.getValueUsingRecordTypeData("fullName");

    if (fullName) {
      return this.makeNameObjFromFullName(forenames, lastName);
    }

    if (lastName) {
      return this.makeNameObjFromLastName(lastName);
    }

    if (forenames) {
      this.makeNameObjFromForenames(forenames);
    }

    return undefined;
  }

  getGender() {
    return this.getValueUsingRecordTypeData("gender");
  }

  getEventDateObj() {
    let dateString = this.getValueUsingRecordTypeData("eventDate");

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getEventPlaceObj() {
    let placeString = this.getValueUsingRecordTypeData("eventPlace");

    if (placeString) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
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
    let dateString = this.getValueUsingRecordTypeData("birthDate");

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getBirthPlaceObj() {
    let placeString = this.getValueUsingRecordTypeData("birthPlace");

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.getValueUsingRecordTypeData("deathDate");

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getDeathPlaceObj() {
    let placeString = this.getValueUsingRecordTypeData("deathPlace");

    if (placeString || this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getAgeAtEvent() {
    return this.getValueUsingRecordTypeData("ageAtEvent");
  }

  getAgeAtDeath() {
    return "";
  }

  getRace() {
    return "";
  }

  getRegistrationDistrict() {
    return this.getValueUsingRecordTypeData("registrationDistrict");
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    return "";
  }

  getOccupation() {
    return this.getValueUsingRecordTypeData("occupation");
  }

  getUnit() {
    return "";
  }

  getRank() {
    return "";
  }

  getServiceNumber() {
    return "";
  }

  getMilitaryBranch() {
    return "";
  }

  getMilitaryRegiment() {
    return "";
  }

  getArrivalDate() {
    return this.getValueUsingRecordTypeData("arrivalDate");
  }

  getArrivalPlace() {
    return this.getValueUsingRecordTypeData("arrivalPlace");
  }

  getDepartureDate() {
    return this.getValueUsingRecordTypeData("departureDate");
  }

  getDeparturePlace() {
    return this.getValueUsingRecordTypeData("departurePlace");
  }

  getShipName() {
    return this.getValueUsingRecordTypeData("shipName");
  }

  getSpouses() {
    let spouseNameObj = this.makeNameObjUsingRecordTypeDataKeys("spouseFullName", "spouseForenames", "spouseLastName");
    if (!spouseNameObj) {
      // could be bride and groom names
      let gender = this.getGender();

      if (gender == "male") {
        spouseNameObj = this.makeNameObjUsingRecordTypeDataKeys("brideFullName", "brideForenames", "brideLastName");
      } else if (gender == "female") {
        spouseNameObj = this.makeNameObjUsingRecordTypeDataKeys("groomFullName", "groomForenames", "groomLastName");
      } else {
        // no (valid) gender
        // try comparing this person's name with the bride and groom names

        let brideNameObj = this.makeNameObjUsingRecordTypeDataKeys("brideFullName", "brideForenames", "brideLastName");
        let groomNameObj = this.makeNameObjUsingRecordTypeDataKeys("groomFullName", "groomForenames", "groomLastName");

        if (brideNameObj && groomNameObj) {
          let mainPersonNameObj = makeNameObjUsingRecordTypeData("fullName", "forenames", "lastName");
          if (mainPersonNameObj.inferFullName() == brideNameObj.inferFullName()) {
            spouseNameObj = groomNameObj;
          } else if (mainPersonNameObj.inferFullName() == groomNameObj.inferFullName()) {
            spouseNameObj = brideNameObj;
          } else if (mainPersonNameObj.inferForenames() == brideNameObj.inferForenames()) {
            spouseNameObj = groomNameObj;
          } else if (mainPersonNameObj.inferForenames() == groomNameObj.inferForenames()) {
            spouseNameObj = brideNameObj;
          } else if (mainPersonNameObj.inferLastName() == brideNameObj.inferLastName()) {
            spouseNameObj = groomNameObj;
          } else if (mainPersonNameObj.inferLastName() == groomNameObj.inferLastName()) {
            spouseNameObj = brideNameObj;
          }
        }
      }
    }

    if (spouseNameObj) {
      let eventDateObj = undefined;
      let eventPlaceObj = undefined;
      let age = "";

      if (this.recordType == RT.Marriage || this.recordType == RT.MarriageRegistration) {
        eventDateObj = this.getEventDateObj();
        eventPlaceObj = this.getEventPlaceObj();
        age = this.getAgeAtEvent();
      }

      return [this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, age)];
    }
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getPrimaryPerson() {
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getPrimaryPersonOptions() {
    return undefined;
  }

  getSpousePersonOptions() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }

  setCustomFields(gd) {}

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

  makeNameObjFromForenames(forenames) {
    if (forenames) {
      let nameObj = new NameObj();
      nameObj.setForenames(forenames);
      return nameObj;
    }
  }

  makeNameObjFromLastName(lastName) {
    if (lastName) {
      let nameObj = new NameObj();
      nameObj.setLastName(lastName);
      return nameObj;
    }
  }

  makeNameObjFromLastNameCommaForenames(nameString) {
    if (nameString) {
      let commaIndex = nameString.indexOf(",");
      if (commaIndex != -1) {
        let lastName = nameString.substring(0, commaIndex).trim();
        let forenames = nameString.substring(commaIndex + 1).trim();
        let nameObj = new NameObj();
        nameObj.setLastName(lastName);
        nameObj.setForenames(forenames);
        return nameObj;
      }
    }
  }

  makeNameObjUsingRecordTypeDataKeys(fullNameKey, forenamesKey, lastNameKey) {
    let nameObj = undefined;
    let fullName = this.getValueUsingRecordTypeData(fullNameKey);
    if (fullName) {
      nameObj = this.makeNameObjFromFullName(fullName);
    } else {
      let forenames = this.getValueUsingRecordTypeData(forenamesKey);
      let lastName = this.getValueUsingRecordTypeData(lastNameKey);
      if (forenames || lastName) {
        nameObj = this.makeNameObjFromForenamesAndLastName(forenames, lastName);
      }
    }
    return nameObj;
  }

  makeDateObjFromDateString(dateString) {
    if (dateString) {
      let dateObj = new DateObj();

      // handle quarter strings
      let quarterRegex = /^([A-Z][a-z][a-z]\-[A-Z][a-z][a-z]\-[A-Z][a-z][a-z])\s+(\d\d\d\d)/;
      if (quarterRegex.test(dateString)) {
        let quarterString = dateString.replace(quarterRegex, "$1");
        let yearString = dateString.replace(quarterRegex, "$2");
        if (quarterString && quarterString != dateString && yearString && yearString != dateString) {
          const quarterStringToQuarter = {
            "Jan-Feb-Mar": 1,
            "Apr-May-Jun": 2,
            "Jul-Aug-Sep": 3,
            "Oct-Nov-Dec": 4,
          };
          let quarter = quarterStringToQuarter[quarterString];
          if (quarter) {
            dateObj.quarter = quarter;
            dateObj.yearString = yearString;
            return dateObj;
          }
        }
      }

      // handle alternate quarter strings like "April - June 1839"
      let altQuarterRegex = /^([A-Z][a-z]+\s*\-\s*[A-Z][a-z]+)\s+(\d\d\d\d)/;
      if (altQuarterRegex.test(dateString)) {
        let quarterString = dateString.replace(altQuarterRegex, "$1");
        let yearString = dateString.replace(altQuarterRegex, "$2");
        if (quarterString && quarterString != dateString && yearString && yearString != dateString) {
          const quarterStringToQuarter = {
            "January-March": 1,
            "April-June": 2,
            "July-September": 3,
            "October-December": 4,
          };
          quarterString = quarterString.replace(/\s*/g, "");
          let quarter = quarterStringToQuarter[quarterString];
          if (quarter) {
            dateObj.quarter = quarter;
            dateObj.yearString = yearString;
            return dateObj;
          }
        }
      }

      // handle alternate quarter strings like "Jan to Mar 1902"
      let alt2QuarterRegex = /^([A-Z][a-z]+\s+to\s+[A-Z][a-z]+)\s+(\d\d\d\d)/;
      if (alt2QuarterRegex.test(dateString)) {
        let quarterString = dateString.replace(alt2QuarterRegex, "$1");
        let yearString = dateString.replace(alt2QuarterRegex, "$2");
        if (quarterString && quarterString != dateString && yearString && yearString != dateString) {
          const quarterStringToQuarter = {
            "Jan to Mar": 1,
            "Apr to Jun": 2,
            "Jul to Sep": 3,
            "Oct to Dec": 4,
          };
          quarterString = quarterString.replace(/\s+/g, " ");
          const quarterSepRegEx = /^([A-Z][a-z]+)\s+to\s+([A-Z][a-z]+)$/;
          let month1 = quarterString.replace(quarterSepRegEx, "$1");
          let month2 = quarterString.replace(quarterSepRegEx, "$2");
          if (month1.length > 3) {
            month1 = month1.substring(0, 3);
          }
          if (month2.length > 3) {
            month2 = month2.substring(0, 3);
          }
          quarterString = month1 + " to " + month2;
          let quarter = quarterStringToQuarter[quarterString];
          if (quarter) {
            dateObj.quarter = quarter;
            dateObj.yearString = yearString;
            return dateObj;
          }
        }
      }

      dateObj.setDateAndQualifierFromString(dateString);
      return dateObj;
    }
  }

  makeDateObjFromDdmmyyyyDate(ddmmyyyyDate, separator) {
    if (ddmmyyyyDate) {
      let parts = ddmmyyyyDate.split(separator);
      if (parts.length != 3) {
        if (parts.length == 1) {
          // could be year only
          if (/^\d\d\d\d$/.test(ddmmyyyyDate)) {
            let dateObj = new DateObj();
            dateObj.yearString = ddmmyyyyDate;
            return dateObj;
          }
        }
        return;
      }

      let day = parts[0];
      let month = parts[1];
      let year = parts[2];

      if (day.length != 2 || month.length != 2 || year.length != 4) {
        return;
      }

      let dayNum = parseInt(day);
      let monthNum = parseInt(month);
      let yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return;
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makeDateObjFromMmddyyyyDate(mmddyyyyDate, separator) {
    if (mmddyyyyDate) {
      let parts = mmddyyyyDate.split(separator);
      if (parts.length != 3) {
        if (parts.length == 1) {
          // could be year only
          if (/^\d\d\d\d$/.test(mmddyyyyDate)) {
            let dateObj = new DateObj();
            dateObj.yearString = mmddyyyyDate;
            return dateObj;
          }
        }
        return;
      }

      let month = parts[0];
      let day = parts[1];
      let year = parts[2];

      /*
        We want to allow dates like 12/3/1887
      if (day.length != 2 || month.length != 2 || year.length != 4) {
        return;
      }
        */

      let dayNum = parseInt(day);
      let monthNum = parseInt(month);
      let yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return;
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makeDateObjFromYyyymmddDate(yyyymmddDate, separator = "-") {
    if (yyyymmddDate) {
      let parts = yyyymmddDate.split(separator);
      if (parts.length != 3) {
        if (parts.length == 1) {
          // could be year only
          if (/^\d\d\d\d$/.test(yyyymmddDate)) {
            let dateObj = new DateObj();
            dateObj.yearString = yyyymmddDate;
            return dateObj;
          }
        }
        return;
      }

      let year = parts[0];
      let month = parts[1];
      let day = parts[2];

      if (day.length != 2 || month.length != 2 || year.length != 4) {
        return;
      }

      let dayNum = parseInt(day);
      let monthNum = parseInt(month);
      let yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return;
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makeDateObjFromMonthDdYyyyTimeDate(inputDateString) {
    // Example: May 17 1916 12:00AM
    if (inputDateString) {
      let parts = inputDateString.split(" ");
      if (parts.length == 4) {
        let month = parts[0];
        let day = parts[1];
        let year = parts[2];

        if (day.length < 1 || month.length < 3 || year.length != 4) {
          return;
        }

        let dayNum = parseInt(day);
        let yearNum = parseInt(year);

        if (isNaN(dayNum) || isNaN(yearNum)) {
          return;
        }

        let initialDateString = day + " " + month + " " + year;

        let parsedDate = DateUtils.parseDateString(initialDateString);
        if (parsedDate && parsedDate.isValid) {
          let dateString = DateUtils.getStdShortFormDateString(parsedDate);

          if (dateString) {
            let dateObj = new DateObj();
            dateObj.dateString = dateString;
            return dateObj;
          }
        }
      }
    }
  }

  makeDateObjFromYear(yearString) {
    if (yearString) {
      let dateObj = new DateObj();
      dateObj.yearString = yearString;
      return dateObj;
    }
  }

  makeDateObjFromYearRange(yearString) {
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
    let advanced = this.getRecordTypeProperty("advancedPlaceRules");

    if (!placeString) {
      placeString = "";
    }

    function addPart(part) {
      if (part) {
        if (placeString) {
          placeString += ", ";
        }
        placeString += part;
      }
    }

    function addImpliedParts(placeObj) {
      if (advanced) {
        if (!placeString && !advanced.addImpliedPartsToBlankPlace) {
          return;
        }

        let existingParts = placeObj.separatePlaceIntoParts();

        if (advanced.impliedStateName && !existingParts.state) {
          addPart(advanced.impliedStateName);
          placeObj.state = advanced.impliedStateName;
        }
        if (advanced.impliedCountryName && !existingParts.country) {
          addPart(advanced.impliedCountryName);
          placeObj.country = advanced.impliedCountryName;
        }
      }
    }

    let placeObj = new PlaceObj();
    addImpliedParts(placeObj);
    placeObj.placeString = placeString;

    if (placeString) {
      return placeObj;
    }

    return undefined;
  }

  makePlaceObjFromCountryName(countryString) {
    if (countryString) {
      let placeObj = new PlaceObj();
      placeObj.country = countryString;
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

  getRecordDataValue(key) {
    if (!key || !this.ed.recordData) {
      return undefined;
    }

    return this.ed.recordData[key];
  }

  getRecordDataValueForKeys(keys) {
    if (this.ed.recordData && keys) {
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

  getExtractedDataValueForKeys(keys) {
    if (this.ed && keys) {
      if (keys && keys.length > 0) {
        for (let key of keys) {
          let value = this.ed[key];
          if (value) {
            return value;
          }
        }
      }
    }
  }

  getRecordTypeMatch(recordTypeMatches, inputData) {
    let collectionId = inputData.collectionId;
    let collectionTitle = inputData.collectionTitle;
    let documentType = inputData.documentType;
    let documentSubtype = inputData.documentSubtype;
    let recordData = inputData.recordData;
    let recordDataLabels = inputData.recordDataLabels;
    let recordSections = inputData.recordSections;

    for (let typeData of recordTypeMatches) {
      // collectionId
      if (typeData.collectionIds) {
        if (!collectionId) {
          continue;
        }
        let collectionIdMatchFound = false;
        for (let typeCollectionId of typeData.collectionIds) {
          if (typeCollectionId.toLowerCase() == collectionId.toLowerCase()) {
            collectionIdMatchFound = true;
            break;
          }
        }
        if (!collectionIdMatchFound) {
          continue;
        }
      }

      // document type
      if (typeData.documentTypes) {
        if (!documentType) {
          continue;
        }
        let documentTypeMatchFound = false;
        for (let typeDocumentType of typeData.documentTypes) {
          if (typeDocumentType.toLowerCase() == documentType.toLowerCase()) {
            documentTypeMatchFound = true;
            break;
          }
        }
        if (!documentTypeMatchFound) {
          continue;
        }
      }

      // document subtype
      if (typeData.documentSubtypes) {
        if (!documentSubtype) {
          continue;
        }
        let documentSubtypeMatchFound = false;
        for (let typeDocumentSubtype of typeData.documentSubtypes) {
          if (typeDocumentSubtype.toLowerCase() == documentSubtype.toLowerCase()) {
            documentSubtypeMatchFound = true;
            break;
          }
        }
        if (!documentSubtypeMatchFound) {
          continue;
        }
      }

      // collection title
      if (typeData.collectionTitleMatches) {
        if (!collectionTitle) {
          continue;
        }

        let title = collectionTitle.toLowerCase();
        let collectionTitleMatchFound = false;
        for (let typeDataTitleParts of typeData.collectionTitleMatches) {
          let partsMatch = true;
          for (let part of typeDataTitleParts) {
            part = part.toLowerCase();
            if (!title.includes(part)) {
              partsMatch = false;
              break;
            }
          }
          if (partsMatch) {
            collectionTitleMatchFound = true;
            break;
          }
        }

        if (!collectionTitleMatchFound) {
          continue;
        }
      }

      if (typeData.requiredRecordSections) {
        if (!recordSections) {
          continue;
        }

        let recordSectionMatchFound = false;
        for (let requiredSectionSet of typeData.requiredRecordSections) {
          let sectionsPresent = true;
          for (let section of requiredSectionSet) {
            if (!recordSections[section]) {
              sectionsPresent = false;
              break;
            }
          }
          if (sectionsPresent) {
            recordSectionMatchFound = true;
            break;
          }
        }
        if (!recordSectionMatchFound) {
          continue;
        }
      }

      if (typeData.requiredFields) {
        if (recordData) {
          let requiredFieldsMatchFound = false;
          for (let requiredFieldSet of typeData.requiredFields) {
            let fieldsPresent = true;
            for (let label of requiredFieldSet) {
              label = label.toLowerCase();
              let fieldFound = false;
              for (let key of Object.keys(recordData)) {
                if (key.toLowerCase() == label) {
                  fieldFound = true;
                  break;
                }
              }

              if (!fieldFound) {
                fieldsPresent = false;
                break;
              }
            }
            if (fieldsPresent) {
              requiredFieldsMatchFound = true;
              break;
            }
          }
          if (!requiredFieldsMatchFound) {
            continue;
          }
        } else if (recordDataLabels) {
          let requiredFieldsMatchFound = false;
          for (let requiredFieldSet of typeData.requiredFields) {
            let fieldsPresent = true;
            for (let label of requiredFieldSet) {
              label = label.toLowerCase();
              let fieldFound = false;
              for (let key of recordDataLabels) {
                if (key.toLowerCase() == label) {
                  fieldFound = true;
                  break;
                }
              }

              if (!fieldFound) {
                fieldsPresent = false;
                break;
              }
            }
            if (fieldsPresent) {
              requiredFieldsMatchFound = true;
              break;
            }
          }
          if (!requiredFieldsMatchFound) {
            continue;
          }
        } else {
          continue;
        }
      }

      // if we get this far it is a match
      return typeData;
    }

    return undefined;
  }

  determineRecordType(recordTypeMatches, inputData) {
    let typeData = this.getRecordTypeMatch(recordTypeMatches, inputData);
    if (typeData) {
      return typeData.recordType;
    }

    return RT.Unclassified;
  }

  getGenderFromString(genderString, maleValues, femaleValues, doToLowerCase = false) {
    if (genderString) {
      if (doToLowerCase) {
        genderString = genderString.toLowerCase();
      }
      if (maleValues.includes(genderString)) {
        return "male";
      } else if (femaleValues.includes(genderString)) {
        return "female";
      }
    }
    return "";
  }

  getGenderFromRecordData(key, maleValues, femaleValues, doToLowerCase = false) {
    let genderString = this.getRecordDataValue(key);
    return this.getGenderFromString(genderString, maleValues, femaleValues, doToLowerCase);
  }

  getValueUsingRule(rule) {
    let value = undefined;
    if (!rule) {
      return value;
    }

    if (rule.prioritizeEdKeys) {
      value = this.getExtractedDataValueForKeys(rule.edKeys);
    }

    if (!value) {
      value = this.getRecordDataValueForKeys(rule.recordDataKeys);
    }

    if (!value && !rule.prioritizeEdKeys) {
      value = this.getExtractedDataValueForKeys(rule.edKeys);
    }

    if (value) {
      if (rule.convertNameFromAllCapsToMixedCase) {
        value = NameUtils.convertNameFromAllCapsToMixedCase(value);
      }
      if (rule.modifier) {
        let mod = rule.modifier;
        if (mod.regex && mod.replaceString) {
          if (mod.regex.test(value)) {
            value = value.replace(mod.regex, mod.replaceString);
          }
        }
      }
      if (rule.valueMapping) {
        for (let key of Object.keys(rule.valueMapping)) {
          const matches = rule.valueMapping[key].matches;
          if (matches) {
            if (matches.includes(value)) {
              value = key;
              break;
            }
          }
        }
      }
    }

    return value;
  }

  getRecordDataRuleForName(name) {
    // name is a standard name used in gd
    let rule = undefined;
    let defaultRule = undefined;

    if (this.recordTypeData && this.recordTypeData.rules) {
      rule = this.recordTypeData.rules[name];
    }

    if (this.defaultRecordTypeData && this.defaultRecordTypeData.rules) {
      defaultRule = this.defaultRecordTypeData.rules[name];
    }

    if (rule && defaultRule && rule.combineRule) {
      rule = { ...rule, ...defaultRule };
    } else if (!rule && defaultRule) {
      rule = defaultRule;
    }

    return rule;
  }

  getValueUsingRecordTypeData(name) {
    // name is a standard name used in gd
    let value = undefined;
    let rule = undefined;
    let defaultRule = undefined;

    if (this.recordTypeData && this.recordTypeData.rules) {
      rule = this.recordTypeData.rules[name];
    }

    if (this.defaultRecordTypeData && this.defaultRecordTypeData.rules) {
      defaultRule = this.defaultRecordTypeData.rules[name];
    }

    if (rule && defaultRule && rule.combineRule) {
      rule = { ...rule, ...defaultRule };
    }

    if (rule) {
      value = this.getValueUsingRule(rule);
      if (value) {
        if (rule.substition) {
        }
      }
    }

    if (!value && defaultRule) {
      value = this.getValueUsingRule(defaultRule);
    }

    return value;
  }

  getRecordTypeProperty(key) {
    let property = undefined;
    let defaultProperty = undefined;

    if (this.recordTypeData && this.recordTypeData[key]) {
      property = this.recordTypeData[key];
    }

    if (this.defaultRecordTypeData && this.defaultRecordTypeData[key]) {
      defaultProperty = this.defaultRecordTypeData[key];
    }

    if (property) {
      if (defaultProperty) {
        // both exist
        if (typeof property === "object" && typeof defaultProperty === "object") {
          if (property.doNotCombineWithDefault) {
            return property;
          } else {
            return { ...property, ...defaultProperty };
          }
        } else {
          return property;
        }
      } else {
        return property;
      }
    } else if (defaultProperty) {
      return defaultProperty;
    }

    return undefined;
  }
}

export { ExtractedDataReader };
