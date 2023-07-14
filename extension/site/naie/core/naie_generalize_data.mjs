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

import { GeneralizedData, GD } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { CD } from "../../../base/core/country_data.mjs";

function buildHouseholdArray(headings, members, result) {
  const stdFieldNames = [
    { stdName: "relationship", siteHeadings: ["Relation to head"] },
    { stdName: "maritalStatus", siteHeadings: ["Marital Status"] },
    { stdName: "occupation", siteHeadings: ["Occupation"] },
    { stdName: "gender", siteHeadings: ["Sex"] },
  ];
  function headingToStdName(heading) {
    for (let entry of stdFieldNames) {
      if (entry.siteHeadings.includes(heading)) {
        return entry.stdName;
      }
    }
  }
  result.householdArrayFields = [];

  let householdArray = [];
  for (let member of members) {
    let householdMember = {};
    if (member.isClosed) {
      // not currently happening on Irish censuses
      householdMember.isClosed = true;
    } else {
      // handle name specially since we combine surname and forenames into one name
      let forenames = member["Forename"];
      if (forenames) {
        householdMember.name = forenames;
      }
      let surname = member["Surname"];
      if (surname) {
        if (householdMember.name) {
          householdMember.name += " ";
        }
        householdMember.name += surname;
      }
      let yearsMarried = member["Years Married"];
      if (yearsMarried && yearsMarried != "-") {
        // this is not used in table but can be used to determine married date
        householdMember.yearsMarried = yearsMarried;
      }

      // handle birthPlace specially
      let combinedBirthPlace = "";
      let birthPlace = member["Birthplace"];
      if (birthPlace) {
        householdMember.birthPlace = birthPlace;
      }

      let age = extractAgeFromMember(member);
      if (age) {
        householdMember.age = age;
      }

      for (let heading of headings) {
        if (heading != "Surname" && heading != "Forename" && heading != "Birthplace" && !heading.startsWith("Age")) {
          let fieldName = headingToStdName(heading);
          if (fieldName) {
            let fieldValue = member[heading];
            if (fieldValue) {
              if (fieldName == "gender") {
                fieldValue = GD.standardizeGender(fieldValue);
              } else if (fieldName == "maritalStatus") {
                fieldValue = GD.standardizeMaritalStatus(fieldValue);
              } else if (fieldName == "relationship") {
                if (fieldValue == "-") {
                  // In some years the head just has "-"
                  if (member == members[0]) {
                    fieldValue = "Head";
                  } else {
                    fieldValue = "";
                  }
                }
                fieldValue = GD.standardizeRelationshipToHead(fieldValue);
              } else if (fieldName == "occupation") {
                fieldValue = GD.standardizeOccupation(cleanOccupation(fieldValue));
              }

              householdMember[fieldName] = fieldValue;
            }
          }
        }
      }
      let isSelected = member.isSelected;
      if (isSelected) {
        householdMember.isSelected = isSelected;
      }
    }
    householdArray.push(householdMember);
  }
  result.householdArray = householdArray;

  let householdArrayFields = [];
  for (let heading of headings) {
    let fieldName = headingToStdName(heading);
    if (!fieldName) {
      if (heading == "Surname") {
        fieldName = "name";
      } else if (heading == "Birthplace") {
        fieldName = "birthPlace";
      } else if (heading == "Age" || heading == "Age in years") {
        fieldName = "age";
      }
    }
    if (fieldName) {
      householdArrayFields.push(fieldName);
    }

    result.householdArrayFields = householdArrayFields;
  }

  // We can also determine parents and spouse in some cases
  result.addSpouseOrParentsForSelectedHouseholdMember();
}

function setYearAndPlace(ed, result) {
  // breadcrumbs
  if (!ed.breadCrumbs || ed.breadCrumbs.length < 6) {
    return false;
  }
  const breadCrumbs = ed.breadCrumbs;

  result.setEventYear(breadCrumbs[1]);

  let eventPlace = breadCrumbs[4] + ", " + breadCrumbs[3] + ", " + breadCrumbs[2];
  if (ed.breadCrumbs.length == 7) {
    eventPlace = breadCrumbs[5] + ", " + eventPlace;
  }

  eventPlace += ", Ireland";
  result.setEventPlace(eventPlace);

  return true;
}

function extractAgeFromMember(member) {
  let age = "";
  if (member["Age"]) {
    age = member["Age"];
  } else if (member["Age in years"] !== undefined) {
    let ageInYears = member["Age in years"];
    if (ageInYears && ageInYears != "-") {
      age = ageInYears;
    } else {
      let ageInMonths = member["Age in months if under one year"];
      if (ageInMonths) {
        age = ageInMonths + " months";
      }
    }
  }
  return age;
}

function cleanOccupation(string) {
  let occupation = string;
  if (occupation == "?") {
    occupation = "";
  }
  return occupation;
}

function setDataFromTable(ed, result) {
  if (!ed.household || ed.household.length < 1) {
    return false;
  }

  const household = ed.household;
  if (!household.headings || !household.members) {
    return false;
  }

  const headings = household.headings;
  const members = household.members;
  if (headings.length < 1 || members.length < 1) {
    return false;
  }

  // find selected member
  let selectedMember = undefined;
  for (let member of members) {
    if (member.isSelected) {
      selectedMember = member;
      break;
    }
  }
  if (!selectedMember) {
    return false;
  }

  let year = result.inferEventYear();

  // Names, there should always be a firstName and lastName. MiddleNames my be undefined.
  result.setLastNameAndForenames(selectedMember["Surname"], selectedMember["Forename"]);

  result.setAgeAtEvent(extractAgeFromMember(selectedMember));

  // could attempt to set country but birth place may not be in Ireland
  let birthPlace = selectedMember["Birthplace"];
  if (!birthPlace) {
    birthPlace = selectedMember["Native country, county, or city"];
  }
  if (birthPlace && birthPlace != "-" && birthPlace != "?") {
    let countryExtract = CD.extractCountryFromPlaceName(birthPlace);
    if (!countryExtract) {
      birthPlace += ", Ireland";
    }
    result.setBirthPlace(birthPlace);
  }

  if (year == "1831") {
    // in 1831 there is no list of members - list head name and a count
    result.setRelationshipToHead("Head");
  } else {
    let relationship = selectedMember["Relation to head"];
    if (relationship == "-" || relationship == "?") {
      if (selectedMember == members[0]) {
        relationship = "Head";
      } else {
        relationship = "";
      }
    }
    result.setRelationshipToHead(relationship);
  }

  result.setMaritalStatus(selectedMember["Marital Status"]);
  result.setPersonGender(selectedMember["Sex"]);
  result.setOccupation(cleanOccupation(selectedMember["Occupation"]));

  if (year != "1831") {
    buildHouseholdArray(headings, members, result);
  }

  return true;
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "naie";

  if (!ed.success) {
    return result; // the extract failed
  }

  result.sourceType = "record";
  result.recordType = RT.Census;

  if (!setYearAndPlace(ed, result)) {
    return result;
  }

  if (!setDataFromTable(ed, result)) {
    return result;
  }

  result.hasValidData = true;

  //console.log("naie; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData };
