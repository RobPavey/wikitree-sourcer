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
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function adaptCountryForFamilySearch(country) {
  if (!country) {
    return "";
  }

  if (country == "England and Wales") {
    return "";
  } else if (country == "United Kingdom") {
    return "";
  }

  return country;
}

function shouldAddSearchTerm(collection, termName, defaultResult, options) {
  let result = defaultResult;

  if (collection && collection.sites.fs.hasOwnProperty("searchTerms")) {
    if (collection.sites.fs.searchTerms.hasOwnProperty(termName)) {
      result = collection.sites.fs.searchTerms.termName;
    }
  } else {
    if (options) {
      const optionName = "search_fs_" + termName + "SearchTerm";
      if (options.hasOwnProperty(optionName)) {
        result = options[optionName];
      }
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

  let today = new Date();
  let thisYear = today.getFullYear();
  if (toYear > thisYear) {
    toYear = thisYear;
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

  let today = new Date();
  let thisYear = today.getFullYear();
  if (toYear > thisYear) {
    toYear = thisYear;
  }

  return { fromYear: fromYear.toString(), toYear: toYear.toString() };
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;
  let typeOfSearch = buildUrlInput.typeOfSearch;

  //console.log("buildSearchUrl, generalizedData is ");
  //console.log(gd);

  let searchType = "record";
  if (typeOfSearch == "FamilyTree") {
    searchType = "tree";
  } else if (typeOfSearch == "FullText") {
    searchType = "fullText";
  }
  var builder = undefined;

  if (typeOfSearch == "FullText") {
    var builder = new FsUriBuilder(searchType);
    builder.addFullName(gd.inferFullName());
  } else {
    let sameCollection = false;
    let parameters = undefined;
    let collection = undefined;
    let fsCollectionId = undefined;

    if (buildUrlInput.typeOfSearch == "SameCollection") {
      if (gd.collectionData && gd.collectionData.id) {
        fsCollectionId = RC.mapCollectionId(
          gd.sourceOfData,
          gd.collectionData.id,
          "fs",
          gd.inferEventCountry(),
          gd.inferEventYear()
        );
        if (fsCollectionId) {
          collection = RC.findCollection("fs", fsCollectionId);
          sameCollection = true;
        }
      }
    } else if (typeOfSearch == "SpecifiedCollection") {
      let searchParams = buildUrlInput.searchParameters;
      if (searchParams.collectionWtsId) {
        collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
        if (collection) {
          fsCollectionId = collection.sites["fs"].id;
        }
      }
    } else if (typeOfSearch == "SpecifiedParameters") {
      parameters = buildUrlInput.searchParameters;
    }

    builder = new FsUriBuilder(searchType, fsCollectionId);

    // Add person ID to search URI to enable improved "Attach to Tree" in FamilySearch results.
    if (gd.sourceType === "profile" && gd.personRepoRef) {
      builder.addSearchParameter("treeref", gd.personRepoRef);
    }

    if (gd.inferPersonGender() && shouldAddSearchTerm(collection, "gender", true, options)) {
      builder.addGender(gd.inferPersonGender());
    }

    let forenames = gd.inferForenames();
    let lastNamesArray = gd.inferLastNamesArrayGivenParametersAndCollection(parameters, collection);
    if (lastNamesArray.length > 0) {
      for (let lastNameIndex = 0; lastNameIndex < lastNamesArray.length; ++lastNameIndex) {
        if (!parameters || lastNamesArray.length == 1 || parameters.lastNames[lastNameIndex]) {
          builder.addName(forenames, lastNamesArray[lastNameIndex]);
        }
      }
    } else {
      builder.addName(forenames, "");
    }

    let birthDateQualifier = gd.inferBirthDateQualifier();
    if (sameCollection && gd.recordType == RT.Census) {
      // although birth dates in censuses are inaccurate, if searching for the same record they should be close
      // so remove the ABOUT
      birthDateQualifier = dateQualifiers.NONE;
    }

    if (shouldAddSearchTerm(collection, "birth", true, options)) {
      let birthYearRangeRange = getDateRange(
        gd.inferBirthYear(),
        options.search_fs_birthYearExactness,
        birthDateQualifier,
        sameCollection
      );
      builder.addBirth(birthYearRangeRange, gd.inferBirthPlace());
    }
    if (shouldAddSearchTerm(collection, "death", true, options)) {
      let deathYearRangeRange = getDateRange(
        gd.inferDeathYear(),
        options.search_fs_deathYearExactness,
        gd.inferDeathDateQualifier(),
        sameCollection
      );
      builder.addDeath(deathYearRangeRange, gd.inferDeathPlace());
    }

    if (shouldAddSearchTerm(collection, "parents", true, options)) {
      if (gd.parents && gd.parents.father && gd.parents.father.name) {
        // for now we don't include the father unless it is a specified parameter
        if ((parameters && parameters.father) || sameCollection) {
          let father = gd.parents.father;
          builder.addFather(father.name.inferForenames(), father.name.inferLastName());
        }
      }

      if (gd.parents && gd.parents.mother && gd.parents.mother.name) {
        // for now we don't include the mother unless it is a specified parameter
        if ((parameters && parameters.mother) || sameCollection) {
          let mother = gd.parents.mother;
          builder.addMother(mother.name.inferForenames(), mother.name.inferLastName());
        }
      }
    }

    if (shouldAddSearchTerm(collection, "spouse", true, options)) {
      if (gd.spouses) {
        for (let spouseIndex = 0; spouseIndex < gd.spouses.length; ++spouseIndex) {
          let spouse = gd.spouses[spouseIndex];

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
            let marriageYearRange = getDateRange(
              marriageYear,
              options.search_fs_marriageYearExactness,
              dateQualifiers.NONE,
              sameCollection
            );
            builder.addMarriage(marriageYearRange, marriagePlace);
          }

          if (spouse.name) {
            // if searching for a census record do not add the surname of the spouse
            // since, if it is a wife their last name will no be different
            let spouseLastName = spouse.name.inferLastName();
            if (gd.inferPersonGender() == "male") {
              if (sameCollection) {
                if (gd.recordType == RT.Census) {
                  spouseLastName = "";
                }
              } else if (collection && !collection.isMarriage) {
                spouseLastName = "";
              }
            }
            builder.addSpouse(spouse.name.inferForenames(), spouseLastName);
          }
        }
      }
    }

    if (gd.recordType == RT.Census) {
      if (gd.eventPlace || gd.eventDate) {
        let residenceYearRange = getDateRange(
          gd.inferEventYear(),
          options.search_fs_residenceYearExactness,
          dateQualifiers.NONE,
          sameCollection
        );
        builder.addResidence(residenceYearRange, gd.inferEventPlace());
      }
    }

    // Note that adding multiple countries like England & Wales sometimes gets no results
    // For example in England and Wales Birth Index. So if there is a collection then do not add
    // countries at all since all collections tend to be specific to a country (or a few)
    if (!collection && searchType != "tree") {
      let countryArray = gd.inferCountries();
      if (countryArray.length == 1) {
        let fsCountry = adaptCountryForFamilySearch(countryArray[0]);
        builder.addCountry(fsCountry);
      } else if (countryArray.length > 1) {
        // FS no longer supports more than one country to focus on, so we have to decide which one to
        // use.
        let haveAddedCountry = false;
        if (gd.sourceType == "record") {
          if (gd.collectionData && gd.collectionData.id) {
            let collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
            if (collection && collection.country) {
              let fsCountry = adaptCountryForFamilySearch(collection.country);
              if (fsCountry) {
                builder.addCountry(fsCountry);
                haveAddedCountry = true;
              }
            }
          }
        }
        if (!haveAddedCountry) {
          let fsCountry = adaptCountryForFamilySearch(countryArray[0]);
          builder.addCountry(fsCountry);
        }
      }
    }

    if (parameters && parameters.type != "all") {
      builder.addRecordType(parameters.type);
    }

    if (typeOfSearch == "SameCollection") {
      if (collection) {
        builder.addMaritalStatus(gd.maritalStatus);
        builder.addRelationship(gd.relationshipToHead);
      }
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
