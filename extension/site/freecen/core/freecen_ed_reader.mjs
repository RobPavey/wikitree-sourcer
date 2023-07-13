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

import { GD } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { getCountryFromCountyCode, getCountryFromCountyName } from "./freecen_chapman_codes.mjs";

function findSelectedMember(ed) {
  for (let member of ed.householdMembers) {
    if (member.isSelected) {
      return member;
    }
  }

  return undefined;
}

function getCountyAndCountry(ed) {
  let result = { county: "", country: "" };

  // "County": "Devon (DEV)",
  let countyString = ed.censusDetails["County"];
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

class FreecenEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.recordType = RT.Census;

    this.censusYear = this.getFirstFoundProperty(this.ed.censusDetails, ["Census", "Census Year"]);

    this.selectedMember = findSelectedMember(ed);
    if (!this.selectedMember) {
      // this can happen on iPhone, so far haven't found any way around it
      // so use first household member in this case
      console.log("freecen: generalizeData: selectedMember is missing, using first member");
      this.selectedMember = ed.householdMembers[0];
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCensusDetail(fieldNames) {
    return this.getFirstFoundProperty(this.ed.censusDetails, fieldNames);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    let surname = StringUtils.toInitialCapsEachWord(this.selectedMember["Surname"], true);
    let forenames = this.selectedMember["Forenames"];
    return this.makeNameObjFromForenamesAndLastName(forenames, surname);
  }

  getGender() {
    return this.selectedMember["Sex"];
  }

  getEventDateObj() {
    let censusYear = this.getCensusDetail(["Census", "Census Year"]);
    return this.makeDateObjFromYear(censusYear);
  }

  getEventPlaceObj() {
    let countyAndCountry = getCountyAndCountry(this.ed);

    let country = countyAndCountry.country;
    let county = countyAndCountry.county;
    let district = this.getCensusDetail(["District", "Census District"]);
    let civilParish = this.ed.censusDetails["Civil Parish"];
    let whereTaken = this.ed.censusDetails["Where Census Taken"];
    let houseNumber = this.ed.censusDetails["House Number"];
    let houseOrStreetName = this.ed.censusDetails["House or Street Name"];

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

    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    if (streetAddress) {
      placeObj.streetAddress = streetAddress;
    }

    return placeObj;
  }

  getBirthPlaceObj() {
    let birthPlace = this.selectedMember["Birth Place"];
    let birthCounty = this.selectedMember["Birth County"];
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

    return this.makePlaceObjFromFullPlaceName(fullBirthPlace);
  }

  getAgeAtEvent() {
    return this.selectedMember["Age"];
  }

  getRegistrationDistrict() {
    return this.getCensusDetail(["District", "Census District"]);
  }

  getRelationshipToHead() {
    return this.selectedMember["Relationship"];
  }

  getMaritalStatus() {
    return this.selectedMember["Marital Status"];
  }

  getOccupation() {
    return this.selectedMember["Occupation"];
  }

  getHousehold() {
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

    let ed = this.ed;
    let headings = ed.householdHeadings;
    let members = ed.householdMembers;
    if (headings && members) {
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
          }
        }
        householdArray.push(householdMember);
      }

      let result = {};
      result.members = householdArray;

      let fields = [];
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
          fields.push(fieldName);
        }
      }
      result.fields = fields;

      return result;
    }
  }

  getCollectionData() {
    if (this.censusYear) {
      let collectionData = {
        id: this.censusYear,
      };

      let piece = this.ed.censusDetails["Piece"];
      if (piece) {
        collectionData.piece = piece;
      }

      let folio = this.ed.censusDetails["Folio"];
      if (folio) {
        collectionData.folio = folio;
      }

      let page = this.ed.censusDetails["Page"];
      if (page) {
        collectionData.page = page;
      }

      let schedule = this.ed.censusDetails["Schedule"];
      if (schedule) {
        collectionData.schedule = schedule;
      }
      return collectionData;
    }
  }
}

export { FreecenEdReader };
