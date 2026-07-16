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

function addAppropriateSurname(gd, parameters, fieldData) {
  let lastName = "";
  let lastNamesArray = gd.inferPersonLastNamesArray(gd);
  if (lastNamesArray.length > 0) {
    if (lastNamesArray.length == 1) {
      lastName = lastNamesArray[0];
    } else if (lastNamesArray.length > parameters.lastNameIndex) {
      lastName = lastNamesArray[parameters.lastNameIndex];
    }
  }
  if (lastName) {
    fieldData["surname"] = lastName;
  }
}

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
        "wagovau",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (thisSiteCollectionId) {
        collection = RC.findCollection("wagovau", thisSiteCollectionId);
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
    let givenNames = gd.name.inferForenames();
    if (givenNames) {
      fieldData["givenNames"] = givenNames;
    }
  }

  if (parameters) {
    addAppropriateSurname(gd, parameters, fieldData);
  } else {
    let lastName = gd.inferLastNames();
    if (typeOfSearch == "births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "deaths") {
      lastName = gd.inferLastNameAtDeath();
    }

    if (lastName) {
      fieldData["surname"] = lastName;
    }
  }

  let searchType = "";

  if (typeOfSearch == "SameCollection") {
    helper.overrideQualifier = dateQualifiers.EXACT;
    if (thisSiteCollectionId) {
      if (thisSiteCollectionId == "birth") {
        searchType = "birth";
      }
      if (thisSiteCollectionId == "death") {
        searchType = "death";
      }
      if (thisSiteCollectionId == "marriage") {
        searchType = "marriage";
      }
    }
  } else if (parameters) {
    if (parameters.category == "births") {
      searchType = "birth";
    }
    if (parameters.category == "deaths") {
      searchType = "death";
    }
    if (parameters.category == "marriages") {
      searchType = "marriage";
    }
  } else {
    if (typeOfSearch == "births") {
      searchType = "birth";
    } else if (typeOfSearch == "deaths") {
      searchType = "death";
    } else if (typeOfSearch == "marriages") {
      searchType = "marriage";
    }
  }

  if (searchType) {
    if (!collection) {
      collection = RC.findCollection("wagovau", searchType);
    }

    if (collection) {
      let siteCollection = collection.sites.wagovau;
      let allowedDates = RC.getCollectionDates(collection, siteCollection);
      helper.setAllowedDateRange(allowedDates);
    }
  }

  // date range
  if (searchType == "birth") {
    // Note that the search form allows birth date to be specified for deaths
    // but most death records do not have this data and, if provided, the search fails
    let range = helper.getYearRangeForBirth(options.search_wagovau_birthYearExactness);

    if (!range) {
      // no birth year - calculate range from max lifespan
      const birthExactness = options.search_wagovau_birthYearExactness;
      const deathExactness = options.search_wagovau_deathYearExactness;
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }

    if (range && range.startYear) {
      fieldData["yearFromCtrl"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["yearToCtrl"] = range.endYear;
      }
    }
  }

  if (searchType == "death") {
    let range = helper.getYearRangeForDeath(options.search_wagovau_deathYearExactness);

    if (!range) {
      // no death year - calculate range from max lifespan
      const birthExactness = options.search_wagovau_birthYearExactness;
      const deathExactness = options.search_wagovau_deathYearExactness;
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }

    if (range && range.startYear) {
      fieldData["yearFromCtrl"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["yearToCtrl"] = range.endYear;
      }
    }
  }

  if (searchType == "marriage") {
    if (typeOfSearch == "SameCollection") {
      let eventYear = gd.inferEventYear();
      if (eventYear) {
        fieldData["yearFromCtrl"] = eventYear;
      }
    } else {
      const birthExactness = options.search_wagovau_birthYearExactness;
      const deathExactness = options.search_wagovau_deathYearExactness;
      const earliestMarriageAge = 14;
      let range = helper.getYearRangeForLifespan(birthExactness, deathExactness, earliestMarriageAge);
      if (range) {
        if (range.startYear) {
          fieldData["yearFromCtrl"] = range.startYear;
        }
        if (range.endYear) {
          fieldData["yearToCtrl"] = range.endYear;
        }
      }

      if (parameters && parameters.spouseIndex != -1 && gd.spouses) {
        if (gd.spouses.length > parameters.spouseIndex) {
          let spouse = gd.spouses[parameters.spouseIndex];
          if (spouse.name) {
            let spouseGivenNames = spouse.name.inferForenames();
            let spouseSurname = spouse.name.inferLastName();
            if (spouseGivenNames) {
              fieldData["spouseGivenNames"] = spouseGivenNames;
            }
            if (spouseSurname) {
              fieldData["spouseSurname"] = spouseSurname;
            }
          }
        }
      }
    }
  }

  // parents
  if (searchType == "birth" || searchType == "death") {
    if (parameters && gd.parents) {
      if (parameters.father && gd.parents.father && gd.parents.father.name) {
        let father = gd.parents.father;
        let fatherName = father.name.inferFullName();
        if (fatherName) {
          fieldData["father"] = fatherName;
        }
      }
      if (parameters.mother && gd.parents.mother && gd.parents.mother.name) {
        let mother = gd.parents.mother;
        let motherName = mother.name.inferFullName();
        if (motherName) {
          fieldData["mother"] = motherName;
        }
      }
    }
  }

  if (searchType) {
    result.searchType = searchType;
  }

  return result;
}

export { buildSearchData };
