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

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;

  let fieldData = {};
  // let selectData = {};

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

  let firstName = gd.inferFirstName();
  //  let middleName = gd.inferMiddleName();  don't use middle name to search
  let lastName = gd.inferLastName();
  let lastNameAtBirth = gd.inferLastNameAtBirth();
  let lastNameAtDeath = gd.inferLastNameAtDeath();
  // console.log("ilsosgov: firstName = "+firstName+", lastName = "+lastName+", lastNameAtDeath = "+lastNameAtDeath);

  //  let county = gd.inferCounty();

  // use the html form input ids for the search fields as fieldData keys
  if (typeOfSearch == "deathsPre1916") {
    if (lastNameAtDeath) {
      fieldData["decedent1"] = lastNameAtDeath;
    } else if (lastName) {
      fieldData["decedent1"] = lastName;
    } else {
      fieldData["decedent1"] = "";
    }
    if (firstName) {
      fieldData["decedent1"] += ", " + firstName;
    }
  } else if (typeOfSearch == "deathsPost1915") {
    if (lastNameAtDeath) {
      fieldData["lname1"] = lastNameAtDeath;
    } else if (lastName) {
      fieldData["lname1"] = lastName;
    } else {
      fieldData["lname1"] = "";
    }

    if (firstName) {
      fieldData["fname1"] = firstName;
    } else {
      fieldData["fname1"] = "";
    }

    let middleName = ""; // use empty middle name for search
    fieldData["mname1"] = middleName;
  } else if (typeOfSearch == "marriagesByGroom") {
    if (lastName) {
      fieldData["gname1"] = lastName;
    } else {
      fieldData["gname1"] = "";
    }
    if (firstName) {
      fieldData["gname1"] += ", " + firstName;
    }
  } else if (typeOfSearch == "marriagesByBride") {
    if (lastName) {
      fieldData["bname1"] = lastNameAtBirth;
    } else {
      fieldData["bname1"] = "";
    }
    if (firstName) {
      fieldData["bname1"] += ", " + firstName;
    }
  }
  //console.log("fieldData is:");
  //console.log(fieldData);

  let result = {
    fieldData: fieldData,
    // selectData: selectData,
  };

  return result;
}

export { buildSearchData };
