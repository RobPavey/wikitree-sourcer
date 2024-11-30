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

// this are the main search results that the user can then flter and sort different ways
// These lways remain sorted by the default sort and they have duplicates and out-of-range
// entries removed.
var searchResults = [];

// the unsorted search results after applying user filters
var userFilteredSearchResults = [];

var showExportControls = false;
var exportOptions = {
  includeDistrictLink: true,
  fullWidth: false,
};

function getDataHeadingsForResultsTable(extractedDataObjs) {
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

  let headings = [];
  for (let heading of possibleHeadings) {
    if (usedKeys.has(heading.key)) {
      headings.push(heading);
    }
  }

  return headings;
}

function getFormattedDataValue(extractedData, heading) {
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
      //value = "(" + value + ")";
    }
  }

  return value;
}

async function exportTable(extractedDataObjs) {
  let tableString = "";
  const columnSeparator = ` ` + `||` + ` `;

  const headingColor = "#E1F0B4";

  tableString += `{|`;

  tableString += ` border="1"`;
  tableString += ` cellpadding="4"`;

  if (exportOptions.fullWidth) {
    tableString += ` width="100%"`;
  }

  tableString += `\n`;

  tableString += `|- bgcolor=` + headingColor + `\n`;

  let dataHeadings = getDataHeadingsForResultsTable(extractedDataObjs);

  // create the heading row
  let firstCol = true;
  for (let heading of dataHeadings) {
    if (firstCol) {
      tableString += `| `;
      firstCol = false;
    } else {
      tableString += columnSeparator;
    }
    let title = heading.text;
    if (title) {
      tableString += title;
    }
  }
  tableString += `\n`;

  for (let extractedData of extractedDataObjs) {
    if (!extractedData.isSelectedForExport) {
      continue;
    }

    tableString += `|-\n`;

    let firstCol = true;
    for (let heading of dataHeadings) {
      if (firstCol) {
        tableString += `| `;
        firstCol = false;
      } else {
        tableString += columnSeparator;
      }
      let value = getFormattedDataValue(extractedData, heading);

      if (value) {
        if (heading.key == "registrationDistrict" && exportOptions.includeDistrictLink) {
          if (extractedData.districtLink) {
            value = "[" + extractedData.districtLink + " " + value + "]";
          }
        }

        tableString += value;
      }
    }
    firstCol = false;
    tableString += `\n`;
  }

  tableString += `|}`;

  // table string complete, save to clipboard
  try {
    await navigator.clipboard.writeText(tableString);
  } catch (error) {
    console.log("Clipboard write failed.");
  }
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

function openGroSearchInNewTab(extractedData) {
  //console.log("openGroSearchInNewTab called, extracted data is:");
  //console.log(extractedData);

  let url = buildGroSearchUrl(extractedData);

  // we could use options to decide whether to open in new tab or window etc
  // currently don't have options loaded in this tab
  chrome.tabs.create({ url: url });
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

function addExportOptionCheckbox(key, text, parent) {
  let id = key + "Checkbox";

  // district link option
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "exportOption";
  checkbox.checked = exportOptions[key];
  checkbox.id = id;
  parent.appendChild(checkbox);
  checkbox.addEventListener("change", function () {
    exportOptions[key] = this.checked;
  });

  let label = document.createElement("label");
  label.innerText = text;
  label.htmlFor = id;
  parent.appendChild(label);
}

function fillTable(extractedDataObjs) {
  let dataHeadings = getDataHeadingsForResultsTable(extractedDataObjs);

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
  if (searchResults.length > 0 && searchResults.length != extractedDataObjs.length) {
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

  if (showExportControls) {
    let thElement = document.createElement("th");
    thElement.innerText = "Export";
    thElement.className = "resultsTableHeaderCell";
    headerElement.appendChild(thElement);
  }

  for (let heading of dataHeadings) {
    let headingText = heading.text;
    let thElement = document.createElement("th");
    thElement.innerText = headingText;
    thElement.className = "resultsTableHeaderCell";
    headerElement.appendChild(thElement);
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

    if (showExportControls) {
      // add checkbox to export
      let tdElement = document.createElement("td");
      tdElement.className = "resultsTableDataCell";
      rowElement.appendChild(tdElement);
      let checkboxElement = document.createElement("input");
      checkboxElement.type = "checkbox";
      checkboxElement.checked = extractedData.isSelectedForExport ? true : false;
      tdElement.appendChild(checkboxElement);
      checkboxElement.addEventListener("change", function () {
        extractedData.isSelectedForExport = this.checked;
      });
    }

    for (let heading of dataHeadings) {
      let value = getFormattedDataValue(extractedData, heading);

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
        linkElement.setAttribute("target", "_blank"); // opens in new tab
        linkElement.innerText = value;
        tdElement.appendChild(linkElement);
      } else {
        tdElement.innerText = value;
      }

      tdElement.className = "resultsTableDataCell";

      if (extractedData[heading.key + "Implied"]) {
        tdElement.classList.add("valueImplied");
      }

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

  // export controls
  let exportControlsElement = document.createElement("div");
  containerElement.appendChild(exportControlsElement);
  exportControlsElement.className = "exportControls";

  let showExportControlsCheckbox = document.createElement("input");
  showExportControlsCheckbox.type = "checkbox";
  showExportControlsCheckbox.id = "showExportControlsCheckbox";
  showExportControlsCheckbox.checked = showExportControls;
  exportControlsElement.appendChild(showExportControlsCheckbox);
  showExportControlsCheckbox.addEventListener("change", function () {
    showExportControls = this.checked;
    fillTable(extractedDataObjs);
  });

  let showExportControlsLabel = document.createElement("label");
  showExportControlsLabel.innerText = "Show export controls";
  showExportControlsLabel.htmlFor = "showExportControlsCheckbox";
  exportControlsElement.appendChild(showExportControlsLabel);

  if (showExportControls) {
    let exportButton = document.createElement("button");
    exportButton.id = "exportButton";
    exportButton.innerText = "Export";
    exportControlsElement.appendChild(exportButton);
    exportButton.addEventListener("click", function () {
      exportTable(extractedDataObjs);
    });

    addExportOptionCheckbox("includeDistrictLink", "Include district links", exportControlsElement);
    addExportOptionCheckbox("fullWidth", "Full width table", exportControlsElement);
  }
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

  function applySelectFilter(id, edKey) {
    let selectElement = document.getElementById(id);
    if (selectElement) {
      // Get all selected options
      const selectedOptions = Array.from(selectElement.selectedOptions);

      // Get the values of the selected options
      const selectedValues = selectedOptions.map((option) => option.value);

      if (selectedValues.length > 0 && !selectedValues.includes("ALL")) {
        userFilteredSearchResults = userFilteredSearchResults.filter(function (item, pos, ary) {
          let value = item[edKey];
          if (value) {
            return selectedValues.includes(value);
          } else {
            return selectedValues.includes(" ");
          }
        });
      }
    }
  }

  applySelectFilter("filterByDistrict", "registrationDistrict");
  applySelectFilter("filterByMmn", "mothersMaidenName");
  applySelectFilter("filterBySurname", "lastName");

  //console.log("After filter, userFilteredSearchResults.length = " + userFilteredSearchResults.length);

  applyUserSorting();

  fillTable(userFilteredSearchResults);
}

function applyUserSorting() {}

function initFilters(searchParameters) {
  let extractedDataObjs = searchResults;
  let districts = [];
  let mmns = [];
  let surnames = [];

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

    let surname = extractedData.lastName;
    if (surname === undefined) {
      surname = " ";
    }
    if (!surnames.includes(surname)) {
      surnames.push(surname);
    }
  }

  districts.sort();
  mmns.sort();
  surnames.sort();

  clearFilters();

  let resultsFilterContainer = document.getElementById("resultsFilterContainer");
  if (!resultsFilterContainer) {
    return;
  }

  function addSelectFilter(label, stringArray, id) {
    if (stringArray.length > 1) {
      let selectDiv = document.createElement("div");
      selectDiv.className = "filterSelectDiv";
      resultsFilterContainer.appendChild(selectDiv);

      let labelElement = document.createElement("label");
      labelElement.innerText = label;
      labelElement.className = "filterSelectLabel";
      selectDiv.appendChild(labelElement);

      let selectElement = document.createElement("select");
      selectElement.id = id;
      selectElement.className = "filterSelect";
      selectElement.multiple = true;
      selectDiv.appendChild(selectElement);

      // add initial "ALL" element
      {
        let optionElement = document.createElement("option");
        optionElement.innerText = "Show All";
        optionElement.value = "ALL";
        selectElement.appendChild(optionElement);
      }

      for (let string of stringArray) {
        let optionElement = document.createElement("option");
        optionElement.innerText = string;
        optionElement.value = string;
        selectElement.appendChild(optionElement);
      }

      selectElement.addEventListener("change", (event) => {
        applyUserFilters();
      });
    }
  }

  addSelectFilter("Select districts:", districts, "filterByDistrict");
  addSelectFilter("Select MMNs:", mmns, "filterByMmn");
  addSelectFilter("Select surnames:", surnames, "filterBySurname");

  let clearDiv = document.createElement("div");
  clearDiv.className = "filterSelectClear";
  resultsFilterContainer.appendChild(clearDiv);
}

function addResult(searchResult) {
  searchResults.push(searchResult);
}

function doesExtractedDataMatchParameters(ed, searchParameters) {
  if (searchParameters.type == "births") {
    let lcMmn = searchParameters.mmn;
    if (lcMmn) {
      lcMmn = lcMmn.toLowerCase().trim();
    }
    let mmnMatches = searchParameters.mmnMatches;
    if (lcMmn && (ed.eventYear > 1923 || mmnMatches == "0")) {
      let lcRowMmn = ed.mothersMaidenName;
      if (lcRowMmn) {
        lcRowMmn = lcRowMmn.toLowerCase().trim();
      }
      if (lcMmn != lcRowMmn) {
        return false;
      }
    }
  } else {
    let year = ed.eventYear;
    let age = ed.ageAtDeath;
    let birthYear = ed.birthYear;
    if (!birthYear) {
      if (age !== undefined) {
        birthYear = year - age;
        ed.birthYear = birthYear;
        ed.birthYearImplied = true;
      }
    } else if (age === undefined) {
      age = year - birthYear;
      ed.ageAtDeath = age;
      ed.ageAtDeathImplied = true;
    }

    //console.log("filtering element, birthYear = " + birthYear + ", age = " + age);

    if (birthYear) {
      let startBirthYear = searchParameters.startBirthYear;
      let endBirthYear = searchParameters.endBirthYear;
      if (ed.birthYearImplied) {
        // we computed the birth year from the age, this can be off by one
        // for example if a person died in 1850 age 0 the birth year can be
        // 1850 or 1849 but we set the implied value to 1850. So if they user has set
        // endBirthYear to 1849 it will miss it. So include an extra year.
        if (endBirthYear) {
          endBirthYear += 1;
        }
      }
      if ((startBirthYear && birthYear < startBirthYear) || (endBirthYear && birthYear > endBirthYear)) {
        //console.log("removing element with birthYear of: " + birthYear);
        return false;
      }
    }
  }

  return true;
}

function sortPruneAndShowResults(searchParameters) {
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
          item.ageAtDeath = age;
          item.ageAtDeathImplied = true;
        }

        //console.log("filtering element, birthYear = " + birthYear + ", age = " + age);

        if (birthYear) {
          let startBirthYear = searchParameters.startBirthYear;
          let endBirthYear = searchParameters.endBirthYear;
          if (item.birthYearImplied) {
            // we computed the birth year from the age, this can be off by one
            // for example if a person died in 1850 age 0 the birth year can be
            // 1850 or 1849 but we set the implied value to 1850. So if they user has set
            // endBirthYear to 1849 it will miss it. So include an extra year.
            if (endBirthYear) {
              endBirthYear += 1;
            }
          }
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
}

function clearResults() {
  searchResults = [];
}

export {
  clearResults,
  addResult,
  doesExtractedDataMatchParameters,
  sortPruneAndShowResults,
  clearResultsTable,
  initFilters,
  clearFilters,
};
