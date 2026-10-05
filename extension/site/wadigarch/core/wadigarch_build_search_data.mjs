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

import { SearchHelper } from "../../../base/core/search_helper.mjs";

// The ids of the record series in the "Record Series" select on the Digital Archives detailed search.
// The form fields that are shown depend on the record series selected.
const recordSeriesIds = {
  births: "5",
  deaths: "4",
  marriages: "1",
  divorces: "44",
};

function getFirstForename(nameObj) {
  // The index has separate first and middle name fields so only search on the first forename
  if (nameObj) {
    let forenames = nameObj.inferForenames();
    if (forenames) {
      return forenames.split(/\s+/)[0];
    }
  }
  return "";
}

function addNameFields(fieldData, prefix, firstName, lastName) {
  if (firstName) {
    fieldData[prefix + "FirstName"] = firstName;
  }
  if (lastName) {
    fieldData[prefix + "LastName"] = lastName;
  }
}

function getPrimaryLastName(gd, searchType, parameters) {
  let lastName = gd.inferLastName();
  if (searchType == "births") {
    lastName = gd.inferLastNameAtBirth();
  } else if (searchType == "deaths") {
    lastName = gd.inferLastNameAtDeath();
  } else if (searchType == "marriages" && gd.personGender == "female") {
    // the name on a marriage record is almost always the maiden name
    let nameAtBirth = gd.inferLastNameAtBirth();
    if (nameAtBirth) {
      lastName = nameAtBirth;
    }
  }

  if (parameters) {
    let lastNamesArray = gd.inferPersonLastNamesArray(gd);
    if (lastNamesArray.length > 0) {
      if (lastNamesArray.length == 1) {
        lastName = lastNamesArray[0];
      } else if (lastNamesArray.length > parameters.lastNameIndex) {
        lastName = lastNamesArray[parameters.lastNameIndex];
      }
    }
  }
  return lastName;
}

function getSpouse(gd, parameters) {
  if (parameters && parameters.spouseIndex != undefined && parameters.spouseIndex != -1 && gd.spouses) {
    if (gd.spouses.length > parameters.spouseIndex) {
      return gd.spouses[parameters.spouseIndex];
    }
  }
}

function addYearRange(fieldData, range) {
  if (range && range.startYear) {
    fieldData["StartYear"] = range.startYear;
    if (range.endYear && range.endYear != range.startYear) {
      fieldData["EndYear"] = range.endYear;
    }
  }
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const parameters = input.searchParameters;
  const options = input.options;
  const runDate = input.runDate;
  let helper = new SearchHelper(gd, options, runDate);

  let searchType = typeOfSearch;
  if (typeOfSearch == "SpecifiedParameters" && parameters) {
    searchType = parameters.category;
  }
  if (!recordSeriesIds[searchType]) {
    searchType = "births";
  }

  let fieldData = {};
  // The "RecordSeries" select has to be set first. This loads the rest of the form.
  let selectData = { RecordSeries: recordSeriesIds[searchType] };

  const birthExactness = options.search_wadigarch_birthYearExactness;
  const deathExactness = options.search_wadigarch_deathYearExactness;

  let firstName = getFirstForename(gd.name);
  let lastName = getPrimaryLastName(gd, searchType, parameters);

  if (searchType == "births") {
    addNameFields(fieldData, "", firstName, lastName);

    let range = helper.getYearRangeForBirth(birthExactness);
    if (!range) {
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }
    addYearRange(fieldData, range);

    if (parameters && gd.parents) {
      if (parameters.father && gd.parents.father && gd.parents.father.name) {
        let father = gd.parents.father.name;
        addNameFields(fieldData, "Father", getFirstForename(father), father.inferLastName());
      }
      if (parameters.mother && gd.parents.mother && gd.parents.mother.name) {
        let mother = gd.parents.mother.name;
        addNameFields(fieldData, "Mother", getFirstForename(mother), mother.inferLastName());
      }
    }
  } else if (searchType == "deaths") {
    addNameFields(fieldData, "", firstName, lastName);

    let range = helper.getYearRangeForDeath(deathExactness);
    if (!range) {
      range = helper.getYearRangeForLifespan(birthExactness, deathExactness);
    }
    addYearRange(fieldData, range);
  } else {
    // Marriages and divorces have two people. For marriages they are the groom and the bride.
    // For divorces they are Spouse A and Spouse B.
    let personPrefix = "SpouseA";
    let spousePrefix = "SpouseB";
    if (searchType == "marriages") {
      personPrefix = "Groom";
      spousePrefix = "Bride";
      if (gd.personGender == "female") {
        personPrefix = "Bride";
        spousePrefix = "Groom";
      }
    }

    addNameFields(fieldData, personPrefix, firstName, lastName);

    let spouse = getSpouse(gd, parameters);
    if (spouse && spouse.name) {
      addNameFields(fieldData, spousePrefix, getFirstForename(spouse.name), spouse.name.inferLastName());
    }

    const earliestMarriageAge = 14;
    addYearRange(fieldData, helper.getYearRangeForLifespan(birthExactness, deathExactness, earliestMarriageAge));
  }

  var result = {
    fieldData: fieldData,
    selectData: selectData,
    searchType: searchType,
  };

  return result;
}

export { buildSearchData };
