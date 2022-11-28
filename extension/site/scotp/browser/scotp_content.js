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

const highlightStyle = "font-weight: bold; font-style: italic";

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
  console.log("addClickedRowListener");

  const elResultsTable = document.querySelector("table.results-table tbody");
  if (elResultsTable && !elResultsTable.hasAttribute("listenerOnClick")) {
    elResultsTable.setAttribute("listenerOnClick", "true");
    elResultsTable.addEventListener("click", function (ev) {
      console.log("clickedRowListener: ev is");
      console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        selectedRow.removeAttribute("style");
      }
      selectedRow = ev.target;
      if (selectedRow) {
        console.log("clickedRowListener: selectedRow is ");
        console.log(selectedRow);

        selectedRow = selectedRow.closest("tr");
        if (selectedRow) {
          selectedRow.setAttribute("style", highlightStyle);
        }
      }
    });
  }
}

function getClickedRow() {
  const elResultsTable = document.querySelector("table.results-table tbody");
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

async function getPendingSearch() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["scotpSearchData"], function (value) {
        resolve(value.scotpSearchData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function checkForPendingSearch() {
  console.log("checkForPendingSearch: called");

  console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  if (document.URL.startsWith("https://www.scotlandspeople.gov.uk/advanced-search/")) {
    console.log("checkForPendingSearch: URL matches");

    let searchData = await getPendingSearch();

    if (searchData) {
      console.log("checkForPendingSearch: got searchData:");
      console.log(searchData);

      let searchUrl = searchData.url;
      let timeStamp = searchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      console.log("checkForPendingSearch: searchUrl is : '" + searchUrl + "'");
      console.log("checkForPendingSearch: document.URL is : '" + document.URL + "'");
      console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let formData = searchData.formData;

        console.log("checkForPendingSearch: formData is:");
        console.log(formData);

        for (var field of formData.fields) {
          console.log("checkForPendingSearch: field.fieldKey is: " + field.fieldKey);
          if (field.fieldKey) {
            const elementId = field.fieldKey;
            const fieldType = field.type;

            //console.log("checkForPendingSearch: value is: " + value);

            let inputElement = document.getElementById(elementId);

            if (!inputElement) {
              continue;
            }

            console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
            console.log("checkForPendingSearch: inputElement.tagName is: " + inputElement.tagName);
            let inputType = inputElement.getAttribute("type");
            console.log("checkForPendingSearch: inputElement type is: " + inputType);
            console.log("checkForPendingSearch: fieldType is: " + fieldType);

            let expectedType = fieldType;
            if (fieldType == "so") {
              expectedType = "text";
            } else if (fieldType == "select" || fieldType == "multipleSelect") {
              expectedType = null;
            }

            if (inputType != expectedType) {
              continue;
            }

            let expectedTag = "INPUT";
            if (fieldType == "select" || fieldType == "multipleSelect") {
              expectedTag = "SELECT";
            }

            if (inputElement.tagName != expectedTag) {
              continue;
            }

            if (fieldType == "text") {
              console.log("checkForPendingSearch: text element, new value is : " + field.value);
              inputElement.value = field.value;
            } else if (fieldType == "so") {
              console.log("checkForPendingSearch: so element, new value is : " + field.value);
              let soWrapper = inputElement.closest("div.so-wrapper");
              if (soWrapper) {
                let buttons = soWrapper.querySelectorAll("input.search-options");
                for (let button of buttons) {
                  console.log("checkForPendingSearch: so element, button value is : " + button.value);
                  if (button.value == field.value) {
                    button.checked = true;
                  } else {
                    button.checked = false;
                  }
                }
              }
            } else if (fieldType == "radio") {
              inputElement.checked = field.value;
            } else if (fieldType == "checkbox") {
              inputElement.checked = field.value;
            } else if (fieldType == "select") {
              console.log("checkForPendingSearch: select element, new value is : " + field.value);

              inputElement.value = field.value;
            } else if (fieldType == "multipleSelect") {
            }
          }
        }

        // try to submit form
        let formElement = document.getElementById("advanced-search-form");
        if (formElement) {
          //console.log("checkForPendingSearch: found formElement:");
          //console.log(formElement);
          // Now hide the form so that the use doesn't try to use it.
          //formElement.style.display = "none";
          //const titleElement = document.querySelector("main.site__content div.container h1.title");
          //if (titleElement) {
          //  titleElement.innerText = "Performing WikiTree Sourcer search...";
          //}
          // now submit the form to do the search
          //formElement.submit();
        }
      }

      // clear the search data
      chrome.storage.local.set({ scotpSearchData: undefined }, function () {
        //console.log('cleared scotpSearchData');
      });
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

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(`scotp`, `site/scotp/core/scotp_extract_data.mjs`, extractHandler);

  addClickedRowListener();
  doHighlightForRefQuery();
}

checkForSearchThenInit();
