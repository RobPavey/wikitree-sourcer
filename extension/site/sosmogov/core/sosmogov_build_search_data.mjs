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

import { DateUtils } from "../../../base/core/date_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

function constrainYearToSosmogovYearRange(yearToTest) {
  // can we extract the following year range from the web site?
  const sosmogovStartYear = 1910;
  const sosmogovEndYear = 1974;
  if (yearToTest < sosmogovStartYear) {
    return sosmogovStartYear;
  } else if (yearToTest > sosmogovEndYear) {
    return sosmogovEndYear;
  }
  return yearToTest;
}

function getDateRangeFromWtsQualifier(yearNum, wtsQualifier) {
  //console.log("getDateRangeFromWtsQualifier:");
  //console.log("yearNum = " + yearNum);
  //console.log("wtsQualifier = " + wtsQualifier);
  var fromYear = yearNum;
  var toYear = yearNum;

  switch (wtsQualifier) {
    case dateQualifiers.NONE:
      fromYear = yearNum - 10;
      toYear = yearNum + 10;
      break;
    case dateQualifiers.EXACT:
      fromYear = yearNum;
      toYear = yearNum;
      break;
    case dateQualifiers.ABOUT:
      fromYear = yearNum - 10;
      toYear = yearNum + 10;
      break;
    case dateQualifiers.BEFORE:
      fromYear = yearNum - 25;
      toYear = yearNum;
      break;
    case dateQualifiers.AFTER:
      fromYear = yearNum;
      toYear = yearNum + 25;
      break;
  }

  fromYear = constrainYearToSosmogovYearRange(fromYear);
  toYear = constrainYearToSosmogovYearRange(toYear);

  //console.log("fromYear = " + fromYear);
  //console.log("toYear = " + toYear);
  return { fromYear: fromYear.toString(), toYear: toYear.toString() };
}

function getDateRange(yearString, wtsQualifier) {
  //console.log("getDateRange:");
  //console.log("yearString = " + yearString);
  //console.log("wtsQualifier = " + wtsQualifier);
  if (!yearString || yearString == "") {
    return null;
  }

  var yearNum = parseInt(yearString);

  //console.log("yearNum = " + yearNum);
  if (isNaN(yearNum) || yearNum < 500) {
    return null;
  } else {
    return getDateRangeFromWtsQualifier(yearNum, wtsQualifier);
  }
}

function buildSearchData(input) {
  const gd = input.generalizedData;

  let fieldData = {};
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

  // search page key fields are (input id=):
  //   LastName, FirstName, and MiddleName,
  //   BeginYear, BeginMonth (selectable options), EndYear, and EndMonth (selectable options),
  //   CountyName (selectable options)
  // input id=btnSearch click would submit the search, but we let the user click the search
  //   button so that the browser history is maintained and the user can click the browser
  //   back arrow to refine/change the search criteria if desired

  let firstName = gd.inferFirstName();
  //  let middleName = gd.inferMiddleName();
  let lastName = gd.inferLastName();
  let lastNameAtDeath = gd.inferLastNameAtDeath();

  let yearString = gd.inferDeathYear();
  //  let county = gd.inferCounty();

  let middleName = "";
  let countyName = "";

  //fieldData["DeathCertNameSearchType_0"] = true;
  //fieldData["LNSearchMethod_0"] = true;
  //fieldData["FNSearchMethod_0"] = true;
  //fieldData["MNSearchMethod_0"] = true;

  if (lastNameAtDeath) {
    fieldData["LastName"] = lastNameAtDeath;
  } else if (lastName) {
    fieldData["LastName"] = lastName;
  } else {
    fieldData["LastName"] = "";
  }
  //  fieldData["MiddleName"] = middleName;
  if (firstName) {
    fieldData["FirstName"] = firstName;
  } else {
    fieldData["FirstName"] = "";
  }
  fieldData["MiddleName"] = middleName;

  // addDateRange(gd, fieldData, gd.inferDeathDate(), runDate, options, deathsDateRange);
  let deathDateRange = getDateRange(gd.inferDeathYear(), gd.inferDeathDateQualifier());

  if (deathDateRange) {
    //console.log("deathDateRange.fromYear = " + deathDateRange.fromYear);
    //console.log("deathDateRange.toYear = " + deathDateRange.toYear);
    fieldData["BeginYear"] = deathDateRange.fromYear;
    fieldData["EndYear"] = deathDateRange.toYear;
  } else {
    fieldData["BeginYear"] = "";
    fieldData["EndYear"] = "";
  }

  //console.log('fieldData["BeginYear"]' + fieldData["BeginYear"]);
  //console.log('fieldData["EndYear"]' + fieldData["EndYear"]);

  //selectData["BeginMonth"] = 0;
  //selectData["EndMonth"] = 0;
  //selectData["CountyName"] = 0;

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
