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

import { getGroYearRanges } from "../core/gro_years.mjs";
import { doSingleSearch } from "./gro_smart_search_single_search.mjs";
import {
  progressDialogResponse,
  showErrorDialog,
  showProgressDialog,
  updateProgressDialog,
  closeProgressDialog,
} from "./gro_smart_search_dialog.mjs";
import {
  searchParameters,
  setSearchParameters,
  createSearchControls,
  setSearchParametersFromControls,
  fillControlsFromSearchParameters,
  checkForAndReportErrorsAndWarnings,
} from "./gro_smart_search_parameters.mjs";
import {
  clearResults,
  addResult,
  sortPruneAndShowResults,
  clearResultsTable,
  initFilters,
  clearFilters,
} from "./gro_smart_search_results.mjs";

const maxResultCount = 1000;

function getYearRanges(type, startYear, endYear, startBirthYear, endBirthYear) {
  let groRanges = getGroYearRanges(type);
  let gapStartYear = groRanges.gapStartYear;
  let gapEndYear = groRanges.gapEndYear;

  let maxYearAgeRangeAllowed = gapStartYear - 1;

  let needAges = false;
  if (type == "deaths") {
    if (startBirthYear && endBirthYear && startBirthYear <= endBirthYear) {
      // we could use age in search but don't if the range is too large, in that
      // case it if better to not pass age to search and filter later.
      if (endBirthYear - startBirthYear < 20) {
        needAges = true;
      }
    }
  }

  let yearRanges = [];

  function addYearRange(year, range) {
    if (needAges && year <= maxYearAgeRangeAllowed) {
      // the extra -1 here is because someone could be born in 1849 but still be 0 in 1850 for example
      let minAgeForYearRange = year - range - endBirthYear - 1;
      let maxAgeForYearRange = year + range - startBirthYear;
      if (minAgeForYearRange < 0) {
        minAgeForYearRange = 0;
      }
      if (maxAgeForYearRange < 0) {
        maxAgeForYearRange = 0;
      }
      let midAge = Math.floor((minAgeForYearRange + maxAgeForYearRange) / 2);
      let neededAgeRange = maxAgeForYearRange - midAge;
      while (neededAgeRange > 10) {
        // use the lower 21 years of age range
        let minAge = minAgeForYearRange;
        let maxAge = minAgeForYearRange + 20;
        let thisMidAge = Math.floor((minAge + maxAge) / 2);
        yearRanges.push({ year: year, range: range, hasAge: true, age: thisMidAge, ageRange: 10 });

        // update for next check
        minAgeForYearRange += 20;
        midAge = Math.floor((minAgeForYearRange + maxAgeForYearRange) / 2);
        neededAgeRange = maxAgeForYearRange - midAge;
      }
      let ageRange = 0;
      if (neededAgeRange > 5) {
        ageRange = 10;
      } else if (neededAgeRange > 2) {
        ageRange = 5;
      } else if (neededAgeRange > 1) {
        ageRange = 2;
      } else if (neededAgeRange > 0) {
        ageRange = 1;
      }
      yearRanges.push({ year: year, range: range, hasAge: true, age: midAge, ageRange: ageRange });
    } else {
      yearRanges.push({ year: year, range: range });
    }
  }

  function addYearsForYearRange(rangeStartYear, rangeEndYear) {
    let year = rangeStartYear;
    while (year <= rangeEndYear) {
      if (year + 4 > rangeEndYear) {
        // partial
        if (year + 2 > rangeEndYear) {
          addYearRange(year, 0);
          year += 1;
        } else {
          addYearRange(year + 1, 1);
          year += 3;
        }
      } else {
        addYearRange(year + 2, 2);
        year += 5;
      }
    }
  }

  if (startYear < gapStartYear && endYear > gapEndYear) {
    addYearsForYearRange(startYear, gapStartYear - 1);
    addYearsForYearRange(gapEndYear + 1, endYear);
  } else {
    addYearsForYearRange(startYear, endYear);
  }

  return yearRanges;
}

async function doSearchForGivenYearAndGender(totalFetchResults, singleSearchParameters, gender) {
  function addFetchResults(result, gender) {
    if (result) {
      if (result.success && result.rows) {
        for (let row of result.rows) {
          row.personGender = gender;
          if (singleSearchParameters.type == "births") {
            row.eventType = "birth";
          } else {
            row.eventType = "death";
          }
        }

        totalFetchResults.singleSearchResults.push(result);
        totalFetchResults.resultCount += result.rows.length;
      }
    }
  }

  const year = singleSearchParameters.year;
  const yearRange = singleSearchParameters.yearRange;
  const age = singleSearchParameters.age;
  const ageRange = singleSearchParameters.ageRange;

  function updateSearchProgressMessage(pageNumber) {
    let progressMessage = "Found " + totalFetchResults.resultCount + " records.";
    progressMessage += "\nNow searching " + year + " +/-" + yearRange + ", " + gender;
    if (age) {
      progressMessage += ", age " + age + " +/-" + ageRange;
    }
    if (pageNumber) {
      progressMessage += ", page " + pageNumber;
    }
    updateProgressDialog(progressMessage);
  }

  updateSearchProgressMessage();

  singleSearchParameters.gender = gender;
  let result = await doSingleSearch(singleSearchParameters, 1);
  if (progressDialogResponse || !result.success) return false;

  if (result.rows && result.rows.length > 0) {
    if (result.resultsNumRecords >= 250) {
      // too many results to get all of them
      let message =
        "A single search returned more than 250 results. Stopping search. Please try a more specific search.";
      if (singleSearchParameters.type == "births") {
        if (singleSearchParameters.mmnMatches != "0") {
          message +=
            "\n\nNote that when MMN matching is not set to exact it will match births with no MMN or with an MMN of '-'.";
          message += " This will greatly increase the number of results.";
        }
      }
      await showErrorDialog(message);
      return false;
    }

    addFetchResults(result, gender);
    if (totalFetchResults.resultCount > maxResultCount) return true;

    if (result.resultsPageCount > 1 && result.resultsPageNumber == 1) {
      for (let pageNumber = 2; pageNumber <= result.resultsPageCount; pageNumber++) {
        updateSearchProgressMessage(pageNumber);
        result = await doSingleSearch(singleSearchParameters, pageNumber);
        if (progressDialogResponse || !result.success) return false;
        addFetchResults(result, gender);
        if (totalFetchResults.resultCount > maxResultCount) return true;
      }
    }
  }

  return true;
}

async function doSmartSearch() {
  //console.log("doSmartSearch");

  clearFilters();
  clearResultsTable();

  setSearchParametersFromControls();

  let success = await checkForAndReportErrorsAndWarnings();
  if (!success) {
    return;
  }

  let singleSearchParameters = {
    type: searchParameters.type,
    surname: searchParameters.surname,
    surnameMatches: searchParameters.surnameMatches,
    forename1: searchParameters.forename1,
    forename2: searchParameters.forename2,
    forenameMatches: searchParameters.forenameMatches,
    mmn: searchParameters.mmn,
    mmnMatches: searchParameters.mmnMatches,
    district: searchParameters.district,
  };

  let startBirthYearForYearRanges = 0;
  let endBirthYearForYearRanges = 0;
  if (searchParameters.type == "deaths") {
    startBirthYearForYearRanges = searchParameters.startBirthYear;
    endBirthYearForYearRanges = searchParameters.endBirthYear;
  }

  let yearRanges = getYearRanges(
    searchParameters.type,
    searchParameters.startYear,
    searchParameters.endYear,
    startBirthYearForYearRanges,
    endBirthYearForYearRanges
  );

  let totalFetchResults = {
    singleSearchResults: [],
    resultCount: 0,
  };

  //console.log("Starting search, yearRanges is");
  //console.log(yearRanges);

  showProgressDialog("Starting search");

  for (let range of yearRanges) {
    singleSearchParameters.year = range.year;
    singleSearchParameters.yearRange = range.range;
    if (range.hasAge) {
      singleSearchParameters.age = range.age;
      singleSearchParameters.ageRange = range.ageRange;
    }
    //console.log("fetching year " + range.year + ", yearRange, " + range.range);

    if (searchParameters.gender == "male" || searchParameters.gender == "both") {
      let result = await doSearchForGivenYearAndGender(totalFetchResults, singleSearchParameters, "male");
      if (!result) {
        break;
      }
    }
    if (searchParameters.gender == "female" || searchParameters.gender == "both") {
      let result = await doSearchForGivenYearAndGender(totalFetchResults, singleSearchParameters, "female");
      if (!result) {
        break;
      }
    }

    if (totalFetchResults.resultCount > maxResultCount) {
      let message = "Exceeded " + maxResultCount + " search results. Stopping search.";
      message += "\n\nThe search results will be incomplete.";
      message += "\n\nTry doing a more specific search.";
      await showErrorDialog(message);
      break;
    }
  }

  closeProgressDialog();

  if (progressDialogResponse == "cancel") {
    return;
  }

  //console.log("Finished search, totalFetchResults.resultCount = ", totalFetchResults.resultCount);

  // popluate searchResults from fetch results
  clearResults();
  for (let result of totalFetchResults.singleSearchResults) {
    if (result.success && result.rows) {
      for (let row of result.rows) {
        addResult(row);
      }
    }
  }

  sortPruneAndShowResults(searchParameters);

  initFilters(searchParameters);
}

function createIntro() {
  let introElement = document.getElementById("introDiv");

  // empty existing div
  while (introElement.firstChild) {
    introElement.removeChild(introElement.firstChild);
  }

  let text = "This page will compute a set of searches to do on the ";
  let linkText = "GRO Online Indexes";
  let text2 = ", and submit them for you, and collate the results.";
  let text3 = "\nThis is useful, for example, for finding all the possible birth registrations";
  text3 += " for children of a couple";
  text3 += " when you know both their surnames at birth and the dates they could have had children.";
  let text4 = "\nThe number of results is limited to " + maxResultCount + ".";

  let fragment = document.createDocumentFragment();

  let labelElement = document.createElement("label");
  labelElement.innerText = text;
  fragment.appendChild(labelElement);

  let linkElement = document.createElement("a");
  linkElement.innerText = linkText;
  linkElement.setAttribute("href", "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp");
  fragment.appendChild(linkElement);

  let label2Element = document.createElement("label");
  label2Element.innerText = text2;
  fragment.appendChild(label2Element);

  let label3Element = document.createElement("label");
  label3Element.innerText = text3;
  fragment.appendChild(label3Element);

  let label4Element = document.createElement("label");
  label4Element.innerText = text4;
  fragment.appendChild(label4Element);

  introElement.appendChild(fragment);
}

function initializePage() {
  let searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", doSmartSearch);
  }

  createIntro();
  createSearchControls("births");
  clearFilters(true);
  clearResultsTable(true);
}

function setupPageForSearchFromPopup(parameters) {
  //console.log("updatePage: parameters is :");
  //console.log(parameters);

  setSearchParameters(parameters);
  fillControlsFromSearchParameters();
}

async function getPendingSearch() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["searchData"], function (value) {
        resolve(value.searchData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");

  let searchData = await getPendingSearch();

  if (searchData) {
    //console.log("checkForPendingSearch: got searchData:");
    //console.log(searchData);

    let searchUrl = searchData.url;
    let timeStamp = searchData.timeStamp;
    let timeStampNow = Date.now();
    let timeSinceSearch = timeStampNow - timeStamp;

    //console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
    //console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
    //console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
    //console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);
    //console.log("checkForPendingSearch: document.URL is :" + document.URL);

    if (timeSinceSearch < 10000 && document.URL.endsWith(searchUrl)) {
      // clear the search data
      chrome.storage.local.remove(["searchData"], function () {
        //console.log("cleared searchData");
      });
      let parameters = searchData.parameters;
      setupPageForSearchFromPopup(parameters);
    }
  }
}

//console.log("gro_smart_search.mjs loaded");

initializePage();
checkForPendingSearch();
