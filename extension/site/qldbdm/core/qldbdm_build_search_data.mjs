/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { SearchHelper } from "../../../base/core/search_helper.mjs";

function buildSearchData(input) {
  let fieldData = {};
  let selectData = {};

  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const options = input.options;
  const runDate = input.runDate;
  let helper = new SearchHelper(gd, options, runDate);

  let sameCollection = false;
  let parameters = undefined;
  let thisSiteCollectionId = "";
  let collection = undefined;

  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      thisSiteCollectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "qldbdm",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (thisSiteCollectionId) {
        collection = RC.findCollection("qldbdm", thisSiteCollectionId);
        sameCollection = true;
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
  }

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  if (gd.name) {
    let givenNames = gd.name.inferForenamesPlusPreferredAndNicknames(
      options.search_qldbdm_includeMiddleName,
      options.search_qldbdm_includePrefName,
      options.search_qldbdm_includeNicknames
    );

    if (givenNames) {
      fieldData["subjectgivennames"] = givenNames;
    }
  }

  if (parameters) {
    addAppropriateSurname(gd, parameters, fieldData);
  } else {
    let lastName = gd.inferLastNames();
    if (typeOfSearch == "Births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "Deaths") {
      lastName = gd.inferLastNameAtDeath();
    }

    if (lastName) {
      fieldData["subjectfamilyname"] = lastName;
    }
  }

  let refineType = "";

  if (typeOfSearch == "SameCollection") {
    helper.overrideQualifier = dateQualifiers.EXACT;
    if (thisSiteCollectionId) {
      if (thisSiteCollectionId == "birth") {
        refineType = "birth";
      }
      if (thisSiteCollectionId == "death") {
        refineType = "death";
      }
      if (thisSiteCollectionId == "marriage") {
        refineType = "marriage";
      }
    }
  } else if (parameters) {
    if (parameters.category == "births") {
      refineType = "birth";
    }
    if (parameters.category == "deaths") {
      refineType = "death";
    }
    if (parameters.category == "marriages") {
      refineType = "marriage";
    }
  } else {
    if (typeOfSearch == "births") {
      refineType = "birth";
    } else if (typeOfSearch == "deaths") {
      refineType = "death";
    } else if (typeOfSearch == "marriages") {
      refineType = "marriage";
    }
  }

  if (refineType) {
    fieldData[refineType] = true;

    if (!collection) {
      collection = RC.findCollection("qldbdm", refineType);
    }

    if (collection) {
      helper.setAllowedDateRange(collection.dates);
    }
  }

  // date range
  let birthYear = gd.inferBirthYear();
  let deathYear = gd.inferDeathYear();
  let eventYear = gd.inferEventYear();
  if (refineType == "birth" || refineType == "death") {
    let range = helper.getYearRangeForBirth(options.search_gensau_birthYearExactness);
    if (range && range.startYear) {
      fieldData["dobfrom"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["dobto"] = range.startYear;
      }
    }
  }

  if (refineType == "death") {
    let range = helper.getYearRangeForDeath(options.search_gensau_deathYearExactness);
    if (range && range.startYear) {
      fieldData["doefrom"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["doeto"] = range.startYear;
      }
    }
  }

  if (refineType == "marriage") {
    const maxLifespan = Number(options.search_general_maxLifespan);
    let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
    if (range) {
      if (range.startYear) {
        let startNum = Number(range.startYear);
        if (startNum) {
          startNum += 14;
          range.startYear = startNum.toString();
        }
        fieldData["doefrom"] = range.startYear;
      }
      if (range.endYear) {
        fieldData["doeto"] = range.endYear;
      }
    }
  }

  // for same collection we can possibly set the registration number
  if (typeOfSearch == "SameCollection" && gd.collectionData) {
    let regNum = "";
    if (gd.collectionData.registrationNumber) {
      regNum = gd.collectionData.registrationNumber;
    }
    if (!regNum && gd.collectionData.referenceNumber) {
      regNum = gd.collectionData.referenceNumber;
    }
    if (regNum) {
      //fieldData["historicalSearch-events-registrationNumber-number"] = regNum;
    }
  }

  return result;
}

export { buildSearchData };
