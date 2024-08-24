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
import { NameUtils } from "../../../base/core/name_utils.mjs";

// Births:
// Earliest record seems to be about 1788.
// Search To Date must not be later than 100 years ago.
// Deaths:
// Earliest record seems to be about 1787.
// Search From Date must be later than 1994. Maybe 30 years ago.
// Marriages:
// Earliest record seems to be about 1787.
// Search To Date must not be later than 1974. Maybe 50 years ago.

const birthsDateRange = {
  from: { day: 1, month: 1, year: 1787 },
  toYearsAgo: 100,
};
const deathsDateRange = {
  from: { day: 1, month: 1, year: 1787 },
  toYearsAgo: 30,
};
const marriagesDateRange = {
  from: { day: 1, month: 1, year: 1787 },
  toYearsAgo: 50,
};

function constrainDate(date, allowedDateRange, runDate) {
  if (allowedDateRange) {
    let from = allowedDateRange.from;
    let toYearsAgo = allowedDateRange.toYearsAgo;

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

    if (toYearsAgo && runDate) {
      let endDate = runDate;
      endDate.setFullYear(endDate.getFullYear() - toYearsAgo);
      endDate.setDate(endDate.getDate() - 1);

      if (date.year > endDate.getFullYear()) {
        date.year = endDate.getFullYear();
        date.month = endDate.getMonth();
        date.day = endDate.getDate();
      } else if (date.year == endDate.getFullYear()) {
        if (date.month > endDate.getMonth()) {
          date.month = endDate.getMonth();
          date.day = endDate.getDate();
        } else if (date.month == endDate.getMonth()) {
          if (date.day > endDate.getDate()) {
            date.day = endDate.getDate();
          }
        }
      }
    }
  }

  return date;
}

function addDateRange(gd, fieldData, dateString, runDate, options, allowedDateRange) {
  const maxLifespan = Number(options.search_general_maxLifespan);

  let exactness = 2;
  const exactnessOption = options.search_nswbdm_dateExactness;
  if (exactnessOption == "exact") {
    exactness = 0;
  } else if (/^\d+$/.test(exactnessOption)) {
    exactness = Number(exactnessOption);
  }

  let fromDate = { day: 1, month: 1, year: 1877 };
  let toDate = { day: 31, month: 12, year: 1974 };

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

  fromDate = constrainDate(fromDate, allowedDateRange, runDate);
  toDate = constrainDate(toDate, allowedDateRange, runDate);

  fieldData["dateOfEvent:switchGroup:range:dateFrom:day"] = fromDate.day;
  fieldData["dateOfEvent:switchGroup:range:dateFrom:month"] = fromDate.month;
  fieldData["dateOfEvent:switchGroup:range:dateFrom:year"] = fromDate.year;

  fieldData["dateOfEvent:switchGroup:range:dateTo:day"] = toDate.day;
  fieldData["dateOfEvent:switchGroup:range:dateTo:month"] = toDate.month;
  fieldData["dateOfEvent:switchGroup:range:dateTo:year"] = toDate.year;
}

function addParentGivenNames(gd, fieldData) {
  if (gd.parents) {
    if (gd.parents.father && gd.parents.father.name) {
      let fatherFirstName = gd.parents.father.name.inferFirstName();
      if (fatherFirstName) {
        fieldData["fatherGivenName:edit"] = fatherFirstName;
      }
      let fatherOtherGivenNames = gd.parents.father.name.inferMiddleNames();
      if (fatherOtherGivenNames) {
        fieldData["fatherOtherNames:edit"] = fatherOtherGivenNames;
      }
    }
    if (gd.parents.mother && gd.parents.mother.name) {
      let motherFirstName = gd.parents.mother.name.inferFirstName();
      if (motherFirstName) {
        fieldData["motherGivenName:edit"] = motherFirstName;
      }
      let motherOtherGivenNames = gd.parents.mother.name.inferMiddleNames();
      if (motherOtherGivenNames) {
        fieldData["motherOtherNames:edit"] = motherOtherGivenNames;
      }
    }
  }
}

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const gd = input.generalizedData;
  const options = input.options;
  const typeOfSearch = input.typeOfSearch;
  const runDate = input.runDate;

  let fieldData = {};

  let firstName = gd.inferFirstName();
  let otherGivenNames = gd.inferMiddleNames();
  let lastName = gd.inferLastName();

  let gender = gd.personGender;
  if (!gender) {
    let predictedGender = NameUtils.predictGenderFromGivenNames(firstName);
    if (predictedGender) {
      gender = predictedGender;
    } else {
      predictedGender = NameUtils.predictGenderFromGivenNames(otherGivenNames);
      if (predictedGender) {
        gender = predictedGender;
      } else {
        gender = male;
      }
    }
  }

  let baseName = "";
  if (typeOfSearch == "Births") {
    baseName = "searchSwitch:birthContainer:birthIdSearchSwitch:birthNameSearchContainer:";

    fieldData["subjectName:familyName:edit"] = lastName;
    fieldData["subjectName:givenName:edit"] = firstName;
    fieldData["subjectName:otherNames:edit"] = otherGivenNames;

    addParentGivenNames(gd, fieldData);

    addDateRange(gd, fieldData, gd.inferBirthDate(), runDate, options, birthsDateRange);
  } else if (typeOfSearch == "Deaths") {
    baseName = "searchSwitch:deathContainer:deathIdSearchSwitch:deathNameSearchContainer:";

    fieldData["subjectName:familyName:edit"] = lastName;
    fieldData["subjectName:givenName:edit"] = firstName;
    fieldData["subjectName:otherNames:edit"] = otherGivenNames;

    addParentGivenNames(gd, fieldData);

    addDateRange(gd, fieldData, gd.inferDeathDate(), runDate, options, deathsDateRange);
  } else {
    baseName = "searchSwitch:marriageContainer:marriageIdSearchSwitch:marriageNameSearchContainer:";

    if (gender == "male") {
      fieldData["groomName:familyName:edit"] = lastName;
      fieldData["groomName:givenName:edit"] = firstName;
      fieldData["groomName:otherNames:edit"] = otherGivenNames;
    } else {
      fieldData["brideName:familyName:edit"] = lastName;
      fieldData["brideName:givenName:edit"] = firstName;
      fieldData["brideName:otherNames:edit"] = otherGivenNames;
    }

    if (gd.spouses && gd.spouses.length > 0) {
      let spouse = gd.spouses[0];
      if (spouse.name) {
        let spouseLastName = spouse.name.inferLastName();
        if (spouseLastName) {
          if (gender == "male") {
            fieldData["brideName:familyName:edit"] = spouseLastName;
          } else {
            fieldData["groomName:familyName:edit"] = spouseLastName;
          }
        }
        let spouseFirstName = spouse.name.inferFirstName();
        if (spouseFirstName) {
          if (gender == "male") {
            fieldData["brideName:givenName:edit"] = spouseFirstName;
          } else {
            fieldData["groomName:givenName:edit"] = spouseFirstName;
          }
        }
        let spouseOtherGivenNames = spouse.name.inferMiddleNames();
        if (spouseOtherGivenNames) {
          if (gender == "male") {
            fieldData["brideName:otherNames:edit"] = spouseOtherGivenNames;
          } else {
            fieldData["groomName:otherNames:edit"] = spouseFirstName;
          }
        }
      }
    }
    addDateRange(gd, fieldData, "", runDate, options, marriagesDateRange);
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    baseName: baseName,
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
