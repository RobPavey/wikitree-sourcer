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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

// The site only covers Yorkshire so the county is rarely shown on the page
const defaultCounty = "Yorkshire";

// Maps the ed field names to the labels that the site uses for them.
// Search result column headings and record page labels are both included.
const fieldLabels = {
  name: ["christian name and surname", "christian name & surname", "name", "full name", "deceased"],
  surname: ["surname", "last name"],
  forenames: [
    "forenames",
    "forename",
    "forename(s)",
    "christian name",
    "christian names",
    "given names",
    "first names",
  ],
  sex: ["sex", "gender"],
  burialDate: ["date of burial", "burial date", "date buried", "event date", "date"],
  deathDate: ["date of death", "death date", "died"],
  age: ["age", "age at death"],
  birthYear: ["birth year", "year of birth"],
  cemetery: ["cemetery", "burial ground", "churchyard", "church"],
  parish: ["parish", "area", "township"],
  county: ["county"],
  grave: ["grave", "grave reference", "grave details", "grave ref", "plot"],
  graveType: ["grave type", "consecration"],
  graveSection: ["grave section", "section"],
  graveNumber: ["no. of grave", "no of grave", "grave number", "grave no", "grave no."],
  register: ["register", "register book", "register volume"],
  registerPage: ["page", "register page", "page no", "page no."],
  registerEntry: ["register entry", "entry", "entry no", "entry no.", "entry number"],
  abode: ["abode", "address", "residence"],
  trade: ["trade", "occupation", "description"],
};

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
  }
  return text;
}

function cleanLabel(inputText) {
  let label = cleanText(inputText);
  if (label) {
    label = label.replace(/\s*:$/, "");
  }
  return label;
}

function addRecordDataValue(result, label, value) {
  label = cleanLabel(label);
  value = cleanText(value);
  if (label && value && !result.recordData[label]) {
    result.recordData[label] = value;
  }
}

function getRecordDataValueForField(recordData, fieldName) {
  // labels are in priority order, e.g. "date of burial" is preferred over a generic "date"
  const keys = Object.keys(recordData);
  for (let label of fieldLabels[fieldName]) {
    for (let key of keys) {
      if (key.toLowerCase() == label) {
        return recordData[key];
      }
    }
  }
  return "";
}

function buildGraveReference(result) {
  let grave = getRecordDataValueForField(result.recordData, "grave");
  if (grave) {
    return grave;
  }

  // Build it in the same style as the Grave column in the search results
  // e.g. "Unconsecrated, Sec Old, No. 5928"
  let parts = [];
  let graveType = getRecordDataValueForField(result.recordData, "graveType");
  if (graveType) {
    parts.push(graveType);
  }
  let graveSection = getRecordDataValueForField(result.recordData, "graveSection");
  if (graveSection) {
    parts.push("Sec " + graveSection);
  }
  let graveNumber = getRecordDataValueForField(result.recordData, "graveNumber");
  if (graveNumber) {
    parts.push("No. " + graveNumber);
  }
  return parts.join(", ");
}

function buildRegisterReference(result) {
  let parts = [];
  let register = getRecordDataValueForField(result.recordData, "register");
  if (register) {
    parts.push(register);
  }
  let registerPage = getRecordDataValueForField(result.recordData, "registerPage");
  if (registerPage) {
    parts.push("Page " + registerPage);
  }
  let registerEntry = getRecordDataValueForField(result.recordData, "registerEntry");
  if (registerEntry) {
    if (parts.length) {
      parts.push("Entry " + registerEntry);
    } else {
      parts.push(registerEntry);
    }
  }
  return parts.join(", ");
}

function buildRecordUrl(href, pageUrl) {
  if (!href) {
    return "";
  }

  let recordUrl = href;
  try {
    let urlObj = new URL(href, pageUrl);
    let uuid = urlObj.searchParams.get("uuid");
    if (uuid) {
      urlObj.search = "?uuid=" + uuid;
    }
    urlObj.hash = "";
    recordUrl = urlObj.toString();
  } catch (error) {
    // leave it as the original href
  }
  return recordUrl;
}

function setStandardFields(result) {
  const recordData = result.recordData;

  let name = getRecordDataValueForField(recordData, "name");
  let surname = getRecordDataValueForField(recordData, "surname");
  let forenames = getRecordDataValueForField(recordData, "forenames");
  if (!name && (surname || forenames)) {
    name = [forenames, surname].filter(Boolean).join(" ");
  }
  if (name) {
    result.name = name;
  }
  if (surname) {
    result.surname = surname;
  }
  if (forenames) {
    result.forenames = forenames;
  }

  const simpleFields = ["sex", "burialDate", "deathDate", "age", "birthYear", "cemetery", "parish", "abode", "trade"];
  for (let fieldName of simpleFields) {
    let value = getRecordDataValueForField(recordData, fieldName);
    if (value) {
      result[fieldName] = value;
    }
  }

  let county = getRecordDataValueForField(recordData, "county");
  result.county = county ? county : defaultCounty;

  let graveReference = buildGraveReference(result);
  if (graveReference) {
    result.graveReference = graveReference;
  }

  let registerReference = buildRegisterReference(result);
  if (registerReference) {
    result.registerReference = registerReference;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Search results page
////////////////////////////////////////////////////////////////////////////////

function getResultsTable(document) {
  return document.querySelector("table#resultsTable");
}

function getSelectedRow(resultsTable) {
  const tbody = resultsTable.querySelector("tbody");
  if (!tbody) {
    return undefined;
  }

  let selectedRow = tbody.querySelector("tr.sourcerSelected");
  if (!selectedRow) {
    // With only one result there is no ambiguity so no need to click on it
    const rows = tbody.querySelectorAll("tr");
    if (rows.length == 1) {
      selectedRow = rows[0];
    }
  }
  return selectedRow;
}

function extractDataFromSearchResultRow(resultsTable, row, result) {
  // The second header row contains the column filter inputs
  const headerRow = resultsTable.querySelector("thead tr");
  if (!headerRow) {
    return;
  }

  const headings = headerRow.querySelectorAll("th");
  const cells = row.querySelectorAll("td");
  if (!headings.length || headings.length != cells.length) {
    return;
  }

  for (let index = 0; index < cells.length; index++) {
    addRecordDataValue(result, headings[index].textContent, cells[index].textContent);

    const link = cells[index].querySelector("a[href*='view_record']");
    if (link) {
      result.recordUrl = buildRecordUrl(link.getAttribute("href"), result.url);
    }

    const sortableDate = cells[index].getAttribute("data-order");
    if (sortableDate && /^\d\d\d\d-\d\d-\d\d$/.test(sortableDate)) {
      result.burialDateIso = sortableDate;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Record page
////////////////////////////////////////////////////////////////////////////////

function isHeaderOnlyRow(row) {
  const cells = row.querySelectorAll("th, td");
  return cells.length > 0 && row.querySelectorAll("th").length == cells.length;
}

function extractLabelValuePairsFromTables(container, result) {
  const rows = container.querySelectorAll("table tr");
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const cells = row.querySelectorAll("th, td");

    // Column layout: a row of labels followed by a row of values
    // e.g. | Register | Page | No. of Grave |
    //      | 12       | 34   | 5678         |
    if (isHeaderOnlyRow(row) && cells.length > 2 && rowIndex + 1 < rows.length) {
      const valueRow = rows[rowIndex + 1];
      const valueCells = valueRow.querySelectorAll("td");
      if (!isHeaderOnlyRow(valueRow) && valueCells.length == cells.length) {
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          addRecordDataValue(result, cells[cellIndex].textContent, valueCells[cellIndex].textContent);
        }
        rowIndex++;
        continue;
      }
    }

    // Row layout: one or more label/value pairs per row
    // e.g. | Date of Burial | 20 April 1875 | Date of Death | 17 April 1875 |
    if (cells.length >= 2 && cells.length % 2 == 0) {
      for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 2) {
        addRecordDataValue(result, cells[cellIndex].textContent, cells[cellIndex + 1].textContent);
      }
    }
  }
}

function extractLabelValuePairsFromDefinitionLists(container, result) {
  const terms = container.querySelectorAll("dl dt");
  for (let term of terms) {
    const definition = term.nextElementSibling;
    if (definition && definition.tagName == "DD") {
      addRecordDataValue(result, term.textContent, definition.textContent);
    }
  }
}

function extractLabelValuePairsFromBoldLabels(container, result) {
  // Handles layouts like "<p><strong>Age:</strong> 41 years</p>" or
  // "<div><strong>Age</strong></div><div>41 years</div>"
  const labelElements = container.querySelectorAll("strong, b, label");
  for (let labelElement of labelElements) {
    const label = cleanLabel(labelElement.textContent);
    if (!label || label.length > 40) {
      continue;
    }

    let value = "";
    const parent = labelElement.parentElement;
    if (parent) {
      const parentText = cleanText(parent.textContent);
      const labelText = cleanText(labelElement.textContent);
      if (parentText.startsWith(labelText)) {
        value = parentText.substring(labelText.length);
      }
    }
    if (!cleanText(value)) {
      let sibling = labelElement.nextElementSibling;
      if (!sibling && parent) {
        sibling = parent.nextElementSibling;
      }
      if (sibling) {
        value = sibling.textContent;
      }
    }
    addRecordDataValue(result, label, value);
  }
}

function extractNameFromHeading(container) {
  const genericHeadingWords = /yorkshire burials|burial record|record details|search|report/i;
  const headings = container.querySelectorAll("h1, h2");
  for (let heading of headings) {
    const text = cleanText(heading.textContent);
    if (text && !genericHeadingWords.test(text)) {
      return text;
    }
  }
  return "";
}

function extractDataFromRecordPage(document, result) {
  let container = document.querySelector("main");
  if (!container) {
    container = document.body;
  }
  if (!container) {
    return;
  }

  extractLabelValuePairsFromTables(container, result);
  extractLabelValuePairsFromDefinitionLists(container, result);
  extractLabelValuePairsFromBoldLabels(container, result);

  if (!getRecordDataValueForField(result.recordData, "name")) {
    const name = extractNameFromHeading(container);
    if (name) {
      result.recordData["Name"] = name;
    }
  }

  result.recordUrl = buildRecordUrl(result.url, result.url);
}

////////////////////////////////////////////////////////////////////////////////
// Main entry point
////////////////////////////////////////////////////////////////////////////////

function isRecordPage(url) {
  if (!url) {
    return false;
  }

  const recordPathRegex = /\/records\/view_record\.php$/i;
  try {
    return recordPathRegex.test(new URL(url).pathname);
  } catch (error) {
    return /\/records\/view_record\.php(?:[?#]|$)/i.test(url);
  }
}

function extractData(document, url) {
  let result = { url: url, success: false, recordData: {} };

  if (isRecordPage(url)) {
    result.pageType = "record";
    extractDataFromRecordPage(document, result);
  } else {
    const resultsTable = getResultsTable(document);
    if (!resultsTable) {
      return result;
    }
    const selectedRow = getSelectedRow(resultsTable);
    if (!selectedRow) {
      return result;
    }
    result.pageType = "searchResult";
    extractDataFromSearchResultRow(resultsTable, selectedRow, result);
  }

  setStandardFields(result);

  if (result.name) {
    result.success = true;
  }

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
