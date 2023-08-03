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

import { OpenarchUriBuilder } from "./openarch_uri_builder.mjs";
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

const minOpenarchYear = 1837;
const maxOpenarchYear = 1992;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minOpenarchYear) {
      yearNum = minOpenarchYear;
    } else if (yearNum > maxOpenarchYear) {
      yearNum = maxOpenarchYear;
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
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new OpenarchUriBuilder();

  // typeOfSearch can be:
  // "Births"
  // "Marriages"
  // "Deaths"
  // "SameCollection"

  let type = typeOfSearch.toLowerCase();
  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      type = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "openarch",
        gd.inferEventCountry(),
        gd.inferEventYear()
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
    let eventYear = gd.inferEventYear();
    dates.startYear = eventYear;
    dates.endYear = eventYear;
  } else if (type == "births") {
    let birthYear = gd.inferBirthYear();
    let birthDateQualifier = gd.inferBirthDateQualifier();
    gd.setDatesUsingQualifier(dates, birthYear, birthDateQualifier);
  } else if (type == "marriages") {
    let eventYear = gd.inferEventYear();

    let birthYear = gd.inferBirthYear();
    if (birthYear) {
      dates.startYear = addNumToYearString(birthYear, 14);
    } else if (eventYear) {
      dates.startYear = subtractNumFromYearString(eventYear, 100);
    }

    let deathYear = gd.inferDeathYear();
    if (deathYear) {
      dates.endYear = deathYear;
    } else if (eventYear) {
      dates.endYear = addNumToYearString(eventYear, 100);
    }
  } else if (type == "deaths") {
    let deathYear = gd.inferDeathYear();
    let deathDateQualifier = gd.inferDeathDateQualifier();
    gd.setDatesUsingQualifier(dates, deathYear, deathDateQualifier);
  }

  // constrain years to the range covered by Openarch
  constrainYears(dates);

  // set the date parameters
  if (dates.startYear) {
    builder.addStartYear(dates.startYear);
  }
  if (dates.endYear) {
    builder.addEndYear(dates.endYear);
  }

  addAppropriateSurname(gd, type, builder);

  addAppropriateGivenNames(gd, dates, type, builder);

  // now set specific fields for each type
  if (type == "births") {
    if (includeMothersName(dates, gd.mothersMaidenName)) {
      builder.addOtherSurname(gd.mothersMaidenName);
    }
  } else if (type == "marriages") {
    includeSpouseNameIfValidThruDateRange(dates, gd, builder);
  } else if (type == "deaths") {
    // although BMD Entries do not seem to have age of death before 1866 it doesn't
    // seem to throw off the search if it is included. However if the entry includes the
    // age of death and it is off by even 1 year it fails to find it. So only include age
    // if this is SameCollection
    let age = gd.inferAgeAtDeath();
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

  // Add collection reference gd if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    builder.addVolume(gd.collectionData.volume);
    builder.addPage(gd.collectionData.page);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
