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

const highlightStyle = "background-color: palegoldenrod";

function getRefRecordKey(recordType) {
  // this is a cut-down version of the scotpRecordTypes in scotp_record_type.mjs since we do not want
  // to import that in the content script
  const scotpRecordTypes = {
    ///////////////////// Statutory Registers ///////////////////////
    stat_births: { ref: "Ref" },
    stat_marriages: { ref: "Ref" },
    stat_divorces: { ref: "Serial Number" },
    stat_deaths: { ref: "Ref" },
    civilpartnership: { ref: "RD/EntryNumber" },
    dissolutions: { ref: "Serial Number" },
    ///////////////////// Church Registers ///////////////////////
    opr_births: { ref: "Ref" },
    opr_marriages: { ref: "Ref" },
    opr_deaths: { ref: "Ref" },
    ///////////////////// Census ///////////////////////
    census: { ref: "Ref" },
    census_lds: { ref: "Ref" },
    ///////////////////// Valuation Rolls ///////////////////////
    valuation_rolls: { ref: "Reference Number" },
    ///////////////////// Legal ///////////////////////
    wills_testaments: { ref: "Reference Number" },
    coa: { ref: "Record Number" },
  };

  let value = "";
  let type = scotpRecordTypes[recordType];
  if (type) {
    value = type.ref;
  }

  return value;
}

function addClickedRowListener() {
  const elResultsTable = document.querySelector(".results-table-wrapper .sticky-table tbody");
  if (elResultsTable && !elResultsTable.hasAttribute("listenerOnClick")) {
    elResultsTable.setAttribute("listenerOnClick", "true");
    elResultsTable.addEventListener("click", function (ev) {
      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        selectedRow.removeAttribute("style");
      }
      selectedRow = ev.target;
      if (selectedRow) {
        selectedRow = selectedRow.closest("tr");
        if (selectedRow) {
          selectedRow.setAttribute("style", highlightStyle);
        }
      }
    });
  }
}

function getClickedRow() {
  const elResultsTable = document.querySelector(".results-table-wrapper .sticky-table tbody");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

async function doHighlightForRefQuery() {
  let url = location.href;

  //console.log("doHighlightForRefQuery: url = " + url);

  const refQuery = "&ref=";
  let refIndex = url.indexOf(refQuery);
  if (refIndex != -1) {
    // there is a ref query, extract the ref value from the URL
    let ampIndex = url.indexOf("&", refIndex + refQuery.length);
    if (ampIndex == -1) {
      ampIndex = url.length;
    }
    let refValue = url.substring(refIndex + refQuery.length, ampIndex);
    if (!refValue) {
      return;
    }

    //console.log("doHighlightForRefQuery: refValue = " + refValue);

    // extract the record_type from url
    const rt1Query = "&record_type=";
    let rtIndex = url.indexOf(rt1Query);
    if (rtIndex != -1) {
      rtIndex += rt1Query.length;
    } else {
      const rt2Query = "&record_type%5B0%5D=";
      rtIndex = url.indexOf(rt2Query);
      if (rtIndex != -1) {
        rtIndex += rt2Query.length;
      } else {
        return;
      }
    }
    ampIndex = url.indexOf("&", rtIndex);
    if (ampIndex == -1) {
      ampIndex = url.length;
    }
    let recordType = url.substring(rtIndex, ampIndex);

    // work out what key to look for
    let refKey = getRefRecordKey(recordType);
    if (!refKey) {
      return;
    }

    let resultsTableWrapper = document.querySelector("div.results-table-wrapper");
    if (!resultsTableWrapper) {
      return;
    }
    let resultsTable = resultsTableWrapper.querySelector("table.table");
    if (!resultsTable) {
      return;
    }
    let headerRow = resultsTable.querySelector("thead > tr");
    if (!headerRow) {
      return;
    }
    let headerCells = headerRow.querySelectorAll("th");

    // find the refKey in the header cells to get the right column index
    let refKeyColumnIndex = -1;
    for (let index = 0; index < headerCells.length; index++) {
      let headerCell = headerCells[index];
      let text = headerCell.textContent;
      if (text && text.trim() == refKey) {
        refKeyColumnIndex = index;
        break;
      }
    }
    if (refKeyColumnIndex == -1) {
      return;
    }

    let rowElements = resultsTable.querySelectorAll("tbody > tr");
    for (let index = 0; index < rowElements.length; index++) {
      let rowElement = rowElements[index];

      let rowCells = rowElement.querySelectorAll("td");
      if (rowCells.length > refKeyColumnIndex) {
        let rowCell = rowCells[refKeyColumnIndex];
        let rowDataElement = rowCell.querySelector("div.table-cell-data");
        if (rowDataElement) {
          let text = rowDataElement.textContent;
          if (text) {
            text = text.trim();
            text = text.replace(/\s+/g, " "); // remove double spaces
            text = encodeURIComponent(text);
            //console.log("doHighlightForRefQuery: text = '" + text + "', refValue = '" + refValue + "'");
            if (text == refValue) {
              // we have found the row to highlight
              rowElement.setAttribute("style", highlightStyle);
              return;
            }
          }
        }
      }
    }
  }
}

function extractHandler(request, sendResponse) {
  let selectedRow = getClickedRow();
  let siteSpecificInput = {
    selectedRowElement: selectedRow,
  };

  // Extract the data via DOM scraping
  let isAsync = extractDataAndRespond(document, location.href, "scotp", sendResponse, siteSpecificInput);
  if (isAsync) {
    return true;
  }
}

siteContentInit(`scotp`, `site/scotp/core/scotp_extract_data.mjs`, extractHandler);

addClickedRowListener();
doHighlightForRefQuery();
