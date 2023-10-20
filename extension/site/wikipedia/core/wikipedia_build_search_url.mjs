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

import { WikipediaUriBuilder } from "./wikipedia_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

function addNumToYearString(yearString, num) {
  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum += num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function subtractNumFromYearString(yearString, num) {
  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum -= num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

const minWikipediaYear = 1837;
const maxWikipediaYear = 1992;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minWikipediaYear) {
      yearNum = minWikipediaYear;
    } else if (yearNum > maxWikipediaYear) {
      yearNum = maxWikipediaYear;
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

function addAppropriateSurname(gd, type, builder) {
  let lastName = gd.lastNameAtBirth;
  if (type == "deaths" || !lastName) {
    lastName = gd.inferLastNameAtDeath();
  }

  if (!lastName) {
    lastName = gd.inferLastName();
  }

  if (lastName) {
    builder.addSurname(lastName);
  }
}

function isInYearRange(rangeStart, rangeEnd, dataStart, dataEnd) {
  // return true if the range dataStart-dataEnd is within or overlaps range rangeStart-rangeEnd

  if (dataStart > rangeEnd || dataEnd < rangeStart) {
    return false; // no overlap and not inside
  }

  return true;
}

function isMiddleNameLikelyAnInitial(dates, type) {
  let startYearNum = DateUtils.getYearNumFromYearString(dates.startYear);
  let endYearNum = DateUtils.getYearNumFromYearString(dates.endYear);

  if (!startYearNum) {
    startYearNum = 1837;
  }
  if (!endYearNum) {
    endYearNum = 2000;
  }

  if (startYearNum > endYearNum) {
    endYearNum = startYearNum; // should never happen but just in case
  }

  let useInitial = false;

  if (isInYearRange(startYearNum, endYearNum, 1866, 1866)) {
    useInitial = true;
  } else if (type == "births" && isInYearRange(startYearNum, endYearNum, 1910, 1965)) {
    useInitial = true;
  } else if (type == "marriages" && isInYearRange(startYearNum, endYearNum, 1910, 1983)) {
    useInitial = true;
  } else if (type == "deaths" && isInYearRange(startYearNum, endYearNum, 1910, 1969)) {
    useInitial = true;
  }

  return useInitial;
}

function addAppropriateGivenNames(gd, dates, type, builder) {
  // there is a limit on the number of given names that the indices contain
  // For now just use first name plus first middle name
  // Oftern they contain the first letter of the third name but of the first 2 are long they might not
  let firstName = gd.inferFirstName();
  let middleName = gd.inferMiddleName();

  if (middleName && middleName.length > 1 && isMiddleNameLikelyAnInitial(dates, type)) {
    middleName = middleName.substr(0, 1); // make an initial
  }

  let givenNames = firstName;
  if (middleName) {
    givenNames += " " + middleName;
  }
  builder.addGivenNames(givenNames);
}

function includeMothersName(dates, mothersMaidenName) {
  let yearNum = DateUtils.getYearNumFromYearString(dates.startYear);
  if (!yearNum) {
    return false;
  }

  if (yearNum > 1911) {
    return true;
  }

  return false;
}

function includeSpouseNameIfValidThruDateRange(dates, gd, builder) {
  //if (dates.startYear > 1911) {
  if (gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let spouseSurname = spouse.name.inferLastName();
      builder.addOtherSurname(spouseSurname);
    }
  }
  //}
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new WikipediaUriBuilder();

  let searchString = "";

  function addTerm(term) {
    if (term) {
      if (searchString) {
        searchString += " ";
      }
      searchString += term;
    }
  }
  addTerm(gd.inferFullName());
  addTerm(gd.inferBirthYear());
  addTerm(gd.inferDeathYear());

  builder.addSearchString(searchString);

  builder.addTitle("Special:Search");

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
