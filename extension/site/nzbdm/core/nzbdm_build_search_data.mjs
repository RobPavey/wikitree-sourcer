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

import { DateUtils } from "../../../base/core/date_utils.mjs";

// Births:
// Search From Date must be later than 31/12/1839.
// Search To Date must not be later than 19/08/1974.
// Deaths:
// Search From Date must be later than 31/12/1839.
// Marriages:
// Search From Date must be later than 31/12/1839.
// Search To Date must not be later than 19/08/1949.

const birthsDateRange = {
  from: { day: 1, month: 1, year: 1840 },
  to: { day: 19, month: 8, year: 1974 },
};
const deathsDateRange = {
  from: { day: 1, month: 1, year: 1840 },
};
const marriagesDateRange = {
  from: { day: 1, month: 1, year: 1840 },
  to: { day: 19, month: 8, year: 1949 },
};

function constrainDate(date, runDate, allowedDateRange) {
  if (allowedDateRange) {
    let from = allowedDateRange.from;
    let to = allowedDateRange.to;

    if (from) {
      if (date.year < from.year) {
        date.year = from.year;
        date.month = from.month;
        date.day = from.day;
      } else if (date.year == from.year) {
        if (date.month < from.month) {
          date.month = from.month;
          date.day = from.day;
        } else if (date.month == from.month) {
          if (date.day < from.day) {
            date.day = from.day;
          }
        }
      }
    }

    if (!to) {
      if (runDate) {
        let endDate = new Date(runDate);
        const oneDayOffset = 24 * 60 * 60 * 1000;
        endDate.setTime(endDate.getTime() - oneDayOffset);

        // note that getMonth returns a zero-based number
        to = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
      }
    }

    if (to) {
      if (date.year > to.year) {
        date.year = to.year;
        date.month = to.month;
        date.day = to.day;
      } else if (date.year == to.year) {
        if (date.month > to.month) {
          date.month = to.month;
          date.day = to.day;
        } else if (date.month == to.month) {
          if (date.day > to.day) {
            date.day = to.day;
          }
        }
      }
    }
  }

  return date;
}

function addDateRange(gd, dateString, runDate, options, allowedDateRange) {
  const maxLifespan = Number(options.search_general_maxLifespan);

  let exactness = 2;
  const exactnessOption = options.search_nzbdm_dateExactness;
  if (exactnessOption == "exact") {
    exactness = 0;
  } else if (/^\d+$/.test(exactnessOption)) {
    exactness = Number(exactnessOption);
  }

  let fromDate = { day: 1, month: 1, year: 1840 };
  let toDate = { day: 31, month: 12, year: 2023 };

  let usedDateString = false;
  if (dateString) {
    let parsedDate = DateUtils.parseDateString(dateString);
    if (parsedDate.isValid && parsedDate.yearNum) {
      usedDateString = true;

      let fromDay = parsedDate.hasDay ? parsedDate.dayNum : 1;
      let fromMonth = parsedDate.hasMonth ? parsedDate.monthNum : 1;
      let fromYear = parsedDate.yearNum - exactness;

      const lastDayOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let toDay = parsedDate.dayNum;
      let toMonth = parsedDate.monthNum;
      if (parsedDate.hasMonth) {
        toMonth = parsedDate.monthNum;
        if (parsedDate.hasDay) {
          toDay = parsedDate.dayNum;
        } else {
          toDay = lastDayOfMonth[parsedDate.monthNum - 1];
        }
      } else {
        toDay = 31;
        toMonth = 12;
      }
      let toYear = parsedDate.yearNum + exactness;

      fromDate = { day: fromDay, month: fromMonth, year: fromYear };
      toDate = { day: toDay, month: toMonth, year: toYear };
    }
  }

  if (!usedDateString) {
    let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate, exactness);

    if (range.startYear) {
      fromDate = { day: 1, month: 1, year: range.startYear };
    }
    if (range.endYear) {
      toDate = { day: 31, month: 12, year: range.endYear };
    }
  }

  fromDate = constrainDate(fromDate, runDate, allowedDateRange);
  toDate = constrainDate(toDate, runDate, allowedDateRange);

  function makeDateString(date) {
    return date.day.toString() + "/" + date.month.toString() + "/" + date.year.toString();
  }

  let fromDateString = makeDateString(fromDate);
  let toDateString = makeDateString(toDate);
  return { fromDate: fromDateString, toDate: toDateString };
}

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const gd = input.generalizedData;
  const options = input.options;
  const typeOfSearch = input.typeOfSearch;
  const runDate = input.runDate;

  let fieldData = {};

  let forenames = gd.inferForenames();
  let lastName = gd.inferLastName();

  if (typeOfSearch == "Births") {
    fieldData.csur = lastName;
    fieldData.cfirst = forenames;

    let parentNames = gd.inferParentForenamesAndLastName();
    if (parentNames.motherForenames) {
      fieldData.mfirst = parentNames.motherForenames;
    }

    let dateRange = addDateRange(gd, gd.inferBirthDate(), runDate, options, birthsDateRange);
    fieldData.cdate_lower = dateRange.fromDate;
    fieldData.cdate_upper = dateRange.toDate;
  } else if (typeOfSearch == "Deaths") {
    let lastNameAtDeath = gd.inferLastNameAtDeath();
    if (lastNameAtDeath) {
      lastName = lastNameAtDeath;
    }
    fieldData.dsur = lastName;
    fieldData.dfirst = forenames;
    let dateRange = addDateRange(gd, gd.inferDeathDate(), runDate, options, deathsDateRange);
    fieldData.ddate_lower = dateRange.fromDate;
    fieldData.ddate_upper = dateRange.toDate;
  } else {
    if (gd.personGender == "male") {
      fieldData.bgsur = lastName;
      fieldData.bgfirst = forenames;
    } else {
      fieldData.brsur = lastName;
      fieldData.brfirst = forenames;
    }
    let dateRange = addDateRange(gd, "", runDate, options, marriagesDateRange);
    fieldData.wdate_lower = dateRange.fromDate;
    fieldData.wdate_upper = dateRange.toDate;
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
