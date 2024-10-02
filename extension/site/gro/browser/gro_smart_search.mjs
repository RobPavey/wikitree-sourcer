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

import { buildGroSearchUrl } from "../core/gro_build_citation.mjs";
import { getUkbmdDistrictPageUrl } from "../core/gro_to_ukbmd.mjs";
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
  createSearchControls,
  setSearchParametersFromControls,
  fillControlsFromSearchParameters,
  checkForAndReportErrorsAndWarnings,
} from "./gro_smart_search_parameters.mjs";

const maxResultCount = 1000;

// this are the main search results that the user can then flter and sort different ways
// These lways remain sorted by the default sort and they have duplicates and out-of-range
// entries removed.
var searchResults = [];

// the unsorted search results after applying user filters
var userFilteredSearchResults = [];

function openGroSearchInNewTab(extractedData) {
  //console.log("openGroSearchInNewTab called, extracted data is:");
  //console.log(extractedData);

  let url = buildGroSearchUrl(extractedData);

  // we could use options to decide whether to opren in new tab or window etc
  // currently don't have options loaded in this tab
  chrome.tabs.create({ url: url });
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

  //console.log("applyUserFilters.");
  //console.log("Before filter, userFilteredSearchResults.length = " + userFilteredSearchResults.length);

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

  //console.log("After filter, userFilteredSearchResults.length = " + userFilteredSearchResults.length);

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
      await showErrorDialog("Exceeded maximum number of search results. Stopping search.");
      break;
    }
  }

  closeProgressDialog();

  if (progressDialogResponse == "cancel") {
    return;
  }

  //console.log("Finished search, totalFetchResults.resultCount = ", totalFetchResults.resultCount);

  // clear the global var for the searchResults and popluate from fetch results
  searchResults = [];
  for (let result of totalFetchResults.singleSearchResults) {
    if (result.success && result.rows) {
      for (let row of result.rows) {
        searchResults.push(row);
      }
    }
  }

  //console.log("Populated searchResults, searchResults.length = ", searchResults.length);

  searchResults.sort(compareExtractedData);

  // we have a sorted list but it could have duplicates for deaths with large birth year range
  // it could also have birth dates that are out of range.
  if (searchParameters.type == "deaths") {
    //console.log("Before remove dupes, extractedDataObjs.length = " + searchResults.length);
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
    //console.log("After remove dupes, extractedDataObjs.length = " + searchResults.length);
  }

  addDistrictLinksToResults(searchResults);

  fillTable(searchResults);

  initFilters(searchParameters, searchResults);
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
