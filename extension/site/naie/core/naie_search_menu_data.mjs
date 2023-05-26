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

import { RT } from "../../../base/core/record_type.mjs";
import {
  getCountiesForCensusYear,
  getMatchingCensusCounty,
  getMatchingCensusCountyFromList,
} from "./naie_county_data.mjs";

const collections = [
  { value: "1821", text: "1821 Census", subcategory: "census" },
  { value: "1831", text: "1831 Census", subcategory: "census" },
  { value: "1841", text: "1841 Census", subcategory: "census" },
  { value: "1851", text: "1851 Census", subcategory: "census" },
  { value: "1901", text: "1901 Census", subcategory: "census" },
  { value: "1911", text: "1911 Census", subcategory: "census" },
];

function setLastNameForYear(generalizedData, yearString, parameters) {
  // if there are multiple last name we may be able to determine the correct one for this year
  let lastNamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
  if (lastNamesArray.length > 1) {
    let bestLastName = generalizedData.inferLastNameOnDate(yearString);
    for (let lastNameIndex = 0; lastNameIndex < lastNamesArray.length; lastNameIndex++) {
      if (lastNamesArray[lastNameIndex] == bestLastName) {
        parameters.lastNameIndex = lastNameIndex;
        break;
      }
    }
  }
}

const NaieData = {
  includeCategories: function (generalizedData, parameters) {
    return false;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return false;
  },

  includeCollections: function (generalizedData, parameters) {
    return true;
  },

  includeSpouses: function (generalizedData, parameters) {
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    return false;
  },

  includeMmn: function (generalizedData, parameters) {
    return false;
  },

  includeOtherPerson: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return undefined;
  },

  getSubcategories: function (generalizedData, parameters, options) {
    return undefined;
  },

  getCollections: function (generalizedData, parameters, options) {
    return collections;
  },

  getAdditionalControls: function (generalizedData, parameters, options) {
    let controls = [];

    const counties = getCountiesForCensusYear(parameters.collection);

    const countyValues = [];
    countyValues.push({ value: "all", text: "All Counties" });
    for (let county of counties) {
      countyValues.push({ value: county, text: county });
    }
    const countySelector = {
      elementId: "county",
      parameterName: "county",
      type: "select",
      label: "County",
      values: countyValues,
    };

    controls.push(countySelector);

    return controls;
  },

  getWarningMessages: function (generalizedData, parameters, options) {
    let messages = [];

    let maxLifespan = Number(options.search_general_maxLifespan);
    let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

    let collectionYearNum = Number(parameters.collection);
    if (isNaN(collectionYearNum)) {
      let message = "Collection '" + parameters.collection + " is not valid - it is not a number.";
      messages.push(message);
      return;
    }

    if (collectionYearNum > lifeDates.endYear || collectionYearNum < lifeDates.startYear) {
      let message = "Collection year '" + parameters.collection + " is not within the possible lifetime.";
      messages.push(message);
    }

    return messages;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

    parameters.collection = "1911";
    parameters.county = "all";

    // If searching from a census then search for same year by default
    if (generalizedData.recordType == RT.Census) {
      let censusYear = generalizedData.inferEventYear();
      for (let collection of collections) {
        if (collection.value == censusYear) {
          parameters.collection = censusYear;
          break;
        }
      }

      let county = generalizedData.inferEventCounty();
      if (county) {
        let naieCounty = getMatchingCensusCounty(parameters.collection, county);
        if (naieCounty) {
          parameters.county = county;
        }
      }
    } else {
      for (let collection of collections) {
        let collectionYearNum = Number(collection.value);
        if (collectionYearNum >= lifeDates.startYear && collectionYearNum <= lifeDates.endYear) {
          parameters.collection = collection.value;
          break;
        }
      }

      // if there are multiple last names we may be able to determine the correct one for this year
      setLastNameForYear(generalizedData, parameters.collection, parameters);

      // if generalizedData has just one matching county then use that
      let countyNames = generalizedData.inferCounties();
      if (countyNames && countyNames.length > 0) {
        let county = getMatchingCensusCountyFromList(parameters.collection, countyNames);
        if (county) {
          parameters.county = county;
        }
      }
    }
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {
    // year has changed so county list may be different
    if (parameters.county != "all") {
      const counties = getCountiesForCensusYear(parameters.collection);
      if (!counties.includes(parameters.county)) {
        parameters.county = "all";
      }
    }

    setLastNameForYear(generalizedData, parameters.collection, parameters);
  },
};

export { NaieData };
