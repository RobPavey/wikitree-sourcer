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

//!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
// insert code here to do detect the selected row by looking for the styling that
// was added in the content script when the row was clicked. Code below is an example.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function getSelectedRow(document) {
  const highlightStyle = "font-weight: bold; font-style: italic";
  const elResultsTable = document.querySelector(".table");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractData(document, url) {
  let result = { url: url, success: false };

  //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
  // insert code here to extract the data from the selected search result on the page.
  // See extension/site/nswbdm/browser/nswbdm_extract_data.js for an example.
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const h3 = document.querySelector("div.content > h3");
  if (h3) {
    result.collectionName = h3.firstChild.textContent.trim();
    const h3Small = h3.querySelector("small");
    if (h3Small) {
      result.repository = h3Small.textContent;
    }
  }

  const decedentTable = document.querySelector(".table"); // retrieve decedent results table
  if (!decedentTable) {
    return result;
  }

  const tableRows = decedentTable.querySelectorAll("tr"); // retrieve all table rows including the first/header row
  if (!tableRows || tableRows.length < 2) {
    return result;
  }

  let headerCells = tableRows[0].querySelectorAll("th");
  if (!headerCells || headerCells.length < 1) {
    return result;
  }

  let selectedRow = getSelectedRow(document);
  if (!selectedRow) {
    // if user doesn't select a row, use the first non-header row
    selectedRow = tableRows[1];
  }

  let tableCells = selectedRow.querySelectorAll("td");
  if (tableCells.length < 1) {
    return result;
  }

  result.recordData = {};
  for (let i = 0; i < tableCells.length; i++) {
    if (tableCells[i].textContent.trim() !== "-  -" && tableCells[i].textContent.trim() !== "- -") {
      let key = headerCells[i].textContent.trim();
      if (headerCells[i].textContent.trim().includes("ofDeceased")) {
        key = headerCells[i].textContent.trim().replace("ofDeceased", "of Deceased");
      }
      // drop N/A fields
      result.recordData[key] = tableCells[i].textContent.trim();
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
