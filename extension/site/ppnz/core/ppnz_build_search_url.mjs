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

import { PpnzUriBuilder } from "./ppnz_uri_builder.mjs";
import { buildQueryString, setDefaultTextQueryParameters } from "../../../base/core/text_query.mjs";

const minPpnzYear = 1837;
const maxPpnzYear = 1992;

function constrainYear(yearNum) {
  if (yearNum < minPpnzYear) {
    yearNum = minPpnzYear;
  } else if (yearNum > maxPpnzYear) {
    yearNum = maxPpnzYear;
  }
  return yearNum;
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  let parameters = buildUrlInput.searchParameters;
  const options = buildUrlInput.options;

  if (!parameters) {
    parameters = {};
    setDefaultTextQueryParameters(parameters, gd, options);
  }

  var builder = new PpnzUriBuilder();

  const dateRange = gd.inferPossibleLifeYearRange();
  if (options.search_ppnz_addToDateRange != "none") {
    // although the values are ints in options sometimes they come through as strings in browser
    let offsetToRange = Number(options.search_ppnz_addToDateRange);
    if (!isNaN(offsetToRange)) {
      if (dateRange.startYear) {
        dateRange.startYear -= offsetToRange;
      }
      if (dateRange.endYear) {
        dateRange.endYear += offsetToRange;
      }
    }
  }

  // constrain years to the range covered by Ppnz
  constrainYears(dateRange);

  let queryString = buildQueryString("ppnz", gd, parameters, options);
  builder.addQueryString(queryString);

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
