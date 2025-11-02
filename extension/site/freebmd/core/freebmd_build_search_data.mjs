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

const minFreebmdYear = 1837;
const maxFreebmdYear = 1992;
const minFreebmdQuarter = 3;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minFreebmdYear) {
      yearNum = minFreebmdYear;
    } else if (yearNum > maxFreebmdYear) {
      yearNum = maxFreebmdYear;
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

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum == minFreebmdYear) {
    let quarterNum = DateUtils.getQuarterNumFromQuarterString(quarterString);
    if (quarterNum < minFreebmdQuarter) {
      quarterNum = minFreebmdQuarter;
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

function addAppropriateSurname(gd, type, fieldData, options) {
  let lastName = gd.inferLastNameAtBirth();

  if (type == "deaths" || !lastName) {
    let cln = gd.inferLastNameAtDeath(options);
    if (cln) {
      lastName = cln;
    }
  }

  if (lastName) {
    fieldData["last_name"] = lastName;
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

function addAppropriateGivenNames(gd, dates, type, fieldData) {
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
  fieldData["first_name"] = givenNames;
}

function includeMothersName(dates, mothersMaidenName) {
  let yearNum = DateUtils.getYearNumFromYearString(dates.startYear);
  if (!yearNum) {
    return false;
  }

  if (yearNum > 1911 || (yearNum == 1911 && dates.startQuarter > 2)) {
    return true;
  }

  return false;
}

function includeSpouseNameIfValidThruDateRange(dates, gd, fieldData) {
  // although spouse name were not recorded until 1911 the FreeBMD search will
  // check the name you give against other on the page.
  // So for now we always include the surname

  //if (dates.startYear > 1911) {
  if (gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let spouseSurname = spouse.name.inferLastName();
      fieldData["spouses_mother_surname"] = gd.spouseSurname;
    }
  }
  //}
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const dataCache = input.dataCache;
  const typeOfSearch = input.typeOfSearch;
  const parameters = input.parameters;
  const options = input.options;

  //console.log("freebmd buildSearchData: parameters is:");
  //console.log(parameters);

  let fieldData = {};
  let selectData = {};

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
        "freebmd",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    } else {
      // should never happen
      type = "births";
    }
  } else if (typeOfSearch == "BirthsOfChildren") {
    type = "births";
  } else if (typeOfSearch == "PossibleDeaths") {
    type = "deaths";
  }

  // add type to search
  if (type == "births") {
    fieldData["search_query_bmd_record_type_birth"] = true;
  } else if (type == "marriages") {
    fieldData["search_query_bmd_record_type_marriage"] = true;
  } else if (type == "deaths") {
    fieldData["search_query_bmd_record_type_death"] = true;
  }

  // compute the start and end dates
  let dates = {
    startYear: undefined,
    endYear: undefined,
    startQuarter: 1,
    endQuarter: 4,
  };

  if (typeOfSearch == "SameCollection") {
    // must be coming from a record of same type and date should be exact
    let eventYear = gd.inferEventYear();
    dates.startYear = eventYear;
    dates.endYear = eventYear;

    let eventQuarter = gd.inferEventQuarter();
    if (eventQuarter) {
      dates.startQuarter = eventQuarter;
      dates.endQuarter = eventQuarter;
    }
  } else if (typeOfSearch == "BirthsOfChildren") {
    if (parameters) {
      dates.startYear = parameters.startYear;
      dates.endYear = parameters.endYear;
      dates.startQuarter = parameters.startQuarter;
      dates.endQuarter = parameters.endQuarter;
    }
  } else if (typeOfSearch == "PossibleDeaths") {
    if (parameters) {
      dates.startYear = parameters.startYear;
      dates.endYear = parameters.endYear;
      dates.startQuarter = parameters.startQuarter;
      dates.endQuarter = parameters.endQuarter;
    }
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

  // constrain years to the range covered by Freebmd
  constrainYears(dates);

  // set the date parameters
  if (dates.startYear) {
    fieldData["from_year"] = dates.startYear;
    if (dates.startQuarter) {
      selectData["from_quarter"] = dates.startQuarter.toString();
    }
  }
  if (dates.endYear) {
    fieldData["to_year"] = dates.endYear;
    if (dates.endQuarter) {
      selectData["to_quarter"] = dates.endQuarter.toString();
    }
  }

  if (typeOfSearch == "BirthsOfChildren") {
    if (gd.personGender == "female") {
      let mmn = gd.lastNameAtBirth;
      if (!mmn) {
        mmn = gd.inferLastName();
      }

      if (parameters && parameters.spouse && parameters.spouse.name) {
        let spouseLastName = parameters.spouse.name.inferLastName();

        if (spouseLastName) {
          fieldData["last_name"] = spouseLastName;
        }
      } else {
        // no spouse, user mother's name as surname
        if (mmn) {
          fieldData["last_name"] = mmn;
        }
      }

      if (mmn) {
        if (includeMothersName(dates, mmn)) {
          fieldData["spouses_mother_surname"] = mmn;
        }
      }
    } else {
      let lastName = gd.lastNameAtBirth;
      if (!lastName) {
        lastName = gd.inferLastName();
      }

      if (lastName) {
        fieldData["last_name"] = lastName;
      }

      if (parameters && parameters.spouse && parameters.spouse.name) {
        let spouseLastName = parameters.spouse.name.inferLastName();
        if (spouseLastName) {
          if (includeMothersName(dates, spouseLastName)) {
            fieldData["spouses_mother_surname"] = spouseLastName;
          }
        }
      }
    }
  } else {
    addAppropriateSurname(gd, type, fieldData, options);

    addAppropriateGivenNames(gd, dates, type, fieldData);
  }

  // now set specific fields for each type
  if (type == "births") {
    if (includeMothersName(dates, gd.mothersMaidenName)) {
      fieldData["spouses_mother_surname"] = gd.mothersMaidenName;
    }
  } else if (type == "marriages") {
    includeSpouseNameIfValidThruDateRange(dates, gd, fieldData);
  } else if (type == "deaths") {
    // although BMD Entries do not seem to have age of death before 1866 it doesn't
    // seem to throw off the search if it is included. However if the entry includes the
    // age of death and it is off by even 1 year it fails to find it. So only include age
    // if this is SameCollection
    if (typeOfSearch != "PossibleDeaths") {
      let age = gd.inferAgeAtDeath();
      if (age !== undefined && age >= 0) {
        if (typeOfSearch != "SameCollection") {
          let range = 5;
          if (age < 14) {
            range = 2;
          } else if (age > 50) {
            range = 10;
          }
          age = age.toString() + "%" + range.toString();
        }
        selectData["spoudeath_select_boxses_mother_surname"] = "1";
        fieldData["search_query_age_at_death"] = age;
      }
    }
  }

  // Add collection reference data if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    fieldData["volume"] = gd.collectionData.volume;
    fieldData["page"] = gd.collectionData.page;
  }

  //console.log("URL is " + url);

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
