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

import { GroUriBuilder } from "../core/gro_uri_builder.mjs";
import { extractFirstRowForBirth, extractFirstRowForDeath, extractSecondRow } from "../core/gro_extract_data.mjs";

// Avoid creating this for every search
var domParser = new DOMParser();

var searchParameters;

function extractAllRowsData(document, firstRowFunction, secondRowFunction, result) {
  let resultsNode = document.querySelector("[name='Results']");
  if (!resultsNode) {
    return;
  }

  let resultsTable = resultsNode.closest("TABLE");
  if (!resultsTable) {
    return;
  }

  // look for the selected result
  let inputElements = resultsTable.querySelectorAll("input[type=radio]");

  // if no results bail out
  if (inputElements.length == 0) {
    return;
  }

  result.rows = [];

  for (let inputElement of inputElements) {
    let rowResult = {};
    firstRowFunction(inputElement, rowResult);
    secondRowFunction(inputElement, rowResult);

    result.rows.push(rowResult);
  }

  result.success = true;
}

function extractAllRowData(document) {
  var result = {
    success: false,
  };

  // first check whether these are births or deaths
  const isBirth = document.querySelector("#EW_Birth:checked");
  const isDeath = document.querySelector("#EW_Death:checked");

  if (isBirth) {
    extractAllRowsData(document, extractFirstRowForBirth, extractSecondRow, result);
  } else if (isDeath) {
    extractAllRowsData(document, extractFirstRowForDeath, extractSecondRow, result);
  }

  result.success = true;

  //console.log(result);

  return result;
}

async function doSearchPost(url, postData) {
  //console.log('doFetch, document.location is: ' + document.location);

  let fetchUrl = url;

  console.log("doFetch, fetchUrl is: " + fetchUrl);

  let fetchOptionsHeaders = {
    accept: "application/x-gedcomx-v1+json, application/json",
    "accept-language": "en",
    //"sec-fetch-dest": "empty",
    //"sec-fetch-mode": "cors",
    //"sec-fetch-site": "same-origin",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  let fetchOptions = {
    headers: fetchOptionsHeaders,
    body: postData,
    method: "POST",
  };

  try {
    let response = await fetch(fetchUrl, fetchOptions);

    //console.log("doFetch, response.status is: " + response.status);

    if (response.status !== 200) {
      //console.log("Looks like there was a problem. Status Code: " + response.status);
      //console.log("Fetch URL is: " + fetchUrl);
      return {
        success: false,
        errorCondition: "FetchError",
        status: response.status,
      };
    }

    let htmlText = await response.text();

    //console.log("doFetch: response text is:");
    //console.log(htmlText);

    let doc = domParser.parseFromString(htmlText, "text/html");
    return doc;
  } catch (error) {
    console.log("fetch failed, error is:");
    console.log(error);
    console.log("Fetch URL is: " + fetchUrl);
  }
}

async function doSingleSearch(singleSearchParameters) {
  let builder = new GroUriBuilder();

  const surname = singleSearchParameters.surname;
  const forename1 = singleSearchParameters.forename1;
  const forename2 = singleSearchParameters.forename2;
  const mmn = singleSearchParameters.mmn;
  const year = singleSearchParameters.year;
  const yearRange = singleSearchParameters.yearRange;
  const gender = singleSearchParameters.gender;

  builder.addIndex("EW_Birth");
  builder.addSurname(surname);
  builder.addFirstForename(forename1);
  builder.addSecondForename(forename2);
  builder.addMothersSurname(mmn);
  builder.addYear(year);
  builder.addYearRange(yearRange);

  if (gender == "male") {
    builder.addGenderMale();
  } else {
    builder.addGenderFemale();
  }

  const url = builder.getUri();

  const searchUrl = "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp";

  let postData = "";
  const queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    let startOfQuery = queryIndex + 1;
    postData = url.substring(startOfQuery);
    postData += "&CurrentPage=1&OccasionalCopy=&RUI=&SearchIndexes=Search";
  }

  console.log("postData from builder is:");
  console.log(postData);

  const extra1 = "&SurnameMatches=0&ForenameMatches=0&MothersSurnameMatches=0";
  //const extra2 = "&DOBDay=&DOBMonth=&DOBYear=&PlaceofBirth=&District=&Quarter=&Month=&Volume=&Page=&Reg=&EntryNumber=";
  postData += extra1;
  //postData += extra2;

  let groDocument = await doSearchPost(searchUrl, postData);

  console.log("groDocument is:");
  console.log(groDocument);

  if (groDocument) {
    let extractResult = extractAllRowData(groDocument);

    console.log("extractResult is:");
    console.log(extractResult);

    return extractResult;
  }

  return { success: false };
}

function getYearRanges(startYear, endYear) {
  let yearRanges = [];
  let year = startYear;
  while (year <= endYear) {
    if (year + 4 > endYear) {
      // partial
      if (year + 2 > endYear) {
        yearRanges.push({ year: year, range: 0 });
        year += 1;
      } else {
        yearRanges.push({ year: year + 1, range: 1 });
        year += 3;
      }
    } else {
      yearRanges.push({ year: year + 2, range: 2 });
      year += 5;
    }
  }
  return yearRanges;
}

function fillTable(tableRowData) {
  let tableElement = document.getElementById("resultsTable");
  if (!tableElement) {
    return;
  }

  // empty existing table
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }

  let fragment = document.createDocumentFragment();

  let headerElement = document.createElement("thead");
  headerElement.className = "tableHeader";
  fragment.appendChild(headerElement);

  const headings = tableRowData.headings;
  const keys = tableRowData.keys;

  for (let heading of headings) {
    let thElement = document.createElement("th");
    thElement.innerHTML = heading;
    headerElement.appendChild(thElement);
  }

  let bodyElement = document.createElement("tbody");
  bodyElement.className = "tableBody";
  fragment.appendChild(bodyElement);

  for (let row of tableRowData.rowData) {
    let rowElement = document.createElement("tr");
    bodyElement.appendChild(rowElement);
    for (let key of keys) {
      let value = row[key];
      if (!value) {
        value = "";
      }
      let tdElement = document.createElement("td");
      tdElement.innerHTML = value;
      rowElement.appendChild(tdElement);
    }
  }

  tableElement.appendChild(fragment);
}

function initFilters(tableRowData) {
  let districts = [];

  for (let row of tableRowData.rowData) {
    let district = row.registrationDistrict;
    if (!districts.includes(district)) {
      districts.push(district);
    }
  }

  districts.sort();

  let districtSelectElement = document.getElementById("filterByDistrict");
  for (let district of districts) {
    let optionElement = document.createElement("option");
    optionElement.innerHTML = district;
    districtSelectElement.appendChild(optionElement);
  }
}

async function doSmartSearch() {
  console.log("doSmartSearch");

  let singleSearchParameters = {
    surname: searchParameters.surname,
    forename1: searchParameters.forename1,
    forename2: searchParameters.forename2,
    mmn: searchParameters.mmn,
  };

  let yearRanges = getYearRanges(searchParameters.birthStartYear, searchParameters.birthEndYear);

  console.log("yearRanges:");
  console.log(yearRanges);

  let totalResults = [];

  function addFetchResults(result, gender) {
    if (result) {
      if (result.success && result.rows) {
        for (let row of result.rows) {
          row.gender = gender;
        }

        totalResults.push(result);
      }
    }
  }

  for (let range of yearRanges) {
    singleSearchParameters.year = range.year;
    singleSearchParameters.yearRange = range.range;
    console.log("fetching year " + range.year + ", yearRange, " + range.range);

    if (searchParameters.gender == "male" || searchParameters.gender == "both") {
      singleSearchParameters.gender = "male";
      let result = await doSingleSearch(singleSearchParameters);
      addFetchResults(result, "male");
    }
    if (searchParameters.gender == "female" || searchParameters.gender == "both") {
      singleSearchParameters.gender = "female";
      let result = await doSingleSearch(singleSearchParameters);
      addFetchResults(result, "female");
    }
  }

  const headings = ["Year", "Quarter", "Surname", "Forenames", "Gender", "MMN", "District"];
  const keys = [
    "eventYear",
    "eventQuarter",
    "lastName",
    "forenames",
    "gender",
    "mothersMaidenName",
    "registrationDistrict",
  ];

  let tableRowData = {
    headings: headings,
    keys: keys,
    rowData: [],
  };

  for (let result of totalResults) {
    if (result.success && result.rows) {
      for (let row of result.rows) {
        tableRowData.rowData.push(row);
      }
    }
  }

  function compareRows(a, b) {
    if (a.eventYear < b.eventYear) {
      return -1;
    } else if (a.eventYear > b.eventYear) {
      return 1;
    }
    if (a.eventQuarter < b.eventQuarter) {
      return -1;
    } else if (a.eventQuarter > b.eventQuarter) {
      return 1;
    }

    return 0;
  }

  tableRowData.rowData.sort(compareRows);

  fillTable(tableRowData);

  initFilters(tableRowData);
}

function initializePage() {
  let searchButton = document.getElementById("searchButton");
  if (searchButton) {
    console.log("adding listener for button");
    searchButton.addEventListener("click", doSmartSearch);
  }
}

async function setupPageForSearchFromPopup(parameters) {
  console.log("updatePage: parameters is :");
  console.log(parameters);

  searchParameters = parameters;
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
