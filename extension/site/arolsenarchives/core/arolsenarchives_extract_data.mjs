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
  if (document.querySelector("yv-its-person-simple-grid") == null) {
    return null;
  }

  const highlightStyle = "font-weight: bold; font-style: italic";
  const resultsTable = document.querySelector("yv-its-person-simple-grid").querySelector('tbody[role="rowgroup"]');
  if (resultsTable) {
    const selectedRow = resultsTable.querySelector("mat-row[style='" + highlightStyle + "']");

    if (selectedRow == null) {
      return null;
    }

    let children = selectedRow.parentNode.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i.toString()] == selectedRow) {
        return i;
      }
    }
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // only allow extract from documents for now
  if (!url.match("/document/")) {
    return;
  }

  result.doc_id = url.substring(url.lastIndexOf("/") + 1);

  const breadcrum_item = document.querySelector('div[class="fd-tree-path"]');
  let breadcrum_string = "";
  for (let breadcrum of breadcrum_item.querySelectorAll('a[class="ng-star-inserted"]')) {
    breadcrum_string += ", " + breadcrum.text.trim();
  }
  const title = document.querySelector('h1[class="title ng-tns-c171-3"]');
  breadcrum_string += ", " + title.textContent.trim();
  result.breadcrum = breadcrum_string.substring(2);

  const selected_index = getSelectedRow(document);
  if (selected_index != null) {
    result.person_index = selected_index;
  }

  result.success = true;

  return result;
}

export { extractData };
