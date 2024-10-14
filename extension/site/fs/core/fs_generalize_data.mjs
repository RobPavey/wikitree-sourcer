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
  NameObj,
  DateObj,
  PlaceObj,
} from "../../../base/core/generalize_data_utils.mjs";
import { RT, Role, RecordSubtype } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { addSpouseOrParentsForSelectedHouseholdMember } from "../../../base/core/structured_household.mjs";

import {
  buildFsRecordLinkOrTemplate,
  buildFsImageLinkOrTemplate,
  buildExternalLinkOrTemplate,
} from "./fs_templates_and_links.mjs";

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
    titleMatches: [{ recordType: RT.SlaveSchedule, matches: ["Slave Schedule"] }],
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
    type: "Naturalization",
    defaultRT: RT.Naturalization,
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
  {
    type: "SocialProgramCorrespondence",
    defaultRT: RT.SocialSecurity,
    recordDataMatches: [
      { recordType: RT.Death, matches: ["Death Date"] },
      { recordType: RT.Birth, matches: ["Birth Date"] },
    ],
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
  const titleMatches = [
    { type: RT.Census, matches: ["Census"] },
    { type: RT.Military, matches: ["World War I"] },
  ];

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

function determineRecordSubtype(recordType, extractedData) {
  let collectionTitle = extractedData.collectionTitle;

  if (recordType == RT.Census) {
    if (collectionTitle) {
      if (collectionTitle.includes("Church Census Records") && collectionTitle.includes("Latter-day Saints")) {
        return RecordSubtype.LdsCensus;
      }
    }
  } else if (recordType == RT.Military) {
    if (collectionTitle) {
      if (collectionTitle.includes("World War I Draft Registration")) {
        return RecordSubtype.WWIDraftRegistration;
      }
      if (collectionTitle.includes("World War II Draft Registration")) {
        return RecordSubtype.WWIIDraftRegistration;
      }
    }
  }
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
      } else if (extractedData.relationshipToFactPerson == "Grandparent") {
        result.role = Role.Grandparent;
      } else if (extractedData.relationshipToFactPerson == "Grandchild") {
        result.role = Role.Grandchild;
      } else if (extractedData.relationshipToFactPerson == "ParentOfSpouse") {
        result.role = Role.ParentOfSpouse;
      } else if (extractedData.relationshipToFactPerson == "SpouseOfChild") {
        result.role = Role.SpouseOfChild;
      } else {
        result.role = Role.Other;
      }
      result.setPrimaryPersonFullName(extractedData.relatedPersonFullName);
      result.setPrimaryPersonLastNameAndForenames(
        extractedData.relatedPersonSurname,
        extractedData.relatedPersonGivenName
      );
      result.setPrimaryPersonGender(extractedData.relatedPersonGender);
    } else {
      result.role = Role.Other;
    }
  }

  result.recordType = recordType;

  let recordSubtype = determineRecordSubtype(recordType, extractedData);
  if (recordSubtype) {
    result.recordSubtype = recordSubtype;
  }
}

function cleanName(name) {
  if (!name) {
    return name;
  }

  // Some name cleaning is done in generalize_data_utils but extra required for this site
  // is done here

  // For something like "Bessie J.e. Alline" we want to remove the periods and have
  // "Bessie J E Alline"

  name = name.replace(/([^\.])\.(\s)/g, "$1$2");
  name = name.replace(/(\s[^\.\s])\.([^\.\s\)\]])/g, "$1 $2");
  name = name.replace(/^\.([^\.])/g, "$1");
  name = name.replace(/([^\.])\.$/, "$1");
  name = name.replace(/\s+/g, " ");

  // if there is a single lowercase letter followed by a space or end of string, change to uppercase
  name = name.replace(/(\s[a-z]\s)/g, (match, p1) => p1.toUpperCase());
  name = name.replace(/^([a-z]\s)/g, (match, p1) => p1.toUpperCase());
  name = name.replace(/(\s[a-z])$/g, (match, p1) => p1.toUpperCase());

  return name;
}

function cleanOccupation(text) {
  let newText = text;
  if (text && /^[^a-z]+$/.test(text)) {
    // there are no lowercase characters
    newText = StringUtils.toInitialCapsEachWord(text);
  }
  return newText;
}

function setFieldIfDefined(targetObject, fieldName, value) {
  if (typeof value !== "undefined") {
    targetObject[fieldName] = value;
  }
}

function setParentFields(gdParent, edParent) {
  setFieldIfDefined(gdParent.name, "name", edParent.fullName);
  setFieldIfDefined(gdParent.name, "forenames", edParent.givenName);
  setFieldIfDefined(gdParent.name, "lastName", edParent.surname);
  setFieldIfDefined(gdParent.name, "prefix", edParent.prefix);
  setFieldIfDefined(gdParent.name, "suffix", edParent.suffix);
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
  cleanPlace = placeString.replace(/^\s*of +/i, "");
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }

  // Sometimes there are consequtive commas e.g. "Turner, , Maine, United States"
  cleanPlace = placeString.replace(/\s+/g, " "); // remove multiple spaces
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }
  cleanPlace = placeString.replace(/\s*,\s*$/g, ""); // remove trailing commas
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }
  cleanPlace = placeString.replace(/\s*,\s*/g, ", "); // remove spaces before commas and ensure space after
  if (cleanPlace) {
    placeString = cleanPlace.trim();
  }
  cleanPlace = placeString.replace(/, ,/g, ","); // replace multiple adjacent commas
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

function selectPlace(placeString, originalPlaceString, isPerson = false) {
  placeString = cleanPlace(placeString);
  originalPlaceString = cleanPlace(originalPlaceString);

  // sometimes there is no place but there is an original place
  if (!placeString) {
    return originalPlaceString;
  }

  if (!originalPlaceString) {
    return placeString;
  }

  // we have both, for a person prioritize the original as that seems
  // to be the latest one entered and what is showing on page
  if (isPerson) {
    placeString = originalPlaceString;
  }

  // Sometimes FS puts things in that are not WikiTree approved
  placeString = placeString.replace(/\,? *British Colonial America/, "");

  return placeString;
}

function generalizeDataGivenRecordType(ed, result) {
  if (ed.age) {
    if (ed.age != "999") {
      let age = ed.age.replace(/^0*(\d)/, "$1"); // remove leading zeroes (but not a single zero on its own)
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

  if (ed.recordData && ed.recordData["Occupation"]) {
    let occupation = cleanOccupation(ed.recordData["Occupation"]);
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
      if (ed.father) {
        let father = result.addFather();
        setParentFields(father, ed.father);
      }
      if (ed.mother) {
        let mother = result.addMother();
        setParentFields(mother, ed.mother);
      }

      // spouse can be specified on a death record for example
      if (ed.spouseFullName || ed.spouseSurname || ed.spouseGivenName) {
        result.spouses = [];
        let resultSpouse = {};
        resultSpouse.name = new NameObj();

        if (ed.spouseFullName) {
          resultSpouse.name.name = ed.spouseFullName;
        }
        if (ed.spouseSurname) {
          resultSpouse.name.lastName = ed.spouseSurname;
        }
        if (ed.spouseGivenName) {
          resultSpouse.name.forenames = ed.spouseGivenName;
        }
        if (ed.spousePrefix) {
          resultSpouse.name.setPrefix(ed.spousePrefix);
        }
        if (ed.spouseSuffix) {
          resultSpouse.name.setSuffix(ed.spouseSuffix);
        }
        if (ed.spouseAge) {
          resultSpouse.age = ed.spouseAge;
        }
        result.spouses.push(resultSpouse);
      }
    }
  } else if (result.recordType == RT.Marriage) {
    result.spouses = [];
    let resultSpouse = {};

    if (result.role != Role.Parent) {
      if (ed.father) {
        let father = result.addFather();
        setParentFields(father, ed.father);
      }
      if (ed.mother) {
        let mother = result.addMother();
        setParentFields(mother, ed.mother);
      }
    }

    if (ed.spouseFullName || ed.spouseSurname || ed.spouseGivenName) {
      resultSpouse.name = new NameObj();

      if (ed.spouseFullName) {
        resultSpouse.name.name = ed.spouseFullName;
      }
      if (ed.spouseSurname) {
        resultSpouse.name.lastName = ed.spouseSurname;
      }
      if (ed.spouseGivenName) {
        resultSpouse.name.forenames = ed.spouseGivenName;
      }
      if (ed.spousePrefix) {
        resultSpouse.name.setPrefix(ed.spousePrefix);
      }
      if (ed.spouseSuffix) {
        resultSpouse.name.setSuffix(ed.spouseSuffix);
      }
      if (ed.spouseAge) {
        resultSpouse.age = ed.spouseAge;
      }
      if (ed.spouseGender) {
        resultSpouse.personGender = ed.spouseGender;
      }

      if (ed.spouseFather) {
        resultSpouse.parents = {};
        resultSpouse.parents.father = {};
        resultSpouse.parents.father.name = new NameObj();
        setParentFields(resultSpouse.parents.father, ed.spouseFather);
      }
      if (ed.spouseMother) {
        if (!resultSpouse.parents) {
          resultSpouse.parents = {};
        }
        resultSpouse.parents.mother = {};
        resultSpouse.parents.mother.name = new NameObj();
        setParentFields(resultSpouse.parents.mother, ed.spouseMother);
      }
    } else if (ed.relatedPersonSpouseFullName || ed.relatedPersonSpouseSurname || ed.relatedPersonSpouseGivenName) {
      resultSpouse.name = new NameObj();
      if (ed.relatedPersonSpouseFullName) {
        resultSpouse.name.name = ed.relatedPersonSpouseFullName;
      }
      if (ed.relatedPersonSpouseSurname) {
        resultSpouse.name.lastName = ed.relatedPersonSpouseSurname;
      }
      if (ed.relatedPersonSpouseGivenName) {
        resultSpouse.name.forenames = ed.relatedPersonSpouseGivenName;
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
    if (ed.recordData["Marriage Date"] || ed.recordData["Marriage Date (Original)"] || ed.recordData["Marriage Year"]) {
      let marriageDate = new DateObj();
      let dateString = selectDate(ed.recordData["Marriage Date"], ed.recordData["Marriage Date (Original)"]);
      if (dateString) {
        marriageDate.dateString = dateString;
        marriageDate.setDateAndQualifierFromString(dateString);
      }
      if (ed.recordData["Marriage Year"]) {
        marriageDate.yearString = ed.recordData["Marriage Year"];
      }
      resultSpouse.marriageDate = marriageDate;
      result.marriageDate = marriageDate.getDateString();
      if (!result.eventDate) {
        result.eventDate = marriageDate;
      }
    }

    result.spouses.push(resultSpouse);
  } else if (result.recordType == RT.MarriageRegistration) {
    result.spouses = [];
    let resultSpouse = {};

    if (ed.spouseFullName || ed.spouseSurname || ed.spouseGivenName) {
      resultSpouse.name = new NameObj();

      let spouseFullName = ed.spouseFullName;
      if (spouseFullName == ed.spouseSurname) {
        // there could be more info in record ed
        let recordData = ed.recordData;
        if (recordData) {
          if (recordData["Other On Page Name1"] && !recordData["Other On Page Name2"]) {
            if (recordData["Other On Page Name Surn1"] == ed.spouseSurname) {
              spouseFullName = recordData["Other On Page Name1"];
            } else if (recordData["Other On Page Name1"].endsWith(ed.spouseSurname)) {
              spouseFullName = recordData["Other On Page Name1"];
            }
          }
        }
      }

      if (spouseFullName) {
        resultSpouse.name.name = spouseFullName;
      }
      if (ed.spouseSurname) {
        resultSpouse.name.lastName = ed.spouseSurname;
      }
      if (ed.spouseGivenName) {
        resultSpouse.name.forenames = ed.spouseGivenName;
      }
      if (ed.spousePrefix) {
        resultSpouse.name.setPrefix(ed.spousePrefix);
      }
      if (ed.spouseSuffix) {
        resultSpouse.name.setSuffix(ed.spouseSuffix);
      }
      if (ed.spouseAge) {
        resultSpouse.age = ed.spouseAge;
      }
    }
    if (result.eventDate) {
      resultSpouse.marriageDate = result.eventDate;
    }
    if (result.eventPlace) {
      resultSpouse.marriagePlace = result.eventPlace;
    }

    // the marriage registration can contain an actual marriage date
    if (ed.recordData["Marriage Date"] || ed.recordData["Marriage Date (Original)"] || ed.recordData["Marriage Year"]) {
      let marriageDate = new DateObj();
      let dateString = selectDate(ed.recordData["Marriage Date"], ed.recordData["Marriage Date (Original)"]);
      if (dateString) {
        marriageDate.setDateAndQualifierFromString(dateString);
      }
      if (ed.recordData["Marriage Year"]) {
        marriageDate.yearString = ed.recordData["Marriage Year"];
      }
      resultSpouse.marriageDate = marriageDate;
      result.marriageDate = marriageDate.getDateString();
    }

    result.spouses.push(resultSpouse);
  } else if (result.recordType == RT.Divorce) {
    result.spouses = [];
    let resultSpouse = {};

    if (result.role != Role.Parent) {
      if (ed.father) {
        let father = result.addFather();
        setParentFields(father, ed.father);
      }
      if (ed.mother) {
        let mother = result.addMother();
        setParentFields(mother, ed.mother);
      }
    }

    if (ed.spouseFullName || ed.spouseSurname || ed.spouseGivenName) {
      resultSpouse.name = new NameObj();

      if (ed.spouseFullName) {
        resultSpouse.name.name = ed.spouseFullName;
      }
      if (ed.spouseSurname) {
        resultSpouse.name.lastName = ed.spouseSurname;
      }
      if (ed.spouseGivenName) {
        resultSpouse.name.forenames = ed.spouseGivenName;
      }
      if (ed.spousePrefix) {
        resultSpouse.name.setPrefix(ed.spousePrefix);
      }
      if (ed.spouseSuffix) {
        resultSpouse.name.setSuffix(ed.spouseSuffix);
      }
      if (ed.spouseAge) {
        resultSpouse.age = ed.spouseAge;
      }
    } else if (ed.relatedPersonSpouseFullName || ed.relatedPersonSpouseSurname || ed.relatedPersonSpouseGivenName) {
      resultSpouse.name = new NameObj();
      if (ed.relatedPersonSpouseFullName) {
        resultSpouse.name.name = ed.relatedPersonSpouseFullName;
      }
      if (ed.relatedPersonSpouseSurname) {
        resultSpouse.name.lastName = ed.relatedPersonSpouseSurname;
      }
      if (ed.relatedPersonSpouseGivenName) {
        resultSpouse.name.forenames = ed.relatedPersonSpouseGivenName;
      }
    }
    if (result.eventDate) {
      resultSpouse.divorceDate = result.eventDate;
    }
    if (result.eventPlace) {
      resultSpouse.divorcePlace = result.eventPlace;
    }

    // the marriage record can contain an actual Divorce date as well as the event date
    // If so it is probably more accurate
    if (ed.recordData["Divorce Date"] || ed.recordData["Divorce Date (Original)"] || ed.recordData["Divorce Year"]) {
      let divorceDate = new DateObj();
      let dateString = selectDate(ed.recordData["Divorce Date"], ed.recordData["Divorce Date (Original)"]);
      if (dateString) {
        divorceDate.dateString = dateString;
        divorceDate.setDateAndQualifierFromString(dateString);
      }
      if (ed.recordData["Divorce Year"]) {
        divorceDate.yearString = ed.recordData["Divorce Year"];
      }
      resultSpouse.divorceDate = divorceDate;
      result.divorceDate = divorceDate.getDateString();
    }

    result.spouses.push(resultSpouse);
  } else if (result.recordType == RT.SlaveSchedule) {
    let freeOrEnslaved = ed.recordData["Flag Free Or Enslaved"];
    if (freeOrEnslaved == "Owner") {
      result.setTypeSpecficDataValue("role", "Slave Owner");
    } else if (freeOrEnslaved == "Slave") {
      result.setTypeSpecficDataValue("role", "Enslaved Person");
    }
    if (result.typeSpecificData) {
      let race = ed.recordData["Race"];
      result.setTypeSpecficDataValue("race", race);
    }
  }

  if (ed.household) {
    let headings = ed.household.headings;
    let members = ed.household.members;
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
            if (age.search(/[^\d]/) != -1) {
              age = age.replace(/\s*years\s*$/i, "");
            }

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

          let race = member.race;
          if (race && race != "Unknown") {
            householdMember.race = race;
            fieldsEncountered.race = true;
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
            birthPlace = cleanPlace(birthPlace);

            // Some censuses (like the US 1880) put the country name on all birth places
            // try to remove it
            if (result.eventPlace && result.eventPlace.placeString) {
              let eventCountry = CD.extractCountryFromPlaceName(result.eventPlace.placeString);
              let birthCountry = CD.extractCountryFromPlaceName(birthPlace);
              if (eventCountry && eventCountry.country && birthCountry && birthCountry.country) {
                if (eventCountry.country.stdName == birthCountry.country.stdName) {
                  birthPlace = birthCountry.remainder;
                }
              }
            }

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
        "race",
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

function addWtSearchTemplates(ed, result) {
  let wtTemplates = [];
  let wtTemplatesRelated = [];

  function addLinkOrTemplate(templates, linkOrTemplate) {
    if (linkOrTemplate && linkOrTemplate.startsWith("{{")) {
      if (!templates.includes(linkOrTemplate)) {
        templates.push(linkOrTemplate);
      }
    }
  }

  if (ed.pageType == "record") {
    var recordUrl = ed.personRecordUrl;
    if (!recordUrl) {
      recordUrl = ed.url;
    }
    addLinkOrTemplate(wtTemplates, buildFsRecordLinkOrTemplate(recordUrl));

    addLinkOrTemplate(wtTemplatesRelated, buildFsImageLinkOrTemplate(ed.fsImageUrl));

    if (ed.collectionTitle == "Find A Grave Index") {
      let memorialId = ed.externalRecordId;
      if (memorialId) {
        addLinkOrTemplate(wtTemplates, "{{FindAGrave|" + memorialId + "}}");
      }
    }
  } else if (ed.pageType == "image") {
    addLinkOrTemplate(wtTemplates, buildFsImageLinkOrTemplate(ed.url));
  }

  if (ed.digitalArtifact) {
    addLinkOrTemplate(wtTemplatesRelated, buildExternalLinkOrTemplate(ed.digitalArtifact));
  }

  addLinkOrTemplate(wtTemplatesRelated, buildFsRecordLinkOrTemplate(ed.relatedPersonLink));
  addLinkOrTemplate(wtTemplatesRelated, buildFsRecordLinkOrTemplate(ed.relatedPersonSpouseLink));
  if (ed.father) {
    addLinkOrTemplate(wtTemplatesRelated, buildFsRecordLinkOrTemplate(ed.father.link));
  }
  if (ed.mother) {
    addLinkOrTemplate(wtTemplatesRelated, buildFsRecordLinkOrTemplate(ed.mother.link));
  }
  if (ed.household && ed.household.members) {
    for (let member of ed.household.members) {
      addLinkOrTemplate(wtTemplatesRelated, buildFsRecordLinkOrTemplate(member.link));
    }
  }

  // if there are templates add them to result
  if (wtTemplates.length) {
    result.wtSearchTemplates = wtTemplates;
  }
  if (wtTemplatesRelated.length) {
    result.wtSearchTemplatesRelated = wtTemplatesRelated;
  }
}

function generalizeDataForPerson(ed, result) {
  function setNameWithPossibleNicknames(dataObject, resultObject) {
    // because this is done when we have already set the name once already the handling of nicknames is
    // complicated.
    let nicknames = resultObject.name.nicknames;

    if (dataObject.fullName) {
      resultObject.name.setFullName(dataObject.fullName);
    }
    if (dataObject.surname) {
      resultObject.name.lastName = dataObject.surname;
    }
    if (dataObject.givenName) {
      resultObject.name.setForenames(dataObject.givenName);
    }
    if (dataObject.prefix) {
      resultObject.name.setPrefix(dataObject.prefix);
    }
    if (dataObject.suffix) {
      resultObject.name.setSuffix(dataObject.suffix);
    }

    // restore the nicknames
    if (nicknames) {
      resultObject.name.nicknames = nicknames;
    }
  }

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
      resultObject.name.setPrefix(dataObject.prefix);
    }
    if (dataObject.suffix) {
      resultObject.name.setSuffix(dataObject.suffix);
    }
  }

  // we will already have set fullName but try to get the fornames and last names
  setNameWithPossibleNicknames(ed, result);

  // if there is no birth or death details then there could be baptism or burial
  if (!result.birthDate) {
    let baptismDate = selectDate(ed.baptismDate, ed.baptismDateOriginal);
    result.setBirthDate(baptismDate);
    result.setBirthYear(ed.baptismYear);
    if (result.birthDate) {
      result.birthDate.qualifier = dateQualifiers.BEFORE;

      if (!result.birthPlace) {
        let baptismPlace = selectPlace(ed.baptismPlace, ed.baptismPlaceOriginal, true);
        result.setBirthPlace(baptismPlace);
      }
    }
  }
  if (!result.deathDate) {
    let burialDate = selectDate(ed.burialDate, ed.burialDateOriginal);
    result.setDeathDate(burialDate);
    result.setDeathYear(ed.burialYear);
    if (result.deathDate) {
      result.deathDate.qualifier = dateQualifiers.BEFORE;

      if (!result.deathPlace) {
        let burialPlace = selectPlace(ed.burialPlace, ed.burialPlaceOriginal, true);
        result.setDeathPlace(burialPlace);
      }
    }
  }

  if (ed.spouses) {
    result.spouses = [];

    for (let spouse of ed.spouses) {
      let resultSpouse = {};

      if (spouse.fullName || spouse.surname || spouse.givenName) {
        resultSpouse.name = new NameObj();
        setName(spouse, resultSpouse);
      }

      if (spouse.marriageDate || spouse.marriageDateOriginal) {
        let marriageDate = selectDate(spouse.marriageDate, spouse.marriageDateOriginal);
        resultSpouse.marriageDate = new DateObj();
        resultSpouse.marriageDate.setDateAndQualifierFromString(marriageDate);
      }

      if (spouse.marriagePlace || spouse.marriagePlaceOriginal) {
        resultSpouse.marriagePlace = new PlaceObj();
        resultSpouse.marriagePlace.placeString = selectPlace(spouse.marriagePlace, spouse.marriagePlaceOriginal, true);
      }

      result.spouses.push(resultSpouse);
    }
  }

  if (ed.father) {
    let father = result.addFather();
    setName(ed.father, father);
  }

  if (ed.mother) {
    let mother = result.addMother();
    setName(ed.mother, mother);
  }
}

function generalizeDataForBook(ed, result) {
  result.sourceType = "book";

  result.hasValidData = true;
}

// This function generalizes the data (ed) extracted from a FamilySearch page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  let isPerson = false;
  if (ed.pageType == "person") {
    result.sourceType = "profile";
    isPerson = true;
  } else if (ed.pageType == "book") {
    generalizeDataForBook(ed, result);
    return result;
  } else {
    result.sourceType = "record";
    determineRecordTypeAndRole(ed, result);
  }

  result.sourceOfData = "fs";

  result.setPersonGender(ed.gender);

  result.setFullName(cleanName(ed.fullName));
  result.setLastNameAndForenames(cleanName(ed.surname), cleanName(ed.givenName));

  let birthDate = selectDate(ed.birthDate, ed.birthDateOriginal);
  result.setBirthDate(birthDate);
  result.setBirthYear(ed.birthYear);
  let birthPlace = selectPlace(ed.birthPlace, ed.birthPlaceOriginal, isPerson);
  result.setBirthPlace(birthPlace);

  let deathDate = selectDate(ed.deathDate, ed.deathDateOriginal);
  result.setDeathDate(deathDate);
  result.setDeathYear(ed.deathYear);

  let deathPlace = selectPlace(ed.deathPlace, ed.deathPlaceOriginal, isPerson);
  result.setDeathPlace(deathPlace);

  let eventDate = selectDate(ed.eventDate, ed.eventDateOriginal);
  result.setEventDate(eventDate);
  result.setEventYear(ed.eventYear);

  if (!ed.eventDate && !ed.eventDateOriginal && !ed.eventYear) {
    // this can happen for a census
    // See: us_sd_census_1905_j_stoner
    if (result.recordType == RT.Census) {
      if (ed.collectionTitle && ed.collectionTitle.includes("Census")) {
        let yearStrings = ed.collectionTitle.match(/\d\d\d\d/);
        if (yearStrings.length == 1) {
          let eventYear = yearStrings[0];
          result.setEventYear(eventYear);
        }
      }
    }
  }

  let eventPlace = selectPlace(ed.eventPlace, ed.eventPlaceOriginal, isPerson);

  if (result.role && result.role != Role.Primary) {
    if (result.recordType == RT.Burial) {
      let deathDate = selectDate(ed.relatedPersonDeathDate, ed.relatedPersonDeathDateOriginal);
      let deathYear = ed.relatedPersonDeathYear;
      result.setPrimaryPersonDeathDate(deathDate);
      result.setPrimaryPersonDeathYear(deathYear);
    } else if (
      result.recordType == RT.Baptism ||
      result.recordType == RT.BirthRegistration ||
      result.recordType == RT.Birth
    ) {
      let birthDate = selectDate(ed.relatedPersonBirthDate, ed.relatedPersonBirthDateOriginal);
      let birthYear = ed.relatedPersonBirthYear;
      result.setPrimaryPersonBirthDate(birthDate);
      result.setPrimaryPersonBirthYear(birthYear);
    } else {
      // might as well store all possible ones
      let birthDate = selectDate(ed.relatedPersonBirthDate, ed.relatedPersonBirthDateOriginal);
      let birthYear = ed.relatedPersonBirthYear;
      result.setPrimaryPersonBirthDate(birthDate);
      result.setPrimaryPersonBirthYear(birthYear);
      let deathDate = selectDate(ed.relatedPersonDeathDate, ed.relatedPersonDeathDateOriginal);
      let deathYear = ed.relatedPersonDeathYear;
      result.setPrimaryPersonDeathDate(deathDate);
      result.setPrimaryPersonDeathYear(deathYear);
    }
  }

  if (!eventPlace) {
    // sometimes the event place info is in other fields
    eventPlace = "";
    if (ed.eventCity) {
      eventPlace += ed.eventCity;
    }
    if (ed.eventCounty) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += ed.eventCounty;
    }
    if (ed.eventState) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += ed.eventState;
    }
    if (ed.eventCountry) {
      if (eventPlace) {
        eventPlace += ", ";
      }
      eventPlace += ed.eventCountry;
    }

    if (!eventPlace) {
      if (ed.documentRecordData) {
        eventPlace = ed.documentRecordData["Event Place"];
      }
    }
  }

  result.setEventPlace(cleanPlace(eventPlace));

  // sometimes there is a street address in document data
  if (result.eventPlace && ed.documentRecordData && ed.documentRecordData["Address"]) {
    let streetAddress = ed.documentRecordData["Address"];
    if (!(eventPlace && eventPlace.includes(streetAddress))) {
      result.eventPlace.streetAddress = streetAddress;
    }
  }

  let residencePlace = ed.residence;
  if (!residencePlace && ed.recordData && ed.recordData["Note Res Place"]) {
    // sometimes this is a field that is not on the residence fact
    residencePlace = ed.recordData["Note Res Place"];
  }
  if (!residencePlace && ed.recordData && ed.recordData["Previous Residence Place"]) {
    // sometimes this is a field that is not on the residence fact
    residencePlace = ed.recordData["Previous Residence Place"];
  }

  if (residencePlace && result.eventPlace) {
    // at least in 1841 census this is the stree address
    result.eventPlace.streetAddress = cleanPlace(residencePlace);
  } else if (residencePlace) {
    result.setResidencePlace(cleanPlace(residencePlace));
  }

  if (result.eventPlace) {
    // there is an event place. But sometimes this isn't really the event place
    // For example for US SS Death Index it is the last residence place
    if (
      ed.collectionTitle == "United States Social Security Death Index" ||
      ed.collectionTitle == "United States, Social Security Numerical Identification Files (NUMIDENT), 1936-2007" ||
      ed.factType == "SocialProgramCorrespondence"
    ) {
      result.residencePlace = result.eventPlace;
      delete result.eventPlace;
    }
  }

  if (ed.registrationDistrict) {
    result.registrationDistrict = ed.registrationDistrict;
  }

  if (ed.registrationQuarter) {
    let quarter = -1;
    let fsQuarter = ed.registrationQuarter;
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

  if (ed.pageType == "person") {
    generalizeDataForPerson(ed, result);
  } else {
    generalizeDataGivenRecordType(ed, result);
  }

  if (ed.household && ed.household.members) {
    let selectedMember = undefined;
    for (let member of ed.household.members) {
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

  if (!result.maritalStatus && ed.recordData) {
    result.setMaritalStatus(ed.recordData["MaritalStatus"]);
  }

  if (ed.recordData && ed.recordData["Race"]) {
    result.race = ed.recordData["Race"];
  }

  if (ed.household && ed.household.members) {
    // We can also determine parents and spouse in some cases
    addSpouseOrParentsForSelectedHouseholdMember(result);

    if (result.spouses && result.spouses.length == 1) {
      let yearsMarried = ed.recordData["Cnt Years Married"];
      if (yearsMarried) {
        let censusDate = result.inferEventDate();
        let marriageDateString = GeneralizedData.getSubtractAgeFromDate(censusDate, yearsMarried);
        let marriageYear = StringUtils.getLastWord(marriageDateString);
        if (marriageYear) {
          result.spouses[0].marriageDate.yearString = marriageYear;
        }
      }
    }
  }

  // Template search data
  addWtSearchTemplates(ed, result);

  // Collection
  if (ed.fsCollectionId) {
    result.collectionData = {
      id: ed.fsCollectionId,
    };

    if (ed.collectionTitle) {
      result.collectionData.collectionTitle = ed.collectionTitle;
    }

    if (ed.referenceData) {
      let refData = ed.referenceData;
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

  if (result.sourceType == "profile") {
    result.personRepoRef = ed.personId;
  }

  result.hasValidData = true;

  //console.log("End of FamilySearch generalizeData, result is:");
  //console.log(result);

  return result;
}

export { generalizeData, generalizeDataGivenRecordType };
