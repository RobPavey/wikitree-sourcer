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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let table = undefined;
  const tables = document.querySelectorAll("table.fullDetailTable");
  if (tables.length == 1) {
    table = tables[0];
  } else {
    // if the user expands more than one search result to look at it then there can be multiple
    // dialogs containing tables. All but one should be hidden
    const dialogs = document.querySelectorAll("div.ui-dialog.detailModalDialog");
    for (let dialog of dialogs) {
      if (dialog.style.display != "none") {
        table = dialog.querySelector("table.fullDetailTable");
        if (table) {
          break;
        }
      }
    }
  }

  if (!table) {
    return result;
  }

  const detailCellRows = table.querySelectorAll(
    "td.DetailCell > div > div.documentSummaries > div.properties > div.displayElementWrapper"
  );

  result.recordData = {};

  function addRecordData(label, value) {
    if (label.endsWith(":")) {
      label = label.substring(0, label.length - 1);
    }

    // For a marriage their can be two labels for each of "Gender" and "Age"
    // To avoid overriting the first we add a number of the label already exists.
    let labelNum = 1;
    let baseLabel = label;
    while (result.recordData[label] !== undefined) {
      labelNum++;
      label = baseLabel + labelNum;
    }
    result.recordData[label] = value;
  }

  for (let row of detailCellRows) {
    let labelDiv = row.querySelector("div.displayElementLabel");
    let valueDiv = row.querySelector("div.displayElementText");
    let imageLink = row.querySelector("div.displayElementText-wrap > a.preservicaItem");

    if (labelDiv) {
      let label = labelDiv.textContent.trim();

      if (label) {
        if (valueDiv) {
          addRecordData(label, valueDiv.textContent.trim());
        } else if (imageLink) {
          addRecordData(label, imageLink.getAttribute("href"));
        }
      }
    }
  }

  let recordId = result.recordData["Record ID"];
  if (recordId) {
    // A recordId like: "NAME_INDEXES:2055407" should generate a permalink like"
    // https://libraries.tas.gov.au/Record/NamesIndex/2055407
    let nameIndexRegEx = /^NAME_INDEXES\:(\d+)$/;
    if (nameIndexRegEx.test(recordId)) {
      let permaLinkNumber = recordId.replace(nameIndexRegEx, "$1");
      if (permaLinkNumber && permaLinkNumber != recordId) {
        result.permalink = "https://libraries.tas.gov.au/Record/NamesIndex/" + permaLinkNumber;
      }
    }
  }

  let resourceUrl = result.recordData["Resource"];
  if (resourceUrl) {
    // we want a permalink.
    // Example URL from href: "https://libraries.tas.gov.au/Digital/RGD37-1-16p186j2"
    // Example permalink: "https://libraries.tas.gov.au/Digital/RGD37-1-16/RGD37-1-16P186"
    const regex = /^https\:\/\/libraries\.tas\.gov\.au\/Digital\/([A-Z0-9\-]+)p(\d+).*$/;
    if (regex.test(resourceUrl)) {
      let resourceId = resourceUrl.replace(regex, "$1");
      let pageNum = resourceUrl.replace(regex, "$2");
      if (resourceId && resourceId != resourceUrl && pageNum && pageNum != resourceUrl) {
        result.resourceId = resourceId;
        result.pageNumber = pageNum;
        result.resourcePermalink =
          "https://libraries.tas.gov.au/Digital/" + resourceId + "/" + resourceId + "P" + pageNum;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
