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

////////////////////////////////////////////////////////////////////////////////
// Code for selecting a row in search results
////////////////////////////////////////////////////////////////////////////////

const highlightStyle = "font-weight: bold; font-style: italic";
const cellHighlightStyle = "background-color: palegreen";

function highlightRow(selectedRow) {
  selectedRow.setAttribute("style", highlightStyle);
  const cells = selectedRow.querySelectorAll("span");
  for (let cell of cells) {
    cell.setAttribute("style", cellHighlightStyle);
  }
}

function unHighlightRow(selectedRow) {
  selectedRow.removeAttribute("style");
  const cells = selectedRow.querySelectorAll("span");
  for (let cell of cells) {
    cell.removeAttribute("style");
  }
}

function getClickedRow() {
  const formElement = document.querySelector("#form");
  if (formElement) {
    const selectedRow = formElement.querySelector("div.detail-columns[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const formElement = document.querySelector("#form");
  //console.log("addClickedRowListener: formElement is");
  //console.log(formElement);

  if (formElement && !formElement.hasAttribute("listenerOnClick")) {
    formElement.setAttribute("listenerOnClick", "true");
    formElement.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }

      // check this is a result row and not the heading
      selectedRow = ev.target;
      if (selectedRow) {
        //console.log("clickedRowListener: selectedRow is ");
        //console.log(selectedRow);

        selectedRow = selectedRow.closest("div.detail-columns");
        if (selectedRow) {
          highlightRow(selectedRow);
        }
      }
    });
  }
}

siteContentInit(`examplesite`, `site/examplesite/core/examplesite_extract_data.mjs`);
addClickedRowListener();
