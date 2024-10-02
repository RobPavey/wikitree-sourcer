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
import { buildGroSearchUrl } from "../core/gro_build_citation.mjs";
import { getUkbmdDistrictPageUrl } from "../core/gro_to_ukbmd.mjs";
import { getGroYearRanges } from "../core/gro_years.mjs";

// Avoid creating this for every search
var domParser = new DOMParser();

const maxResultCount = 1000;

var searchParameters = {};

// this are the main search results that the user can then flter and sort different ways
// These lways remain sorted by the default sort and they have duplicates and out-of-range
// entries removed.
var searchResults = [];

// the unsorted search results after applying user filters
var userFilteredSearchResults = [];

// the user filtered results after applying user sorting
var userSortedSearchResults = [];

function openGroSearchInNewTab(extractedData) {
  console.log("openGroSearchInNewTab called, extracted data is:");
  console.log(extractedData);

  let url = buildGroSearchUrl(extractedData);

  // we could use options to decide whether to opren in new tab or window etc
  // currently don't have options loaded in this tab
  chrome.tabs.create({ url: url });
}

function extractAllRowsData(document, firstRowFunction, secondRowFunction, result) {
  //console.log("extractAllRowsData called");

  let resultsNode = document.querySelector("[name='Results']");
  if (!resultsNode) {
    console.log("extractAllRowsData: no results found in document");
    return;
  }

  let resultsTable = resultsNode.closest("TABLE");
  if (!resultsTable) {
    console.log("extractAllRowsData: no results table found in document");
    return;
  }

  // look for the selected result
  let inputElements = resultsTable.querySelectorAll("input[type=radio]");

  // if no results bail out
  if (inputElements.length == 0) {
    console.log("extractAllRowsData: no result rows found in document");
    return;
  }

  result.rows = [];

  for (let inputElement of inputElements) {
    let rowResult = {};
    firstRowFunction(inputElement, rowResult);
    secondRowFunction(inputElement, rowResult);

    result.rows.push(rowResult);
  }

  // Look to see how many pages there are
  result.resultsNumRecords = 0;
  result.resultsPageCount = 1;
  result.resultsPageNumber = 1;

  let possiblePageXOfYTdElements = resultsTable.querySelectorAll(
    "tbody > tr > td.main_text > table > tbody > tr > td.main_text"
  );
  //console.log("possiblePageXOfYTdElements.length is: " + possiblePageXOfYTdElements.length);

  for (let possiblePageXOfYTdElement of possiblePageXOfYTdElements) {
    let text = possiblePageXOfYTdElement.textContent;
    //console.log("possiblePageXOfYTdElement, text is: " + text);
    // example text : `250 Record(s) Found - Showing Page 1 of 5Go to page      `
    let regex = /(^\d+)\s+Record(?:\(s\))?\s+Found\s+-\s+Showing\s+Page\s+(\d+)\s+of\s+(\d+).*$/i;
    if (regex.test(text)) {
      result.resultsNumRecords = Number(text.replace(regex, "$1"));
      result.resultsPageNumber = Number(text.replace(regex, "$2"));
      result.resultsPageCount = Number(text.replace(regex, "$3"));
      console.log("Found page number, resultsNumRecords is: " + result.resultsNumRecords);
      //console.log("Found page number, resultsPageNumber is: " + result.resultsPageNumber);
      //console.log("Found page number, resultsPageCount is: " + result.resultsPageCount);
      break;
    }
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
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
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

    return {
      success: true,
      status: response.status,
      document: doc,
    };
  } catch (error) {
    console.log("fetch failed, error is:");
    console.log(c);
    console.log("Fetch URL is: " + fetchUrl);

    return {
      success: false,
      errorCondition: "Exception",
      status: response.status,
      error: error,
    };
  }
}

async function doSingleSearch(singleSearchParameters, pageNumber) {
  let builder = new GroUriBuilder(true);

  const type = singleSearchParameters.type;
  const surname = singleSearchParameters.surname;
  const surnameMatches = singleSearchParameters.surnameMatches;
  const forename1 = singleSearchParameters.forename1;
  const forenameMatches = singleSearchParameters.forenameMatches;
  const forename2 = singleSearchParameters.forename2;
  const mmn = singleSearchParameters.mmn;
  const mmnMatches = singleSearchParameters.mmnMatches;
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

  // Add the parameters in the same order that the GRO page would add them
  if (type == "births") {
    builder.addIndex("EW_Birth");
  } else {
    builder.addIndex("EW_Death");
  }

  let currentPage = "1";
  if (pageNumber > 1) {
    currentPage = (pageNumber - 1).toString();
  }
  builder.addCurrentPage(currentPage);

  builder.addYear(year);
  builder.addYearRange(yearRange);

  builder.addSurname(surname);
  builder.addSurnameMatches(surnameMatches);
  builder.addFirstForename(forename1);
  builder.addForenameMatches(forenameMatches);
  builder.addSecondForename(forename2);
  builder.addUrlText("&Forename3=&Forename4=");

  if (gender == "male") {
    builder.addGenderMale();
  } else {
    builder.addGenderFemale();
  }

  if (type == "births") {
    builder.addMothersSurname(mmn);
    builder.addMothersSurnameMatches(mmnMatches);
  } else {
    builder.addAge(age);
    builder.addAgeRange(ageRange);
  }

  if (type == "births") {
    builder.addUrlText("&DOBDay=&DOBMonth=&DOBYear=&PlaceofBirth=");
  } else {
    builder.addUrlText("&DODDay=&DODMonth=&DODYear=&PlaceofDeath=");
  }

  builder.addDistrict(district);

  builder.addUrlText("&Quarter=&Month=&Volume=&Page=&Reg=&EntryNumber=&OccasionalCopy=&RUI=");

  if (pageNumber > 1) {
    builder.addUrlText("&SearchIndexes=" + pageNumber);
  } else {
    builder.addUrlText("&SearchIndexes=Search");
  }

  const url = builder.getUri();

  const searchUrl = "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp";

  let postData = "";
  const queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    let startOfQuery = queryIndex + 1;
    postData = url.substring(startOfQuery);
  }

  console.log("postData is:");
  console.log(postData);

  let fetchResult = await doSearchPost(searchUrl, postData);

  console.log("fetchResult is:");
  console.log(fetchResult);

  if (fetchResult.success && fetchResult.document) {
    // if user is not logged in we will have a successful fetch but
    // it will have been redirected to the login page
    if (fetchResult.document.title) {
      let lcTitle = fetchResult.document.title.toLowerCase();
      if (lcTitle.includes("login")) {
        await showErrorDialog(
          "Search failed. Please check that you are logged into the GRO site at https://www.gro.gov.uk/gro/content/certificates"
        );
        return { success: false };
      }
    }

    let extractResult = extractAllGroRowData(fetchResult.document);

    console.log("extractResult is:");
    console.log(extractResult);

    return extractResult;
  } else {
    await showErrorDialog("Search failed. Unable to get search results from GRO.");
  }

  return { success: false };
}

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

function clearResultsTable(showPlaceholder) {
  let containerElement = document.getElementById("searchResultsContainer");
  if (!containerElement) {
    return;
  }

  // empty existing container
  while (containerElement.firstChild) {
    containerElement.removeChild(containerElement.firstChild);
  }

  if (showPlaceholder) {
    let placeHolder = document.createElement("label");
    placeHolder.innerText = "The results table will appear here after a successful search.";
    containerElement.appendChild(placeHolder);
  }
}

function fillTable(extractedDataObjs) {
  let possibleHeadings = [
    { key: "eventYear", text: "Year" },
    { key: "eventQuarter", text: "Quarter" },
    { key: "lastName", text: "Surname" },
    { key: "forenames", text: "Forenames" },
    { key: "personGender", text: "Sex" },
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

  // empty existing table
  clearResultsTable();

  let containerElement = document.getElementById("searchResultsContainer");
  if (!containerElement) {
    return;
  }

  let resultsSummaryElement = document.createElement("div");
  containerElement.appendChild(resultsSummaryElement);
  resultsSummaryElement.id = "resultsSummary";

  function resultsEnding(number) {
    let text = number + " result";
    if (number != 1) {
      text += "s";
    }
    text += ".";
    return text;
  }
  let resultsSummary = "Found " + resultsEnding(searchResults.length);
  if (searchResults.length > 0) {
    resultsSummary += " After applying filters showing " + resultsEnding(extractedDataObjs.length);
  }
  let resultsSummaryLabel = document.createElement("label");
  resultsSummaryLabel.className = "resultsSummary";
  resultsSummaryLabel.innerText = resultsSummary;
  resultsSummaryElement.appendChild(resultsSummaryLabel);

  if (searchResults.length == 0) {
    return;
  }

  let tableElement = document.createElement("table");
  containerElement.appendChild(tableElement);
  tableElement.id = "resultsTable";
  tableElement.className = "resultsTable";

  // check if some of the optional fields exists for any of the entries

  let fragment = document.createDocumentFragment();

  let headerElement = document.createElement("thead");
  headerElement.className = "tableHeader";
  fragment.appendChild(headerElement);

  for (let heading of possibleHeadings) {
    if (usedKeys.has(heading.key)) {
      let headingText = heading.text;
      let thElement = document.createElement("th");
      thElement.innerText = headingText;
      thElement.className = "resultsTableHeaderCell";
      headerElement.appendChild(thElement);
    }
  }

  // add column for go to GRO
  {
    let thElement = document.createElement("th");
    thElement.innerText = "GRO site";
    thElement.className = "resultsTableHeaderCell";
    headerElement.appendChild(thElement);
  }

  let bodyElement = document.createElement("tbody");
  bodyElement.className = "tableBody";
  fragment.appendChild(bodyElement);

  for (let extractedData of extractedDataObjs) {
    let rowElement = document.createElement("tr");
    rowElement.className = "resultsTableDataRow";
    bodyElement.appendChild(rowElement);

    for (let heading of possibleHeadings) {
      if (!usedKeys.has(heading.key)) {
        continue;
      }

      let hasKey = extractedData.hasOwnProperty(heading.key);

      let value = "";
      if (hasKey) {
        value = extractedData[heading.key];

        if (heading.key == "personGender") {
          if (value == "male") {
            value = "M";
          } else if (value == "female") {
            value = "F";
          }
        } else if (heading.key == "eventQuarter") {
          if (value == 1) {
            value = "Jan-Feb-Mar";
          } else if (value == 2) {
            value = "Apr-May-Jun";
          } else if (value == 3) {
            value = "Jul-Aug-Sep";
          } else if (value == 4) {
            value = "Oct-Nov-Dec";
          }
        }

        if (extractedData[heading.key + "Implied"]) {
          value = "(" + value + ")";
        }
      }

      let linkText = "";
      if (heading.key == "registrationDistrict" && value) {
        if (extractedData.districtLink) {
          linkText = extractedData.districtLink;
        }
      }

      let tdElement = document.createElement("td");
      if (linkText) {
        let linkElement = document.createElement("a");
        linkElement.setAttribute("href", linkText);
        linkElement.innerHTML = value;
        tdElement.appendChild(linkElement);
      } else {
        tdElement.innerHTML = value;
      }

      tdElement.className = "resultsTableDataCell";
      rowElement.appendChild(tdElement);
    }

    // add button to go to GRO
    let tdElement = document.createElement("td");
    tdElement.className = "resultsTableDataCell";
    rowElement.appendChild(tdElement);
    let groButtonElement = document.createElement("button");
    tdElement.appendChild(groButtonElement);
    groButtonElement.innerText = "Open tab";
    groButtonElement.addEventListener("click", (event) => {
      openGroSearchInNewTab(extractedData);
    });
  }

  tableElement.appendChild(fragment);
}

function addDistrictLinksToResults(searchResults) {
  for (let ed of searchResults) {
    let url = getUkbmdDistrictPageUrl(
      ed.registrationDistrict,
      ed.referenceVolume,
      ed.eventYear,
      ed.registrationDistrictCode
    );
    if (url) {
      ed.districtLink = url;
    }
  }
}

function clearFilters(showPlaceholder) {
  let resultsFilterContainer = document.getElementById("resultsFilterContainer");
  if (!resultsFilterContainer) {
    return;
  }
  // remove all children
  while (resultsFilterContainer.firstChild) {
    resultsFilterContainer.removeChild(resultsFilterContainer.firstChild);
  }

  if (showPlaceholder) {
    let placeHolder = document.createElement("label");
    placeHolder.innerText =
      "The filters appear here when there are results and the filter would have an effect on them.";
    resultsFilterContainer.appendChild(placeHolder);
  }
}

function applyUserFilters() {
  userFilteredSearchResults = Array.from(searchResults);

  console.log(
    "applyUserFilters. Before filter, userFilteredSearchResults.length = " + userFilteredSearchResults.length
  );

  {
    let selectElement = document.getElementById("filterByDistrict");
    if (selectElement) {
      // Get all selected options
      const selectedOptions = Array.from(selectElement.selectedOptions);

      // Get the values of the selected options
      const selectedValues = selectedOptions.map((option) => option.value);

      if (selectedValues.length > 0 && !selectedValues.includes("ALL")) {
        userFilteredSearchResults = userFilteredSearchResults.filter(function (item, pos, ary) {
          let district = item.registrationDistrict;
          if (district) {
            return selectedValues.includes(district);
          } else {
            return selectedValues.includes(" ");
          }
        });
      }
    }
  }

  {
    let selectElement = document.getElementById("filterByMmn");
    if (selectElement) {
      // Get all selected options
      const selectedOptions = Array.from(selectElement.selectedOptions);

      // Get the values of the selected options
      const selectedValues = selectedOptions.map((option) => option.value);

      if (selectedValues.length > 0 && !selectedValues.includes("ALL")) {
        userFilteredSearchResults = userFilteredSearchResults.filter(function (item, pos, ary) {
          let mmn = item.mothersMaidenName;
          if (mmn) {
            return selectedValues.includes(mmn);
          } else {
            return selectedValues.includes(" ");
          }
        });
      }
    }
  }

  console.log("applyUserFilters. After filter, userFilteredSearchResults.length = " + userFilteredSearchResults.length);

  applyUserSorting();

  fillTable(userFilteredSearchResults);
}

function applyUserSorting() {}

function initFilters(searchParameters, extractedDataObjs) {
  let districts = [];
  let mmns = [];

  for (let extractedData of extractedDataObjs) {
    let district = extractedData.registrationDistrict;
    if (district === undefined) {
      district = " ";
    }
    if (!districts.includes(district)) {
      districts.push(district);
    }

    if (searchParameters.type == "births") {
      let mmn = extractedData.mothersMaidenName;
      if (mmn === undefined) {
        mmn = " ";
      }
      if (!mmns.includes(mmn)) {
        mmns.push(mmn);
      }
    }
  }

  districts.sort();
  mmns.sort();

  clearFilters();

  let resultsFilterContainer = document.getElementById("resultsFilterContainer");
  if (!resultsFilterContainer) {
    return;
  }

  if (districts.length > 1) {
    let selectDiv = document.createElement("div");
    selectDiv.className = "filterSelectDiv";
    resultsFilterContainer.appendChild(selectDiv);

    let labelElement = document.createElement("label");
    labelElement.innerText = "Select districts:";
    labelElement.className = "filterSelectLabel";
    selectDiv.appendChild(labelElement);

    let selectElement = document.createElement("select");
    selectElement.id = "filterByDistrict";
    selectElement.className = "filterSelect";
    selectElement.multiple = true;
    selectDiv.appendChild(selectElement);

    // add initial "ALL" element
    {
      let optionElement = document.createElement("option");
      optionElement.innerHTML = "Show All";
      optionElement.value = "ALL";
      selectElement.appendChild(optionElement);
    }

    for (let district of districts) {
      let optionElement = document.createElement("option");
      optionElement.innerHTML = district;
      optionElement.value = district;
      selectElement.appendChild(optionElement);
    }

    selectElement.addEventListener("change", (event) => {
      applyUserFilters();
    });
  }

  if (mmns.length > 1) {
    let selectDiv = document.createElement("div");
    selectDiv.className = "filterSelectDiv";
    resultsFilterContainer.appendChild(selectDiv);

    let labelElement = document.createElement("label");
    labelElement.innerText = "Select MMNs:";
    labelElement.className = "filterSelectLabel";
    selectDiv.appendChild(labelElement);

    let selectElement = document.createElement("select");
    selectElement.id = "filterByMmn";
    selectElement.className = "filterSelect";
    selectElement.multiple = true;
    selectDiv.appendChild(selectElement);

    // add initial "ALL" element
    {
      let optionElement = document.createElement("option");
      optionElement.innerHTML = "Show All";
      optionElement.value = "ALL";
      selectElement.appendChild(optionElement);
    }

    for (let mmn of mmns) {
      let optionElement = document.createElement("option");
      optionElement.innerHTML = mmn;
      optionElement.value = mmn;
      selectElement.appendChild(optionElement);
    }

    selectElement.addEventListener("change", (event) => {
      applyUserFilters();
    });
  }

  let clearDiv = document.createElement("div");
  clearDiv.className = "filterSelectClear";
  resultsFilterContainer.appendChild(clearDiv);
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

  if (a.personGender < b.personGender) {
    return -1;
  } else if (a.personGender > b.personGender) {
    return 1;
  }

  return 0;
}

function waitForButtonClicks(dialog, buttons) {
  return new Promise((resolve) => {
    const handleClick = (event) => {
      for (let button of buttons) {
        let buttonId = "button" + button;
        let buttonElement = dialog.querySelector("#" + buttonId);
        buttonElement.removeEventListener("click", handleClick);
      }
      resolve(event.target.id); // Resolve with the ID of the clicked button
    };

    for (let button of buttons) {
      let buttonId = "button" + button;
      let buttonElement = dialog.querySelector("#" + buttonId);
      buttonElement.addEventListener("click", handleClick);
    }
  });
}

async function showDialog(heading, message, buttons, type) {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let dialogHeader = dialog.querySelector("div.dialogHeader");
  if (!dialogHeader) {
    console.log("dialogHeader not found");
    return;
  }
  let dialogMessageDiv = dialog.querySelector("div.dialogMessage");
  if (!dialogMessageDiv) {
    console.log("dialogMessageDiv not found");
    return;
  }
  let dialogBusyDiv = dialog.querySelector("div.dialogBusy");
  if (!dialogBusyDiv) {
    console.log("dialogBusyDiv not found");
    return;
  }
  let dialogButtonRow = dialog.querySelector("div.dialogButtonRow");
  if (!dialogButtonRow) {
    console.log("dialogButtonRow not found");
    return;
  }

  // add header
  {
    // remove all children
    while (dialogHeader.firstChild) {
      dialogHeader.removeChild(dialogHeader.firstChild);
    }
    let wrapperDiv = document.createElement("div");
    if (type == "error") {
      wrapperDiv.className = "dialogErrorHeader";
    } else if (type == "warning") {
      wrapperDiv.className = "dialogWarningHeader";
    } else if (type == "progress") {
      wrapperDiv.className = "dialogProgressHeader";
    }
    dialogHeader.appendChild(wrapperDiv);
    let label = document.createElement("label");
    label.innerText = heading;
    label.className = "dialogHeaderLabel";
    wrapperDiv.appendChild(label);
  }

  // add message
  {
    // remove all children
    while (dialogMessageDiv.firstChild) {
      dialogMessageDiv.removeChild(dialogMessageDiv.firstChild);
    }

    let label = document.createElement("label");
    label.innerText = message;
    dialogMessageDiv.appendChild(label);
  }

  {
    while (dialogBusyDiv.firstChild) {
      dialogBusyDiv.removeChild(dialogBusyDiv.firstChild);
    }

    if (type == "progress") {
      let busy = document.createElement("div");
      busy.id = "busyContainer";
      busy.className = "busyContainer";
      dialogBusyDiv.appendChild(busy);

      let loader = document.createElement("div");
      loader.className = "spinner";
      busy.appendChild(loader);
    }
  }

  // add buttons
  {
    // remove all children
    while (dialogButtonRow.firstChild) {
      dialogButtonRow.removeChild(dialogButtonRow.firstChild);
    }
    for (let button of buttons) {
      let buttonElement = document.createElement("button");
      buttonElement.innerText = button;
      buttonElement.className = "dialogButton";
      buttonElement.id = "button" + button;
      dialogButtonRow.appendChild(buttonElement);
    }
  }

  dialog.showModal();

  let clickedButtonId = await waitForButtonClicks(dialog, buttons);

  dialog.close();

  return clickedButtonId;
}

async function showErrorDialog(message) {
  return await showDialog("Error", message, ["OK"], "error");
}

async function showWarningDialog(message) {
  return await showDialog("Warning", message, ["Continue", "Cancel"], "warning");
}

var progressDialogResponse = "";
async function showProgressDialog(message) {
  progressDialogResponse = "";
  showDialog("Progress", message, ["Stop", "Cancel"], "progress");

  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let stopButtonId = "buttonStop";
  let stopButtonElement = dialog.querySelector("#" + stopButtonId);
  if (stopButtonElement) {
    stopButtonElement.addEventListener("click", (event) => {
      progressDialogResponse = "stop";
    });
  }

  let cancelButtonId = "buttonCancel";
  let cancelButtonElement = dialog.querySelector("#" + cancelButtonId);
  if (cancelButtonElement) {
    cancelButtonElement.addEventListener("click", (event) => {
      progressDialogResponse = "cancel";
    });
  }
}

function updateProgressDialog(message) {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let dialogMessageDiv = dialog.querySelector("div.dialogMessage");
  if (!dialogMessageDiv) {
    console.log("dialogList not found");
    return;
  }

  // add message
  {
    // remove all children
    while (dialogMessageDiv.firstChild) {
      dialogMessageDiv.removeChild(dialogMessageDiv.firstChild);
    }

    let label = document.createElement("label");
    label.innerText = message;
    dialogMessageDiv.appendChild(label);
  }
}

function closeProgressDialog() {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }
  dialog.close();
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
      await showErrorDialog(
        "A single search returned more the 250 results. Canceling search. Please try a more specific search."
      );
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

function checkSearchParameters() {
  let result = {
    errorInputIds: [],
    warningInputIds: [],
    errorMessages: [],
    warningMessages: [],
  };

  if (
    !searchParameters.startYear ||
    !searchParameters.endYear ||
    searchParameters.startYear > searchParameters.endYear
  ) {
    let message = "Invalid start and end years.";
    if (!searchParameters.startYear) {
      message += "\nNo start year specified.";
      result.errorInputIds.push("searchParamStartYear");
    }
    if (!searchParameters.endYear) {
      message += "\nNo end year specified.";
      result.errorInputIds.push("searchParamEndYear");
    }
    if (
      searchParameters.startYear &&
      searchParameters.endYear &&
      searchParameters.startYear > searchParameters.endYear
    ) {
      result.errorInputIds.push("searchParamStartYear");
      result.errorInputIds.push("searchParamEndYear");
      message += "\nStart year is greater than end year.";
    }
    result.errorMessages.push(message);
  }

  if (!searchParameters.surname) {
    result.errorInputIds.push("searchParamSurname");
    result.errorMessages.push("Surname is required.");
  }

  if (!searchParameters.gender) {
    result.errorInputIds.push("searchParamGender");
    result.errorMessages.push("Gender is required.");
  }

  let groRanges = getGroYearRanges(searchParameters.type);
  let groStartYear = groRanges.startYear;
  let groEndYear = groRanges.endYear;
  let gapStartYear = groRanges.gapStartYear;
  let gapEndYear = groRanges.gapEndYear;

  let invalidRangeMessage = "Invalid start and end years.";
  let invalidRange = false;
  let startYear = searchParameters.startYear;
  let endYear = searchParameters.endYear;
  if (endYear < groStartYear) {
    invalidRange = true;
    invalidRangeMessage += "\nEnd year is less than GRO start year of " + groStartYear + ".";
    result.errorInputIds.push("searchParamEndYear");
  } else if (startYear > groEndYear) {
    invalidRange = true;
    invalidRangeMessage += "\nStart year is greater than GRO end year of " + groEndYear + ".";
    result.errorInputIds.push("searchParamStartYear");
  } else if (startYear >= gapStartYear && endYear <= gapEndYear) {
    invalidRange = true;
    invalidRangeMessage += "\nRange is fully within the gap in GRO records of " + gapStartYear + "-" + gapEndYear + ".";
    result.errorInputIds.push("searchParamStartYear");
    result.errorInputIds.push("searchParamEndYear");
  }
  if (invalidRange) {
    result.errorMessages.push(invalidRangeMessage);
  }

  let clampedRange = false;
  let clampedMessage = "Year range checks.";
  if (startYear < groStartYear) {
    startYear = groStartYear;
    clampedRange = true;
    clampedMessage += "\nStart year is less than GRO start year of " + groStartYear + ".";
    clampedMessage += " Will use start year of " + startYear + ".";
    result.warningInputIds.push("searchParamStartYear");
  }
  if (endYear > groEndYear) {
    endYear = groEndYear;
    clampedRange = true;
    clampedMessage += "\nEnd year is greater than GRO end year of " + groEndYear + ".";
    clampedMessage += " Will use end year of " + endYear + ".";
    result.warningInputIds.push("searchParamEndYear");
  }
  if (startYear >= gapStartYear && startYear <= gapEndYear) {
    startYear = gapEndYear + 1;
    clampedRange = true;
    clampedMessage += "\nStart year is in the gap in GRO records between " + gapStartYear + " and " + gapEndYear + ".";
    clampedMessage += " Will use start year of " + startYear + ".";
    result.warningInputIds.push("searchParamStartYear");
  }
  if (endYear >= gapStartYear && endYear <= gapEndYear) {
    endYear = gapStartYear - 1;
    clampedRange = true;
    clampedMessage += "\nEnd year is in the gap in GRO records between " + gapStartYear + " and " + gapEndYear + ".";
    clampedMessage += " Will use end year of " + endYear + ".";
    result.warningInputIds.push("searchParamEndYear");
  }
  searchParameters.startYear = startYear;
  searchParameters.endYear = endYear;

  if (clampedRange) {
    result.warningMessages.push(clampedMessage);
  }

  if (startYear < gapStartYear && endYear > gapEndYear) {
    let message =
      "The year range includes the gap years " +
      gapStartYear +
      "-" +
      gapEndYear +
      ". These years will not be searched.";
    result.warningMessages.push(message);
    result.warningInputIds.push("searchParamStartYear");
    result.warningInputIds.push("searchParamEndYear");
  }

  if (searchParameters.type == "births") {
    if (searchParameters.endYear > 1923 && searchParameters.mmn) {
      let message = "Mother's Maiden Name is specified but range includes years greater than 1923.";
      message += "\n\nFor those years the GRO search cannot narrow the search results using the MMN";
      message += " but it does return the MMN in the result if it matches,";
      message += " so there will be extra search results with blank MMNs.";
      if (searchParameters.startYear <= 1924 && searchParameters.endYear >= 1924) {
        message += "\n\nThe year 1924 is a special case. It does return the MMN for non-matching results.";
        message += " So there may be extra search results with non-matching MMNs.";
      }
      message += "\n\nYou can use the MMN results filter to only show the results with the MMNs that you want.";
      result.warningMessages.push(message);
      result.warningInputIds.push("searchParamMmn");
    }
  }

  return result;
}

async function checkForAndReportErrorsAndWarnings() {
  let checkData = checkSearchParameters();

  if (checkData.errorMessages.length) {
    showErrorDialog(checkData.errorMessages[0]);
    return false;
  }

  for (let message of checkData.warningMessages) {
    let response = await showWarningDialog(message);
    if (response == "buttonCancel") {
      return false;
    }
  }

  return true;
}

async function doSmartSearch() {
  console.log("doSmartSearch");

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

  console.log("yearRanges:");
  console.log(yearRanges);

  let totalFetchResults = {
    singleSearchResults: [],
    resultCount: 0,
  };

  showProgressDialog("Starting search");

  for (let range of yearRanges) {
    singleSearchParameters.year = range.year;
    singleSearchParameters.yearRange = range.range;
    if (range.hasAge) {
      singleSearchParameters.age = range.age;
      singleSearchParameters.ageRange = range.ageRange;
    }
    console.log("fetching year " + range.year + ", yearRange, " + range.range);

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
      await showErrorDialog("Exceeded maximum number of search results. Stopping search.");
      break;
    }
  }

  closeProgressDialog();

  if (progressDialogResponse == "cancel") {
    return;
  }

  console.log("Finished search, totalFetchResults.resultCount = ", totalFetchResults.resultCount);

  // clear the global var for the searchResults and popluate from fetch results
  searchResults = [];
  for (let result of totalFetchResults.singleSearchResults) {
    if (result.success && result.rows) {
      for (let row of result.rows) {
        searchResults.push(row);
      }
    }
  }

  console.log("Populated searchResults, searchResults.length = ", searchResults.length);

  searchResults.sort(compareExtractedData);

  // we have a sorted list but it could have duplicates for deaths with large birth year range
  // it could also have birth dates that are out of range.
  if (searchParameters.type == "deaths") {
    console.log("Before remove dupes, extractedDataObjs.length = " + searchResults.length);
    // remove an element if it is the same as the one before it.
    searchResults = searchResults.filter(function (item, pos, ary) {
      let keepElement = true;

      //console.log("filtering element, forenames = " + item.forenames + ", district = " + item.registrationDistrict);

      if (pos > 0 && compareExtractedData(item, ary[pos - 1]) == 0) {
        keepElement = false;
      } else {
        let year = item.eventYear;
        let age = item.ageAtDeath;
        let birthYear = item.birthYear;
        if (!birthYear) {
          if (age !== undefined) {
            birthYear = year - age;
            item.birthYear = birthYear;
            item.birthYearImplied = true;
          }
        } else if (age === undefined) {
          age = year - birthYear;
          item.age = birthYear;
          item.ageImplied = true;
        }

        //console.log("filtering element, birthYear = " + birthYear + ", age = " + age);

        if (birthYear) {
          let startBirthYear = searchParameters.startBirthYear;
          let endBirthYear = searchParameters.endBirthYear;
          if ((startBirthYear && birthYear < startBirthYear) || (endBirthYear && birthYear > endBirthYear)) {
            //console.log("removing element with birthYear of: " + birthYear);
            keepElement = false;
          }
        }
      }

      return keepElement;
    });
    console.log("After remove dupes, extractedDataObjs.length = " + searchResults.length);
  }

  addDistrictLinksToResults(searchResults);

  fillTable(searchResults);

  initFilters(searchParameters, searchResults);
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

function getSelectValue(id) {
  const selectElement = document.getElementById(id);
  if (selectElement) {
    return selectElement.value;
  }
  return "0";
}

function createRadioButtonGroup(parent, labelText, name, options, required) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valueTdElement = document.createElement("td");
  parent.appendChild(valueTdElement);

  let label = document.createElement("label");
  labelTdElement.appendChild(label);
  label.innerText = labelText;
  if (required) {
    label.classList.add("searchParamsRequired");
  }

  for (let option of options) {
    let inputDiv = document.createElement("div");
    inputDiv.className = "radioButtonAndLabel";
    valueTdElement.appendChild(inputDiv);
    let inputElement = document.createElement("input");
    inputDiv.appendChild(inputElement);
    inputElement.type = "radio";
    inputElement.className = "radio";
    inputElement.name = name;
    inputElement.value = option.value;
    inputElement.id = option.id;
    let labelElement = document.createElement("label");
    inputDiv.appendChild(labelElement);
    labelElement.className = "radioLabel";
    labelElement.innerText = option.label;
  }
}

function createSelect(parent, label, id, options) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valuelTdElement = document.createElement("td");
  parent.appendChild(valuelTdElement);

  let labelElement = document.createElement("label");
  labelTdElement.appendChild(labelElement);
  labelElement.innerText = label;

  let selectElement = document.createElement("select");
  selectElement.id = id;
  selectElement.class = "dropdown";
  valuelTdElement.appendChild(selectElement);

  let isFirst = true;
  for (let option of options) {
    let optionElement = document.createElement("option");
    selectElement.appendChild(optionElement);
    optionElement.value = option.value;
    optionElement.innerText = option.text;
    if (isFirst) {
      selectElement.value = option.value;
      isFirst = false;
    }
  }
}

function addTextInput(parent, label, id, inputClass, required) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valueTdElement = document.createElement("td");
  parent.appendChild(valueTdElement);

  let labelElement = document.createElement("label");
  labelTdElement.appendChild(labelElement);
  labelElement.innerText = label;
  if (required) {
    labelElement.classList.add("searchParamsRequired");
  }

  let inputElement = document.createElement("input");
  valueTdElement.appendChild(inputElement);
  inputElement.type = "text";
  inputElement.id = id;
  inputElement.className = inputClass;
}

function createIntro() {
  let introElement = document.getElementById("introDiv");

  // empty existing div
  while (introElement.firstChild) {
    introElement.removeChild(introElement.firstChild);
  }

  let text = "This tool will compute a set of searches to do on the ";
  let linkText = "GRO Online Indexes";
  let text2 = " and submit them for you and collate the results.";
  let text3 = " The number of results is limited to " + maxResultCount + ".";
  let text4 = " This is useful, for example,  for finding all the possible birth registrations";
  text4 += " for children of a couple";
  text4 += " when you know both their surnames at birth and the dates they could have had children.";

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

function updateSearchControlsOnChange() {
  console.log("updateSearchControlsOnChange");
  setSearchParametersFromControls();
  console.log("updateSearchControlsOnChange, searchParameters is:");
  console.log(searchParameters);

  const allSearchParamInputIds = [
    "searchParamStartYear",
    "searchParamEndYear",
    "searchParamStartBirthYear",
    "searchParamEndBirthYear",
    "searchParamSurname",
    "searchParamForename1",
    "searchParamForename2",
    "searchParamMmn",
    "searchParamDistrict",
  ];

  for (let id of allSearchParamInputIds) {
    let element = document.getElementById(id);
    if (element) {
      element.classList.remove("searchParamError");
      element.classList.remove("searchParamWarning");
    } else {
      console.log("element with id " + id + " not found");
    }
  }

  let checkData = checkSearchParameters();
  console.log("checkData is:");
  console.log(checkData);

  for (let id of checkData.errorInputIds) {
    let element = document.getElementById(id);
    element.classList.add("searchParamError");
  }

  for (let id of checkData.warningInputIds) {
    let element = document.getElementById(id);
    if (!element.classList.contains("searchParamError")) {
      element.classList.add("searchParamWarning");
    }
  }
}

function createSearchControls(type) {
  let parametersElement = document.getElementById("searchParametersContainer");

  // empty existing div
  while (parametersElement.firstChild) {
    parametersElement.removeChild(parametersElement.firstChild);
  }

  let fragment = document.createDocumentFragment();

  let searchControlsTable = document.createElement("table");
  searchControlsTable.id = "searchControlsTable";
  fragment.appendChild(searchControlsTable);
  let searchControlsBody = document.createElement("tbody");
  searchControlsTable.appendChild(searchControlsBody);

  // add the "type" radio button group
  {
    let typeRow = document.createElement("tr");
    searchControlsBody.appendChild(typeRow);

    let options = [
      { label: "Births", value: "births", id: "searchParamBirth" },
      { label: "Deaths", value: "deaths", id: "searchParamDeath" },
    ];
    createRadioButtonGroup(typeRow, "Select index to search:", "recordType", options, true);
  }

  {
    let genderRow = document.createElement("tr");
    searchControlsBody.appendChild(genderRow);
    let options = [
      { label: "Male", value: "male", id: "searchParamGenderMale" },
      { label: "Female", value: "female", id: "searchParamGenderFemale" },
      { label: "Both", value: "both", id: "searchParamGenderBoth" },
    ];
    createRadioButtonGroup(genderRow, "Sex/Gender:", "gender", options, true);
  }

  // start year and end year
  {
    let partialLabel = "";
    if (type == "births") {
      partialLabel = " year of birth reg: ";
    } else {
      partialLabel = " year of death reg: ";
    }

    let yearRow = document.createElement("tr");
    searchControlsBody.appendChild(yearRow);
    addTextInput(yearRow, "Earliest" + partialLabel, "searchParamStartYear", "textInputYear", true);
    addTextInput(yearRow, "Latest" + partialLabel, "searchParamEndYear", "textInputYear", true);
  }

  // if death add start birth year and end birth year
  if (type == "deaths") {
    let birthYearRow = document.createElement("tr");
    searchControlsBody.appendChild(birthYearRow);
    addTextInput(birthYearRow, "Earliest year of birth: ", "searchParamStartBirthYear", "textInputYear", false);
    addTextInput(birthYearRow, "Latest year of birth: ", "searchParamEndBirthYear", "textInputYear", false);
  }

  {
    let surnameRow = document.createElement("tr");
    searchControlsBody.appendChild(surnameRow);
    let label = type == "births" ? "Surname at birth: " : "Surname at death: ";
    addTextInput(surnameRow, label, "searchParamSurname", "textInputName", true);

    createSelect(surnameRow, "Surname matching: ", "searchParamSurnameMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
    ]);
  }

  {
    let forename1Row = document.createElement("tr");
    searchControlsBody.appendChild(forename1Row);
    addTextInput(forename1Row, "First Forename: ", "searchParamForename1", "textInputName", false);

    createSelect(forename1Row, "Forename matching: ", "searchParamForenameMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
      { text: "Derivative Name Variations", value: "5" },
    ]);
  }

  {
    let forename2Row = document.createElement("tr");
    searchControlsBody.appendChild(forename2Row);
    addTextInput(forename2Row, "Second Forename: ", "searchParamForename2", "textInputName", false);
  }

  if (type == "births") {
    let mmnRow = document.createElement("tr");
    mmnRow.id = "searchParamMmnRow";
    searchControlsBody.appendChild(mmnRow);
    addTextInput(mmnRow, "Mother's maiden name: ", "searchParamMmn", "textInputName", false);

    createSelect(mmnRow, "MMN matching: ", "searchParamMmnMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
      { text: "Similar Sounding Variations", value: "4" },
    ]);
  }

  {
    let districtRow = document.createElement("tr");
    searchControlsBody.appendChild(districtRow);
    addTextInput(districtRow, "Registration district: ", "searchParamDistrict", "textInputDistrict", false);
  }

  parametersElement.appendChild(fragment);

  // now initialize values
  let birthInput = document.getElementById("searchParamBirth");
  if (birthInput) {
    birthInput.addEventListener("click", (event) => {
      createSearchControls("births");
    });
    if (type == "births") {
      birthInput.checked = true;
    }
  }

  let deathInput = document.getElementById("searchParamDeath");
  if (deathInput) {
    deathInput.addEventListener("click", (event) => {
      createSearchControls("deaths");
    });
    if (type == "deaths") {
      deathInput.checked = true;
    }
  }

  let genderBothInput = document.getElementById("searchParamGenderBoth");
  if (genderBothInput) {
    genderBothInput.checked = true;
  }

  // add a listener for whenever controls changed
  searchControlsTable.addEventListener("change", (event) => {
    updateSearchControlsOnChange();
  });
}

function initializePage() {
  let searchButton = document.getElementById("searchButton");
  if (searchButton) {
    console.log("adding listener for button");
    searchButton.addEventListener("click", doSmartSearch);
  }

  createIntro();
  createSearchControls("births");
  clearFilters(true);
  clearResultsTable(true);
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

  if (type == "births") {
    fillTextInput("searchParamMmn", searchParameters.mmn);
  } else {
    fillTextInput("searchParamStartBirthYear", searchParameters.startBirthYear);
    fillTextInput("searchParamEndBirthYear", searchParameters.endBirthYear);
  }

  updateSearchControlsOnChange();
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
  searchParameters.surnameMatches = getSelectValue("searchParamSurnameMatches");
  searchParameters.forename1 = getTextInputValue("searchParamForename1");
  searchParameters.forenameMatches = getSelectValue("searchParamForenameMatches");
  searchParameters.forename2 = getTextInputValue("searchParamForename2");

  if (searchParameters.type == "births") {
    searchParameters.mmn = getTextInputValue("searchParamMmn");
    searchParameters.mmnMatches = getTextInputValue("searchParamMmnMatches");
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
