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
  const elResultsTable = document.querySelector("div.main-content div.page-wrapper table tbody");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // to get the type of record look at the heading like "Birth Search"
  let header = document.querySelector("div.main-content div.document-info h1 > a");
  if (header) {
    let text = header.textContent.trim();
    let link = header.getAttribute("href");
    result.headerText = text;
    result.headerLink = link;
  }

  let infoParas = document.querySelectorAll("div.main-content div.document-info p");
  for (let infoPara of infoParas) {
    let textContent = infoPara.textContent.trim();
    if (textContent.startsWith("Reference:")) {
      result.reference = textContent;
    }
  }

  const pageInfos = document.querySelectorAll("div.main-content div.page-wrapper div.page-info");
  if (pageInfos.length == 1) {
    let pageInfo = pageInfos[0];
    let pageHeading = pageInfo.querySelector("h2");
    if (pageHeading) {
      result.pageHeading = pageHeading.textContent.trim();
    }
    let spans = pageInfo.querySelectorAll("span");
    if (spans.length > 0) {
      result.pageSpans = [];
      for (let span of spans) {
        let text = span.textContent.trim();
        result.pageSpans.push(text);
      }
    }
  }

  const resultsTable = document.querySelector("div.main-content div.page-wrapper table");

  if (!resultsTable) {
    return result;
  }

  let headingRow = resultsTable.querySelector("thead > tr");
  let resultRows = resultsTable.querySelectorAll("tbody > tr");

  if (!headingRow || !resultRows.length) {
    return result;
  }

  // by default we use the first row as the record to extract
  let selectedResultRow = resultRows[0];
  // but if there is a user selected row we use that row
  let userSelectedRowElement = getSelectedRow(document);
  if (userSelectedRowElement) {
    selectedResultRow = userSelectedRowElement;
    result.isRowSelected = true;
  }

  let headingFields = headingRow.querySelectorAll("th");
  let resultFields = selectedResultRow.querySelectorAll("td");

  if (!headingFields.length || !resultFields.length) {
    return result;
  }

  result.recordData = {};

  for (let index = 0; index < headingFields.length; index++) {
    let headingNode = headingFields[index];
    let valueNode = resultFields[index];

    let heading = headingNode.textContent.trim();
    let value = valueNode.textContent.trim();

    if (heading) {
      result.recordData[heading] = value;
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
