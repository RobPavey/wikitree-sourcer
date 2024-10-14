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
  const resultsTable = document.querySelector("#results_frame > table.results > tbody");
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

  // Note that a census page is for household - not specific to person

  const breadCrumbList = document.querySelector("#breadcrumb");
  if (breadCrumbList) {
    result.breadCrumbs = [];
    const listElements = breadCrumbList.querySelectorAll("li");
    for (let element of listElements) {
      let text = element.textContent;
      if (text) {
        result.breadCrumbs.push(text);
      }
    }
  }

  const headingNode = document.querySelector("#results_frame > h1");
  if (headingNode) {
    let text = headingNode.textContent;
    if (text) {
      result.heading = text;
    }
  }

  const tableNode = document.querySelector("#results_frame > table");
  if (tableNode) {
    let tableHeading = tableNode.querySelector("thead");
    let tableBody = tableNode.querySelector("tbody");

    let household = undefined;

    if (tableHeading && tableBody) {
      let headingCols = tableHeading.querySelectorAll("th");

      household = {};

      household.headings = [];
      household.members = [];

      for (let heading of headingCols) {
        let text = heading.textContent;
        if (!text) {
          text = "";
        }
        household.headings.push(text);
      }

      let rows = tableBody.querySelectorAll("tr");

      // by default we use the first row as the record to extract
      let selectedRowElement = rows[0];
      // but if there is a user selected row we use that row
      let userSelectedRowElement = getSelectedRow(document);
      if (userSelectedRowElement) {
        selectedRowElement = userSelectedRowElement;
        result.isRowUserSelected = true;
      }

      for (let row of rows) {
        let member = {};
        let cols = row.querySelectorAll("td");
        for (let colIndex = 0; colIndex < cols.length; colIndex++) {
          let col = cols[colIndex];
          let label = household.headings[colIndex];
          let text = col.textContent;
          if (!text) {
            text = "";
          }
          member[label] = text;
        }

        if (row == selectedRowElement) {
          member.isSelected = true;
        }

        household.members.push(member);
      }
    }

    if (household && household.headings && household.headings.length > 0) {
      result.household = household;
    }
  }

  let imageList = document.querySelector("#mainlist");
  if (imageList) {
    // just use the fist link for now
    let linkNode = imageList.querySelector("dt > a.imagelink");
    if (linkNode) {
      let href = linkNode.href;
      if (href) {
        result.imageLink = href;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
