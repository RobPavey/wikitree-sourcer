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
    fieldData["subjectfamilyname"] = lastName;
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
    if (typeOfSearch == "births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "deaths") {
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
      let siteCollection = collection.sites.qldbdm;
      let allowedDates = RC.getCollectionDates(collection, siteCollection);
      helper.setAllowedDateRange(allowedDates);
    }
  }

  // date range
  if (refineType == "birth") {
    // Note that the search form allows birth date to be specified for deaths
    // but most death records do not have this data and, if provided, the search fails
    let range = helper.getYearRangeForBirth(options.search_qldbdm_birthYearExactness);

    if (!range) {
      // no birth year - calculate range from max lifespan
      const birthExactness = options.search_qldbdm_birthYearExactness;
      const deathExactness = options.search_qldbdm_deathYearExactness;
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }

    if (range && range.startYear) {
      fieldData["dobfrom"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["dobto"] = range.endYear;
      }
    }
  }

  if (refineType == "death") {
    let range = helper.getYearRangeForDeath(options.search_qldbdm_deathYearExactness);

    if (!range) {
      // no death year - calculate range from max lifespan
      const birthExactness = options.search_qldbdm_birthYearExactness;
      const deathExactness = options.search_qldbdm_deathYearExactness;
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }

    if (range && range.startYear) {
      fieldData["doefrom"] = range.startYear;
      if (range.endYear && range.endYear != range.startYear) {
        fieldData["doeto"] = range.endYear;
      }
    }
  }

  if (refineType == "marriage") {
    if (typeOfSearch == "SameCollection") {
      let eventYear = gd.inferEventYear();
      if (eventYear) {
        fieldData["doefrom"] = eventYear;
      }
    } else {
      const birthExactness = options.search_qldbdm_birthYearExactness;
      const deathExactness = options.search_qldbdm_deathYearExactness;
      const earliestMarriageAge = 14;
      let range = helper.getYearRangeForLifespan(birthExactness, deathExactness, earliestMarriageAge);
      if (range) {
        if (range.startYear) {
          fieldData["doefrom"] = range.startYear;
        }
        if (range.endYear) {
          fieldData["doeto"] = range.endYear;
        }
      }

      if (parameters && parameters.spouseIndex != -1 && gd.spouses) {
        if (gd.spouses.length > parameters.spouseIndex) {
          let spouse = gd.spouses[parameters.spouseIndex];
          if (spouse.name) {
            let spouseName = spouse.name.inferFullName();
            if (spouseName) {
              fieldData["spousename"] = spouseName;
            }
          }
        }
      }
    }
  }

  // parents
  if (refineType == "birth" || refineType == "death") {
    if (parameters && gd.parents) {
      if (parameters.father && gd.parents.father && gd.parents.father.name) {
        let father = gd.parents.father;
        let fatherName = father.name.inferFullName();
        if (fatherName) {
          fieldData["fathersname"] = fatherName;
        }
      }
      if (parameters.mother && gd.parents.mother && gd.parents.mother.name) {
        let mother = gd.parents.mother;
        let motherName = mother.name.inferFullName();
        if (motherName) {
          fieldData["mothersname"] = motherName;
        }
      }
    }
  }

  // for same collection we can possibly set the registration number
  if (typeOfSearch == "SameCollection" && gd.collectionData) {
    let code = "";
    if (gd.collectionData.registrationNumber) {
      // this will typically be of the form "1911/B009762"
      code = gd.collectionData.registrationNumber;
    }
    if (!code && gd.collectionData.referenceNumber) {
      // This will typically be of the form "1911/B/9762"
      code = gd.collectionData.referenceNumber;
    }
    if (code) {
      let regYear = "";
      let regType = "";
      let regNum = "";

      let parts = code.split("/");

      if (parts.length == 3) {
        regYear = parts[0];
        regType = parts[1];
        regNum = parts[2];
      } else if (parts.length == 2) {
        regYear = parts[0];
        regType = parts[1][0];
        regNum = parts[1].substring(1);
      }
      fieldData["regyear"] = regYear;
      fieldData["regtype"] = regType;
      fieldData["regnum"] = regNum;
    }
  }

  return result;
}

export { buildSearchData };
