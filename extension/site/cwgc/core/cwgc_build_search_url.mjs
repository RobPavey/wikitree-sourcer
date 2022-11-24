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

import { CwgcUriBuilder } from "./cwgc_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { optionsRegistry } from "../../../base/core/options/options_registry.mjs";

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

const minCwgcYear = 1914;
const maxCwgcYear = 1947;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minCwgcYear) {
      yearNum = minCwgcYear;
    } else if (yearNum > maxCwgcYear) {
      yearNum = maxCwgcYear;
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

function isInYearRange(rangeStart, rangeEnd, dataStart, dataEnd) {
  // return true if the range dataStart-dataEnd is within or overlaps range rangeStart-rangeEnd

  if (dataStart > rangeEnd || dataEnd < rangeStart) {
    return false; // no overlap and not inside
  }

  return true;
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new CwgcUriBuilder();

  // compute the start and end dates
  let dates = {
    startYear: undefined,
    endYear: undefined,
  };

  if (options.search_cwgc_deathYearExactness !== "none") {
    if (data.deathDate) {
      const deathYear = data.inferDeathYear();
      if (deathYear) {
        dates.startYear = data.inferDeathYear();
        dates.endYear = data.inferDeathYear();
      }
    } else if (data.birthDate) {
      // UK Official conscription ages were 18 to 41
      // but may have lied about age on joining
      const birthYear = data.inferBirthYear();
      if (birthYear) {
        dates.startYear = addNumToYearString(birthYear, 0); // include civilian deaths
        dates.endYear = addNumToYearString(birthYear, 120);
      }
    }
  }

  if (/^\d$/.test(options.search_cwgc_deathYearExactness)) {
    const adjustYear = Number(options.search_cwgc_deathYearExactness);
    console.log(adjustYear);
    if (dates.startYear) {
      dates.startYear = subtractNumFromYearString(dates.startYear, adjustYear);
    }
    if (dates.endYear) {
      dates.endYear = addNumToYearString(dates.endYear, adjustYear);
    }
  }

  // constrain years to the range covered by Cwgc
  constrainYears(dates);
  if (options.search_cwgc_deathYearExactness !== "none") {
    if (dates.startYear) {
      builder.addDateDeathFromYear(dates.startYear);
    }
    if (dates.endYear) {
      builder.addDateDeathToYear(dates.endYear);
    }
  }

  const surnameExactness = options.search_cwgc_exactLastName ? true : false;
  const surnameAtDeath = data.inferLastName();
  if (surnameAtDeath) {
    builder.addSurname(surnameAtDeath, surnameExactness);
  }

  let firstName = data.inferFirstName();
  if (firstName) {
    if ((options.search_cwgc_useFirstnameOrInitial === "initial" && firstName.length > 0) || firstName.length === 1) {
      builder.addInitials(firstName.slice(0, 1));
    } else {
      const firstNameExactness = options.search_cwgc_exactFirstName ? true : false;
      builder.addForename(firstName, firstNameExactness);
    }
  }
  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
