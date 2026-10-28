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
  const resultsTableBody = document.querySelector("table.pi-table > tbody");
  if (resultsTableBody) {
    const selectedRow = resultsTableBody.querySelector("tr.sourcerSelected");
    return selectedRow;
  }
}

function extractDataGivenRow(document, row, result) {
  let tds = row.querySelectorAll("td");
  if (tds.length) {
    let table = row.closest("table");
    if (table) {
      let ths = table.querySelectorAll("thead tr th");
      if (tds.length == ths.length) {
        result.recordData = {};
        for (let index = 0; index < tds.length; index++) {
          let keyElement = ths[index];
          let valueElement = tds[index];
          if (keyElement && valueElement) {
            let key = keyElement.textContent.trim();
            let value = valueElement.textContent.trim();
            if (key && value) {
              result.recordData[key] = value;
            }
          }
        }
      }
    }
  }

  result.success = true;
}

function extractData(document, url) {
  let result = { url: url, success: false };

  let section = document.querySelector("pioneers-index > section");

  if (!section) {
    // This is nonly needed in node.js unit tests using jsdom
    // The HTML on the page is bad because the pioneers-index element is nested in
    // a paragraph tag which is illegal. The browser seems to fix it up OK but jsdom does not.
    // Looks for the section that was kicked out right after the paragraph
    section = document.querySelector("p > pioneers-index")
      ? document.querySelector("p + section")
      : document.querySelector("pioneers-index + section");
  }

  if (!section) {
    return result;
  }

  let recordType = "";
  let app = section.querySelector("app-birth-search");
  if (app) {
    recordType = "birth";
  } else {
    app = section.querySelector("app-death-search");
    if (app) {
      recordType = "death";
    } else {
      app = section.querySelector("app-marriage-search");
      if (app) {
        recordType = "marriage";
      } else {
        return result;
      }
    }
  }

  result.recordType = recordType;

  let selectedRow = getSelectedRow(document);
  if (!selectedRow) {
    let tbody = app.querySelector("table > tbody");
    if (tbody) {
      let firstRow = tbody.querySelector("tr");
      if (firstRow) {
        selectedRow = firstRow;
      }
    }
  }

  if (!selectedRow) {
    return result;
  }

  extractDataGivenRow(document, selectedRow, result);
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
