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

import { RT } from "../../../base/core/record_type.mjs";

// The search form for each type of search. Values of the form's "type" select.
const formTypes = {
  Births: "birth",
  Marriages: "marriage",
  Deaths: "death",
};

// The site's year range select allows 0 to 10 years
const maxYearRange = 10;

function getTypeOfSearch(gd, typeOfSearch) {
  if (formTypes[typeOfSearch]) {
    return typeOfSearch;
  }
  // The default search (no type chosen) follows the kind of record the data came from
  switch (gd.recordType) {
    case RT.Marriage:
    case RT.MarriageRegistration:
      return "Marriages";
    case RT.Death:
    case RT.DeathRegistration:
    case RT.Burial:
      return "Deaths";
    default:
      return "Births";
  }
}

function getYearRange(options) {
  let range = Number(options.search_rootsirl_yearRange);
  if (isNaN(range) || range < 0) {
    range = 2;
  }
  return Math.min(range, maxYearRange);
}

function getSingleSpouse(gd) {
  // Only use a spouse when there is exactly one, otherwise we would not know which marriage to search for
  if (gd.spouses && gd.spouses.length == 1) {
    return gd.spouses[0];
  }
  return undefined;
}

function setNameFields(fieldData, nameObj, surnameKey, firstNameKey) {
  if (!nameObj) {
    return;
  }
  let lastName = nameObj.inferLastName();
  let firstName = nameObj.inferFirstName();
  if (lastName) {
    fieldData[surnameKey] = lastName;
  }
  if (firstName) {
    fieldData[firstNameKey] = firstName;
  }
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const options = input.options;
  const typeOfSearch = getTypeOfSearch(gd, input.typeOfSearch);

  let fieldData = {};
  let selectData = {};

  // Only the first forename is used: the registers often have more or fewer forenames than a profile,
  // and the site matches the start of the first name.
  let firstName = gd.inferFirstName();
  if (firstName) {
    fieldData.firstname = firstName;
  }

  let lastName = "";
  let year = "";

  if (typeOfSearch == "Births") {
    lastName = gd.inferLastNameAtBirth();
    year = gd.inferBirthYear();

    if (options.search_rootsirl_includeParents) {
      let parents = gd.inferParentForenamesAndLastName();
      if (parents.fatherForenames) {
        fieldData.ffirstname = parents.fatherForenames.split(" ")[0];
      }
      if (parents.fatherLastName) {
        fieldData.fsurname = parents.fatherLastName;
      }
      if (parents.motherForenames) {
        fieldData.mfirstname = parents.motherForenames.split(" ")[0];
      }
      if (parents.motherLastName) {
        fieldData.msurname = parents.motherLastName;
      }
    }
  } else if (typeOfSearch == "Deaths") {
    lastName = gd.inferLastNameAtDeath();
    year = gd.inferDeathYear();
  } else {
    // A woman is recorded at her marriage under her maiden name
    lastName = gd.personGender == "female" ? gd.inferLastNameAtBirth() : gd.inferLastName();

    let spouse = getSingleSpouse(gd);
    if (spouse) {
      if (spouse.marriageDate) {
        year = spouse.marriageDate.getYearString();
      }
      if (options.search_rootsirl_includeSpouse) {
        setNameFields(fieldData, spouse.name, "ssurname", "sfirstname");
      }
    }
  }

  if (!lastName) {
    lastName = gd.inferLastName();
  }
  if (lastName) {
    fieldData.surname = lastName;
  }

  if (year && /^\d{4}$/.test(year)) {
    fieldData.year = year;
    selectData.yearRange = String(getYearRange(options));
  } else {
    fieldData.year = "";
    selectData.yearRange = "-1"; // the blank choice
  }

  // "Standard Surname Index" includes spelling variants such as Smith/Smyth
  selectData.variants = "ssi";

  var result = {
    fieldData: fieldData,
    selectData: selectData,
    searchType: typeOfSearch,
    formType: formTypes[typeOfSearch],
  };

  return result;
}

export { buildSearchData };
