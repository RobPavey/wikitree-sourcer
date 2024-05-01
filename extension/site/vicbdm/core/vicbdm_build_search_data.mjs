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

import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function getDateRangeFromWtsQualifier(yearNum, wtsQualifier, sameCollection) {
  var fromYear = yearNum;
  var toYear = yearNum;

  if (sameCollection) {
    wtsQualifier = dateQualifiers.EXACT;
  }

  switch (wtsQualifier) {
    case dateQualifiers.NONE:
      fromYear = yearNum - 2;
      toYear = yearNum + 2;
      break;
    case dateQualifiers.EXACT:
      fromYear = yearNum;
      // add an extra year to toYear because registration date could be after birth date
      toYear = yearNum + 1;
      break;
    case dateQualifiers.ABOUT:
      fromYear = yearNum - 5;
      toYear = yearNum + 5;
      break;
    case dateQualifiers.BEFORE:
      fromYear = yearNum - 5;
      toYear = yearNum;
      break;
    case dateQualifiers.AFTER:
      fromYear = yearNum;
      toYear = yearNum + 5;
      break;
  }

  return { fromYear: fromYear.toString(), toYear: toYear.toString() };
}

function getDateRange(yearString, exactnessOption, wtsQualifier, sameCollection) {
  if (!yearString || yearString == "") {
    return null;
  }

  if (exactnessOption == "none") {
    return null;
  }

  var yearNum = parseInt(yearString);

  if (isNaN(yearNum) || yearNum < 500) {
    return null;
  }

  if (exactnessOption == "auto") {
    return getDateRangeFromWtsQualifier(yearNum, wtsQualifier, sameCollection);
  }

  var fromYear = yearNum;
  var toYear = yearNum;

  let plusOrMinus = exactnessOption;
  if (exactnessOption == "exact") {
    plusOrMinus = 0;
  }

  if (!Number.isFinite(plusOrMinus)) {
    // should never happen
    plusOrMinus = parseInt(plusOrMinus);

    if (isNaN(plusOrMinus) || plusOrMinus > 100 || plusOrMinus < -100) {
      return null;
    }
  }

  if (plusOrMinus != undefined) {
    fromYear = fromYear - plusOrMinus;
    toYear = toYear + plusOrMinus;
  }

  return { fromYear: fromYear.toString(), toYear: toYear.toString() };
}

function addAppropriateSurname(gd, parameters, fieldData) {
  let lastName = "";
  let lastNamesArray = gd.inferPersonLastNamesArray(gd);
  if (lastNamesArray.length > 0) {
    if (lastNamesArray.length == 1) {
      lastName = lastNamesArray[0];
    } else if (lastNamesArray.length > 1) {
      for (let possibleLastName of lastNamesArray) {
        if (parameters["includeLastName_" + possibleLastName]) {
          if (lastName) {
            lastName += " ";
          }
          lastName += possibleLastName;
        }
      }
      if (!lastName) {
        lastName = lastNamesArray[0];
      }
    }
  }
  if (lastName) {
    fieldData["historicalSearch-name-familyName"] = lastName;
  }
}

function setYearRangeForYear(year, qualifier, exactness, fieldData) {
  if (!year) {
    return;
  }

  let yearRange = getDateRange(year, exactness, qualifier, false);

  if (yearRange) {
    if (yearRange.fromYear) {
      fieldData["historicalSearch-yearRange-from"] = yearRange.fromYear;
    }
    if (yearRange.toYear) {
      fieldData["historicalSearch-yearRange-to"] = yearRange.toYear;
    }
  }
}

function buildSearchData(input) {
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
    let lastName = gd.inferLastNames();
    if (typeOfSearch == "Births") {
      lastName = gd.inferLastNameAtBirth();
    } else if (typeOfSearch == "Deaths") {
      lastName = gd.inferLastNameAtDeath();
    }

    if (lastName) {
      fieldData["historicalSearch-name-familyName"] = lastName;
    }
  }

  if (typeOfSearch == "SameCollection") {
    if (vicbdmCollectionId) {
      if (vicbdmCollectionId == "Births") {
        fieldData["historicalSearch-events-birth"] = true;
      }
      if (vicbdmCollectionId == "Deaths") {
        fieldData["historicalSearch-events-death"] = true;
      }
      if (vicbdmCollectionId == "Marriages") {
        fieldData["historicalSearch-events-marriage"] = true;
      }
    }
  } else if (parameters) {
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

  // date range
  if (typeOfSearch == "SameCollection") {
    let yearString = gd.inferEventYear();
    if (yearString) {
      fieldData["historicalSearch-yearRange-from"] = yearString;
      fieldData["historicalSearch-yearRange-to"] = yearString;
    }
  } else if (typeOfSearch == "Births" || (parameters && parameters.category == "Births")) {
    let qualifier = gd.inferBirthDateQualifier();
    let exactness = options.search_vicbdm_birthYearExactness;
    setYearRangeForYear(gd.inferBirthYear(), qualifier, exactness, fieldData);
  } else if (typeOfSearch == "Deaths" || (parameters && parameters.category == "Deaths")) {
    let qualifier = gd.inferDeathDateQualifier();
    let exactness = options.search_vicbdm_deathYearExactness;
    setYearRangeForYear(gd.inferDeathYear(), qualifier, exactness, fieldData);
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

  function setAdditionalOption(key, value) {
    fieldData["historicalSearch-additionalOptions"] = true;
    fieldData[key] = value;
  }

  if (parameters && parameters.place != "<none>") {
    setAdditionalOption("historicalSearch-additionalOptions-place", parameters.place);
  }

  if (parameters && parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
    let spouse = gd.spouses[parameters.spouseIndex];
    if (spouse.name) {
      let lastName = spouse.name.inferLastName();
      let givenName = spouse.name.inferForenames();
      if (lastName) {
        setAdditionalOption("historicalSearch-additionalOptions-spouse-name-familyName", lastName);
      }
      if (givenName) {
        setAdditionalOption("historicalSearch-additionalOptions-spouse-name-firstGivenName", givenName);
      }
    }
  }

  if (gd.parents) {
    if (parameters && parameters.father && gd.parents.father && gd.parents.father.name) {
      let givenName = gd.parents.father.name.inferForenames();
      if (givenName) {
        setAdditionalOption("historicalSearch-additionalOptions-father-name-firstGivenName", givenName);
      }
      if (parameters.category == "Deaths") {
        let lastName = gd.parents.father.name.inferLastName();
        if (lastName) {
          setAdditionalOption("historicalSearch-additionalOptions-father-name-familyName", lastName);
        }
      }
    }
    if (parameters && parameters.mother && gd.parents.mother && gd.parents.mother.name) {
      let givenName = gd.parents.mother.name.inferForenames();
      if (givenName) {
        setAdditionalOption("historicalSearch-additionalOptions-mother-name-firstGivenName", givenName);
      }
      if (parameters.category == "Deaths") {
        let lastName = gd.parents.mother.name.inferLastName();
        if (lastName) {
          setAdditionalOption("historicalSearch-additionalOptions-mother-name-familyName", lastName);
        }
      }
    }
  }

  if (gd.mothersMaidenName) {
    let includeMmn = false;
    if (parameters && parameters.mmn) {
      includeMmn = true;
    } else if (options.search_vicbdm_includeMmn && (typeOfSearch == "Births" || typeOfSearch == "Deaths")) {
      includeMmn = true;
    }
    if (includeMmn) {
      setAdditionalOption("historicalSearch-additionalOptions-mother-name-familyNameAtBirth", gd.mothersMaidenName);
    }
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
