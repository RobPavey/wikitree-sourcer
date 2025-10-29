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

//!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
// insert code here to do detect the selected row by looking for the styling that
// was added in the content script when the row was clicked. Code below is an example.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function getSelectedRow(document) {
  const highlightStyle = "font-weight: bold; font-style: italic";
  const deathCertTable = document.querySelector("table#DeathCertTable");
  if (deathCertTable) {
    const selectedRow = deathCertTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractAllNames(nameString) {
  // in addition to deceased, there may be names for spouse, father, and mother
  let names = [];
  const deceasedString = "- Deceased";
  const spouseString = "- Spouse";
  const fatherString = "- Father";
  const motherString = "- Mother";
  const deceasedNameEnd = nameString.indexOf(deceasedString);
  if (deceasedNameEnd > 0) {
    names[deceasedString.substring(2)] = nameString.substring(0, deceasedNameEnd).trim();
    let currentStartIndex = deceasedNameEnd + deceasedString.length;
    const spouseNameEnd = nameString.indexOf(spouseString);
    if (spouseNameEnd > 0) {
      names[spouseString.substring(2)] = nameString.substring(currentStartIndex, spouseNameEnd).trim();
      currentStartIndex = spouseNameEnd + spouseString.length;
    }
    const fatherNameEnd = nameString.indexOf(fatherString);
    if (fatherNameEnd > 0) {
      names[fatherString.substring(2)] = nameString.substring(currentStartIndex, fatherNameEnd).trim();
      currentStartIndex = fatherNameEnd + fatherString.length;
    }
    const motherNameEnd = nameString.indexOf(motherString);
    if (motherNameEnd > 0) {
      names[motherString.substring(2)] = nameString.substring(currentStartIndex, motherNameEnd).trim();
      currentStartIndex = motherNameEnd + motherString.length; // probably don't need this
    }
  } else {
    //should always be a deceased name
  }
  return names;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  const collectionName = document.querySelector("h1.titleUnderline");
  if (collectionName) {
    result.collectionName = collectionName.textContent;
  }

  const deathCertTable = document.querySelector("table#DeathCertTable"); // retrieve results table
  if (!deathCertTable) {
    return result;
  }

  const tableHeader = deathCertTable.querySelector("tr[data-sortable]"); // retrieve result table header row
  if (!tableHeader) {
    return result;
  }
  let headerKeyValuePairs = {};
  let headerCells = tableHeader.querySelectorAll("th");
  if (headerCells.length < 1) {
    return result;
  } else {
    for (let headerCell of headerCells) {
      let key = headerCell.className.trim();
      if (key != "Image") {
        let value = headerCell.querySelector("span").textContent.trim();
        if (key && value) {
          headerKeyValuePairs[key] = value;
        }
      }
    }
  }

  const tableRows = deathCertTable.querySelectorAll("tr:not([data-sortable])"); // retrieve the rest of the result table rows
  if (tableRows.length < 1) {
    return result;
  }

  let selectedRow = getSelectedRow(document);
  if (!selectedRow) {
    // if user doesn't select a row, use the first row?
    selectedRow = tableRows[0];
  }

  result.recordData = {};
  let tableCells = selectedRow.querySelectorAll("td");
  if (tableCells.length < 1) {
    return result;
  } else {
    for (let tableCell of tableCells) {
      let key = tableCell.className.trim();
      let value = tableCell.textContent.trim();
      if (key == "Image") {
        let anchor = tableCell.querySelector("a");
        if (anchor) {
          value = anchor.href;
          if (key && value) {
            result.recordData[key] = value;
          }
        }
      } else if (key == "Name") {
        // in addition to deceased, there may be names for spouse, father, and mother
        let allNames = extractAllNames(value);
        for (const key in allNames) {
          if (allNames.hasOwnProperty(key)) {
            const value = allNames[key];
            if (key && value) {
              result.recordData[key] = value;
            }
          }
        }
      } else {
        if (key && value) {
          // use the header text as record data key
          let headerText = headerKeyValuePairs[key];
          result.recordData[headerText] = value;
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
