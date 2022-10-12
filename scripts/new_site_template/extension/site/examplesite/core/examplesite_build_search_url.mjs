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

import { ExamplesiteUriBuilder } from "./examplesite_uri_builder.mjs";
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

const minExamplesiteYear = 1837;
const maxExamplesiteYear = 1992;
const minExamplesiteQuarter = 3;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minExamplesiteYear) {
      yearNum = minExamplesiteYear;
    } else if (yearNum > maxExamplesiteYear) {
      yearNum = maxExamplesiteYear;
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function constrainQuarter(yearString, quarterString) {
  if (!yearString || !quarterString) {
    return quarterString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum == minExamplesiteYear) {
    let quarterNum = WTS_Date.getQuarterNumFromQuarterString(quarterString);
    if (quarterNum < minExamplesiteQuarter) {
      quarterNum = minExamplesiteQuarter;
    }
    return quarterNum.toString();
  } else {
    return quarterString;
  }
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.startQuarter = constrainQuarter(dates.startYear, dates.startQuarter);
  dates.endYear = constrainYear(dates.endYear);
  dates.endQuarter = constrainQuarter(dates.endYear, dates.endQuarter);
}

function addAppropriateSurname(data, type, builder) {
  let lastName = data.lastNameAtBirth;
  if (type == "deaths" || !lastName) {
    lastName = data.inferLastNameAtDeath();
  }

  if (!lastName) {
    lastName = data.inferLastName();
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
  let startYearNum = WTS_Date.getYearNumFromYearString(dates.startYear);
  let endYearNum = WTS_Date.getYearNumFromYearString(dates.endYear);

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

function addAppropriateGivenNames(data, dates, type, builder) {
  // there is a limit on the number of given names that the indices contain
  // For now just use first name plus first middle name
  // Oftern they contain the first letter of the third name but of the first 2 are long they might not
  let firstName = data.inferFirstName();
  let middleName = data.inferMiddleName();

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
  let yearNum = WTS_Date.getYearNumFromYearString(dates.startYear);
  if (!yearNum) {
    return false;
  }

  if (yearNum > 1911) {
    return true;
  }

  return false;
}

function includeSpouseNameIfValidThruDateRange(dates, data, builder) {
  //if (dates.startYear > 1911) {
  if (data.spouses && data.spouses.length == 1) {
    let spouse = data.spouses[0];
    if (spouse.name) {
      let spouseSurname = spouse.name.inferLastName();
      builder.addOtherSurname(spouseSurname);
    }
  }
  //}
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new ExamplesiteUriBuilder();

  // typeOfSearch can be:
  // "Births"
  // "Marriages"
  // "Deaths"
  // "SameCollection"

  let type = typeOfSearch.toLowerCase();
  if (typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      type = RC.mapCollectionId(
        data.sourceOfData,
        data.collectionData.id,
        "examplesite",
        data.inferEventCountry(),
        data.inferEventYear()
      );
    } else {
      // should never happen
      type = "births";
    }
  }

  // add type to search
  if (type == "births") {
    builder.addType("Births");
  } else if (type == "marriages") {
    builder.addType("Marriages");
  } else if (type == "deaths") {
    builder.addType("Deaths");
  }

  // compute the start and end dates
  let dates = {
    startYear: undefined,
    endYear: undefined,
  };

  if (typeOfSearch == "SameCollection") {
    // must be coming from a record of same type and date should be exact
    let eventYear = data.inferEventYear();
    dates.startYear = eventYear;
    dates.endYear = eventYear;
  } else if (type == "births") {
    let birthYear = data.inferBirthYear();
    let birthDateQualifier = data.inferBirthDateQualifier();
    data.setDatesUsingQualifier(dates, birthYear, birthDateQualifier);
  } else if (type == "marriages") {
    let eventYear = data.inferEventYear();

    let birthYear = data.inferBirthYear();
    if (birthYear) {
      dates.startYear = addNumToYearString(birthYear, 14);
    } else if (eventYear) {
      dates.startYear = subtractNumFromYearString(eventYear, 100);
    }

    let deathYear = data.inferDeathYear();
    if (deathYear) {
      dates.endYear = deathYear;
    } else if (eventYear) {
      dates.endYear = addNumToYearString(eventYear, 100);
    }
  } else if (type == "deaths") {
    let deathYear = data.inferDeathYear();
    let deathDateQualifier = data.inferDeathDateQualifier();
    data.setDatesUsingQualifier(dates, deathYear, deathDateQualifier);
  }

  // constrain years to the range covered by Examplesite
  dates.startQuarter = 1;
  dates.endQuarter = 4;
  constrainYears(dates);

  // set the date parameters
  if (dates.startYear) {
    builder.addStartYear(dates.startYear);
    builder.addStartQuarter(dates.startQuarter);
  }
  if (dates.endYear) {
    builder.addEndYear(dates.endYear);
    builder.addEndQuarter(dates.endQuarter);
  }

  addAppropriateSurname(data, type, builder);

  addAppropriateGivenNames(data, dates, type, builder);

  // now set specific fields for each type
  if (type == "births") {
    if (includeMothersName(dates, data.mothersMaidenName)) {
      builder.addOtherSurname(data.mothersMaidenName);
    }
  } else if (type == "marriages") {
    includeSpouseNameIfValidThruDateRange(dates, data, builder);
  } else if (type == "deaths") {
    // although BMD Entries do not seem to have age of death before 1866 it doesn't
    // seem to throw off the search if it is included. However if the entry includes the
    // age of death and it is off by even 1 year it fails to find it. So only include age
    // if this is SameCollection
    let age = data.inferAgeAtDeath();
    if (age != undefined && age >= 0) {
      if (typeOfSearch != "SameCollection") {
        let range = 5;
        if (age < 14) {
          range = 2;
        } else if (age > 50) {
          range = 10;
        }
        age = age.toString() + "%" + range.toString();
      }
      builder.addAgeAtDeath(age);
    }
  }

  // Add collection reference data if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    builder.addVolume(data.collectionData.volume);
    builder.addPage(data.collectionData.page);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
