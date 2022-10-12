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

import { RC } from "../../../base/core/record_collections.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { countyNameToCountyCode } from "./freecen_chapman_codes.mjs";

function addBirthYear(data, options, sameCollection, fieldData) {
  // compute the start and end birth dates
  let optBirthYearRange = options.search_freecen_birthYearRangeDefault;
  if (sameCollection) {
    optBirthYearRange = options.search_freecen_birthYearRangeSameCollection;
  }
  if (optBirthYearRange != "none") {
    let birthYear = data.inferBirthYear();
    let birthDates = {
      startYear: undefined,
      endYear: undefined,
    };

    if (optBirthYearRange == "auto") {
      let birthDateQualifier = data.inferBirthDateQualifier();
      data.setDatesUsingQualifier(birthDates, birthYear, birthDateQualifier);
    } else {
      let range = 2;
      if (optBirthYearRange == "exact") {
        range = 0;
      } else if (optBirthYearRange == "2") {
        range = 2;
      } else if (optBirthYearRange == "5") {
        range = 5;
      } else if (optBirthYearRange == "10") {
        range = 10;
      }
      let yearNum = WTS_Date.getYearNumFromYearString(birthYear);
      if (yearNum) {
        birthDates.startYear = yearNum - range;
        birthDates.endYear = yearNum + range;
      }
    }
    if (birthDates.startYear) {
      fieldData["start_year"] = birthDates.startYear;
    }
    if (birthDates.endYear) {
      fieldData["end_year"] = birthDates.endYear;
    }
  }
}

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const data = input.generalizedData;
  const options = input.options;

  let fieldData = {
    utf8: true,
  };

  let sameCollection = false;
  let collection = undefined;
  let parameters = undefined;
  let freecenCollectionId = undefined;

  if (input.typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      freecenCollectionId = RC.mapCollectionId(
        data.sourceOfData,
        data.collectionData.id,
        "freecen",
        data.inferEventCountry(),
        data.inferEventYear()
      );
      if (freecenCollectionId) {
        collection = RC.findCollection("freecen", freecenCollectionId);
        if (collection) {
          sameCollection = true;
        }
      }
    }
  } else if (input.typeOfSearch == "SpecifiedCollection") {
    let searchParams = input.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection && collection.sites["freecen"]) {
        freecenCollectionId = collection.sites["freecen"].id;
      }
    }
  } else if (input.typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
    if (parameters.collection != "all") {
      freecenCollectionId = parameters.collection;
      if (freecenCollectionId) {
        collection = RC.findCollection("freecen", freecenCollectionId);
      }
    }
    if (parameters.subcategory != "all") {
      subcategory = parameters.subcategory;
    }
  }

  if (freecenCollectionId) {
    // the collection id is just the census year
    fieldData["search_query_record_type"] = freecenCollectionId;
  }

  let forenames = data.inferForenames();
  if (forenames) {
    fieldData["first_name"] = forenames;
  }

  let lastName = data.inferLastNameGivenParametersAndCollection(parameters, collection);
  if (lastName) {
    fieldData["last_name"] = lastName;
  }

  let optFuzzy = options.search_freecen_fuzzyInDefault;
  if (sameCollection) {
    optFuzzy = options.search_freecen_fuzzyInSameCollection;
  }
  fieldData["search_query_fuzzy"] = optFuzzy;

  addBirthYear(data, options, sameCollection, fieldData);

  let maritalStatus = data.maritalStatus;
  let maritalStatusCode = "";
  if (maritalStatus == "married") {
    maritalStatusCode = "M";
  } else if (maritalStatus == "widowed") {
    maritalStatusCode = "W";
  } else if (maritalStatus == "single") {
    maritalStatusCode = "S";
  }

  if (maritalStatusCode) {
    fieldData["search_query_marital_status"] = maritalStatusCode;
  }

  let sex = data.personGender;
  if (sex && sex != "-") {
    fieldData["search_query_sex"] = sex.toUpperCase()[0];
  }

  let optBirthCounty = options.search_freecen_includeBirthCounty;
  if (optBirthCounty) {
    let birthCounty = data.inferBirthCounty();
    if (birthCounty) {
      let chapmanCode = countyNameToCountyCode(birthCounty);
      if (chapmanCode) {
        fieldData["search_query_birth_chapman_codes"] = chapmanCode;
      }
    }
  }

  // it only makes sense to include the census place when searching same collection
  if (sameCollection) {
    let optCensusCounty = options.search_freecen_includeCensusCounty;
    if (optCensusCounty) {
      let eventCounty = data.inferEventCounty();
      if (eventCounty) {
        let chapmanCode = countyNameToCountyCode(eventCounty);
        if (chapmanCode) {
          fieldData["search_query_chapman_codes"] = chapmanCode;
        }
      }
    }
  }

  // More exact census place involves generating a special place ID. This is too much effort.
  // search_query[freecen2_place_ids][]: 5fc6db0ef4040beff4813f18
  // Only allowed if an exact census place specified
  // search_query[search_nearby_places]: true

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
