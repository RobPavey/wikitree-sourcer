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
  const resultsTable = document.querySelector("#main-content > div > div > table > tbody");
  if (resultsTable) {
    const selectedRow = resultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // First extract the search data, it will be there for all types of results
  let summaryList = document.querySelector("#main-content > dl.govuk-summary-list");
  if (summaryList) {
    let searchData = {};
    let rows = summaryList.querySelectorAll("div.govuk-summary-list__row");
    for (let row of rows) {
      let keyElement = row.querySelector("dt.govuk-summary-list__key");
      let valueElement = row.querySelector("dd.govuk-summary-list__value");
      if (keyElement && valueElement) {
        let key = keyElement.textContent;
        let value = valueElement.textContent;
        if (key && value) {
          searchData[key] = value;
        }
      }

      result.searchData = searchData;
    }
  }

  // See if there are digital results
  result.digitalResultCount = 0;
  let digitalCaption = document.querySelector("#main-content caption.govuk-table__caption");
  if (digitalCaption) {
    let captionText = digitalCaption.textContent;
    const suffix = " results returned";
    if (captionText.endsWith(suffix)) {
      let countString = captionText.substring(0, captionText.length - suffix.length);
      if (countString != "0") {
        let count = Number(countString);
        if (count && !isNaN(count)) {
          result.digitalResultCount = count;
        }
      }
    } else if (captionText == "1 result returned") {
      result.digitalResultCount = 1;
    }
  }

  // See if there are document results
  result.documentResultCount = 0;
  const possibleDocumentPagesElements = document.querySelectorAll("#main-content > div > p");
  for (let element of possibleDocumentPagesElements) {
    const text = element.textContent;
    const suffix = " document pages returned";
    if (text && text.endsWith(suffix)) {
      const countString = text.substring(0, text.length - suffix.length);
      if (countString != "0") {
        let count = Number(countString);
        if (count && !isNaN(count)) {
          result.documentResultCount = count;
        }
      }
      break;
    } else if (text == "1 document page returned") {
      result.documentResultCount = 1;
    }
  }

  if (result.digitalResultCount) {
    // #main-content > div:nth-child(5) > div > table > thead
    let table = document.querySelector("#main-content > div > div > table");
    if (table) {
      let thead = table.querySelector("thead");
      let tbody = table.querySelector("tbody");
      if (thead && tbody) {
        let rows = tbody.querySelectorAll("tr");
        if (rows.length > 0) {
          // by default we use the first row as the record to extract
          let selectedRowElement = rows[0];
          // but if there is a user selected row we use that row
          let userSelectedRowElement = getSelectedRow(document);
          if (userSelectedRowElement) {
            selectedRowElement = userSelectedRowElement;
            result.isRowUserSelected = true;
          }

          let headingElements = thead.querySelectorAll("tr > th");
          let headings = [];
          for (let th of headingElements) {
            headings.push(th.textContent);
          }

          let cellElements = selectedRowElement.querySelectorAll("td");
          if (cellElements.length == headings.length) {
            let digitalRecord = {};
            for (let i = 0; i < cellElements.length; i++) {
              let cell = cellElements[i];
              let cellText = cell.textContent.trim();
              let heading = headings[i];
              if (cellText && heading && cellText != "Add to basket") {
                digitalRecord[heading] = cellText;
              }
            }
            result.digitalRecordData = digitalRecord;
          }
        }
      }
    }
  }

  // Test to see if we are viewing the document page
  const fullScreenPdf = document.querySelector("#main-content > div.fullscreen-pdf");
  if (fullScreenPdf) {
    result.isImage = true;
  }

  // sometimes there are image results but no image selected - in this case it is not a valid result
  if (result.isImage || result.digitalRecordData) {
    result.success = true;
  }

  //console.log(result);

  return result;
}

export { extractData };
