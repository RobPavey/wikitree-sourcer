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
import { WTS_Date } from "../../../base/core/wts_date.mjs";

function addNumToYearString(yearString, num) {
  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum += num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function subtractNumFromYearString(yearString, num) {
  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum -= num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

const minPpnzYear = 1837;
const maxPpnzYear = 1992;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minPpnzYear) {
      yearNum = minPpnzYear;
    } else if (yearNum > maxPpnzYear) {
      yearNum = maxPpnzYear;
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new PpnzUriBuilder();

  const dateRange = data.inferPossibleLifeYearRange();
  if (options.search_ppnz_addToDateRange && options.search_ppnz_addToDateRange != "none") {
    if (dateRange.startYear) {
      dateRange.startYear = subtractNumFromYearString(dateRange.startYear, options.search_ppnz_addToDateRange);
    }
    if (dateRange.endYear) {
      dateRange.endYear = addNumToYearString(dateRange.endYear, options.search_ppnz_addToDateRange);
    }
  }

  // constrain years to the range covered by Ppnz
  constrainYears(dateRange);

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  let queryString = "";

  const lnab = data.inferLastNameAtBirth();
  const cln = data.inferLastNameAtDeath();

  if (lnab && cln && lnab != cln) {
    queryString = lnab + " " + cln;
  } else {
    if (lnab) {
      queryString = lnab;
    } else if (cln) {
      queryString = cln;
    }
  }

  let givenNames = data.inferForenames();
  if (givenNames) {
    queryString += " " + givenNames;
    queryString = queryString.trim();
  }

  builder.addQueryString(queryString);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
