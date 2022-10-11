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
} from "../../../base/core/generalize_data_utils.mjs";
import { RT, RecordSubtype } from "../../../base/core/record_type.mjs";

function determineRecordType(extractedData) {
  const titleMatches = [
    { type: RT.BirthRegistration, matches: ["England & Wales Births"] },
    {
      type: RT.MarriageRegistration,
      matches: [
        "England & Wales Marriages",
        "Civil Registration Marriage Index",
      ],
    },
    { type: RT.DeathRegistration, matches: ["England & Wales Deaths"] },

    {
      type: RT.Baptism,
      matches: [
        "Select Births and Christenings",
        "Church of England Births and Baptisms",
      ],
    },
    { type: RT.Marriage, matches: ["Church of England Marriages and Banns"] },
    {
      type: RT.Burial,
      matches: [
        "Church of England Burials",
        "Burial and Cremation Index",
        "Find a Grave",
      ],
    },

    { type: RT.Divorce, matches: ["Divorce Index"] },

    { type: RT.Census, matches: ["Census", "1939 Register"] },
    { type: RT.ElectoralRegister, matches: ["Electoral Roll"] },

    { type: RT.Probate, matches: ["Probate"] },
    {
      type: RT.Will,
      matches: ["Prerogative Court of Canterbury Wills", "Will Books"],
    },

    {
      type: RT.MarriageRegistration,
      matches: ["Civil Registration Marriage Index"],
    },
    { type: RT.CriminalRegister, matches: ["Criminal Register"] },
    { type: RT.FreemasonMembership, matches: ["Freemason Membership"] },
    {
      type: RT.WorkhouseRecord,
      matches: ["Workhouse Admission and Discharge Records"],
    },
    { type: RT.CrewList, matches: ["Crew List"] },
    { type: RT.PassengerList, matches: ["Passenger List"] },
    { type: RT.ConvictTransportation, matches: ["Convict Transportation"] },
    {
      type: RT.Military,
      matches: [
        "Medal and Award Rolls",
        "British Army World War I Service Records",
        "Army World War I Pension",
        "World War I Pension Ledgers and Index Cards",
        "Regimental Rolls and Recruitment Registers",
      ],
    },
    {
      type: RT.MedicalPatient,
      matches: ["Lunacy Patients Admission Registers"],
    },
    { type: RT.QuarterSession, matches: ["Quarter Sessions"] },
    {
      type: RT.Directory,
      matches: ["City and County Directories", "City Directories"],
    },
    { type: RT.Employment, matches: ["Employment Records"] },
    { type: RT.SocialSecurity, matches: ["U.S., Social Security"] },
    { type: RT.LandTax, matches: ["Land Tax Redemption", "Land Tax Records"] },
    { type: RT.Apprenticeship, matches: ["Apprentices' Indentures"] },
  ];

  const subcategoryMatches = [
    { type: RT.Census, matches: ["Census"] },
    { type: RT.BirthRegistration, matches: ["Civil Births"] },
    { type: RT.MarriageRegistration, matches: ["Civil Marriage & Divorce"] },
    { type: RT.DeathRegistration, matches: ["Civil Deaths"] },
    { type: RT.Baptism, matches: ["Parish Baptisms"] },
    { type: RT.Marriage, matches: ["Parish Marriages"] },
    { type: RT.Burial, matches: ["Parish Burials"] },
    { type: RT.ElectoralRegister, matches: ["Electoral Rolls"] },
    {
      type: RT.Military,
      matches: ["Regimental & Service Records", "First World War"],
    },
    { type: RT.Immigration, matches: ["Migration"] },
    { type: RT.Newspaper, matches: ["Newspapers & Magazines"] },
    { type: RT.LegalRecord, matches: ["Courts & Legal"] },
    { type: RT.Probate, matches: ["Wills & Probate"] },
    { type: RT.RateBook, matches: ["Rate Books"] },
    { type: RT.Directory, matches: ["Directories & Almanacs"] },
    { type: RT.FamHistOrPedigree, matches: ["Family Histories & Pedigrees"] },
    { type: RT.Employment, matches: ["Occupations"] },
    { type: RT.SchoolRecords, matches: ["Schools & Education"] },
  ];

  const categoryMatches = [
    { type: RT.Military, matches: ["Military, armed forces & conflict"] },
  ];

  //console.log("in determineRecordType");
  //console.log(extractedData.recordData);

  let category = extractedData.recordData["Category"];
  let subcategory = extractedData.recordData["Subcategory"];

  // test collection before sub-category since it can be more specific. For example
  // Divorce Index is more specific that "Civil Marriage & Divorce"
  if (extractedData.collection) {
    for (let titleMatch of titleMatches) {
      for (let match of titleMatch.matches) {
        if (extractedData.collection.includes(match)) {
          return titleMatch.type;
        }
      }
    }

    // check for birth or death registration
    if (extractedData.collection.includes("Registration")) {
      if (extractedData.collection.includes("Birth")) {
        return RT.BirthRegistration;
      }
      if (extractedData.collection.includes("Death")) {
        return RT.DeathRegistration;
      }
    }
  }

  if (subcategory) {
    for (let subcategoryMatch of subcategoryMatches) {
      for (let match of subcategoryMatch.matches) {
        if (subcategory.includes(match)) {
          return subcategoryMatch.type;
        }
      }
    }
  }

  if (category) {
    for (let categoryMatch of categoryMatches) {
      for (let match of categoryMatch.matches) {
        if (category.includes(match)) {
          return categoryMatch.type;
        }
      }
    }
  }

  return RT.Unclassified;
}

function determineRecordTypeAndRole(extractedData, result) {
  let recordType = determineRecordType(extractedData);
  result.recordType = recordType;
}

function getCleanRecordDataValue(data, fieldName) {
  if (!data.recordData) {
    return undefined;
  }

  let value = data.recordData[fieldName];
  if (!value) {
    return value;
  }
  value = value.trim();

  // remove leading comma or periods
  // I have seen a leading , on a residence
  while (value[0] == "." || value[0] == ",") {
    value = value.substring(1).trim();
  }

  if (value == "-") {
    value = undefined;
  }

  // sometimes an age (for example) has "y" on the end. Remove that
  if (/^\d+y$/.test(value)) {
    value = value.substring(0, value.length - 1);
  }

  return value;
}

function getRecordDataValueForList(data, fieldNames) {
  for (let fieldName of fieldNames) {
    let value = getCleanRecordDataValue(data, fieldName);
    if (value) {
      return value;
    }
  }
}

function setBirthDateAndYear(data, result) {
  let birthDate = getCleanRecordDataValue(data, "Birth date");
  let birthYear = getCleanRecordDataValue(data, "Birth year");
  if (birthDate && !birthDate.startsWith("?")) {
    result.setBirthDate(birthDate);
  }
  if (birthYear && birthYear != "-") {
    result.setBirthYear(birthYear);
  }
}

function setDeathDateAndYear(data, result) {
  let deathDate = getCleanRecordDataValue(data, "Death date");
  let deathYear = getCleanRecordDataValue(data, "Death year");
  if (deathDate && !deathDate.startsWith("?")) {
    result.setDeathDate(deathDate);
  }
  if (deathYear && deathYear != "-") {
    result.setDeathYear(deathYear);
  }
}

function setEventDateFromRecordData(
  data,
  result,
  dateStrings,
  dayStrings,
  monthStrings,
  quarterStrings,
  yearStrings
) {
  function cleanDateString(dateString) {
    if (dateString) {
      if (dateString == "-" || dateString.startsWith("?")) {
        return "";
      }
    }
    return dateString;
  }

  let eventDate = cleanDateString(getRecordDataValueForList(data, dateStrings));
  let eventDay = cleanDateString(getRecordDataValueForList(data, dayStrings));
  let eventMonth = cleanDateString(
    getRecordDataValueForList(data, monthStrings)
  );
  let eventQuarter = cleanDateString(
    getRecordDataValueForList(data, quarterStrings)
  );
  let eventYear = cleanDateString(getRecordDataValueForList(data, yearStrings));

  if (eventDate) {
    result.setEventDate(eventDate);
  } else {
    if (eventDay && eventMonth && eventYear) {
      let dateString = eventDay + " " + eventMonth + " " + eventYear;
      result.setEventDate(dateString);
    } else if (eventQuarter) {
      result.setEventQuarter(eventQuarter);
    }
  }

  if (eventYear) {
    result.setEventYear(eventYear);
  }
}

function setEventDateFromRecordDataKey(data, result, key) {
  let dateStrings = [key + " date", "Date"];
  let dayStrings = [key + " day", "Day"];
  let monthStrings = [key + " month", "Month"];
  let quarterStrings = [key + " quarter", "Quarter"];
  let yearStrings = [key + " year", "Year"];

  setEventDateFromRecordData(
    data,
    result,
    dateStrings,
    dayStrings,
    monthStrings,
    quarterStrings,
    yearStrings
  );
}

function setEventDateFromRecordDataKeys(data, result, keys) {
  function setStrings(keys, suffix, solo) {
    let strings = [];
    for (let key of keys) {
      strings.push(key + " " + suffix);
    }
    if (solo) {
      strings.push(solo);
    }
    return strings;
  }

  let dateStrings = setStrings(keys, "date", "Date");
  let dayStrings = setStrings(keys, "day", "Day");
  let monthStrings = setStrings(keys, "month", "Month");
  let quarterStrings = setStrings(keys, "quarter", "Quarter");
  let yearStrings = setStrings(keys, "year", "Year");

  setEventDateFromRecordData(
    data,
    result,
    dateStrings,
    dayStrings,
    monthStrings,
    quarterStrings,
    yearStrings
  );
}

function buildMainPlaceObj(data) {
  let placeObj = {};
  placeObj.headingPlace = data.place;
  placeObj.country = getCleanRecordDataValue(data, "Country");
  placeObj.state = getCleanRecordDataValue(data, "State");
  placeObj.county = getCleanRecordDataValue(data, "County");
  placeObj.parish = getCleanRecordDataValue(data, "Parish");
  placeObj.place = getRecordDataValueForList(data, [
    "Place",
    "Marriage place",
    "Burial place",
  ]);
  placeObj.streetAddress = getCleanRecordDataValue(data, "Address");
  placeObj.fullAddress = getCleanRecordDataValue(data, "Full address");

  // some less common ones
  placeObj.residence = getRecordDataValueForList(data, [
    "Residence",
    "Residence town",
  ]);
  placeObj.electorate = getCleanRecordDataValue(data, "Electorate");
  placeObj.pollingDistrict = getCleanRecordDataValue(
    data,
    "Polling district or place"
  );

  return placeObj;
}

function isValidPlaceValue(value) {
  return value && value != "-";
}

function getPlaceStringFromPlaceObj(placeObj, recordType) {
  let isResidenceOrStreetAddressWanted = false;
  if (
    recordType == RT.Residence ||
    recordType == RT.Census ||
    recordType == RT.Occupation ||
    recordType == RT.ElectoralRegister
  ) {
    isResidenceOrStreetAddressWanted = true;
  }

  let placeString = "";
  if (
    isValidPlaceValue(placeObj.fullAddress) &&
    isResidenceOrStreetAddressWanted
  ) {
    return placeObj.fullAddress;
  }

  if (
    isValidPlaceValue(placeObj.streetAddress) &&
    isResidenceOrStreetAddressWanted
  ) {
    placeString += placeObj.streetAddress;
  } else if (isValidPlaceValue(placeObj.residence)) {
    if (isResidenceOrStreetAddressWanted) {
      placeString += placeObj.residence;
    }
  }

  function addString(stringToAdd) {
    if (!stringToAdd) {
      return;
    }
    if (placeString && placeString.endsWith(stringToAdd)) {
      return;
    }
    if (stringToAdd.startsWith(placeString)) {
      placeString = stringToAdd;
    } else {
      if (placeString) {
        placeString += ", ";
      }
      placeString += stringToAdd;
    }
  }

  if (
    isValidPlaceValue(placeObj.place) &&
    placeObj.place != placeObj.residence
  ) {
    addString(placeObj.place);
  }

  if (
    isValidPlaceValue(placeObj.parish) &&
    placeObj.parish != placeObj.residence &&
    placeObj.parish != placeObj.place
  ) {
    addString(placeObj.parish);
  } else if (isValidPlaceValue(placeObj.electorate)) {
    addString(placeObj.electorate);
  } else if (isValidPlaceValue(placeObj.pollingDistrict)) {
    addString(placeObj.pollingDistrict);
  }
  if (isValidPlaceValue(placeObj.county)) {
    addString(placeObj.county);
  }

  if (isValidPlaceValue(placeObj.state)) {
    addString(placeObj.state);
  }

  if (isValidPlaceValue(placeObj.country)) {
    addString(placeObj.country);
  }

  // now have to decide whether the heading place is better
  if (isValidPlaceValue(placeObj.headingPlace)) {
    if (placeObj.headingPlace.length > placeString.length) {
      placeString = placeObj.headingPlace;
    }
  }

  return placeString;
}

function setEventPlaceFromPlaceObj(result, eventPlaceObj) {
  result.setEventPlace(
    getPlaceStringFromPlaceObj(eventPlaceObj, result.recordType)
  );

  if (eventPlaceObj.streetAddress) {
    result.eventPlace.streetAddress = eventPlaceObj.streetAddress;
  }
}

function generalizeDataGivenRecordType(data, result) {
  if (result.recordType == RT.BirthRegistration) {
    let birthYear = getCleanRecordDataValue(data, "Birth year");
    let birthDate = getCleanRecordDataValue(data, "Birth date");
    let birthQuarter = getCleanRecordDataValue(data, "Birth quarter");
    if (birthDate) {
      result.setBirthDate(birthDate);
      result.setEventDate(birthDate);
    } else {
      if (birthYear) {
        result.setEventYear(birthYear);
        result.setBirthYear(birthYear);
      }
      if (birthQuarter) {
        result.setEventQuarter(birthQuarter);
      }
    }

    let mmn = getCleanRecordDataValue(data, "Mother's maiden name");
    if (mmn) {
      result.mothersMaidenName = mmn;
    }

    result.lastNameAtBirth = result.inferLastName();
  } else if (result.recordType == RT.DeathRegistration) {
    let deathDate = getCleanRecordDataValue(data, "Death date");
    let deathYear = getCleanRecordDataValue(data, "Death year");
    let deathQuarter = getCleanRecordDataValue(data, "Death quarter");
    if (deathDate) {
      result.setDeathDate(deathDate);
      result.setEventDate(deathDate);
    } else {
      if (deathYear) {
        result.setEventDate(deathYear);
        result.setDeathDate(deathYear);
      }
      if (deathQuarter) {
        result.setEventQuarter(deathQuarter);
      }
    }

    result.lastNameAtDeath = result.inferLastName();

    let age = getRecordDataValueForList(data, ["Age", "Age at death"]);
    if (age) {
      result.ageAtDeath = age;
    }

    let birthDay = getRecordDataValueForList(data, ["Birth day"]);
    let birthMonth = getRecordDataValueForList(data, ["Birth month"]);
    let birthYear = getRecordDataValueForList(data, ["Birth year"]);
    if (birthYear && (birthMonth || !age)) {
      result.setBirthDateFromYearMonthDay(birthYear, birthMonth, birthDay);
    }
  } else if (result.recordType == RT.Census) {
    let birthYear = getCleanRecordDataValue(data, "Birth year");
    if (birthYear) {
      let estYear = birthYear;
      if (estYear.startsWith("abt ")) {
        estYear = estYear.substring(4);
      }
      result.setBirthYear(estYear);
      result.birthDate.qualifier = dateQualifiers.ABOUT;
    }

    let age = getRecordDataValueForList(data, ["Age", "Age in years"]);
    if (age) {
      result.ageAtEvent = age;
    } else {
      let dob = getRecordDataValueForList(data, ["DOB", "Birth date"]);
      if (dob) {
        result.setBirthDate(dob);
        result.birthDate.qualifier = dateQualifiers.EXACT;
      }
    }

    if (getCleanRecordDataValue(data, "Birth place")) {
      result.setBirthPlace(getCleanRecordDataValue(data, "Birth place"));
    }

    if (
      !result.eventDate ||
      (!result.eventDate.dateString && !result.eventDate.yearString)
    ) {
      // if this came from an image there will be no heading but may be a year
      if (data.year) {
        result.setEventYear(data.year);
      } else if (data.heading) {
        // extract the year from the collection title
        let yearString = data.heading.replace(/^.*(\d\d\d\d).*$/, "$1");
        if (yearString && yearString != data.heading) {
          result.setEventYear(yearString);
        }
      }
    }

    if (getCleanRecordDataValue(data, "Occupation")) {
      result.occupation = getCleanRecordDataValue(data, "Occupation");
    }

    if (getCleanRecordDataValue(data, "Employer")) {
      result.employer = getCleanRecordDataValue(data, "Employer");
    }

    result.setMaritalStatus(getCleanRecordDataValue(data, "Marital status"));

    let relationshipToHead = getRecordDataValueForList(data, [
      "Relationship",
      "Relationship to head",
    ]);
    result.setRelationshipToHead(relationshipToHead);

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
            let isSelected = member["isSelected"];
            if (isSelected) {
              householdMember.isSelected = isSelected;
            }

            let name = "";
            if (data.urlPath == "record") {
              // We use a hack to get name for each member when on an image
              name = member["Name"];
            } else {
              let firstNames = member["First name(s)"];
              if (!firstNames) {
                firstNames = member["First name"];
              }
              let lastName = member["Last name"];
              if (!lastName) {
                lastName = member["Last name(s)"];
              }

              if (firstNames && firstNames != "-") {
                name = firstNames;
              }
              if (lastName && lastName != "-") {
                if (name) {
                  name += " ";
                }
                name += lastName;
              }
            }

            if (name) {
              householdMember.name = name;
              fieldsEncountered.name = true;
            }

            let relationship = member["Relationship"];
            if (!relationship) {
              relationship = member["Relationship to head"];
            }
            if (!relationship && isSelected && result.relationshipToHead) {
              relationship = result.relationshipToHead;
            }
            if (relationship && relationship != "-") {
              householdMember.relationship =
                GD.standardizeRelationshipToHead(relationship);
              fieldsEncountered.relationship = true;
            }

            let maritalStatus = member["Marital status"];
            if (!maritalStatus && isSelected && result.maritalStatus) {
              maritalStatus = result.maritalStatus;
            }
            if (maritalStatus && maritalStatus != "-") {
              householdMember.maritalStatus =
                GD.standardizeMaritalStatus(maritalStatus);
              fieldsEncountered.maritalStatus = true;
            }

            let gender = member["Sex"];
            if (!gender) {
              gender = member["Gender"];
            }
            if (!gender && isSelected && result.personGender) {
              gender = result.personGender;
            }
            if (gender && gender != "-") {
              householdMember.gender = GD.standardizeGender(gender);
              fieldsEncountered.gender = true;
            }

            let age = member["Age"];
            if (!age) {
              age = member["Age in years"];
            }
            if (!age && isSelected && result.ageAtEvent) {
              age = result.ageAtEvent;
            }
            if (age && age != "-") {
              householdMember.age = age;
              fieldsEncountered.age = true;
            }

            let birthYear = member["Birth year"];
            if (birthYear && birthYear != "-") {
              householdMember.birthYear = birthYear;
              fieldsEncountered.birthYear = true;
            }

            let birthDate = member["DOB"];
            if (!birthDate) {
              birthDate = member["Birth date"];
            }
            if (birthDate && birthDate != "-") {
              householdMember.birthDate = birthDate;
              fieldsEncountered.birthDate = true;
            } else {
              // Not sure about this. Sometimes a census has full birth date (at least in some areas)
              // so we put it in as a header to display. But the the transcription may only have birth year.
              if (!householdMember.age && householdMember.birthYear) {
                householdMember.birthDate = householdMember.birthYear;
              }
            }

            let occupation = member["Occupation"];
            if (!occupation && isSelected && result.occupation) {
              occupation = result.occupation;
            }
            if (occupation && occupation != "-") {
              householdMember.occupation = occupation;
              fieldsEncountered.occupation = true;
            }

            let employer = member["Employer"];
            if (!employer && isSelected && result.employer) {
              employer = result.employer;
            }
            if (employer && employer != "-") {
              householdMember.employer = employer;
              fieldsEncountered.employer = true;
            }

            let birthPlace = member["Birth place"];
            if (
              !birthPlace &&
              isSelected &&
              result.birthPlace &&
              result.birthPlace.placeString
            ) {
              birthPlace = result.birthPlace.placeString;
            }
            if (birthPlace && birthPlace != "-") {
              householdMember.birthPlace = birthPlace;
              fieldsEncountered.birthPlace = true;
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
          "birthDate",
          "occupation",
          "employer",
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

      // We can also determine parents and spouse in some cases
      result.addSpouseOrParentsForSelectedHouseholdMember();

      if (result.spouses && result.spouses.length == 1) {
        let marriageYear = getRecordDataValueForList(data, ["Marriage year"]);
        if (marriageYear) {
          result.spouses[0].marriageDate.yearString = marriageYear;
        }
      }
    }
  } else if (
    result.recordType == RT.MarriageRegistration ||
    result.recordType == RT.Marriage
  ) {
    setEventDateFromRecordDataKeys(data, result, ["Marriage"]);

    if (!result.eventDate) {
      setEventDateFromRecordDataKeys(data, result, ["Banns"]);
      if (result.eventDate) {
        result.recordSubtype = RecordSubtype.Banns;
      }
    }

    let spouseLastName = getRecordDataValueForList(data, [
      "Spouse's last name",
      "Spouse's last name(s)",
    ]);
    let spouseFirstNames = getRecordDataValueForList(data, [
      "Spouse's first name(s)",
      "Spouse's first name",
    ]);

    // sometimes it says "Groom's last name" or "Bride's last name" instead
    if (!spouseLastName) {
      if (data.personGender == "male") {
        spouseLastName = getRecordDataValueForList(data, [
          "Bride's last name(s)",
          "Bride's last name",
        ]);
        spouseFirstNames = getRecordDataValueForList(data, [
          "Bride's first name(s)",
          "Bride's first name",
        ]);
      } else if (data.personGender == "female") {
        spouseLastName = getRecordDataValueForList(data, [
          "Groom's last name(s)",
          "Groom's last name",
        ]);
        spouseFirstNames = getRecordDataValueForList(data, [
          "Groom's first name(s)",
          "Groom's first name",
        ]);
      }
    }

    let age = getRecordDataValueForList(data, ["Age"]);
    let spouseAge = getRecordDataValueForList(data, ["Spouse's age"]);
    // sometimes it says "Groom's age" or "Bride's age" instead
    if (!spouseAge || !age) {
      if (data.personGender == "male") {
        if (!age) {
          age = getRecordDataValueForList(data, ["Groom's age"]);
        }
        if (!spouseAge) {
          spouseAge = getRecordDataValueForList(data, ["Bride's age"]);
        }
      } else if (data.personGender == "female") {
        if (!age) {
          age = getRecordDataValueForList(data, ["Bride's age"]);
        }
        if (!spouseAge) {
          spouseAge = getRecordDataValueForList(data, ["Groom's age"]);
        }
      }
    }
    result.setFieldIfValueExists("ageAtEvent", age);

    // sometimes it says "Groom's father's last name" or "Bride's father's last name" etc
    // In which case we will not have the parents yet

    let groomFatherFirstName = getRecordDataValueForList(data, [
      "Groom's father's first name(s)",
      "Groom's father's first name",
    ]);
    let groomFatherLastName = getRecordDataValueForList(data, [
      "Groom's father's last name(s)",
      "Groom's father's last name",
    ]);
    let brideFatherFirstName = getRecordDataValueForList(data, [
      "Bride's father's first name(s)",
      "Bride's father's first name",
    ]);
    let brideFatherLastName = getRecordDataValueForList(data, [
      "Bride's father's last name(s)",
      "Bride's father's last name",
    ]);

    if (
      groomFatherFirstName ||
      groomFatherLastName ||
      brideFatherFirstName ||
      brideFatherLastName
    ) {
      if (!result.parents || !result.parents.father) {
        let father = result.father ?? result.addFather();

        if (data.personGender == "male") {
          father.name.setFirstNames(groomFatherFirstName);
          father.name.setLastName(groomFatherLastName);
        } else {
          father.name.setFirstNames(brideFatherFirstName);
          father.name.setLastName(brideFatherLastName);
        }
      }
    }

    let groomMotherFirstName = getRecordDataValueForList(data, [
      "Groom's mother's first name(s)",
      "Groom's mother's first name",
    ]);
    let groomMotherLastName = getRecordDataValueForList(data, [
      "Groom's mother's last name(s)",
      "Groom's mother's last name",
    ]);
    let brideMotherFirstName = getRecordDataValueForList(data, [
      "Bride's mother's first name(s)",
      "Bride's mother's first name",
    ]);
    let brideMotherLastName = getRecordDataValueForList(data, [
      "Bride's mother's last name(s)",
      "Bride's mother's last name",
    ]);
    if (
      groomMotherFirstName ||
      groomMotherLastName ||
      brideMotherFirstName ||
      brideMotherLastName
    ) {
      if (!result.parents || !result.parents.mother) {
        let mother = result.mother ?? result.addMother();

        if (data.personGender == "male") {
          mother.name.setFirstNames(groomMotherFirstName);
          mother.name.setLastName(groomMotherLastName);
        } else {
          mother.name.setFirstNames(brideMotherFirstName);
          mother.name.setLastName(brideMotherLastName);
        }
      }
    }

    if (spouseLastName || result.eventDate) {
      let name = new WtsName();
      name.setFirstNames(spouseFirstNames);
      name.setLastName(spouseLastName);
      let spouse = {
        name: name,
        marriageDate: result.eventDate,
        marriagePlace: result.eventPlace,
      };

      if (spouseAge) {
        spouse.age = spouseAge;
      }

      let spouseFatherFirstName = getRecordDataValueForList(data, [
        "Spouse's father's first name(s)",
        "Spouse's father's first name",
      ]);
      let spouseFatherLastName = getRecordDataValueForList(data, [
        "Spouse's father's last name(s)",
        "Spouse's father's last name",
      ]);
      if (spouseFatherFirstName && spouseFatherLastName) {
        spouse.fatherName = spouseFatherFirstName + " " + spouseFatherLastName;
      } else {
        if (data.personGender == "male") {
          if (brideFatherFirstName && brideFatherLastName) {
            spouse.fatherName =
              brideFatherFirstName + " " + brideFatherLastName;
          }
        } else {
          if (groomFatherFirstName && groomFatherLastName) {
            spouse.fatherName =
              groomFatherFirstName + " " + groomFatherLastName;
          }
        }
      }

      let spouseMotherFirstName = getRecordDataValueForList(data, [
        "Spouse's mother's first name(s)",
        "Spouse's mother's first name",
      ]);
      let spouseMotherLastName = getRecordDataValueForList(data, [
        "Spouse's mother's last name(s)",
        "Spouse's mother's last name",
      ]);
      if (spouseMotherFirstName && spouseMotherLastName) {
        spouse.motherName = spouseMotherFirstName + " " + spouseMotherLastName;
      } else {
        if (data.personGender == "male") {
          if (brideMotherFirstName && brideMotherLastName) {
            spouse.motherName =
              brideMotherFirstName + " " + brideMotherLastName;
          }
        } else {
          if (groomMotherFirstName && groomMotherLastName) {
            spouse.motherName =
              groomMotherFirstName + " " + groomMotherLastName;
          }
        }
      }

      result.spouses = [spouse];
    }
  } else if (result.recordType == RT.Baptism) {
    setEventDateFromRecordDataKeys(data, result, ["Baptism", "Christening"]);
    setBirthDateAndYear(data, result);
    result.lastNameAtBirth = result.inferLastName();
  } else if (result.recordType == RT.Burial) {
    setEventDateFromRecordDataKey(data, result, "Burial");
    setBirthDateAndYear(data, result);
    setDeathDateAndYear(data, result);

    let age = getRecordDataValueForList(data, ["Age", "Age at death"]);
    if (age) {
      result.ageAtDeath = age;
    }

    result.lastNameAtDeath = result.inferLastName();
  } else if (result.recordType == RT.Will || result.recordType == RT.Probate) {
    setEventDateFromRecordDataKeys(data, result, ["Probate", "Will"]);
    result.setDeathDate(getRecordDataValueForList(data, ["Death date"]));
    result.setDeathYear(getRecordDataValueForList(data, ["Death year"]));

    if (result.recordType == RT.Will) {
      result.recordSubtype = "Probate"; // for now assume FMP Will records have probate date
    }

    // NOTE: for a probate or will record it often does not give the death place but instead the
    // residence place. It is incorrect to set the death place to residence place. So we have a separate
    // "residencePlace"

    let residencePlace = getRecordDataValueForList(data, [
      "Residence",
      "Residence town",
      "Place",
    ]);
    if (residencePlace) {
      // we may be able to get a more complete residence place
      let placeObj = buildMainPlaceObj(data);
      let fullPlaceString = getPlaceStringFromPlaceObj(placeObj, RT.Residence);
      if (fullPlaceString.length > residencePlace.length) {
        if (fullPlaceString.startsWith(residencePlace)) {
          residencePlace = fullPlaceString;
        }
      }

      result.setResidencePlace(residencePlace);

      // If there is an event place that is the same as the residence then remove it
      // For probate the event place should be the probate registry place
      if (result.eventPlace) {
        if (result.eventPlace.placeString == residencePlace) {
          delete result.eventPlace;
        }
      }
    }

    let deathPlace = getRecordDataValueForList(data, ["Death place"]);
    if (deathPlace) {
      result.setDeathPlace(deathPlace);
    }

    let eventPlace = getRecordDataValueForList(data, [
      "Registry",
      "Probate registry",
    ]);
    if (eventPlace) {
      if (eventPlace.placeString != eventPlace) {
        result.setEventPlace(eventPlace);
      }
    }

    result.lastNameAtDeath = result.inferLastName();

    let occupation = getRecordDataValueForList(data, ["Occupation"]);
    if (occupation) {
      result.occupation = occupation;
    }
  } else if (result.recordType == RT.Divorce) {
    setEventDateFromRecordDataKeys(data, result, ["Petition", "Divorce"]);

    let spouseLastName = getRecordDataValueForList(data, [
      "Spouse's last name",
      "Spouse's last name(s)",
    ]);
    if (spouseLastName) {
      let spouseFirstNames = getRecordDataValueForList(data, [
        "Spouse's first name(s)",
        "Spouse's first name",
      ]);

      let name = new WtsName();
      name.setFirstNames(spouseFirstNames);
      name.setLastName(spouseLastName);
      let spouse = {
        name: name,
      };

      result.spouses = [spouse];
    }
  } else {
    setEventDateFromRecordDataKeys(data, result, [
      "Event",
      "Issue",
      "Entry",
      "Electoral",
      "Registration",
    ]);
  }
}

function generalizeProfileData(data, result) {
  result.setLastNameAndForeNames(data.surname, data.givenName);
  result.setBirthYear(data.birthYear);
  result.setBirthDate(data.birthDate);
  result.setBirthPlace(data.birthPlace);
  result.setDeathYear(data.deathYear);
  result.setDeathDate(data.deathDate);
  result.setDeathPlace(data.deathPlace);

  if (data.fatherName) {
    let father = result.addFather();
    father.name.setFullName(data.fatherName);
  }
  if (data.motherName) {
    let mother = result.addMother();
    mother.name.setFullName(data.motherName);
  }

  for (let dataSpouse of data.spouses) {
    let spouse = result.addSpouse();
    spouse.name.setFullName(dataSpouse.name);
    spouse.marriageDate.dateString = dataSpouse.marriageDate;
    spouse.marriagePlace.placeString = dataSpouse.marriagePlace;
  }

  result.hasValidData = true;
}

// This function generalizes the data extracted from an Ancestry page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  if (data.urlPath == "record") {
    // this is an image/record rather than a transcript
    if (!data.recordData) {
      result.sourceType = "image";
      result.hasValidData = true;
      return result;
    }

    // it does have transcription data extracted from the image page though so
    // continue
  } else if (data.urlProfileId) {
    generalizeProfileData(data, result);
    return result;
  }

  // can't do any generalize without the record data, hopefully we wouldn't get called
  // in this case because the extractData would have been seen as failed.
  if (!data.recordData) {
    result.hasValidData = false;
    return result;
  }

  result.sourceType = "record";
  determineRecordTypeAndRole(data, result);

  result.sourceOfData = "fmp";

  result.setPersonGender(data.personGender);

  let firstNames = getRecordDataValueForList(data, [
    "First name(s)",
    "First name",
  ]);
  let lastName = getRecordDataValueForList(data, ["Last name", "Last name(s)"]);
  result.setLastNameAndForeNames(lastName, firstNames);

  let recordData = data.recordData;
  if (recordData != undefined) {
    result.setPersonGender(getCleanRecordDataValue(data, "Sex"));

    result.setEventCountry(getCleanRecordDataValue(data, "Country"));

    if (getCleanRecordDataValue(data, "Registration district")) {
      result.registrationDistrict = getCleanRecordDataValue(
        data,
        "Registration district"
      );
    } else if (getCleanRecordDataValue(data, "District")) {
      result.registrationDistrict = getCleanRecordDataValue(data, "District");
    }

    let eventPlaceObj = buildMainPlaceObj(data);
    setEventPlaceFromPlaceObj(result, eventPlaceObj);

    // parents may be recorded
    let fatherFirstName = getRecordDataValueForList(data, [
      "Father's first name(s)",
      "Father's first name",
    ]);
    let fatherLastName = getRecordDataValueForList(data, [
      "Father's last name(s)",
      "Father's last name",
    ]);
    if (fatherFirstName || fatherLastName) {
      let father = result.addFather();
      father.name.setFirstNames(fatherFirstName);
      father.name.setLastName(fatherLastName);
    }
    let motherFirstName = getRecordDataValueForList(data, [
      "Mother's first name(s)",
      "Mother's first name",
    ]);
    let motherLastName = getRecordDataValueForList(data, [
      "Mother's last name(s)",
      "Mother's last name",
    ]);
    if (motherFirstName || motherLastName) {
      let mother = result.addMother();
      mother.name.setFirstNames(motherFirstName);
      mother.name.setLastName(motherLastName);
    }

    generalizeDataGivenRecordType(data, result);
  }

  // Collection
  if (data.collection) {
    let collectionId = data.collection;
    result.collectionData = {
      id: collectionId,
    };

    if (recordData) {
      let archiveSeries = getCleanRecordDataValue(data, "Archive series");
      if (archiveSeries) {
        result.collectionData.archiveSeries = archiveSeries;
      }
      let volume = getCleanRecordDataValue(data, "Volume");
      if (volume) {
        result.collectionData.volume = volume;
      }
      let page = getCleanRecordDataValue(data, "Page");
      if (page) {
        result.collectionData.page = page;
      }
      let districtNumber = getCleanRecordDataValue(
        data,
        "Registration district number"
      );
      if (districtNumber) {
        result.collectionData.districtNumber = districtNumber;
      }
      let piece = getCleanRecordDataValue(data, "Piece number");
      if (piece) {
        result.collectionData.piece = piece;
      }
      let folio = getCleanRecordDataValue(data, "Folio");
      if (folio) {
        result.collectionData.folio = folio;
      }
      let schedule = getCleanRecordDataValue(data, "Schedule");
      if (schedule) {
        result.collectionData.schedule = schedule;
      }
      let registrationNumber = getCleanRecordDataValue(
        data,
        "Registration number"
      );
      if (registrationNumber) {
        result.collectionData.registrationNumber = registrationNumber;
      }
    }
  }

  result.hasValidData = true;

  //console.log("End of FMP generalizeData, result is:");
  //console.log(result);

  return result;
}

export {
  generalizeData,
  generalizeDataGivenRecordType,
  GeneralizedData,
  dateQualifiers,
};
