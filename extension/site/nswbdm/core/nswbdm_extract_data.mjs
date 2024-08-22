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

function getSelectedRow(document) {
  const highlightStyle = "font-weight: bold; font-style: italic";
  const elResultsTable = document.querySelector("#form div.table-row");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("div.detail-columns[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  const form = document.querySelector("#form");
  if (!form) {
    return result;
  }

  const rowDivs = form.querySelectorAll("div.table-row > div.even,.odd");
  if (rowDivs.length < 1) {
    return result;
  }

  let selectedRow = getSelectedRow(document);
  if (!selectedRow) {
    selectedRow = rowDivs[0];
  }

  let colDivs = selectedRow.querySelectorAll("div.detail-columns > div");
  if (colDivs.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let colDiv of colDivs) {
    let lastNameSpan = colDiv.querySelector("span.ds-lastname");
    if (lastNameSpan) {
      // this is the column with the first and last name (which are actually reversed)
      // This column only exists on births and deaths
      result.firstName = lastNameSpan.textContent.trim();
      let firstNameSpan = colDiv.querySelector("span.ds-firstname");
      if (firstNameSpan) {
        result.lastName = firstNameSpan.textContent.trim();
      }
    } else {
      let spans = colDiv.querySelectorAll("span");
      if (spans.length == 1) {
        let tagDiv = colDiv.querySelector("div.tag");
        let span = colDiv.querySelector("span");
        if (tagDiv && span) {
          let key = tagDiv.textContent.trim();
          let value = span.textContent.trim();
          if (key && value) {
            result.recordData[key] = value;
          }
        }
      } else if (spans.length > 1) {
        // this is the registration number
        let tagDiv = colDiv.querySelector("div.tag");
        let tagString = tagDiv.textContent.trim();
        let tagStringLc = tagString.toLowerCase();
        if (tagStringLc == "registration number") {
          let registrationNumberParts = [];
          for (let span of spans) {
            let value = span.textContent.trim();
            if (value) {
              registrationNumberParts.push(value);
            }
          }
          if (registrationNumberParts.length) {
            result.registrationNumberParts = registrationNumberParts;
          }
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
