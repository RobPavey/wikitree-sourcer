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

function extractAllGroRowData(document) {
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

  const type = singleSearchParameters.type;
  const surname = singleSearchParameters.surname;
  const forename1 = singleSearchParameters.forename1;
  const forename2 = singleSearchParameters.forename2;
  const mmn = singleSearchParameters.mmn;
  const year = singleSearchParameters.year;
  const yearRange = singleSearchParameters.yearRange;
  const age = singleSearchParameters.age;
  const ageRange = singleSearchParameters.ageRange;
  const gender = singleSearchParameters.gender;
  const district = singleSearchParameters.district;

  console.log("doSingleSearch, singleSearchParameters has:");
  console.log("  year: " + year);
  console.log("  yearRange: " + yearRange);
  if (age) {
    console.log("  age: " + age);
    console.log("  ageRange: " + ageRange);
  }

  if (type == "birth") {
    builder.addIndex("EW_Birth");
  } else {
    builder.addIndex("EW_Death");
  }
  builder.addSurname(surname);
  builder.addFirstForename(forename1);
  builder.addSecondForename(forename2);
  builder.addYear(year);
  builder.addYearRange(yearRange);

  if (gender == "male") {
    builder.addGenderMale();
  } else {
    builder.addGenderFemale();
  }

  if (type == "birth") {
    builder.addMothersSurname(mmn);
  } else {
    builder.addAge(age);
    builder.addAgeRange(ageRange);
  }

  builder.addDistrict(district);

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
    let extractResult = extractAllGroRowData(groDocument);

    console.log("extractResult is:");
    console.log(extractResult);

    return extractResult;
  }

  return { success: false };
}

function getYearRanges(startYear, endYear, startBirthYear, endBirthYear) {
  let needAges = startBirthYear && endBirthYear && startBirthYear < endBirthYear ? true : false;

  function addYearRange(year, range) {
    if (needAges && year < 1984) {
      let minAgeForYearRange = year - range - endBirthYear;
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

  let yearRanges = [];
  let year = startYear;
  while (year <= endYear) {
    if (year + 4 > endYear) {
      // partial
      if (year + 2 > endYear) {
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
  return yearRanges;
}

function fillTable(extractedDataObjs) {
  let possibleHeadings = [
    { key: "eventYear", text: "Year" },
    { key: "eventQuarter", text: "Quarter" },
    { key: "lastName", text: "Surname" },
    { key: "forenames", text: "Forenames" },
    { key: "gender", text: "Gender" },
    { key: "mothersMaidenName", text: "MMN" },
    { key: "ageAtDeath", text: "Age" },
    { key: "birthYear", text: "Birth Year" },
    { key: "registrationDistrict", text: "District" },
  ];

  let usedKeys = new Set();
  for (let extractedData of extractedDataObjs) {
    for (let heading of possibleHeadings) {
      if (extractedData.hasOwnProperty(heading.key)) {
        usedKeys.add(heading.key);
      }
    }
  }

  let hasBothAgesAndYobs = usedKeys.has("ageAtDeath") && usedKeys.has("birthYear");

  let tableElement = document.getElementById("resultsTable");
  if (!tableElement) {
    return;
  }

  // empty existing table
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }

  // check if some of the optional fields exists for any of the entries

  let fragment = document.createDocumentFragment();

  let headerElement = document.createElement("thead");
  headerElement.className = "tableHeader";
  fragment.appendChild(headerElement);

  for (let heading of possibleHeadings) {
    if (usedKeys.has(heading.key)) {
      let headingText = heading.text;
      if (hasBothAgesAndYobs) {
        if (heading.key == "ageAtDeath") {
          headingText = "Age/YoB";
        } else if (heading.key == "birthYear") {
          headingText = "";
        }
      }
      if (headingText) {
        let thElement = document.createElement("th");
        thElement.innerText = headingText;
        headerElement.appendChild(thElement);
      }
    }
  }

  let bodyElement = document.createElement("tbody");
  bodyElement.className = "tableBody";
  fragment.appendChild(bodyElement);

  for (let extractedData of extractedDataObjs) {
    let rowElement = document.createElement("tr");
    bodyElement.appendChild(rowElement);

    let addedAgeOrYob = false;
    for (let heading of possibleHeadings) {
      if (!usedKeys.has(heading.key)) {
        continue;
      }

      let hasKey = extractedData.hasOwnProperty(heading.key);

      let skipCell = false;
      if (hasBothAgesAndYobs) {
        if (heading.key == "ageAtDeath") {
          if (hasKey) {
            addedAgeOrYob = true;
          } else {
            skipCell = true;
          }
        } else if (heading.key == "birthYear") {
          if (addedAgeOrYob) {
            skipCell = true;
          }
        }
      }

      if (!skipCell) {
        let value = "";
        if (hasKey) {
          value = extractedData[heading.key];
        }

        let tdElement = document.createElement("td");
        tdElement.innerHTML = value;
        rowElement.appendChild(tdElement);
      }
    }
  }

  tableElement.appendChild(fragment);
}

function initFilters(extractedDataObjs) {
  let districts = [];

  for (let extractedData of extractedDataObjs) {
    let district = extractedData.registrationDistrict;
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

  // can filter by MMN for both birth and death
}

function compareExtractedData(a, b) {
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
  if (a.lastName < b.lastName) {
    return -1;
  } else if (a.lastName > b.lastName) {
    return 1;
  }
  if (a.forenames < b.forenames) {
    return -1;
  } else if (a.forenames > b.forenames) {
    return 1;
  }
  if (a.registrationDistrict < b.registrationDistrict) {
    return -1;
  } else if (a.registrationDistrict > b.registrationDistrict) {
    return 1;
  }
  if (a.registrationDistrictCode < b.registrationDistrictCode) {
    return -1;
  } else if (a.registrationDistrictCode > b.registrationDistrictCode) {
    return 1;
  }

  // age or birthYear
  if (a.ageAtDeath && b.birthYear) {
    return -1;
  } else if (a.birthYear && b.ageAtDeath) {
    return 1;
  } else if (a.birthYear && b.birthYear) {
    if (a.birthYear < b.birthYear) {
      return -1;
    } else if (a.birthYear > b.birthYear) {
      return 1;
    }
  } else if (a.ageAtDeath < b.ageAtDeath) {
    return -1;
  } else if (a.ageAtDeath > b.ageAtDeath) {
    return 1;
  }

  if (a.referenceVolume < b.referenceVolume) {
    return -1;
  } else if (a.referenceVolume > b.referenceVolume) {
    return 1;
  }
  if (a.referencePage < b.referencePage) {
    return -1;
  } else if (a.referencePage > b.referencePage) {
    return 1;
  }
  if (a.referenceRegister < b.referenceRegister) {
    return -1;
  } else if (a.referenceRegister > b.referenceRegister) {
    return 1;
  }
  if (a.entryNumber < b.entryNumber) {
    return -1;
  } else if (a.entryNumber > b.entryNumber) {
    return 1;
  }

  if (a.gender < b.gender) {
    return -1;
  } else if (a.gender > b.gender) {
    return 1;
  }

  return 0;
}

async function doSmartSearch() {
  console.log("doSmartSearch");

  setSearchParametersFromControls();

  let singleSearchParameters = {
    type: searchParameters.type,
    surname: searchParameters.surname,
    forename1: searchParameters.forename1,
    forename2: searchParameters.forename2,
    mmn: searchParameters.mmn,
    district: searchParameters.district,
  };

  let startBirthYearForYearRanges = 0;
  let endBirthYearForYearRanges = 0;
  if (searchParameters.type == "death") {
    startBirthYearForYearRanges = searchParameters.startBirthYear;
    endBirthYearForYearRanges = searchParameters.endBirthYear;
  }

  let yearRanges = getYearRanges(
    searchParameters.startYear,
    searchParameters.endYear,
    startBirthYearForYearRanges,
    endBirthYearForYearRanges
  );

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
    if (range.hasAge) {
      singleSearchParameters.age = range.age;
      singleSearchParameters.ageRange = range.ageRange;
    }
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

  let extractedDataObjs = [];
  for (let result of totalResults) {
    if (result.success && result.rows) {
      for (let row of result.rows) {
        extractedDataObjs.push(row);
      }
    }
  }

  extractedDataObjs.sort(compareExtractedData);

  // we have a sorted list but it could have duplicates for deaths with large birth year range
  if (searchParameters.type == "death") {
    console.log("Before remove dupes, extractedDataObjs.length = " + extractedDataObjs.length);
    // remove an element if it is the same as the one before it.
    extractedDataObjs = extractedDataObjs.filter(function (item, pos, ary) {
      return !pos || compareExtractedData(item, ary[pos - 1]) != 0;
    });
    console.log("After remove dupes, extractedDataObjs.length = " + extractedDataObjs.length);
  }

  fillTable(extractedDataObjs);

  initFilters(extractedDataObjs);
}

function getRadioButtonValue(name) {
  // Get the radio buttons by their name attribute
  const radioButtons = document.getElementsByName(name);
  // Find the selected radio button
  let selectedValue = "";
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      selectedValue = radioButton.value;
      break;
    }
  }
  return selectedValue;
}

function createRadioButtonGroup(parent, legendText, name, options) {
  let fieldSet = document.createElement("fieldset");
  parent.appendChild(fieldSet);

  let legend = document.createElement("legend");
  fieldSet.appendChild(legend);
  legend.innerText = legendText;

  for (let option of options) {
    let inputDiv = document.createElement("div");
    fieldSet.appendChild(inputDiv);
    let inputElement = document.createElement("input");
    inputDiv.appendChild(inputElement);
    inputElement.type = "radio";
    inputElement.name = name;
    inputElement.value = option.value;
    inputElement.id = option.id;
    let labelElement = document.createElement("label");
    inputDiv.appendChild(labelElement);
    labelElement.innerText = option.label;
  }
}

function addTextInput(parent, label, id) {
  let divElement = document.createElement("div");
  parent.appendChild(divElement);
  let labelElement = document.createElement("label");
  divElement.appendChild(labelElement);
  labelElement.innerText = label;
  let inputElement = document.createElement("input");
  divElement.appendChild(inputElement);
  inputElement.type = "text";
  inputElement.id = id;
}

function createSearchControls(type) {
  let parametersElement = document.getElementById("searchParametersDiv");

  // empty existing div
  while (parametersElement.firstChild) {
    parametersElement.removeChild(parametersElement.firstChild);
  }

  let fragment = document.createDocumentFragment();

  // add the "type" radio button group
  {
    let options = [
      { label: "Births", value: "birth", id: "searchParamBirth" },
      { label: "Deaths", value: "death", id: "searchParamDeath" },
    ];
    createRadioButtonGroup(fragment, "Select index to search:", "recordType", options);
  }

  // start year and end year
  {
    addTextInput(fragment, "Start year: ", "searchParamStartYear");
    addTextInput(fragment, "End year: ", "searchParamEndYear");
  }

  addTextInput(fragment, "Surname at birth: ", "searchParamSurname");
  addTextInput(fragment, "First Forename: ", "searchParamForename1");
  addTextInput(fragment, "Second Forename: ", "searchParamForename2");

  let options = [
    { label: "Male", value: "male", id: "searchParamGenderMale" },
    { label: "Female", value: "female", id: "searchParamGenderFemale" },
    { label: "Either", value: "both", id: "searchParamGenderBoth" },
  ];
  createRadioButtonGroup(fragment, "Sex:", "gender", options);

  if (type == "birth") {
    addTextInput(fragment, "Mother's maiden name: ", "searchParamMmn");
  } else {
    addTextInput(fragment, "Earliest birth year: ", "searchParamStartBirthYear");
    addTextInput(fragment, "Latest birth year: ", "searchParamEndBirthYear");
  }

  addTextInput(fragment, "District: ", "searchParamDistrict");

  parametersElement.appendChild(fragment);

  // now initialize values
  let birthInput = document.getElementById("searchParamBirth");
  if (birthInput) {
    birthInput.addEventListener("click", (event) => {
      createSearchControls("birth");
    });
  }
  if (type == "birth") {
    birthInput.checked = true;
  }

  let deathInput = document.getElementById("searchParamDeath");
  if (deathInput) {
    deathInput.addEventListener("click", (event) => {
      createSearchControls("death");
    });
  }
  if (type == "death") {
    deathInput.checked = true;
  }
}

function initializePage() {
  let searchButton = document.getElementById("searchButton");
  if (searchButton) {
    console.log("adding listener for button");
    searchButton.addEventListener("click", doSmartSearch);
  }

  createSearchControls("birth");
}

function fillControlsFromSearchParameters() {
  function fillTextInput(id, value) {
    let inputElement = document.getElementById(id);
    if (inputElement) {
      if (value) {
        inputElement.value = value;
      } else {
        inputElement.value = "";
      }
    }
  }

  function setRadioButton(name, value) {
    console.log("setRadioButton: name = " + name + ", value = " + value);
    // Get the radio buttons by their name attribute
    const radioButtons = document.getElementsByName(name);
    console.log("radioButtons.length = " + radioButtons.length);
    // Find the selected radio button
    for (const radioButton of radioButtons) {
      if (radioButton.value == value) {
        console.log("found radioButton with value = " + value);

        radioButton.checked = true;
        break;
      }
    }
  }

  let type = searchParameters.type;
  createSearchControls(type);

  fillTextInput("searchParamStartYear", searchParameters.startYear);
  fillTextInput("searchParamEndYear", searchParameters.endYear);

  fillTextInput("searchParamSurname", searchParameters.surname);
  fillTextInput("searchParamForename1", searchParameters.forename1);
  fillTextInput("searchParamForename2", searchParameters.forename2);

  setRadioButton("gender", searchParameters.gender);

  if (type == "birth") {
    fillTextInput("searchParamMmn", searchParameters.mmn);
  } else {
    fillTextInput("searchParamStartBirthYear", searchParameters.startBirthYear);
    fillTextInput("searchParamEndBirthYear", searchParameters.endBirthYear);
  }
}

function setSearchParametersFromControls() {
  function getTextInputValue(id, isNumber) {
    let value = "";
    if (isNumber) {
      value = 0;
    }
    let inputElement = document.getElementById(id);
    if (inputElement) {
      if (inputElement.value) {
        if (isNumber) {
          let number = Number(inputElement.value);
          if (number && !isNaN(number)) {
            value = number;
          }
        } else {
          value = inputElement.value;
        }
      }
    }
    return value;
  }

  searchParameters.type = getRadioButtonValue("recordType");
  searchParameters.gender = getRadioButtonValue("gender");

  searchParameters.startYear = getTextInputValue("searchParamStartYear", true);
  searchParameters.endYear = getTextInputValue("searchParamEndYear", true);

  searchParameters.surname = getTextInputValue("searchParamSurname");
  searchParameters.forename1 = getTextInputValue("searchParamForename1");
  searchParameters.forename2 = getTextInputValue("searchParamForename2");

  if (searchParameters.type == "birth") {
    searchParameters.mmn = getTextInputValue("searchParamMmn");
  } else {
    searchParameters.startBirthYear = getTextInputValue("searchParamStartBirthYear", true);
    searchParameters.endBirthYear = getTextInputValue("searchParamEndBirthYear", true);
  }

  searchParameters.mothersMaidenName = getTextInputValue("searchParamMmn");
  searchParameters.district = getTextInputValue("searchParamDistrict");
}

function setupPageForSearchFromPopup(parameters) {
  console.log("updatePage: parameters is :");
  console.log(parameters);

  searchParameters = parameters;

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
