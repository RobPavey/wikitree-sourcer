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

function getHighlightStyle() {
  const highlightStyle = "font-weight: bold; font-style: italic";
  return highlightStyle;
}

function highlightRow(selectedRow) {
  const cellHighlightStyle = "background-color: lightgreen";
  selectedRow.setAttribute("style", getHighlightStyle());
  const cells = selectedRow.querySelectorAll("mat-cell");
  for (let cell of cells) {
    cell.setAttribute("style", cellHighlightStyle);
  }
}

function unHighlightRow(selectedRow) {
  selectedRow.removeAttribute("style");
  const cells = selectedRow.querySelectorAll("mat-cell");
  for (let cell of cells) {
    cell.removeAttribute("style");
  }
}

function getClickedRow() {
  const resultsTable = document.querySelector("yv-its-person-simple-grid").querySelector('tbody[role="rowgroup"]');
  if (resultsTable) {
    const selectedRow = resultsTable.querySelector("mat-row[style='" + getHighlightStyle() + "']");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const resultsTable = document.querySelector("yv-its-person-simple-grid").querySelector('tbody[role="rowgroup"]');
  if (resultsTable && !resultsTable.hasAttribute("listenerOnClick")) {
    resultsTable.setAttribute("listenerOnClick", "true");
    resultsTable.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }
      selectedRow = ev.target;
      if (selectedRow) {
        //console.log("clickedRowListener: selectedRow is ");
        //console.log(selectedRow);

        selectedRow = selectedRow.closest("mat-row");
        if (selectedRow) {
          highlightRow(selectedRow);
        }
      }
    });

    // could highlight the first row here to give a hint that rows are selactable
    // but that could be intrusive if user not intending to use sourcer on the page
  }
}

function insertButtonHandler() {
  let button = document.querySelector('button[class="its-button show-indexed-data ng-star-inserted"');

  if (button == null) {
    return;
  }

  let onclick = button.onclick;
  button.onclick = () => {
    if (onclick != null) {
      onclick();
    }
    addClickedRowListener();
  };
}

siteContentInit(`arolsenarchives`, `site/arolsenarchives/core/arolsenarchives_extract_data.mjs`);
setTimeout(() => {
  insertButtonHandler();
}, 1000);
