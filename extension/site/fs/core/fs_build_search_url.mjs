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

import { FsUriBuilder } from "./fs_uri_builder.mjs";
import { GeneralizedData, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function adaptCountryArrayForFamilySearch(countryArray) {

  // FS used to support multiple countries in the search but now it only allows one.

  let newCountryArray = [];   

  for (let country of countryArray) {
    if (country == "England and Wales") {
      continue;
    }
    else if (country == "United Kingdom") {
      continue;
    }
    else {
      newCountryArray.push(country);
      break;
    }
  }

  return newCountryArray;
}

function shouldAddSearchTerm(collection, termName, defaultResult) {
  let result = defaultResult;

  if (collection && collection.sites.fs.hasOwnProperty("searchTerms")) {
    if (collection.sites.fs.searchTerms.hasOwnProperty(termName)) {
      result = collection.sites.fs.searchTerms.termName;
    }
  }
  
  return result;
}

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
      toYear = yearNum;
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

  // add an extra 2 years either side because the target records that we are searching for
  // can have innaccuracies (i.e. birth date in a census)
  fromYear = fromYear - 2;
  toYear = toYear + 2;

  return { fromYear: fromYear.toString(), toYear: toYear.toString()};
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

  return { fromYear: fromYear.toString(), toYear: toYear.toString()};
}

function buildSearchUrl(buildUrlInput) {

  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  //console.log("buildSearchUrl, generalizedData is ");
  //console.log(data);

  let searchType = "record";
  if (buildUrlInput.typeOfSearch == "FamilyTree") {
    searchType = "tree";
  }
  var builder = new FsUriBuilder(searchType);

  let sameCollection = false;
  let parameters = undefined;
  let collection = undefined;

  if (buildUrlInput.typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      let fsCollectionId = RC.mapCollectionId(data.sourceOfData, data.collectionData.id, "fs",
        data.inferEventCountry(), data.inferEventYear());
      if (fsCollectionId) {
        collection = RC.findCollection("fs", fsCollectionId);
        builder.addCollection(fsCollectionId);
        sameCollection = true;
      }
    }
  }
  else if (buildUrlInput.typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection) {
        let fsCollectionId = collection.sites["fs"].id;
        builder.addCollection(fsCollectionId);
      }
    }
  }
  else if (buildUrlInput.typeOfSearch == "SpecifiedParameters") {
    parameters = buildUrlInput.searchParameters;
  }

  if (data.personGender && shouldAddSearchTerm(collection, "gender", true)) {
    builder.addGender(data.personGender);
  }

  let forenames = data.inferForenames();
  let lastNamesArray = data.inferLastNamesArrayGivenParametersAndCollection(parameters, collection);
  if (lastNamesArray.length > 0) {
    for (let lastNameIndex = 0; lastNameIndex < lastNamesArray.length; ++lastNameIndex) {
      if (!parameters || lastNamesArray.length == 1 || parameters.lastNames[lastNameIndex]) {
        builder.addName(forenames, lastNamesArray[lastNameIndex]);
      }
    }
  }

  let birthDateQualifier = data.inferBirthDateQualifier();
  if (sameCollection && data.recordType == RT.Census) {
    // although birth dates in censuses are inaccurate, if searching for the same record they should be close
    // so remove the ABOUT
    birthDateQualifier = dateQualifiers.NONE;
  }

  let birthYearRangeRange = getDateRange(data.inferBirthYear(), options.search_fs_birthYearExactness,
    birthDateQualifier, sameCollection);
  builder.addBirth(birthYearRangeRange, data.inferBirthPlace());
  let deathYearRangeRange = getDateRange(data.inferDeathYear(), options.search_fs_deathYearExactness,
    data.inferDeathDateQualifier(), sameCollection);
  builder.addDeath(deathYearRangeRange, data.inferDeathPlace());

  if (data.parents && data.parents.father && data.parents.father.name) {
    // for now we don't include the father unless it is a specified parameter
    if ((parameters && parameters.father) || sameCollection) {
      let father = data.parents.father;
      builder.addFather(father.name.inferForenames(), father.name.inferLastName());
    }
  }

  if (data.parents && data.parents.mother && data.parents.mother.name) {
    // for now we don't include the mother unless it is a specified parameter
    if ((parameters && parameters.mother) || sameCollection) {
      let mother = data.parents.mother;
      builder.addMother(mother.name.inferForenames(), mother.name.inferLastName());
    }
  }

  if (data.spouses) {
    for (let spouseIndex = 0; spouseIndex < data.spouses.length; ++spouseIndex) {
      let spouse = data.spouses[spouseIndex];

      if (parameters && !parameters.spouses[spouseIndex]) {
        continue;
      }

      if (spouse.marriageDate || spouse.marriagePlace) {
        let marriageYear = "";
        let marriagePlace = "";
        if (spouse.marriageDate) {
          marriageYear = spouse.marriageDate.getYearString();
        }
        if (spouse.marriagePlace) {
          marriagePlace = spouse.marriagePlace.placeString;
        }

        let marriageYearRange = getDateRange(marriageYear, options.search_fs_marriageYearExactness,
          dateQualifiers.NONE, sameCollection);
        builder.addMarriage(marriageYearRange, marriagePlace);
      }

      if (spouse.name) {
        // if searching for a census record do not add the surname of the spouse
        // since, if it is a wife their last name will no be different
        let spouseLastName = spouse.name.inferLastName();
        if (data.personGender == "male") {
          if (sameCollection) {
            if (data.recordType == RT.Census) {
              spouseLastName = "";
            }
          }
          else if (collection && !collection.isMarriage) {
            spouseLastName = "";
          }
        }
        builder.addSpouse(spouse.name.inferForenames(), spouseLastName);
      }
    }
  }

  if (data.recordType == RT.Census) {
    if (data.eventPlace || data.eventDate) {
      let residenceYearRange = getDateRange(data.inferEventYear(), options.search_fs_residenceYearExactness,
        dateQualifiers.NONE, sameCollection);
      builder.addResidence(residenceYearRange, data.inferEventPlace());
    }
  }

  // Note that adding multiple countries like England & Walse sometimes gets no results
  // For example in England and Wales Birth Index. So if there is a collection then do not add
  // countries at all since all collections tend to be specific to a country (or a few)
  if (!collection && searchType != "tree") {
    let countryArray = data.inferCountries();
    if (countryArray.length > 0) {
      let fsCountryArray = adaptCountryArrayForFamilySearch(countryArray);
      for (let country of fsCountryArray) {
        builder.addCountry(country);
      }
    }
  }

  if (parameters && parameters.type != "all") {
    builder.addRecordType(parameters.type);
  }

  if (buildUrlInput.typeOfSearch == "SameCollection") {
    if (collection) {
      builder.addMaritalStatus(data.maritalStatus);
      builder.addRelationship(data.relationshipToHead);
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
      'url' : url,
  }

  return result;
}

export { buildSearchUrl };
