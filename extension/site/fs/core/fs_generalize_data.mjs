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

import {
  GeneralizedData,
  GD,
  dateQualifiers,
  WtsName,
  WtsDate,
  WtsPlace,
} from "../../../base/core/generalize_data_utils.mjs";
import { RT, Role } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";

const factTypeToRecordType = [
  {
    type: undefined,
    defaultRT: RT.Unclassified,
  },
  {
    type: "Birth",
    defaultRT: RT.Birth,
    titleMatches: [
      {
        recordType: RT.BirthRegistration,
        matches: ["England and Wales Birth Registration Index", "New Zealand, Civil Records Indexes"],
      },
    ],
    recordDataMatches: [
      { recordType: RT.BirthRegistration, matches: ["Registration Number"] },
      {
        recordType: RT.BirthRegistration,
        matches: ["Baptism Date", "Christening Date"],
      },
    ],
  },
  {
    type: "Death",
    defaultRT: RT.Death,
    titleMatches: [
      {
        title: RT.DeathRegistration,
        matches: ["England and Wales Death Registration Index"],
      },
    ],
  },
  {
    type: "BirthRegistration",
    defaultRT: RT.BirthRegistration,
  },
  {
    type: "MarriageRegistration",
    defaultRT: RT.MarriageRegistration,
  },
  {
    type: "DeathRegistration",
    defaultRT: RT.DeathRegistration,
  },
  {
    type: "Marriage",
    defaultRT: RT.Marriage,
    titleMatches: [
      {
        recordType: RT.MarriageRegistration,
        matches: ["England and Wales Marriage Registration Index"],
      },
    ],
  },
  {
    type: "MarriageNotice",
    defaultRT: RT.Marriage,
  },
  {
    type: "MarriageLicense",
    defaultRT: RT.Marriage,
  },
  {
    type: "MarriageBanns",
    defaultRT: RT.Marriage,
  },
  {
    type: "Divorce",
    defaultRT: RT.Divorce,
  },
  {
    type: "Census",
    defaultRT: RT.Census,
  },
  {
    type: "Residence",
    defaultRT: RT.Residence,
    titleMatches: [
      { recordType: RT.LandTax, matches: ["Land Tax"] },
      { recordType: RT.SchoolRecords, matches: ["School Records"] },
      { recordType: RT.Census, matches: ["Census"] },
    ],
  },
  {
    type: "EducationEnrollment",
    defaultRT: RT.SchoolRecords,
  },
  {
    type: "Baptism",
    defaultRT: RT.Baptism,
  },
  {
    type: "Christening",
    defaultRT: RT.Baptism,
  },
  {
    type: "Burial",
    defaultRT: RT.Burial,
  },
  {
    type: "Probate",
    defaultRT: RT.Probate,
  },
  {
    type: "Obituary",
    defaultRT: RT.Obituary,
  },
  {
    type: "Immigration",
    defaultRT: RT.Immigration,
    titleMatches: [{ recordType: RT.PassengerList, matches: ["Passenger List"] }],
  },
  {
    type: "MilitaryService",
    defaultRT: RT.Military,
  },
  {
    type: "MilitaryDraftRegistration",
    defaultRT: RT.Military,
  },
  {
    type: "VoterRegistration",
    defaultRT: RT.ElectoralRegister,
    titleMatches: [{ recordType: RT.ElectoralRegister, matches: ["Electoral Register"] }],
  },
  {
    type: "TaxAssessment",
    defaultRT: RT.Tax,
  },
  {
    type: "Pension",
    defaultRT: RT.Pension,
  },
  {
    type: "PassportApplication",
    defaultRT: RT.PassportApplication,
  },
];

const sourceRecordTypeToRecordType = [
  {
    type: undefined,
    defaultRT: RT.Unclassified,
  },
  {
    type: "Marriages",
    defaultRT: RT.Marriage,
  },
];

function determineRecordType(extractedData) {
  const titleMatches = [{ type: RT.Census, matches: ["Census"] }];

  //console.log("in determineRecordType, factType is");
  //console.log(extractedData.factType);

  function lookup(factType, collectionTitle, recordData, table) {
    for (let obj of table) {
      if (factType == obj.type) {
        if (obj.titleMatches && collectionTitle) {
          for (let titleMatch of obj.titleMatches) {
            for (let match of titleMatch.matches) {
              if (collectionTitle.includes(match)) {
                let recordType = titleMatch.recordType;
                return recordType;
              }
            }
          }
        }
        if (recordData && obj.recordDataMatches) {
          for (let recordDataMatch of obj.recordDataMatches) {
            for (let match of recordDataMatch.matches) {
              if (recordData.hasOwnProperty(match)) {
                let recordType = recordDataMatch.recordType;
                return recordType;
              }
            }
          }
        }
        let recordType = obj.defaultRT;
        if (recordType) {
          return recordType;
        }
      }
    }
  }

  let sourceTitle = extractedData.sourceTitleForPerson;
  let recordData = extractedData.recordData;

  // If there is a relatedPersonFactType that implies that it is
  // the fact type of the primary fact
  if (extractedData.relatedPersonFactType) {
    let recordType = lookup(extractedData.relatedPersonFactType, sourceTitle, recordData, factTypeToRecordType);
    if (recordType != undefined) {
      return recordType;
    }
  }

  if (extractedData.factType) {
    let recordType = lookup(extractedData.factType, sourceTitle, recordData, factTypeToRecordType);
    if (recordType != undefined) {
      return recordType;
    }
  }

  if (recordData && recordData["Source Record Type"]) {
    let sourceRecordType = recordData["Source Record Type"];
    let recordType = lookup(sourceRecordType, sourceTitle, recordData, sourceRecordTypeToRecordType);
    if (recordType != undefined) {
      return recordType;
    }
  }

  if (sourceTitle) {
    for (let titleMatch of titleMatches) {
      for (let match of titleMatch.matches) {
        if (sourceTitle.includes(match)) {
          return titleMatch.type;
        }
      }
    }

    // check for birth or death registration
    if (sourceTitle.includes("Registration")) {
      if (sourceTitle.includes("Birth")) {
        return RT.BirthRegistration;
      }
      if (sourceTitle.includes("Death")) {
        return RT.DeathRegistration;
      }
    }

    // check for a marriage
    if (sourceTitle.includes("Marriage") && extractedData.recordData && extractedData.recordData["Marriage Date"]) {
      return RT.Marriage;
    }

    if (sourceTitle.includes("Criminal Register")) {
      return RT.CriminalRegister;
    }

    if (sourceTitle.includes("Freemason Membership")) {
      return RT.FreemasonMembership;
    }
  }

  return RT.Unclassified;
}

function determineRecordTypeAndRole(extractedData, result) {
  let recordType = determineRecordType(extractedData);

  if (extractedData.relatedPersonFactType) {
    if (extractedData.relationshipToFactPerson) {
      if (extractedData.relationshipToFactPerson == "Parent") {
        result.role = Role.Parent;
      } else if (extractedData.relationshipToFactPerson == "Child") {
        result.role = Role.Child;
      } else if (extractedData.relationshipToFactPerson == "Spouse") {
        result.role = Role.Spouse;
      }
      if (extractedData.relatedPersonFullName) {
        result.primaryPerson = extractedData.relatedPersonFullName;
      }
      if (extractedData.relatedPersonGender) {
        result.primaryPersonGender = extractedData.relatedPersonGender;
      }
    }
  }

  result.recordType = recordType;
}

function cleanOccupation(text) {
  let newText = text;
  if (text && /^[^a-z]+$/.test(text)) {
    // there are no lowercase characters
    newText = WTS_String.toInitialCapsEachWord(text);
  }
  return newText;
}

function setFieldIfDefined(targetObject, fieldName, value) {
  if (typeof value !== "undefined") {
    targetObject[fieldName] = value;
  }
}

const quarterNames = [
  {
    name: "Jan-Feb-Mar",
    value: 1,
  },
  {
    name: "Apr-May-Jun",
    value: 2,
  },
  {
    name: "Jul-Aug-Sep",
    value: 3,
  },
  {
    name: "Oct-Nov-Dec",
    value: 4,
  },
];

function cleanDate(dateString) {
  if (!dateString) {
    return dateString;
  }

  // sometimes the dates are surrounded by < >
  let cleanDate = dateString.replace(/^\s*\<([^>]*)\>\s*$/, "$1");
  if (cleanDate) {
    dateString = cleanDate.trim();
  }
  return dateString;
}

function cleanPlace(placeString) {
  if (!placeString) {
    return placeString;
  }

  // sometimes the places are surrounded by < >
  let cleanPlace = placeString.replace(/^\s*\<([^>]*)\>\s*$/, "$1");
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }

  // sometimes the place starts with "of "
  cleanPlace = placeString.replace(/^\s*of */i, "");
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }

  return placeString;
}

function selectDate(dateString, originalDateString) {
  dateString = cleanDate(dateString);
  originalDateString = cleanDate(originalDateString);

  if (!dateString) {
    return originalDateString;
  }
  if (!originalDateString) {
    return dateString;
  }

  // sometimes date come through in like this:
  // Birth Date: 11081921
  // Birth Date	(Original): 08 Nov 1921
  // Example is US SS Death Index for 2004
  if (/\d\d\d\d\d\d\d\d/.test(dateString)) {
    return originalDateString;
  }

  // sometimes date come through in like this:
  // Death Date: 05/24/1974
  // Birth Date	(Original): 24 May 1974
  // Example is US CA Death Index
  if (/\d?\d\/\d?\d\/\d\d\d\d/.test(dateString)) {
    return originalDateString;
  }

  // sometimes date come through in like this:
  // "birthDateOriginal": "1 Nov 1854",
  // "birthDate": "1 11 1854",
  // Example is https://www.familysearch.org/ark:/61903/1:1:XBQC-X9Q
  if (/\d?\d\s+\d?\d\s+\d\d\d\d/.test(dateString)) {
    return originalDateString;
  }

  // sometimes dateString is just a year and originalDateString is the full date
  if (dateString.length < 6 && originalDateString.length > dateString.length) {
    return originalDateString;
  }

  return dateString;
}

function selectPlace(placeString, originalPlaceString) {
  placeString = cleanPlace(placeString);
  originalPlaceString = cleanPlace(originalPlaceString);

  // sometimes there is no place but there is an original place
  if (!placeString) {
    return originalPlaceString;
  }

  // Sometimes FS puts things in that are not WikiTree approved
  placeString = placeString.replace(/\,? *British Colonial America/, "");

  return placeString;
}

function generalizeDataGivenRecordType(data, result) {
  if (data.age) {
    if (data.age != "999") {
      let age = data.age.replace(/^0*(\d)/, "$1"); // remove leading zeroes (but not a single zero on its own)
      // occasionally the age has extra text. e.g. "7 years"
      if (age && age.length > 1) {
        if (age.search(/[^\d]/) != -1) {
          age = age.replace(/\s*years\s*$/i, "");
        }
      }
      if (result.recordType == RT.DeathRegistration || result.recordType == RT.Death) {
        result.ageAtDeath = age;
      } else {
        result.ageAtEvent = age;
      }
    }
  }

  if (data.recordData && data.recordData["Occupation"]) {
    let occupation = cleanOccupation(data.recordData["Occupation"]);
    if (occupation) {
      result.occupation = occupation;
    }
  }

  if (
    result.recordType == RT.Baptism ||
    result.recordType == RT.Birth ||
    result.recordType == RT.BirthRegistration ||
    result.recordType == RT.BirthOrBaptism ||
    result.recordType == RT.Death ||
    result.recordType == RT.DeathRegistration
  ) {
    if (result.role != Role.Parent) {
      if (data.father) {
        let father = result.addFather();
        setFieldIfDefined(father.name, "name", data.father.fullName);
        setFieldIfDefined(father.name, "forenames", data.father.givenName);
        setFieldIfDefined(father.name, "lastName", data.father.surname);
        setFieldIfDefined(father.name, "prefix", data.father.prefix);
        setFieldIfDefined(father.name, "suffix", data.father.suffix);
      }
      if (data.mother) {
        let mother = result.addMother();
        setFieldIfDefined(mother.name, "name", data.mother.fullName);
        setFieldIfDefined(mother.name, "forenames", data.mother.givenName);
        setFieldIfDefined(mother.name, "lastName", data.mother.surname);
        setFieldIfDefined(mother.name, "prefix", data.mother.prefix);
        setFieldIfDefined(mother.name, "suffix", data.mother.suffix);
      }

      // spouse can be specified on a death record for example
      if (data.spouseFullName || data.spouseSurname || data.spouseGivenName) {
        result.spouses = [];
        let resultSpouse = {};
        resultSpouse.name = new WtsName();

        if (data.spouseFullName) {
          resultSpouse.name.name = data.spouseFullName;
        }
        if (data.spouseSurname) {
          resultSpouse.name.lastName = data.spouseSurname;
        }
        if (data.spouseGivenName) {
          resultSpouse.name.forenames = data.spouseGivenName;
        }
        if (data.spousePrefix) {
          resultSpouse.name.prefix = data.spousePrefix;
        }
        if (data.spouseSuffix) {
          resultSpouse.name.suffix = data.spouseSuffix;
        }
        if (data.spouseAge) {
          resultSpouse.age = data.spouseAge;
        }
        result.spouses.push(resultSpouse);
      }
    }
  } else if (result.recordType == RT.Marriage) {
    result.spouses = [];
    let resultSpouse = {};

    if (result.role != Role.Parent) {
      if (data.father) {
        let father = result.addFather();
        setFieldIfDefined(father.name, "name", data.father.fullName);
        setFieldIfDefined(father.name, "forenames", data.father.givenName);
        setFieldIfDefined(father.name, "lastName", data.father.surname);
        setFieldIfDefined(father.name, "prefix", data.father.prefix);
        setFieldIfDefined(father.name, "suffix", data.father.suffix);
      }
      if (data.mother) {
        let mother = result.addMother();
        setFieldIfDefined(mother.name, "name", data.mother.fullName);
        setFieldIfDefined(mother.name, "forenames", data.mother.givenName);
        setFieldIfDefined(mother.name, "lastName", data.mother.surname);
        setFieldIfDefined(mother.name, "prefix", data.mother.prefix);
        setFieldIfDefined(mother.name, "suffix", data.mother.suffix);
      }
    }

    if (data.spouseFullName || data.spouseSurname || data.spouseGivenName) {
      resultSpouse.name = new WtsName();

      if (data.spouseFullName) {
        resultSpouse.name.name = data.spouseFullName;
      }
      if (data.spouseSurname) {
        resultSpouse.name.lastName = data.spouseSurname;
      }
      if (data.spouseGivenName) {
        resultSpouse.name.forenames = data.spouseGivenName;
      }
      if (data.spousePrefix) {
        resultSpouse.name.prefix = data.spousePrefix;
      }
      if (data.spouseSuffix) {
        resultSpouse.name.suffix = data.spouseSuffix;
      }
      if (data.spouseAge) {
        resultSpouse.age = data.spouseAge;
      }
    } else if (
      data.relatedPersonSpouseFullName ||
      data.relatedPersonSpouseSurname ||
      data.relatedPersonSpouseGivenName
    ) {
      resultSpouse.name = new WtsName();
      if (data.relatedPersonSpouseFullName) {
        resultSpouse.name.name = data.relatedPersonSpouseFullName;
      }
      if (data.relatedPersonSpouseSurname) {
        resultSpouse.name.lastName = data.relatedPersonSpouseSurname;
      }
      if (data.relatedPersonSpouseGivenName) {
        resultSpouse.name.forenames = data.relatedPersonSpouseGivenName;
      }
    }
    if (result.eventDate) {
      resultSpouse.marriageDate = result.eventDate;
    }
    if (result.eventPlace) {
      resultSpouse.marriagePlace = result.eventPlace;
    }

    // the marriage record can contain an actual marriage date as well as the event date
    // If so it is probably more accurate
    if (
      data.recordData["Marriage Date"] ||
      data.recordData["Marriage Date (Original)"] ||
      data.recordData["Marriage Year"]
    ) {
      let marriageDate = new WtsDate();
      let dateString = selectDate(data.recordData["Marriage Date"], data.recordData["Marriage Date (Original)"]);
      if (dateString) {
        marriageDate.dateString = dateString;
        marriageDate.setDateAndQualifierFromString(dateString);
      }
      if (data.recordData["Marriage Year"]) {
        marriageDate.yearString = data.recordData["Marriage Year"];
      }
      resultSpouse.marriageDate = marriageDate;
      result.marriageDate = marriageDate.getDateString();
    }

    result.spouses.push(resultSpouse);
  } else if (result.recordType == RT.MarriageRegistration) {
    result.spouses = [];
    let resultSpouse = {};

    if (data.spouseFullName || data.spouseSurname || data.spouseGivenName) {
      resultSpouse.name = new WtsName();

      let spouseFullName = data.spouseFullName;
      if (spouseFullName == data.spouseSurname) {
        // there could be more info in record data
        let recordData = data.recordData;
        if (recordData) {
          if (recordData["Other On Page Name1"] && !recordData["Other On Page Name2"]) {
            if (recordData["Other On Page Name Surn1"] == data.spouseSurname) {
              spouseFullName = recordData["Other On Page Name1"];
            } else if (recordData["Other On Page Name1"].endsWith(data.spouseSurname)) {
              spouseFullName = recordData["Other On Page Name1"];
            }
          }
        }
      }

      if (spouseFullName) {
        resultSpouse.name.name = spouseFullName;
      }
      if (data.spouseSurname) {
        resultSpouse.name.lastName = data.spouseSurname;
      }
      if (data.spouseGivenName) {
        resultSpouse.name.forenames = data.spouseGivenName;
      }
      if (data.spousePrefix) {
        resultSpouse.name.prefix = data.spousePrefix;
      }
      if (data.spouseSuffix) {
        resultSpouse.name.suffix = data.spouseSuffix;
      }
      if (data.spouseAge) {
        resultSpouse.age = data.spouseAge;
      }
    }
    if (result.eventDate) {
      resultSpouse.marriageDate = result.eventDate;
    }
    if (result.eventPlace) {
      resultSpouse.marriagePlace = result.eventPlace;
    }

    // the marriage registration can contain an actual marriage date
    if (
      data.recordData["Marriage Date"] ||
      data.recordData["Marriage Date (Original)"] ||
      data.recordData["Marriage Year"]
    ) {
      let marriageDate = new WtsDate();
      let dateString = selectDate(data.recordData["Marriage Date"], data.recordData["Marriage Date (Original)"]);
      if (dateString) {
        marriageDate.setDateAndQualifierFromString(dateString);
      }
      if (data.recordData["Marriage Year"]) {
        marriageDate.yearString = data.recordData["Marriage Year"];
      }
      resultSpouse.marriageDate = marriageDate;
      result.marriageDate = marriageDate.getDateString();
    }

    result.spouses.push(resultSpouse);
  }

  if (data.household) {
    let headings = data.household.headings;
    let members = data.household.members;
    if (headings && members) {
      result.householdArrayFields = [];
      let fieldsEncountered = {};

      let householdArray = [];
      for (let member of members) {
        let householdMember = {};
        if (member.isClosed) {
          householdMember.isClosed = true;
        } else {
          let name = member.fullName;
          if (name) {
            householdMember.name = name;
            fieldsEncountered.name = true;
          }
          let relationship = member.relationship;
          if (relationship && relationship != "Unknown") {
            householdMember.relationship = GD.standardizeRelationshipToHead(relationship);
            fieldsEncountered.relationship = true;
          }
          let maritalStatus = GD.standardizeMaritalStatus(member.maritalStatus);
          if (maritalStatus) {
            householdMember.maritalStatus = maritalStatus;
            fieldsEncountered.maritalStatus = true;
          }
          let gender = member.gender;
          if (gender && gender != "Unknown") {
            householdMember.gender = GD.standardizeGender(gender);
            fieldsEncountered.gender = true;
          }
          let age = member.age;
          if (age && age != "Unknown" && age != "999") {
            householdMember.age = age;
            fieldsEncountered.age = true;
          }
          let birthYear = member.birthYear;
          if (birthYear && birthYear != "Unknown") {
            householdMember.birthYear = birthYear;
            fieldsEncountered.birthYear = true;
          }
          let birthDate = member.birthDate;
          if (birthDate && birthDate != "Unknown" && birthDate != birthYear) {
            householdMember.birthDate = birthDate;
            fieldsEncountered.birthDate = true;
          }

          let occupation = cleanOccupation(member.occupation);
          if (occupation && occupation != "Unknown") {
            householdMember.occupation = occupation;
            fieldsEncountered.occupation = true;
          }
          let birthPlace = member.birthPlace;
          if (!birthPlace) {
            birthPlace = member.birthPlaceOriginal;
          }
          if (birthPlace && birthPlace != "Unknown") {
            householdMember.birthPlace = birthPlace;
            fieldsEncountered.birthPlace = true;
          }
          let isSelected = member["isSelected"];
          if (isSelected) {
            householdMember.isSelected = isSelected;
          }
        }
        householdArray.push(householdMember);
      }
      result.householdArray = householdArray;

      let possibleHouseholdArrayFields = [
        "name",
        "relationship",
        "maritalStatus",
        "gender",
        "age",
        "birthYear",
        "occupation",
        "birthPlace",
      ];

      let householdArrayFields = [];
      for (let field of possibleHouseholdArrayFields) {
        if (fieldsEncountered[field]) {
          householdArrayFields.push(field);
        }
      }
      result.householdArrayFields = householdArrayFields;
    }
  }
}

function generalizeDataForPerson(data, result) {
  function setName(dataObject, resultObject) {
    if (dataObject.fullName) {
      resultObject.name.name = dataObject.fullName;
    }
    if (dataObject.surname) {
      resultObject.name.lastName = dataObject.surname;
    }
    if (dataObject.givenName) {
      resultObject.name.forenames = dataObject.givenName;
    }
    if (dataObject.prefix) {
      resultObject.name.prefix = dataObject.prefix;
    }
    if (dataObject.suffix) {
      resultObject.name.suffix = dataObject.suffix;
    }
  }

  // we will already have set fullName but try to get the fornames and last names
  setName(data, result);

  if (data.spouses) {
    result.spouses = [];

    for (let spouse of data.spouses) {
      let resultSpouse = {};

      if (spouse.fullName || spouse.surname || spouse.givenName) {
        resultSpouse.name = new WtsName();
        setName(spouse, resultSpouse);
      }

      if (spouse.marriageDate || spouse.marriageDateOriginal) {
        let marriageDate = selectDate(spouse.marriageDate, spouse.marriageDateOriginal);
        resultSpouse.marriageDate = new WtsDate();
        resultSpouse.marriageDate.setDateAndQualifierFromString(marriageDate);
      }

      if (spouse.marriagePlace || spouse.marriagePlaceOriginal) {
        resultSpouse.marriagePlace = new WtsPlace();
        resultSpouse.marriagePlace.placeString = selectPlace(spouse.marriagePlace, spouse.marriagePlaceOriginal);
      }

      result.spouses.push(resultSpouse);
    }
  }

  if (data.father) {
    let father = result.addFather();
    setName(data.father, father);
  }

  if (data.mother) {
    let mother = result.addMother();
    setName(data.mother, mother);
  }
}

function generalizeDataForBook(data, result) {
  result.sourceType = "book";

  result.hasValidData = true;
}

// This function generalizes the data extracted from a FamilySearch page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  if (data.pageType == "person") {
    result.sourceType = "profile";
  } else if (data.pageType == "book") {
    generalizeDataForBook(data, result);
    return result;
  } else {
    result.sourceType = "record";
    determineRecordTypeAndRole(data, result);
  }

  result.sourceOfData = "fs";

  result.setPersonGender(data.gender);

  result.setFullName(data.fullName);

  let birthDate = selectDate(data.birthDate, data.birthDateOriginal);
  result.setBirthDate(birthDate);
  result.setBirthYear(data.birthYear);
  let birthPlace = selectPlace(data.birthPlace, data.birthPlaceOriginal);
  result.setBirthPlace(birthPlace);

  let deathDate = selectDate(data.deathDate, data.deathDateOriginal);
  result.setDeathDate(deathDate);
  result.setDeathYear(data.deathYear);

  let deathPlace = selectPlace(data.deathPlace, data.deathPlaceOriginal);
  result.setDeathPlace(deathPlace);

  let eventDate = selectDate(data.eventDate, data.eventDateOriginal);
  result.setEventDate(eventDate);
  result.setEventYear(data.eventYear);

  let eventPlace = selectPlace(data.eventPlace, data.eventPlaceOriginal);

  if (!eventPlace) {
    // sometimes the event place info is in other fields
    eventPlace = "";
    if (data.eventCity) {
      eventPlace += data.eventCity;
    }
    if (data.eventCounty) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += data.eventCounty;
    }
    if (data.eventState) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += data.eventState;
    }
    if (data.eventCountry) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += data.eventCountry;
    }
  }

  result.setEventPlace(eventPlace);

  let residencePlace = data.residence;
  if (!residencePlace && data.recordData && data.recordData["Note Res Place"]) {
    // sometimes this is a field that is not on the residence fact
    residencePlace = data.recordData["Note Res Place"];
  }
  if (residencePlace && result.eventPlace) {
    // at least in 1841 census this is the stree address
    result.eventPlace.streetAddress = residencePlace;
  }

  if (result.eventPlace) {
    // there is an event place. But sometimes this isn't really the event place
    // For example for US SS Death Index it is the last residence place
    if (data.collectionTitle == "United States Social Security Death Index") {
      result.residencePlace = result.eventPlace;
      delete result.eventPlace;
    }
  }

  if (data.registrationDistrict) {
    result.registrationDistrict = data.registrationDistrict;
  }

  if (data.registrationQuarter) {
    let quarter = -1;
    let fsQuarter = data.registrationQuarter;
    for (let quarterName of quarterNames) {
      if (fsQuarter == quarterName.name) {
        quarter = quarterName.value;
        break;
      }
    }
    if (quarter != -1) {
      result.setEventQuarter(quarter);
    }
  }

  if (data.pageType == "person") {
    generalizeDataForPerson(data, result);
  } else {
    generalizeDataGivenRecordType(data, result);
  }

  if (data.household && data.household.members) {
    let selectedMember = undefined;
    for (let member of data.household.members) {
      if (member.isSelected) {
        selectedMember = member;
        break;
      }
    }

    if (selectedMember) {
      result.setMaritalStatus(selectedMember.maritalStatus);
      result.setRelationshipToHead(selectedMember.relationship);
    }
  }

  if (!result.maritalStatus && data.recordData) {
    result.setMaritalStatus(data.recordData["MaritalStatus"]);
  }

  if (data.household && data.household.members) {
    // We can also determine parents and spouse in some cases
    result.addSpouseOrParentsForSelectedHouseholdMember();

    if (result.spouses && result.spouses.length == 1) {
      let yearsMarried = data.recordData["Cnt Years Married"];
      if (yearsMarried) {
        let censusDate = result.inferEventDate();
        let marriageDateString = GeneralizedData.getSubtractAgeFromDate(censusDate, yearsMarried);
        let marriageYear = WTS_String.getLastWord(marriageDateString);
        if (marriageYear) {
          result.spouses[0].marriageDate.yearString = marriageYear;
        }
      }
    }
  }

  // Collection
  if (data.fsCollectionId) {
    result.collectionData = {
      id: data.fsCollectionId,
    };

    if (data.referenceData) {
      let refData = data.referenceData;
      if (refData.sourceVolume) {
        result.collectionData.volume = refData.sourceVolume;
      }

      if (refData.sourcePageNbr) {
        result.collectionData.page = refData.sourcePageNbr;
      }

      if (refData.sourceScheduleType) {
        result.collectionData.schedule = refData.sourceScheduleType;
      }

      if (refData.sourcePieceFolio) {
        let pf = refData.sourcePieceFolio;
        let slashIndex = pf.indexOf("/");
        if (slashIndex != -1) {
          result.collectionData.piece = pf.substring(0, slashIndex).trim();
          result.collectionData.folio = pf.substring(slashIndex + 1).trim();
        } else {
          result.collectionData.folio = pf;
        }
      }
    }
  }

  result.hasValidData = true;

  //console.log("End of FamilySearch generalizeData, result is:");
  //console.log(result);

  return result;
}

export { generalizeData, generalizeDataGivenRecordType, GeneralizedData, dateQualifiers };
