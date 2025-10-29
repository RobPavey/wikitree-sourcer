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

  // search page key fields are: input id=
  //   LastName, FirstName, and MiddleName,
  //   BeginYear, BeginMonth (selectable options), EndYear, and EndMonth (selectable options),
  //   CountyName (selectable options),
  //   and input id=btnSearch click will submit the search

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
  if (yearString) {
    fieldData["BeginYear"] = yearString;
    fieldData["EndYear"] = yearString;
  } else {
    fieldData["BeginYear"] = "";
    fieldData["EndYear"] = "";
  }

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
