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

import { CD } from "./country_data.mjs";
import { DateObj, PlaceObj } from "./generalize_data_utils.mjs";
import { RT, Role, RecordSubtype } from "./record_type.mjs";
import { RC } from "./record_collections.mjs";
import { DateUtils } from "./date_utils.mjs";
import { buildStructuredHousehold } from "./structured_household.mjs";
import {
  getPrimaryPersonChildTerm,
  getPrimaryPersonSpouseTerm,
  getPrimaryPersonTermAndName,
  isRegistrationEventDateTheRegistrationDate,
} from "./narrative_or_sentence_utils.mjs";

function getQuarterName(quarterNumber) {
  const quarterNames = ["Jan-Feb-Mar", "Apr-May-Jun", "Jul-Aug-Sep", "Oct-Nov-Dec"];
  if (quarterNumber != undefined && quarterNumber >= 1 && quarterNumber <= 4) {
    return quarterNames[quarterNumber - 1];
  }

  return "";
}

function getPlaceWithPrepositionFromPlaceObj(placeObj, placeString = "", isFullPlaceString = false) {
  if (placeObj) {
    let preposition = placeObj.getPreposition(isFullPlaceString, placeString);

    if (!placeString) {
      placeString = placeObj.inferPlaceString();
    }

    if (placeString) {
      if (preposition) {
        return preposition + " " + placeString;
      } else {
        return placeString;
      }
    }
  }
  return "";
}

function getPlaceWithPreposition(placeString, prepositionHint = "") {
  let placeObj = new PlaceObj();
  placeObj.placeString = placeString;
  placeObj.prepositionHint = prepositionHint;
  return getPlaceWithPrepositionFromPlaceObj(placeObj);
}

function getFullPlaceTermWithPreposition(placeObj) {
  if (placeObj) {
    let placeString = placeObj.inferFullPlaceString();
    let placeWithPreposition = getPlaceWithPrepositionFromPlaceObj(placeObj, placeString, true);
    if (placeWithPreposition) {
      return " " + placeWithPreposition;
    }
  }
  return "";
}

function addEventPlaceTermWithPrepositionOrRd(dataString, gd) {
  let placeTerm = getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());
  if (placeTerm) {
    return dataString + placeTerm;
  }

  if (gd.registrationDistrict) {
    if (!dataString.endsWith(".") && !dataString.endsWith(",")) {
      dataString += ".";
    }
    return dataString + " Registration district " + gd.registrationDistrict;
  }

  return dataString;
}

function cleanDateObj(dateObj) {
  if (dateObj) {
    return dateObj.getDataStringFormat(false);
  }
  return "";
}

function cleanAge(age) {
  let result = age;
  if (result) {
    if (typeof result == "string") {
      result = result.toLowerCase();
    }
  }
  return result;
}

function getDateWithPreposition(dateObj, prepSuffix = "") {
  if (dateObj) {
    return dateObj.getDataStringFormat(true, prepSuffix);
  }
  return "";
}

function getDateFromStringWithPreposition(dateString, prepSuffix = "") {
  if (dateString) {
    let dateObj = new DateObj();
    dateObj.dateString = dateString;

    return dateObj.getDataStringFormat(true, prepSuffix);
  }
  return "";
}

function getFullName(gd) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }
  return name;
}

function getReferenceString(gd, options) {
  let dataString = "";

  if (gd.collectionData) {
    let volume = gd.collectionData.volume;
    if (volume) {
      dataString += " volume " + volume;

      let page = gd.collectionData.page;
      if (page) {
        dataString += " page " + page;
      }
    }

    let reg = gd.collectionData.registerNumber;
    if (reg) {
      dataString += " reg " + reg;
    }

    let entryNum = gd.collectionData.entryNumber;
    if (entryNum) {
      dataString += " entry number " + entryNum;
    }

    let registrationNumber = gd.collectionData.registrationNumber;
    if (registrationNumber) {
      dataString += " registration number " + registrationNumber;
    }
  }

  return dataString;
}

function getParentageString(fatherName, motherName, gender) {
  let parentageString = "";

  if (!fatherName && !motherName) {
    return parentageString;
  }

  if (gender == "male") {
    parentageString += ", son of";
  } else if (gender == "female") {
    parentageString += ", daughter of";
  } else {
    parentageString += ", child of";
  }
  if (fatherName) {
    parentageString += " " + fatherName;
  }
  if (motherName) {
    if (fatherName) {
      parentageString += " &";
    }
    parentageString += " " + motherName;
  }

  return parentageString;
}

function getUkCensusString(gd, options) {
  let dataString = getFullName(gd);

  let structuredHousehold = buildStructuredHousehold(gd);
  let selectedStructuredMember = undefined;
  let relatedToPerson = undefined;
  if (structuredHousehold) {
    selectedStructuredMember = structuredHousehold.selectedMember;
    if (selectedStructuredMember) {
      if (selectedStructuredMember.relationTo) {
        relatedToPerson = selectedStructuredMember.relationTo;
      } else if (
        structuredHousehold.head &&
        structuredHousehold.head.personIndex != selectedStructuredMember.personIndex
      ) {
        // sometimes this is a pauper and the "head" is also a pauper
        // maybe some relationships are not valid to be head
        // for now just check if they are the same
        if (
          selectedStructuredMember.gdMember.relationship &&
          selectedStructuredMember.gdMember.relationship != structuredHousehold.head.gdMember.relationship
        ) {
          relatedToPerson = structuredHousehold.head;
        }
      }
    }
  }

  let age = cleanAge(gd.ageAtEvent);
  let maritalStatus = gd.maritalStatus;
  let relationshipToHead = gd.relationshipToHead;

  if (maritalStatus == "widow") {
    maritalStatus = "widowed";
  } else if (maritalStatus == "single") {
    maritalStatus = gd.getTermForUnmarried();
  }

  if (age) {
    dataString += " (" + age + ")";
  }

  if (!relationshipToHead) {
    // no relationship defined (e.g. 1841)
    if (maritalStatus) {
      dataString += ", " + maritalStatus;
    }
    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation + ",";
    }
  } else if (relationshipToHead == "head") {
    if (maritalStatus) {
      dataString += ", " + maritalStatus;
    }
    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation + ",";
    }
    dataString += " head of household";
  } else {
    let needsClosingComma = false;
    if (relationshipToHead == "wife") {
      dataString += ", wife";
      needsClosingComma = true;
    } else if (relationshipToHead) {
      if (maritalStatus) {
        dataString += ", " + maritalStatus;
        needsClosingComma = true;
      }
      dataString += " " + relationshipToHead;
    }

    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation;
      needsClosingComma = true;
    }

    if (needsClosingComma) {
      dataString += ",";
    }

    if (gd.householdArray && gd.householdArray.length > 0) {
      let headIndex = 0;
      if (relatedToPerson) {
        headIndex = relatedToPerson.personIndex;
      } else {
        headIndex = getHeadOfHouseholdIndex(gd.householdArray);
      }
      let headName = gd.householdArray[headIndex].name;
      let headAge = cleanAge(gd.householdArray[headIndex].age);

      if (headName) {
        dataString += " in household of ";
        dataString += headName;
        if (headAge) {
          dataString += " (" + headAge + ")";
        }
      }
    }
  }

  // we want to give more than just the street address and the registration district if possible
  // First check if the registration district is part of the placeString.
  if (gd.eventPlace) {
    if (!gd.registrationDistrict) {
      // this can happen for 1911 ceneus on Ancestry which just has a number for district
      if (gd.eventPlace && gd.eventPlace.placeString) {
        dataString += getFullPlaceTermWithPreposition(gd.eventPlace);
      }
    } else {
      let addedPlace = false;
      let placeParts = gd.eventPlace.separatePlaceIntoParts();
      if (placeParts.localPlace) {
        let regIndex = placeParts.localPlace.indexOf(", " + gd.registrationDistrict + ", ");
        if (regIndex == -1) {
          if (placeParts.localPlace.endsWith(", " + gd.registrationDistrict)) {
            regIndex = placeParts.localPlace.indexOf(", " + gd.registrationDistrict);
          }
        }
        if (regIndex != -1) {
          let shortPlaceString = placeParts.localPlace.substring(0, regIndex);
          shortPlaceString = getPlaceWithPreposition(shortPlaceString);
          dataString += " " + shortPlaceString;
          dataString += " in " + gd.registrationDistrict + " registration district";
          addedPlace = true;
        } else if (placeParts.localPlace == gd.registrationDistrict) {
          // no point duplicating the info - just give registration district
          dataString += " in " + gd.registrationDistrict + " registration district";
          addedPlace = true;
        }
      }
      if (!addedPlace) {
        if (placeParts.localPlace) {
          dataString += " " + getPlaceWithPreposition(placeParts.localPlace);
        } else if (gd.eventPlace && gd.eventPlace.placeString) {
          dataString += " " + getPlaceWithPreposition(gd.eventPlace.placeString);
        }
        dataString += " in " + gd.registrationDistrict + " registration district";
      }
      if (placeParts.county || placeParts.country) {
        dataString += " in ";
        if (placeParts.county && placeParts.country) {
          dataString += placeParts.county + ", " + placeParts.country;
        } else if (placeParts.county) {
          dataString += placeParts.county;
        } else if (placeParts.country) {
          dataString += placeParts.country;
        }
      }
    }
  } else if (gd.registrationDistrict) {
    dataString += " in " + gd.registrationDistrict + " registration district";
  }

  let birthPlace = gd.inferBirthPlace();
  if (birthPlace) {
    dataString += ". Born in " + birthPlace;
  }

  let employer = gd.employer;
  if (employer) {
    dataString += ". Employed by " + employer;
  }

  return dataString;
}

function get1939RegisterString(gd, options) {
  let dataString = getFullName(gd);

  let birthDate = gd.inferBirthDateObj();
  if (birthDate) {
    dataString += " (born " + cleanDateObj(birthDate) + ")";
  }
  let maritalStatus = gd.maritalStatus;
  if (maritalStatus) {
    // Note in the 1939 register the term single is used rather than unmarried so leave it that way
    dataString += ", " + maritalStatus;
  }
  let occupation = gd.occupation;
  if (occupation) {
    dataString += ", " + occupation + ",";
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getHeadOfHouseholdIndex(householdArray) {
  for (let index = 0; index < householdArray.length; index++) {
    let member = householdArray[index];
    if (member.relationship) {
      let relationshipLc = member.relationship.toLowerCase();
      if (relationshipLc == "head" || relationshipLc.includes("head")) {
        return index;
      }
    }
  }
  return 0;
}

function getOtherCensusString(gd, options) {
  let dataString = getFullName(gd);

  let structuredHousehold = buildStructuredHousehold(gd);
  let selectedStructuredMember = undefined;
  let relatedToPerson = undefined;
  if (structuredHousehold) {
    selectedStructuredMember = structuredHousehold.selectedMember;
    if (selectedStructuredMember) {
      if (selectedStructuredMember.relationTo) {
        relatedToPerson = selectedStructuredMember.relationTo;
      } else if (
        structuredHousehold.head &&
        structuredHousehold.head.personIndex != selectedStructuredMember.personIndex
      ) {
        // sometimes this is a pauper and the "head" is also a pauper
        // maybe some relationships are not valid to be head
        // for now just check if they are the same
        if (
          selectedStructuredMember.gdMember.relationship &&
          selectedStructuredMember.gdMember.relationship != structuredHousehold.head.gdMember.relationship
        ) {
          relatedToPerson = structuredHousehold.head;
        }
      }
    }
  }

  let age = cleanAge(gd.ageAtEvent);
  let maritalStatus = gd.maritalStatus;
  let relationshipToHead = gd.relationshipToHead;

  if (age) {
    dataString += " (" + age + ")";
  }

  if (relationshipToHead == "head") {
    if (maritalStatus) {
      dataString += ", " + maritalStatus;
    }
    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation + ",";
    }
    dataString += " head of household";
  } else if (relationshipToHead) {
    let needsClosingComma = false;
    if (relationshipToHead == "wife") {
      dataString += ", wife";
      needsClosingComma = true;
    } else if (relationshipToHead) {
      if (maritalStatus) {
        dataString += ", " + maritalStatus;
        needsClosingComma = true;
      }
      dataString += " " + relationshipToHead;
    }

    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation;
      needsClosingComma = true;
    }

    if (needsClosingComma) {
      dataString += ",";
    }

    if (gd.householdArray && gd.householdArray.length > 0) {
      let headIndex = 0;
      if (relatedToPerson) {
        headIndex = relatedToPerson.personIndex;
      } else {
        headIndex = getHeadOfHouseholdIndex(gd.householdArray);
      }
      let headName = gd.householdArray[headIndex].name;
      let headAge = cleanAge(gd.householdArray[headIndex].age);

      if (headName) {
        dataString += " in household of ";
        dataString += headName;
        if (headAge) {
          dataString += " (" + headAge + ")";
        }
      }
    }
  } else {
    if (maritalStatus) {
      dataString += ", " + maritalStatus;
    }
    let occupation = gd.occupation;
    if (occupation) {
      dataString += ", " + occupation + ",";
    }
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  let birthPlace = gd.inferBirthPlace();
  if (birthPlace) {
    dataString += ". Born in " + birthPlace;
  }

  return dataString;
}

function getCensusString(gd, options) {
  // First test if this is a regular england census or a 1939 register

  let is1939Register = false;
  let isUkCensus = false;

  if (gd.collectionData && gd.collectionData.id) {
    let collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
    if (collection) {
      if (collection.wtsId == "EnglandAndWales1939Register") {
        is1939Register = true;
      } else {
        if (collection.country) {
          let country = collection.country;
          if (country == "United Kingdom" || CD.isPartOf(country, "United Kingdom")) {
            isUkCensus = true;
          }
        }
      }
    }
  }

  if (is1939Register) {
    return get1939RegisterString(gd, options);
  }

  if (isUkCensus) {
    return getUkCensusString(gd, options);
  }

  // it is some other census record
  return getOtherCensusString(gd, options);
}

function getPopulationRegisterString(gd, options) {
  let dataString = getFullName(gd);

  let occupation = gd.occupation;
  if (occupation) {
    dataString += ", " + occupation + ",";
  }

  let eventDateObj = gd.inferEventDateObj();
  if (eventDateObj) {
    if (eventDateObj.fromDate && eventDateObj.toDate) {
      dataString +=
        " between " +
        eventDateObj.fromDate.getDataStringFormat(false, "") +
        " and " +
        eventDateObj.toDate.getDataStringFormat(false, "");
    } else {
      dataString += " " + getDateWithPreposition(eventDateObj);
    }
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  let birthDateObj = gd.birthDate;
  let birthPlace = gd.inferBirthPlace();
  if (birthDateObj) {
    dataString += ". Born " + getDateWithPreposition(birthDateObj);
    if (birthPlace) {
      dataString += " " + getPlaceWithPreposition(birthPlace);
    }
  } else if (birthPlace) {
    dataString += ". Born " + getPlaceWithPreposition(birthPlace);
  }

  return dataString;
}

function getSlaveScheduleString(gd, options) {
  let dataString = getFullName(gd);

  let age = cleanAge(gd.ageAtEvent);
  if (age) {
    dataString += ", " + age + ",";
  }

  if (gd.typeSpecificData) {
    let role = gd.typeSpecificData.role;
    if (role) {
      if (!dataString.endsWith(",")) {
        dataString += ",";
      }
      if (gd.typeSpecificData.wasFugitive) {
        dataString += " fugitive";
      }
      if (gd.inferPersonGender()) {
        dataString += " " + gd.inferPersonGender();
      }
      if (gd.typeSpecificData.race) {
        dataString += " " + gd.typeSpecificData.race.toLowerCase();
      }
      dataString += " " + role.toLowerCase();
      if (gd.typeSpecificData.numEnslavedPeople) {
        dataString += " of " + gd.typeSpecificData.numEnslavedPeople + " enslaved people";
      }
      dataString += ",";
    }
  }

  let eventDateObj = gd.inferEventDateObj();
  if (eventDateObj) {
    dataString += " " + getDateWithPreposition(eventDateObj);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getSocialSecurityString(gd, options) {
  let dataString = getFullName(gd);

  let deathDate = gd.inferDeathDateObj();
  let placeObj = gd.inferDeathPlaceObj();

  if (gd.role && gd.role != Role.Primary) {
    dataString += " in Social Security record for " + getPrimaryPersonTermAndName(gd);
    deathDate = gd.inferEventDateObj();
    placeObj = gd.inferEventPlaceObj();
  } else {
    dataString += " Social Security record";
  }

  return dataString;
}

function getUkRegistrationString(gd, options, type) {
  let dataString = getFullName(gd);
  dataString += " " + type;

  if (type == "marriage" && gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let spouseName = spouse.name.inferFullName();
      if (spouseName) {
        dataString += " to " + spouseName;
      }
    }
  }

  dataString += " registered"; // make clear that it is date of registration not event

  let quarter = getQuarterName(gd.inferEventQuarter());
  if (quarter) {
    dataString += " " + quarter;

    let eventYear = gd.inferEventYear();
    if (eventYear) {
      dataString += " " + eventYear;
    }
  } else {
    let eventDate = gd.inferEventDateObj();
    if (eventDate) {
      dataString += " " + cleanDateObj(eventDate);
    }
  }

  let district = gd.registrationDistrict;
  if (!district) {
    let eventPlace = gd.inferEventPlace();
    if (eventPlace) {
      district = eventPlace;
    } else {
      return ""; // fallback to non-custom string
    }
  }
  dataString += " in " + district;

  if (type == "birth") {
    if (gd.mothersMaidenName) {
      dataString += ", mother's maiden name " + gd.mothersMaidenName;
    } else {
      let parentNames = gd.inferParentNamesForDataString();
      if (parentNames.fatherName || parentNames.motherName) {
        dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
      }
    }
  } else if (type == "death") {
    let bornOrAgeText = "";

    // coming from FS the gd.birthDate.dateString could be something like "1844", we don't want to use that
    if (gd.birthDate && gd.birthDate.dateString && gd.birthDate.dateString.length > 8) {
      // later UK death registrations include full birth date (available after June quarter 1969)
      let birthDate = gd.inferBirthDateObj();
      bornOrAgeText = "born " + cleanDateObj(birthDate);
    } else {
      let age = cleanAge(gd.ageAtDeath);
      if (!age) {
        age = cleanAge(gd.age);
      }
      if (!age) {
        age = cleanAge(gd.ageAtEvent);
      }
      if (age) {
        bornOrAgeText = "age " + age;
      } else if (gd.birthDate) {
        let dateString = gd.birthDate.dateString;
        if (!dateString) {
          dateString = gd.birthDate.yearString;
        }
        if (dateString) {
          bornOrAgeText = "born " + dateString;
        }
      }
    }

    let mmnText = "";
    if (gd.mothersMaidenName) {
      mmnText = "mother's maiden name " + gd.mothersMaidenName;
    }

    if (bornOrAgeText && mmnText) {
      dataString += " (" + bornOrAgeText + ", " + mmnText + ")";
    } else if (bornOrAgeText) {
      dataString += " (" + bornOrAgeText + ")";
    } else if (mmnText) {
      dataString += " (" + mmnText + ")";
    }
  }

  // Normally a reference string would be a separate part of the citation - not in the data string
  // GRO and FreeBMD are special cases.
  if (gd.sourceOfData == "gro" || gd.sourceOfData == "freebmd") {
    dataString += getReferenceString(gd, options);
  }

  return dataString;
}

function getValuationRollString(gd, options) {
  let dataString = getFullName(gd);

  if (gd.status) {
    dataString += "recorded as " + gd.status + " in a valuation roll";
  } else {
    dataString += "recorded in a valuation roll";
  }

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function addRegistrationPlace(gd, options) {
  let placeString = "";

  let place = gd.inferEventPlace();
  let registrationDistrict = gd.registrationDistrict;

  if (gd.isRecordInCountry("Ireland") && registrationDistrict) {
    let eventYearNum = DateUtils.getYearNumFromYearString(gd.inferEventYear());
    if (eventYearNum && eventYearNum >= 1864) {
      placeString = " in the " + registrationDistrict + " Superintendent Registrar's District";
    } else {
      placeString = " in the " + registrationDistrict + " registration area";
    }
  } else {
    if (place) {
      placeString = " " + getPlaceWithPreposition(place);
    } else if (registrationDistrict) {
      placeString = " in the " + registrationDistrict + " district";
    }
  }

  return placeString;
}

function getBirthRegistrationString(gd, options) {
  if (gd.isRecordInCountry("United Kingdom")) {
    return getUkRegistrationString(gd, options, "birth");
  }

  let dataString = "";

  let isDateTheRegistrationDate = isRegistrationEventDateTheRegistrationDate(gd);

  // generic birth registration
  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      let primaryPersonName = gd.inferPrimaryPersonFullName();
      if (primaryPersonName) {
        dataString += primaryPersonName;
      } else {
        dataString += "child";
      }

      dataString += " born to ";

      dataString += getFullName(gd);
      if (gd.spouses && gd.spouses[0] && gd.spouses[0].name && gd.spouses[0].name.name) {
        dataString += " and " + gd.spouses[0].name.name;
      }
    } else {
      dataString += getFullName(gd) + " in record for birth of " + getPrimaryPersonTermAndName(gd);
    }

    let date = gd.inferEventDateObj();
    if (date) {
      dataString += " " + getDateWithPreposition(date);
    }

    dataString += addRegistrationPlace(gd, options);
  } else {
    dataString = getFullName(gd);

    let birthDate = gd.inferBirthDate();
    let eventDate = gd.inferEventDate();
    if (isDateTheRegistrationDate) {
      if (birthDate && birthDate != eventDate && birthDate.endsWith(eventDate)) {
        dataString += " birth";
        dataString += " " + birthDate;
        dataString += " registered"; // because place is registration place
      } else {
        dataString += " birth registered";
        dataString += " " + eventDate;
        if (birthDate && birthDate != eventDate) {
          dataString += " (born " + birthDate + ")";
        }
      }
    } else {
      dataString += " birth";
      if (birthDate) {
        dataString += " " + birthDate;
      } else {
        dataString += " " + eventDate;
      }
    }

    dataString += addRegistrationPlace(gd, options);

    // sometimes there is a birth place that contains more info than the registration place
    // e.g.: https://www.ancestry.com/discoveryui-content/view/3027592:2573
    let birthPlace = gd.birthPlace;
    if (birthPlace && birthPlace.placeString) {
      let birthPlaceString = birthPlace.placeString;
      if (!dataString.includes(birthPlaceString)) {
        dataString += ", birth place " + birthPlaceString;
      }
    }

    let parentNames = gd.inferParentNamesForDataString();
    if (parentNames.fatherName || parentNames.motherName) {
      dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
    }

    if (gd.mothersMaidenName) {
      dataString += ", mother's maiden name " + gd.mothersMaidenName;
    }
  }

  return dataString;
}

function getDeathRegistrationString(gd, options) {
  if (gd.isRecordInCountry("United Kingdom")) {
    return getUkRegistrationString(gd, options, "death");
  }

  let isDateTheRegistrationDate = isRegistrationEventDateTheRegistrationDate(gd);

  let deathDate = gd.inferDeathDateObj();

  // generic death registration
  let dataString = getFullName(gd);
  if (gd.role && gd.role != Role.Primary) {
    dataString += " in death record for " + getPrimaryPersonTermAndName(gd);
    deathDate = gd.inferEventDateObj();

    if (deathDate) {
      dataString += " " + cleanDateObj(deathDate);
    }
  } else {
    let deathDateString = cleanDateObj(deathDate);
    let eventDateString = cleanDateObj(gd.inferEventDateObj());
    let age = cleanAge(gd.ageAtDeath);

    if (isDateTheRegistrationDate) {
      if (deathDateString && deathDateString != eventDateString && deathDateString.endsWith(eventDateString)) {
        dataString += " death";
        dataString += " " + deathDateString;
        if (age) {
          dataString += " (age " + age + ")";
        }
        dataString += " registered"; // because place is registration place
      } else {
        dataString += " death registered";
        dataString += " " + eventDateString;
        if (deathDateString && deathDateString != eventDateString) {
          if (age) {
            dataString += " (died " + deathDateString + ", age " + age + ")";
          } else {
            dataString += " (died " + deathDateString + ")";
          }
        } else {
          if (age) {
            dataString += " (age " + age + ")";
          }
        }
      }
    } else {
      dataString += " death";
      if (deathDateString) {
        dataString += " " + deathDateString;
      } else {
        dataString += " " + eventDateString;
      }
      if (age) {
        dataString += " (age " + age + ")";
      }
    }
  }

  dataString += addRegistrationPlace(gd, options);

  if (!(gd.role && gd.role != Role.Primary)) {
    let birthDateObj = gd.birthDate;
    if (birthDateObj) {
      let birthDateString = birthDateObj.getDateString();
      if (birthDateString) {
        dataString += " (born " + birthDateString + ")";
      }
    }

    let parentNames = gd.inferParentNamesForDataString();
    if (parentNames.fatherName || parentNames.motherName) {
      dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
    }
  }

  return dataString;
}

function getMarriageRegistrationString(gd, options) {
  if (gd.isRecordInCountry("United Kingdom")) {
    return getUkRegistrationString(gd, options, "marriage");
  }

  // generic marriage reg
  let dataString = getFullName(gd);

  let age = cleanAge(gd.ageAtEvent);
  if (age) {
    dataString += " (" + age + ")";
  }

  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      dataString += " child";
    } else {
      dataString += " " + getPrimaryPersonTermAndName(gd);
    }
  } else {
    if (gd.parents) {
      let fatherName = "";
      if (gd.parents.father && gd.parents.father.name) {
        fatherName = gd.parents.father.name.inferFullName();
      }
      let motherName = "";
      if (gd.parents.mother && gd.parents.mother.name) {
        motherName = gd.parents.mother.name.inferFullName();
      }

      dataString += getParentageString(fatherName, motherName, gd.inferPersonGender());
      dataString += ",";
    }
  }

  dataString += " marriage";

  if (gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let spouseName = spouse.name.inferFullName();
      dataString += " to " + spouseName;

      let spouseAge = cleanAge(spouse.age);
      if (spouseAge) {
        dataString += " (" + spouseAge + ")";
      }

      if (spouse.parents) {
        let fatherName = "";
        if (spouse.parents.father && spouse.parents.father.name) {
          fatherName = spouse.parents.father.name.inferFullName();
        }
        let motherName = "";
        if (spouse.parents.mother && spouse.parents.mother.name) {
          motherName = spouse.parents.mother.name.inferFullName();
        }

        dataString += getParentageString(fatherName, motherName, spouse.personGender);
        dataString += ",";
      }
    }
  }

  let date = gd.inferEventDateObj();
  if (gd.marriageDate) {
    date = new DateObj();
    date.dateString = gd.marriageDate;
  }
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  dataString += addRegistrationPlace(gd, options);

  return dataString;
}

function getBirthString(gd, options) {
  let dataString = "";

  let eventDateObj = gd.inferEventDateObj();
  let birthDateObj = gd.inferBirthDateObj();

  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      let primaryPersonName = gd.inferPrimaryPersonFullName();
      if (primaryPersonName) {
        dataString += primaryPersonName;
      } else {
        dataString += "child";
      }

      if (gd.recordType == RT.Birth) {
        dataString += " born to ";
      } else {
        dataString += " born or baptised to ";
      }
      dataString += getFullName(gd);
      if (gd.spouses && gd.spouses[0] && gd.spouses[0].name && gd.spouses[0].name.name) {
        dataString += " and " + gd.spouses[0].name.name;
      }
    } else {
      dataString += getFullName(gd) + " in record of birth of " + getPrimaryPersonTermAndName(gd);
    }

    if (eventDateObj) {
      dataString += " " + getDateWithPreposition(eventDateObj);
    }
  } else {
    dataString += getFullName(gd);

    let twoDates = false;
    if (eventDateObj && birthDateObj && eventDateObj.getDateString() != birthDateObj.getDateString()) {
      twoDates = true;
    }

    if (gd.recordType == RT.Birth) {
      dataString += " born";
      if (birthDateObj) {
        dataString += " " + getDateWithPreposition(birthDateObj);
      } else if (eventDateObj) {
        dataString += " " + getDateWithPreposition(eventDateObj);
      }
    } else {
      if (twoDates) {
        dataString += " born";
        dataString += " " + getDateWithPreposition(birthDateObj);
        dataString += " and baptised or registered " + getDateWithPreposition(eventDateObj);
      } else {
        dataString += " born or baptised";
        dataString += " " + getDateWithPreposition(eventDateObj);
      }
    }

    let parentNames = gd.inferParentNamesForDataString();
    if (parentNames.fatherName || parentNames.motherName) {
      dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
      dataString += ",";
    }
  }

  let useBirthPlace = false;
  if (!gd.role || gd.role == Role.Primary) {
    if (gd.recordType == RT.Birth && gd.inferBirthPlaceObj()) {
      // Sometimes the eventplace is a more comlete version of birthplace.
      // E.g. https://www.familysearch.org/ark:/61903/1:1:FXX1-Q87
      let birthPlace = gd.inferBirthPlace();
      let eventPlace = gd.inferEventPlace();
      if (eventPlace) {
        if (!eventPlace.startsWith(birthPlace)) {
          useBirthPlace = true;
        }
      } else {
        useBirthPlace = true;
      }
    }
  }

  if (useBirthPlace) {
    dataString += getFullPlaceTermWithPreposition(gd.inferBirthPlaceObj());
  } else if (gd.inferEventPlaceObj()) {
    dataString = addEventPlaceTermWithPrepositionOrRd(dataString, gd);
  }

  if (dataString.endsWith(",")) {
    dataString = dataString.substring(0, dataString.length - 1);
  }

  return dataString;
}

function getDeathString(gd, options) {
  let dataString = getFullName(gd);

  let deathDate = gd.inferDeathDateObj();
  let placeObj = gd.inferDeathPlaceObj();

  if (gd.role && gd.role != Role.Primary) {
    dataString += " in death record for " + getPrimaryPersonTermAndName(gd);
    deathDate = gd.inferEventDateObj();
    placeObj = gd.inferEventPlaceObj();
  } else {
    dataString += " death";
  }

  if (deathDate) {
    dataString += " " + cleanDateObj(deathDate);
  }

  let birthDateObj = gd.birthDate;
  if (gd.role && gd.role != Role.Primary) {
    birthDateObj = gd.inferPrimaryPersonBirthDateObj();
  }

  if (birthDateObj && birthDateObj.dateString && birthDateObj.dateString.length > 4) {
    dataString += " (born " + birthDateObj.dateString + ")";
  } else {
    let age = cleanAge(gd.ageAtDeath);
    if (age) {
      dataString += " (age " + age + ")";
    }
  }

  let parentNames = gd.inferParentNamesForDataString();
  if (parentNames.fatherName || parentNames.motherName) {
    dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
    dataString += ",";
  }

  if (gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let spouseName = spouse.name.inferFullName();
      if (spouseName) {
        let relation = "spouse";
        if (gd.inferPersonGender() == "male") {
          relation = "husband";
        } else if (gd.inferPersonGender() == "female") {
          relation = "wife";
        }
        if (!dataString.endsWith(",")) {
          dataString += ",";
        }
        dataString += " " + relation + " of " + spouseName + ",";
      }
    }
  }

  if (placeObj) {
    let place = placeObj.inferFullPlaceString();
    if (place) {
      dataString += " " + getPlaceWithPreposition(place);
    }
  } else {
    let residencePlace = gd.inferResidencePlace();
    if (residencePlace) {
      dataString += " residing " + getPlaceWithPreposition(residencePlace);
    }
  }

  if (dataString.endsWith(",")) {
    dataString = dataString.substring(0, dataString.length - 1);
  }

  if (gd.mothersMaidenName) {
    dataString += ", mother's maiden name " + gd.mothersMaidenName;
  }

  if (gd.causeOfDeath) {
    dataString += ". Cause of death: " + gd.causeOfDeath;
  }

  return dataString;
}

function getBaptismString(gd, options) {
  let dataString = getFullName(gd);

  if (gd.role && gd.role != Role.Primary) {
    dataString += "'s " + getPrimaryPersonTermAndName(gd);
  }

  dataString += " baptism";

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  let birthDateObj = gd.birthDate;
  if (gd.role && gd.role != Role.Primary) {
    birthDateObj = gd.inferPrimaryPersonBirthDateObj();
  }

  if (birthDateObj) {
    dataString += " (born " + cleanDateObj(birthDateObj) + ")";
  }

  let place = gd.inferFullEventPlace();

  let parentNames = gd.inferParentNamesForDataString();
  if (parentNames.fatherName || parentNames.motherName) {
    dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
    if (place) {
      dataString += ",";
    }
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  // sometimes a baptism has a death date. (e.g. germany_baptism_1840_johanna_hartmann)
  let deathDate = gd.inferDeathDateObj();
  if (deathDate) {
    dataString += " and died " + getDateWithPreposition(deathDate);
  }

  return dataString;
}

function getConfirmationString(gd, options) {
  let dataString = getFullName(gd);

  if (gd.role && gd.role != Role.Primary) {
    dataString += "'s " + getPrimaryPersonTermAndName(gd);
  }

  dataString += " confirmation";

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  let birthDateObj = gd.birthDate;
  if (gd.role && gd.role != Role.Primary) {
    birthDateObj = gd.inferPrimaryPersonBirthDateObj();
  }

  if (birthDateObj) {
    dataString += " (born " + cleanDateObj(birthDateObj) + ")";
  }

  let place = gd.inferFullEventPlace();

  let parentNames = gd.inferParentNamesForDataString();
  if (parentNames.fatherName || parentNames.motherName) {
    dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
    if (place) {
      dataString += ",";
    }
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getMarriageString(gd, options) {
  let dataString = "";

  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      let possessiveName = getFullName(gd) + "'s";
      dataString += possessiveName + " " + getPrimaryPersonChildTerm(gd);
      let primaryPersonName = gd.inferPrimaryPersonFullName();
      if (primaryPersonName) {
        dataString += " " + primaryPersonName;
      }

      let age = cleanAge(gd.primaryPersonAge);
      if (age) {
        dataString += " (" + age + ")";
      }
    } else {
      dataString += getFullName(gd) + " in record for another person's";
    }
  } else {
    dataString += getFullName(gd);

    let age = cleanAge(gd.ageAtEvent);
    if (age) {
      dataString += " (" + age + ")";
    }

    let parentNames = gd.inferParentNamesForDataString();
    if (parentNames.fatherName || parentNames.motherName) {
      dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
      dataString += ",";
    }
  }

  dataString += " marriage";

  if (gd.spouses && gd.spouses.length == 1 && gd.spouses[0].name) {
    let spouse = gd.spouses[0];
    let spouseName = spouse.name.inferFullName();
    dataString += " to " + spouseName;

    let spouseAge = cleanAge(spouse.age);
    if (spouseAge) {
      dataString += " (" + spouseAge + ")";
    }

    if (spouse.parents) {
      let fatherName = "";
      if (spouse.parents.father && spouse.parents.father.name) {
        fatherName = spouse.parents.father.name.inferFullName();
      }
      let motherName = "";
      if (spouse.parents.mother && spouse.parents.mother.name) {
        motherName = spouse.parents.mother.name.inferFullName();
      }

      dataString += getParentageString(fatherName, motherName, spouse.personGender);
      dataString += ",";
    }
  }

  if (gd.recordSubtype && gd.recordSubtype == RecordSubtype.Banns) {
    dataString += ". Banns read";
  }

  if (gd.marriageDate) {
    let date = new DateObj();
    date.dateString = gd.marriageDate;
    dataString += " " + getDateWithPreposition(date);
  } else {
    let date = gd.inferEventDateObj();
    if (date) {
      let prepSuffix = "";
      if (gd.recordSubtype && gd.recordSubtype == RecordSubtype.MarriageOrBanns) {
        prepSuffix = "or after";
      }
      dataString += " " + getDateWithPreposition(date, prepSuffix);
    }
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getBurialString(gd, options) {
  let dataString = getFullName(gd);
  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      let primaryPersonName = gd.inferPrimaryPersonFullName();
      dataString += "'s " + getPrimaryPersonChildTerm(gd);
      if (primaryPersonName) {
        dataString += " " + primaryPersonName;
      }
    } else if (gd.role == Role.Spouse) {
      let primaryPersonName = gd.inferPrimaryPersonFullName();
      dataString += "'s " + getPrimaryPersonSpouseTerm(gd);
      if (primaryPersonName) {
        dataString += " " + primaryPersonName;
      }
    } else {
      dataString += "'s " + getPrimaryPersonTermAndName(gd);
    }
  } else {
    let parentNames = gd.inferParentNamesForDataString();
    if (parentNames.fatherName || parentNames.motherName) {
      dataString += getParentageString(parentNames.fatherName, parentNames.motherName, gd.inferPersonGender());
      dataString += ",";
    }
  }

  if (gd.recordType == RT.DeathOrBurial) {
    dataString += " death or burial";
  } else {
    dataString += " burial";
  }

  let deathDate = gd.deathDate;
  let age = cleanAge(gd.ageAtDeath);
  if (!age) {
    age = cleanAge(gd.ageAtEvent);
  }
  if (deathDate && age) {
    dataString += " (died " + getDateWithPreposition(deathDate) + " at age " + age + ")";
  } else if (deathDate) {
    dataString += " (died " + getDateWithPreposition(deathDate) + ")";
  } else if (age) {
    dataString += " (died age " + age + ")";
  }

  let burialDate = gd.inferEventDateObj();
  if (burialDate) {
    dataString += " " + getDateWithPreposition(burialDate);
  }

  dataString = addEventPlaceTermWithPrepositionOrRd(dataString, gd);

  if (gd.causeOfDeath) {
    dataString += ". Cause of death: " + gd.causeOfDeath;
  }

  // Include the birth date if known, but try to exclude it if it is just a year estimated (by transcriber)
  // from the age.
  let birthDateObj = gd.birthDate;
  if (gd.role && gd.role != Role.Primary) {
    birthDateObj = gd.inferPrimaryPersonBirthDateObj();
  }

  if (birthDateObj) {
    let includeBirthDate = true;
    if (age) {
      if (!birthDateObj.dateString) {
        // only a year
        includeBirthDate = false;
      } else if (birthDateObj.dateString == birthDateObj.yearString) {
        // only a year
        includeBirthDate = false;
      } else if (birthDateObj.dateString.length <= 4) {
        // only a year
        includeBirthDate = false;
      }
    } else {
      // there is no age, so if there is a birth date it may be from original and may add info
    }

    if (includeBirthDate) {
      dataString += ". Born " + getDateWithPreposition(birthDateObj);
    }
  }

  return dataString;
}

function getCremationString(gd, options) {
  let dataString = getFullName(gd);
  dataString += " cremation";

  let deathDate = gd.inferDeathDateObj();
  let age = cleanAge(gd.ageAtDeath);
  if (deathDate && age) {
    dataString += " (died " + getDateWithPreposition(deathDate) + " at age " + age + ")";
  } else if (deathDate) {
    dataString += " (died " + getDateWithPreposition(deathDate) + ")";
  } else if (age) {
    dataString += " (died age " + age + ")";
  }

  let cremationDate = gd.inferEventDateObj();
  if (cremationDate) {
    dataString += " " + getDateWithPreposition(cremationDate);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getProbateString(gd, options) {
  let dataString = getFullName(gd);
  dataString += " probate";

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  let deathDate = gd.inferDeathDateObj();
  if (deathDate) {
    dataString += ". Died " + cleanDateObj(deathDate);

    let deathPlace = gd.inferDeathPlace();
    if (deathPlace) {
      dataString += " " + getPlaceWithPreposition(deathPlace);
    } else {
      let residencePlace = gd.inferResidencePlace();
      if (residencePlace) {
        dataString += " residing " + getPlaceWithPreposition(residencePlace);
      }
    }
  } else {
    let residencePlace = gd.inferResidencePlace();
    if (residencePlace) {
      dataString += ". Residence " + residencePlace;
    }
  }

  if (gd.occupation) {
    dataString += ". Occupation: " + gd.occupation;
  }

  return dataString;
}

function getScottishWillString(gd, options) {
  if (gd.role && gd.role != Role.Primary) {
    return ""; // fall back to non-custom string
  }

  let dataString = "";

  if (gd.recordSubtype == "Probate") {
    dataString = "Confirmation of probate of will of ";
  } else if (gd.recordSubtype == "Testament") {
    if (gd.testateOrIntestate == "testate") {
      dataString = "Confirmation of will of ";
    } else if (gd.testateOrIntestate == "intestate") {
      dataString = "Confirmation of testament of ";
    } else {
      dataString = "Confirmation of will or testament of ";
    }
  } else if (gd.recordSubtype == "Inventory") {
    dataString = "Confirmation of inventory for ";
  } else if (gd.recordSubtype == "AdditionalInventory") {
    dataString = "Confirmation of inventory for ";
  } else if (gd.recordSubtype == "AdditionalInventory") {
    dataString = "Confirmation of additional inventory for ";
  } else {
    dataString = "Confirmation of will or testament of ";
  }

  dataString += getFullName(gd);

  if (gd.courtName) {
    dataString += " at " + gd.courtName;
  } else {
    let place = gd.inferFullEventPlace();
    if (place) {
      dataString += " in " + place;
    }
  }

  let eventDate = gd.inferEventDateObj();
  let origDate = gd.originalConfirmationGrantedDate;
  let grantedDate = gd.grantedDate;

  if (eventDate) {
    if (grantedDate) {
      dataString += " " + getDateFromStringWithPreposition(grantedDate);
      dataString += " (original confirmation " + getDateWithPreposition(eventDate) + ")";
    } else if (origDate) {
      dataString += " " + getDateWithPreposition(eventDate);
      dataString += " (original confirmation " + getDateFromStringWithPreposition(origDate) + ")";
    } else {
      dataString += " " + getDateWithPreposition(eventDate);
    }
  }

  let deathDate = gd.inferDeathDateObj();
  if (deathDate) {
    dataString += ". Died " + cleanDateObj(deathDate);

    let deathPlace = gd.inferDeathPlace();
    if (deathPlace && deathPlace != place) {
      dataString += " " + getPlaceWithPreposition(place);
    }
  }

  if (gd.occupation) {
    dataString += ". Occupation: " + gd.occupation;
  }

  return dataString;
}

function getWillString(gd, options) {
  if (gd.inferEventCountry() == "Scotland" || (gd.courtName && gd.courtName.startsWith("non-Scot"))) {
    return getScottishWillString(gd, options);
  }

  if (gd.role && gd.role != Role.Primary) {
    return ""; // fall back to non-custom string
  }

  let dateObj = gd.inferEventDateObj();
  let deathDateObj = gd.inferDeathDateObj();

  let hasProbateDate = false;
  if (dateObj) {
    if (!deathDateObj || dateObj.getDateString() != deathDateObj.getDateString()) {
      // there is a probate date (probably)
      hasProbateDate = true;
    }
  }

  let dataString = "Will of " + getFullName(gd);

  let eventPlace = gd.inferFullEventPlace();
  let deathPlace = gd.inferDeathPlace();
  let residencePlace = gd.inferResidencePlace();

  let usedResidence = false;
  if (residencePlace) {
    dataString += " of " + residencePlace;
    usedResidence = true;
  } else if (eventPlace) {
    dataString += " of " + eventPlace;
  }

  if (hasProbateDate) {
    dataString += ", granted probate";
    dataString += " " + getDateWithPreposition(dateObj);
  }

  let deathDate = gd.inferDeathDateObj();
  if (deathDate) {
    dataString += ". Died " + cleanDateObj(deathDate);
    if (deathPlace) {
      dataString += " " + getPlaceWithPreposition(deathPlace);
    } else if (!usedResidence && residencePlace) {
      dataString += " " + getPlaceWithPreposition(residencePlace);
    }
  }

  if (gd.occupation) {
    dataString += ". Occupation: " + gd.occupation;
  }

  return dataString;
}

function getDivorceString(gd, options) {
  let dataString = getFullName(gd);
  dataString += " divorce";

  if (gd.spouses && gd.spouses.length == 1 && gd.spouses[0].name) {
    let spouseName = gd.spouses[0].name.inferFullName();
    dataString += " from " + spouseName;
  }

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  return dataString;
}

function getDefaultString(gd, options) {
  let dataString = getFullName(gd);

  let date = gd.inferEventDateObj();
  if (date) {
    dataString += " " + getDateWithPreposition(date);
  }

  dataString += getFullPlaceTermWithPreposition(gd.inferEventPlaceObj());

  if (dataString == "Unknown") {
    // the only thing is the unknown name - no use for anything.
    dataString = "";
  }

  return dataString;
}

const DataString = {
  buildDataString: function (input) {
    if (!input || !input.generalizedData || !input.options) {
      return "";
    }

    let gd = input.generalizedData;
    let options = input.options;

    let dataString = "";

    switch (gd.recordType) {
      case RT.BirthRegistration: {
        dataString = getBirthRegistrationString(gd, options);
        break;
      }
      case RT.Birth:
      case RT.BirthOrBaptism: {
        dataString = getBirthString(gd, options);
        break;
      }
      case RT.DeathRegistration: {
        dataString = getDeathRegistrationString(gd, options);
        break;
      }
      case RT.Death: {
        dataString = getDeathString(gd, options);
        break;
      }
      case RT.MarriageRegistration: {
        dataString = getMarriageRegistrationString(gd, options);
        break;
      }
      case RT.Baptism: {
        dataString = getBaptismString(gd, options);
        break;
      }
      case RT.Confirmation: {
        dataString = getConfirmationString(gd, options);
        break;
      }
      case RT.Marriage: {
        dataString = getMarriageString(gd, options);
        break;
      }
      case RT.Burial:
      case RT.DeathOrBurial: {
        dataString = getBurialString(gd, options);
        break;
      }
      case RT.Cremation: {
        dataString = getCremationString(gd, options);
        break;
      }
      case RT.Census: {
        dataString = getCensusString(gd, options);
        break;
      }
      case RT.PopulationRegister: {
        dataString = getPopulationRegisterString(gd, options);
        break;
      }
      case RT.Probate: {
        dataString = getProbateString(gd, options);
        break;
      }
      case RT.Will: {
        dataString = getWillString(gd, options);
        break;
      }
      case RT.Divorce: {
        dataString = getDivorceString(gd, options);
        break;
      }
      case RT.SlaveSchedule: {
        dataString = getSlaveScheduleString(gd, options);
        break;
      }
      case RT.SocialSecurity: {
        dataString = getSocialSecurityString(gd, options);
        break;
      }
      case RT.ValuationRoll: {
        dataString = getValuationRollString(gd, options);
        break;
      }
    }

    if (dataString) {
      dataString += ".";
    }

    return dataString;
  },

  buildDefaultDataString: function (input) {
    if (!input || !input.generalizedData || !input.options) {
      return "";
    }

    let gd = input.generalizedData;
    let options = input.options;

    let dataString = getDefaultString(gd, options);

    if (dataString) {
      dataString += ".";
    }

    return dataString;
  },
};

export { DataString };
