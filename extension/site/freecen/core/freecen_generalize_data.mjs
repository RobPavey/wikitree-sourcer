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

import { GeneralizedData, GD, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { commonGeneralizeData } from "../../../base/core/generalize_data_creation.mjs";

import { FreecenEdReader } from "./freecen_ed_reader.mjs";

function buildHouseholdArray(ed, result) {
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

  let headings = ed.householdHeadings;
  let members = ed.householdMembers;
  if (headings && members) {
    result.householdArrayFields = [];

    let householdArray = [];
    for (let member of members) {
      let householdMember = {};
      if (member.isClosed) {
        householdMember.isClosed = true;
      } else {
        // handle name specially since we combine surname and forenames into one name
        let forenames = member["Forenames"];
        if (forenames) {
          householdMember.name = forenames;
        }
        let surname = member["Surname"];
        if (surname) {
          if (householdMember.name) {
            householdMember.name += " ";
          }
          surname = StringUtils.toInitialCapsEachWord(surname, true);
          householdMember.name += surname;
        }
        let yearsMarried = member["Years Married"];
        if (yearsMarried && yearsMarried != "-") {
          // this is not used in table but can be used to determine married date
          householdMember.yearsMarried = yearsMarried;
        }

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
          if (heading != "Surname" && heading != "Forenames" && heading != "Birth Place" && heading != "Birth County") {
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
}

function generalizeData(input) {
  //console.log("freecen: generalizeData: input is:");
  //console.log(input);

  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freecen";

  if (!ed.success) {
    return result; //the extract failed
  }

  if (!ed.censusDetails || !ed.householdHeadings || !ed.householdMembers) {
    console.log("freecen: generalizeData: censusDetails, householdHeadings or householdMembers is missing");
    return result; // defensive
  }

  result.sourceType = "record";

  let edReader = new FreecenEdReader(ed);

  if (!edReader.selectedMember) {
    console.log("freecen: generalizeData: no selected member");
    return result; // defensive
  }

  commonGeneralizeData(edReader, result);

  //buildHouseholdArray(ed, result);

  //console.log("freecen: generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
