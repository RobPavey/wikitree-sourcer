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
} from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import {
  getCountryFromCountyCode,
  getCountryFromCountyName,
} from "./freecen_chapman_codes.mjs";

function getCountyAndCountry(data) {
  let result = { county: "", country: "" };

  // "County": "Devon (DEV)",
  let countyString = data.censusDetails["County"];
  let countyCode = "";
  let county = countyString;
  let openParenIndex = countyString.lastIndexOf("(");
  if (openParenIndex != -1) {
    let closeParenIndex = countyString.indexOf(")", openParenIndex);
    if (closeParenIndex != -1) {
      countyCode = countyString.substring(openParenIndex + 1, closeParenIndex);
      county = countyString.substring(0, openParenIndex).trim();
    }
  }

  let country = getCountryFromCountyCode(countyCode);

  result.country = country;
  result.county = county;
  return result;
}

function getCensusDetail(data, fieldNames) {
  let result = undefined;
  for (let fieldName of fieldNames) {
    result = data.censusDetails[fieldName];
    if (result) {
      break;
    }
  }
  return result;
}

function buildEventPlace(data, result) {
  let countyAndCountry = getCountyAndCountry(data);

  let country = countyAndCountry.country;
  let county = countyAndCountry.county;
  let district = getCensusDetail(data, ["District", "Census District"]);
  let civilParish = data.censusDetails["Civil Parish"];
  let whereTaken = data.censusDetails["Where Census Taken"];
  let houseNumber = data.censusDetails["House Number"];
  let houseOrStreetName = data.censusDetails["House or Street Name"];

  let streetAddress = "";
  if (houseOrStreetName && houseOrStreetName != "-") {
    streetAddress = houseOrStreetName;
    if (houseNumber) {
      streetAddress = houseNumber + " " + streetAddress;
    }
  }

  let placeString = "";

  function addPlacePart(part) {
    if (part) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += part;
    }
  }

  addPlacePart(streetAddress);
  if (whereTaken) {
    addPlacePart(whereTaken);
  } else {
    addPlacePart(civilParish);
    if (district != civilParish) {
      addPlacePart(district);
    }
  }
  addPlacePart(county);
  addPlacePart(country);

  result.setEventPlace(placeString);

  if (streetAddress) {
    result.eventPlace.streetAddress = streetAddress;
  }

  if (district) {
    result.registrationDistrict = district;
  }
}

function findSelectedMember(data) {
  for (let member of data.householdMembers) {
    if (member.isSelected) {
      return member;
    }
  }

  return undefined;
}

function buildHouseholdArray(data, result) {
  const stdFieldNames = [
    { stdName: "age", ancestryHeadings: ["Age"] },
    { stdName: "relationship", ancestryHeadings: ["Relationship"] },
    { stdName: "maritalStatus", ancestryHeadings: ["Marital Status"] },
    { stdName: "occupation", ancestryHeadings: ["Occupation"] },
    { stdName: "gender", ancestryHeadings: ["Sex"] },
  ];
  function headingToStdName(heading) {
    for (let entry of stdFieldNames) {
      if (entry.ancestryHeadings.includes(heading)) {
        return entry.stdName;
      }
    }
  }
  let selectedPersonYearsMarried = "";

  let headings = data.householdHeadings;
  let members = data.householdMembers;
  if (headings && members) {
    result.householdArrayFields = [];

    let householdArray = [];
    for (let member of members) {
      let householdMember = {};
      if (member.isClosed) {
        householdMember.isClosed = true;
      } else {
        // handle name specially since we combine surname and forenames into one name
        let surname = WTS_String.toInitialCapsEachWord(member["Surname"], true);
        let forenames = member["Forenames"];
        householdMember.name = forenames;
        if (forenames && surname) {
          householdMember.name += " ";
        }
        householdMember.name += surname;

        // handle birthPlace specially since we combine birthPlace and birthCounty into one string
        let combinedBirthPlace = "";
        let birthPlace = member["Birth Place"];
        let birthCounty = member["Birth County"];

        if (birthPlace) {
          combinedBirthPlace = birthPlace;
        }
        if (birthCounty) {
          if (combinedBirthPlace) {
            combinedBirthPlace += ", ";
          }
          combinedBirthPlace += birthCounty;
        }

        if (combinedBirthPlace) {
          householdMember.birthPlace = combinedBirthPlace;
        }

        for (let heading of headings) {
          if (
            heading != "Surname" &&
            heading != "Forenames" &&
            heading != "Birth Place" &&
            heading != "Birth County"
          ) {
            let fieldName = headingToStdName(heading);
            if (fieldName) {
              let fieldValue = member[heading];
              if (fieldValue) {
                if (fieldName == "gender") {
                  fieldValue = GD.standardizeGender(fieldValue);
                } else if (fieldName == "maritalStatus") {
                  fieldValue = GD.standardizeMaritalStatus(fieldValue);
                } else if (fieldName == "relationship") {
                  fieldValue = GD.standardizeRelationshipToHead(fieldValue);
                } else if (fieldName == "occupation") {
                  fieldValue = GD.standardizeOccupation(fieldValue);
                }

                householdMember[fieldName] = fieldValue;
              }
            }
          }
        }
        let isSelected = member.isSelected;
        if (isSelected) {
          householdMember.isSelected = isSelected;

          let yearsMarried = member["Years Married"];
          if (yearsMarried) {
            selectedPersonYearsMarried = yearsMarried;
          }
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
        } else if (heading == "Birth Place") {
          fieldName = "birthPlace";
        }
      }
      if (fieldName) {
        householdArrayFields.push(fieldName);
      }
    }
    result.householdArrayFields = householdArrayFields;
  }

  // We can also determine parents and spouse in some cases
  result.addSpouseOrParentsForSelectedHouseholdMember();

  if (result.spouses && result.spouses.length == 1) {
    if (selectedPersonYearsMarried) {
      let censusDate = result.inferEventDate();
      let marriageDateString = GeneralizedData.getSubtractAgeFromDate(
        censusDate,
        selectedPersonYearsMarried
      );
      let marriageYear = WTS_String.getLastWord(marriageDateString);
      if (marriageYear) {
        result.spouses[0].marriageDate.yearString = marriageYear;
      }
    }
  }
}

function generalizeData(input) {
  //console.log("freecen: generalizeData: input is:");
  //console.log(input);

  let data = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freecen";

  if (!data.success) {
    return result; //the extract failed
  }

  if (
    !data.censusDetails ||
    !data.householdHeadings ||
    !data.householdMembers
  ) {
    console.log(
      "freecen: generalizeData: censusDetails, householdHeadings or householdMembers is missing"
    );
    return result; // defensive
  }

  result.sourceType = "record";
  result.recordType = RT.Census;

  buildEventPlace(data, result);

  let censusYear = getCensusDetail(data, ["Census", "Census Year"]);
  result.setEventYear(censusYear);

  let selectedMember = findSelectedMember(data);
  if (!selectedMember) {
    // this can happen on iPhone, so far haven't found any way around it
    // so use first household member in this case
    console.log(
      "freecen: generalizeData: selectedMember is missing, using first member"
    );
    selectedMember = data.householdMembers[0];
  }

  let surname = WTS_String.toInitialCapsEachWord(
    selectedMember["Surname"],
    true
  );
  let forenames = selectedMember["Forenames"];

  result.setLastNameAndForeNames(surname, forenames);

  if (data.ageAtDeath) {
    result.ageAtDeath = data.ageAtDeath;
  }

  let age = selectedMember["Age"];
  if (age) {
    result.ageAtEvent = age;
  }

  let birthPlace = selectedMember["Birth Place"];
  let birthCounty = selectedMember["Birth County"];
  let birthCountry = getCountryFromCountyName(birthCounty);

  let fullBirthPlace = "";
  if (birthPlace) {
    fullBirthPlace += birthPlace;
  }

  if (birthCounty) {
    if (fullBirthPlace) {
      fullBirthPlace += ", ";
    }
    fullBirthPlace += birthCounty;

    if (birthCountry) {
      fullBirthPlace += ", " + birthCountry;
    }
  }

  result.setBirthPlace(fullBirthPlace);

  let relationshipToHead = selectedMember["Relationship"];
  result.setRelationshipToHead(relationshipToHead);

  result.setMaritalStatus(selectedMember["Marital Status"]);
  result.setPersonGender(selectedMember["Sex"]);
  result.setOccupation(selectedMember["Occupation"]);

  buildHouseholdArray(data, result);

  // should we use a collection to allow search for same record on Ancestry?
  if (censusYear) {
    result.collectionData = {
      id: censusYear,
    };

    let piece = data.censusDetails["Piece"];
    if (piece) {
      result.collectionData.piece = piece;
    }

    let folio = data.censusDetails["Folio"];
    if (folio) {
      result.collectionData.folio = folio;
    }

    let page = data.censusDetails["Page"];
    if (page) {
      result.collectionData.page = page;
    }

    let schedule = data.censusDetails["Schedule"];
    if (schedule) {
      result.collectionData.schedule = schedule;
    }
  }

  result.hasValidData = true;

  //console.log("freecen: generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
