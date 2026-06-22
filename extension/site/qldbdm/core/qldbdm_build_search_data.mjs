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

  //console.log("fieldData is:");
  //console.log(fieldData);

  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const options = input.options;
  const runDate = input.runDate;

  let sameCollection = false;
  let parameters = undefined;
  let vicbdmCollectionId = "";
  let collection = undefined;

  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      vicbdmCollectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "vicbdm",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (vicbdmCollectionId) {
        collection = RC.findCollection("vicbdm", vicbdmCollectionId);
        sameCollection = true;
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
  }

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  if (gd.name) {
    let givenNames = gd.name.inferForenamesPlusPreferredAndNicknames(
      options.search_vicbdm_includeMiddleName,
      options.search_vicbdm_includePrefName,
      options.search_vicbdm_includeNicknames
    );

    if (givenNames) {
      fieldData["subjectgivennames"] = givenNames;
    }
  }

  if (parameters) {
    addAppropriateSurname(gd, parameters, fieldData);
  } else {
    let lastName = gd.inferLastNames();
    if (typeOfSearch == "Births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "Deaths") {
      lastName = gd.inferLastNameAtDeath();
    }

    if (lastName) {
      fieldData["subjectfamilyname"] = lastName;
    }
  }

  if (typeOfSearch == "SameCollection") {
    if (vicbdmCollectionId) {
      if (vicbdmCollectionId == "Births") {
        fieldData["birth"] = true;
      }
      if (vicbdmCollectionId == "Deaths") {
        fieldData["death"] = true;
      }
      if (vicbdmCollectionId == "Marriages") {
        fieldData["marriage"] = true;
      }
    }
  } else if (parameters) {
    if (parameters.category == "Births" || parameters.category == "All") {
      fieldData["birth"] = true;
    }
    if (parameters.category == "Deaths" || parameters.category == "All") {
      fieldData["death"] = true;
    }
    if (parameters.category == "Marriages" || parameters.category == "All") {
      fieldData["marriage"] = true;
    }
  } else {
    if (typeOfSearch == "Births") {
      fieldData["birth"] = true;
    } else if (typeOfSearch == "Deaths") {
      fieldData["death"] = true;
    } else if (typeOfSearch == "Marriages") {
      fieldData["marriage"] = true;
    }
  }

  // date range
  let birthYear = gd.inferBirthYear();
  let deathYear = gd.inferDeathYear();
  let eventYear = gd.inferEventYear();
  if (typeOfSearch == "SameCollection" && eventYear) {
    let yearString = eventYear;
    if (yearString) {
      fieldData["historicalSearch-yearRange-from"] = yearString;
      fieldData["historicalSearch-yearRange-to"] = yearString;
    }
  } else if (birthYear && (typeOfSearch == "Births" || (parameters && parameters.category == "Births"))) {
    let qualifier = gd.inferBirthDateQualifier();
    let exactness = options.search_vicbdm_birthYearExactness;
    setYearRangeForYear(birthYear, qualifier, exactness, fieldData);
  } else if (deathYear && (typeOfSearch == "Deaths" || (parameters && parameters.category == "Deaths"))) {
    let qualifier = gd.inferDeathDateQualifier();
    let exactness = options.search_vicbdm_deathYearExactness;
    setYearRangeForYear(deathYear, qualifier, exactness, fieldData);
  } else if (typeOfSearch == "Marriages" || (parameters && parameters.category == "Marriages")) {
    const maxLifespan = Number(options.search_general_maxLifespan);
    let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
    if (range) {
      if (range.startYear) {
        let startNum = Number(range.startYear);
        if (startNum) {
          startNum += 14;
          range.startYear = startNum.toString();
        }
        fieldData["historicalSearch-yearRange-from"] = range.startYear;
      }
      if (range.endYear) {
        fieldData["historicalSearch-yearRange-to"] = range.endYear;
      }
    }
  } else {
    // all types?
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
  }

  // for same collection we can possibly set the registration number
  if (typeOfSearch == "SameCollection" && gd.collectionData) {
    let regNum = "";
    if (gd.collectionData.registrationNumber) {
      regNum = gd.collectionData.registrationNumber;
    }
    if (!regNum && gd.collectionData.referenceNumber) {
      regNum = gd.collectionData.referenceNumber;
    }
    if (regNum) {
      fieldData["historicalSearch-events-registrationNumber-number"] = regNum;
    }
  }

  return result;
}

export { buildSearchData };
