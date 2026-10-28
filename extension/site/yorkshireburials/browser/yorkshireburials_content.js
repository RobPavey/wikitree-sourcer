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

////////////////////////////////////////////////////////////////////////////////
// Code for selecting a row in search results
////////////////////////////////////////////////////////////////////////////////

const highlightStyle = "font-weight: bold; font-style: italic";
const cellHighlightStyle = "background-color: palegreen";

function highlightRow(selectedRow) {
  if (selectedRow && selectedRow.isConnected) {
    selectedRow.setAttribute("style", highlightStyle);
    const cells = selectedRow.querySelectorAll("td");
    for (let cell of cells) {
      cell.setAttribute("style", cellHighlightStyle);
    }
    selectedRow.classList.add("sourcerSelected");
  }
}

function unHighlightRow(selectedRow) {
  if (selectedRow && selectedRow.isConnected) {
    selectedRow.removeAttribute("style");
    const cells = selectedRow.querySelectorAll("td");
    for (let cell of cells) {
      cell.removeAttribute("style");
    }
    selectedRow.classList.remove("sourcerSelected");
  }
}

function getClickedRow() {
  const resultsTableBody = document.querySelector("table#resultsTable > tbody");
  if (resultsTableBody) {
    const selectedRow = resultsTableBody.querySelector("tr.sourcerSelected");
    return selectedRow;
  }
}

function addClickedRowListener() {
  const resultsTable = document.querySelector("table#resultsTable");

  if (resultsTable && !resultsTable.hasAttribute("listenerOnClick")) {
    resultsTable.setAttribute("listenerOnClick", "true");
    resultsTable.addEventListener("click", function (ev) {
      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }

      // check this is a result row and not the heading (which contains the column filters)
      let selectedElement = ev.target;
      if (selectedElement) {
        let containingTbody = selectedElement.closest("tbody");
        if (containingTbody) {
          let row = selectedElement.closest("tr");
          if (row) {
            highlightRow(row);
          }
        }
      }
    });
  }
}

siteContentInit("yorkshireburials");
addClickedRowListener();
