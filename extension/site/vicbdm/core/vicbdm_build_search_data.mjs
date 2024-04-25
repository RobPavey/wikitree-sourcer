/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const searchParameters = input.searchParameters;
  const options = input.options;
  const runDate = input.runDate;

  let fieldData = {};
  let selectData = {};

  let forenames = gd.inferForenames();
  if (forenames) {
    fieldData["historicalSearch-name-firstGivenName"] = forenames;
  }

  let lastName = gd.inferLastName();
  if (lastName) {
    fieldData["historicalSearch-name-familyName"] = lastName;
  }

  fieldData["historicalSearch-events-birth"] = true;
  fieldData["historicalSearch-events-death"] = true;
  fieldData["historicalSearch-events-marriage"] = true;

  const maxLifespan = Number(options.search_general_maxLifespan);
  let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
  if (range) {
    if (range.startYear) {
      fieldData["historicalSearch-yearRange-from"] = range.startYear;
    }
    if (range.endYear) {
      fieldData["historicalSearch-yearRange-to"] = range.endYear;
    }
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
