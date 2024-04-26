/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function addAppropriateSurname(gd, parameters, fieldData) {
  let lastName = "";
  let lastNamesArray = gd.inferPersonLastNamesArray(gd);
  if (lastNamesArray.length > 0) {
    if (lastNamesArray.length == 1) {
      lastName = lastNamesArray[0];
    } else if (lastNamesArray.length > parameters.lastNameIndex) {
      lastName = lastNamesArray[parameters.lastNameIndex];
    }
  }
  if (lastName) {
    fieldData["historicalSearch-name-familyName"] = lastName;
  }
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const parameters = input.searchParameters;
  const options = input.options;
  const runDate = input.runDate;

  let fieldData = {};
  let selectData = {};

  let givenNamesArray = [];

  function addGivenNames(newNames) {
    if (newNames) {
      let newNamesArray = newNames.split(" ");
      for (let newName of newNamesArray) {
        newName = newName.trim();
        if (!givenNamesArray.includes(newName)) {
          givenNamesArray.push(newName);
        }
      }
    }
  }

  if (options.search_vicbdm_includeMiddleName) {
    addGivenNames(gd.inferForenames());
  } else {
    addGivenNames(gd.inferFirstName());
  }

  if (options.search_vicbdm_includePrefName) {
    if (gd.name) {
      addGivenNames(gd.name.prefNames);
    }
  }

  if (options.search_vicbdm_includeNicknames) {
    if (gd.name) {
      addGivenNames(gd.name.nicknames);
    }
  }

  if (givenNamesArray.length > 0) {
    let givenNames = givenNamesArray.join(" ");
    fieldData["historicalSearch-name-firstGivenName"] = givenNames;
  }

  if (parameters) {
    addAppropriateSurname(gd, parameters, fieldData);
  } else {
    let lastName = gd.inferLastName();
    if (typeOfSearch == "Births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "Deaths") {
      lastName = gd.inferLastNameAtDeath();
    }

    if (lastName) {
      fieldData["historicalSearch-name-familyName"] = lastName;
    }
  }

  if (parameters) {
    if (parameters.category == "Births" || parameters.category == "All") {
      fieldData["historicalSearch-events-birth"] = true;
    }
    if (parameters.category == "Deaths" || parameters.category == "All") {
      fieldData["historicalSearch-events-death"] = true;
    }
    if (parameters.category == "Marriages" || parameters.category == "All") {
      fieldData["historicalSearch-events-marriage"] = true;
    }
  } else {
    if (typeOfSearch == "Births") {
      fieldData["historicalSearch-events-birth"] = true;
    } else if (typeOfSearch == "Deaths") {
      fieldData["historicalSearch-events-death"] = true;
    } else if (typeOfSearch == "Marriages") {
      fieldData["historicalSearch-events-marriage"] = true;
    }
  }

  const maxLifespan = Number(options.search_general_maxLifespan);
  let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
  if (range) {
    if (range.startYear) {
      fieldData["historicalSearch-yearRange-from"] = range.startYear;
    }
    if (range.endYear) {
      fieldData["historicalSearch-yearRange-to"] = range.endYear;
    }
  }

  function setAdditionalOption(key, value) {
    fieldData["historicalSearch-additionalOptions"] = true;
    fieldData[key] = value;
  }

  if (parameters && parameters.place != "<none>") {
    setAdditionalOption("historicalSearch-additionalOptions-place", parameters.place);
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
