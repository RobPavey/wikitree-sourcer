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

const HIGHLIGHT_STYLE = "background-color: #bbdba7";

/**
 * Registers an event listener to handle highlighting rows by clicking.
 */
function addClickedRowListener() {
  const elResultsTable = document.querySelector(".tablesearch tbody");
  if (elResultsTable && !elResultsTable.hasAttribute("listenerOnClick")) {
    elResultsTable.setAttribute("listenerOnClick", "true");
    elResultsTable.addEventListener("click", (event) => {
      // clear existing selected row if any
      const prevSelectedRow = getSelectedRow();
      if (prevSelectedRow) {
        prevSelectedRow.removeAttribute("style");
      }
      const eventTarget = event.target;
      if (eventTarget) {
        const newSelectedRow = eventTarget.closest("tr");
        if (newSelectedRow) {
          newSelectedRow.setAttribute("style", HIGHLIGHT_STYLE);
        }
      }
    });
  }
}

/**
 * Returns the <tr> element of the selected row, undefined if none selected.
 */
function getSelectedRow() {
  const elResultsTable = document.querySelector(".tablesearch tbody");
  if (elResultsTable) {
    return elResultsTable.querySelector(`tr[style='${HIGHLIGHT_STYLE}']`);
  }
}

function extractHandler(request, sendResponse) {
  const siteSpecificInput = {
    selectedRowElement: getSelectedRow(),
  };
  // Extract the data via DOM scraping
  return extractDataAndRespond(document, location.href, "geneteka", sendResponse, siteSpecificInput);
}

siteContentInit("geneteka", "site/geneteka/core/geneteka_extract_data.mjs", extractHandler);

addClickedRowListener();
