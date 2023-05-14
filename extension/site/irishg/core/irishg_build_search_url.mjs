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

import { IrishgUriBuilder } from "./irishg_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
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

const minIrishgYear = 1837;
const maxIrishgYear = 1992;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minIrishgYear) {
      yearNum = minIrishgYear;
    } else if (yearNum > maxIrishgYear) {
      yearNum = maxIrishgYear;
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

function addAppropriateSurname(data, builder) {
  let lastName = data.lastNameAtBirth;
  if (!lastName) {
    lastName = data.inferLastNameAtDeath();
  }

  if (!lastName) {
    lastName = data.inferLastName();
  }

  if (lastName) {
    builder.addSurname(lastName);
  }
}

function addAppropriateGivenNames(data, builder) {
  let firstName = data.inferFirstName();
  let givenNames = firstName;
  builder.addGivenNames(givenNames);
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new IrishgUriBuilder(typeOfSearch);

  addAppropriateGivenNames(data, builder);

  addAppropriateSurname(data, builder);

  let startYear = data.inferBirthYear();
  let endYear = data.inferDeathYear();
  builder.addStartYear(startYear);
  builder.addEndYear(endYear);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
