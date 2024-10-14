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

import { TaslibUriBuilder } from "./taslib_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const options = buildUrlInput.options;

  var builder = new TaslibUriBuilder();

  // call methods on builder here

  let name = gd.inferFullName();
  if (typeOfSearch == "Deaths") {
    let lnad = gd.inferLastNameAtDeath(options);
    if (lnad) {
      let givenNames = gd.inferForenames();
      if (givenNames) {
        name = givenNames + " " + lnad;
      } else {
        name = lnad;
      }
    }
  }

  builder.addName(name);

  let exactness = 2;
  const exactnessOption = options.search_nzbdm_dateExactness;
  if (exactnessOption == "exact") {
    exactness = 0;
  } else if (/^\d+$/.test(exactnessOption)) {
    exactness = Number(exactnessOption);
  }

  let maxLifespan = Number(options.search_general_maxLifespan);
  let dateRange = gd.inferPossibleLifeYearRange(maxLifespan, new Date(), exactness);

  if (typeOfSearch == "Births") {
    let yearString = gd.inferBirthYear();
    if (yearString) {
      let yearNum = Number(yearString);
      if (!isNaN(yearNum) && yearNum > 1000) {
        dateRange = { startYear: yearNum - exactness, endYear: yearNum + exactness };
      }
    }
  } else if (typeOfSearch == "Deaths") {
    let yearString = gd.inferDeathYear();
    if (yearString) {
      let yearNum = Number(yearString);
      if (!isNaN(yearNum) && yearNum > 1000) {
        dateRange = { startYear: yearNum - exactness, endYear: yearNum + exactness };
      }
    }
  } else if (typeOfSearch == "Marriages") {
    if (dateRange && dateRange.startYear) {
      const minMarriageAge = 14;
      if (!(dateRange.endYear && dateRange.endYear - dateRange.startYear < minMarriageAge)) {
        dateRange.startYear += minMarriageAge;
      }
    }
  }

  builder.addYearRange(dateRange.startYear.toString(), dateRange.endYear.toString());

  if (typeOfSearch) {
    builder.addRecordType(typeOfSearch);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
