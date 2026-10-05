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

// The ids of the record series in the "Collections" select on the Digital Archives name search
const recordSeriesIds = {
  births: "5",
  deaths: "4",
  marriages: "1",
};

function getFirstForename(gd) {
  // The index has separate first and middle name fields so only search on the first forename
  let forenames = gd.inferForenames();
  if (forenames) {
    return forenames.split(/\s+/)[0];
  }
  return "";
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const parameters = input.searchParameters;

  let fieldData = {};
  let selectData = {};

  let searchType = typeOfSearch;
  if (typeOfSearch == "SpecifiedParameters" && parameters) {
    searchType = parameters.category;
  }

  let lastName = gd.inferLastName();
  if (searchType == "births") {
    lastName = gd.inferLastNameAtBirth();
  } else if (searchType == "deaths") {
    lastName = gd.inferLastNameAtDeath();
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

  let firstName = getFirstForename(gd);
  if (firstName) {
    fieldData["FirstName"] = firstName;
  }
  if (lastName) {
    fieldData["LastName"] = lastName;
  }

  // 0 is "All Collections"
  let recordSeriesId = recordSeriesIds[searchType];
  selectData["NameSearchRecordSeries"] = recordSeriesId ? recordSeriesId : "0";

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
