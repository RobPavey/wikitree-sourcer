/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { GeneralizedData, GD, dateQualifiers, NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
// Births:
// Search From Date must be later than 31/12/1839.
// Search To Date must not be later than 19/08/1974.
// Deaths:
// Search From Date must be later than 31/12/1839.
// Marriages:
// Search From Date must be later than 31/12/1839.
// Search To Date must not be later than 19/08/1949.

const birthsDateRange = {
  from: { day: 1, month: 1, year: 1800 },
  to: { day: 31, month: 12, year: 1929 },
};
const deathsDateRange = {
  from: { day: 1, month: 1, year: 1815 },
  to: { day: 31, month: 12, year: 1974 },
};
const marriagesDateRange = {
  from: { day: 1, month: 1, year: 1847 },
  to: { day: 31, month: 12, year: 1974 },
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

  let fromDate = { day: 1, month: 1, year: 1658 };
  let toDate = { day: 31, month: 12, year: 2014 };

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
  console.log("buildSearchData, input is:");
  console.log(input);

  const gd = input.generalizedData;
  const options = input.options;
  const typeOfSearch = "General";
  const runDate = input.runDate;


  let fieldData = {
    utf8: true,
  };
// we only require selectData if there are select controls to fill
// which will not br needed until we add search from the Vital Records search page
  let selectData = {};

  //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
  // Add code here to populate the search data that is used to fill out the search form
  // The fieldData typically will be used for text fields
  // while the selectData will be for select controls
  // In these structures use the names of the elements in the search form that need to be
  // filled
  // For examples see:
  // - extension/site/vicbdm/core/vicbdm_build_search_data.mjs
  // - extension/site/nswbdm/core/nswbdm_build_search_data.mjs
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  let lastName = gd.inferLastName();
  //console.log("buildSearchData, lastName is:", lastName);
  //console.log(lastName);
  if (lastName) {
    fieldData["ContentPlaceHolder1_ContentPlaceHolder1_textboxFamilyName"] = lastName;
  }
 let forenames = gd.inferForenames();
  if (forenames) {
    fieldData["ContentPlaceHolder1_ContentPlaceHolder1_textboxGivenNames"] = forenames;
  }
 // addStartAndEndYearFromBirthAndDeath(gd, options, fieldData, 0);
 
  let panbBirthYear = gd.inferBirthYear();
  //console.log("buildSearchData, panbBirthYear is:");
  //console.log(panbBirthYear);
  if  (panbBirthYear) {
    panbBirthYear = Number(panbBirthYear) -2;
    if(panbBirthYear > 1658) {
     fieldData["ContentPlaceHolder1_ContentPlaceHolder1_textboxYearFrom"] = panbBirthYear;
    }
  }

  let panbDeathYear = gd.inferDeathYear();
  //console.log("buildSearchData, panbDeathYear is:");
  //console.log(panbDeathYear);
  if  (panbDeathYear) {
    panbDeathYear = Number(panbDeathYear) + 10;
    if( /*panbDeathYear > 1700 &&*/ panbDeathYear < 2014) {
     fieldData["ContentPlaceHolder1_ContentPlaceHolder1_textboxYearTo"] = panbDeathYear;
    }
  }
  // console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
