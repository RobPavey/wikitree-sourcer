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
  const cells = selectedRow.querySelectorAll("td");
  for (let cell of cells) {
    cell.setAttribute("style", cellHighlightStyle);
  }
}

function unHighlightRow(selectedRow) {
  selectedRow.removeAttribute("style");
  const cells = selectedRow.querySelectorAll("td");
  for (let cell of cells) {
    cell.removeAttribute("style");
  }
}

function getClickedRow() {
  const resultsTable = document.querySelector("#main-content > div > div > table > tbody");
  if (resultsTable) {
    const selectedRow = resultsTable.querySelector("tr[style='" + getHighlightStyle() + "']");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const resultsTable = document.querySelector("#main-content > div > div > table > tbody");
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

        selectedRow = selectedRow.closest("tr");
        if (selectedRow) {
          highlightRow(selectedRow);
        }
      }
    });

    // could highlight the first row here to give a hint that rows are selactable
    // but that could be intrusive if user not intending to use sourcer on the page
  }
}

async function getPendingSearch() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["searchData"], function (value) {
        resolve(value.searchData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function checkForPendingSearchData() {
  //console.log("checkForPendingSearchData: called");

  //console.log("checkForPendingSearchData: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  if (document.URL == "https://probatesearch.service.gov.uk/") {
    //console.log("checkForPendingSearchData: URL matches");

    let searchData = await getPendingSearch();

    if (searchData) {
      //console.log("checkForPendingSearchData: got searchData:");
      //console.log(searchData);

      let searchUrl = searchData.url;
      let timeStamp = searchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearchData: searchUrl is :" + searchUrl);
      //console.log("checkForPendingSearchData: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearchData: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearchData: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let mainContent = document.getElementById("main-content");
        if (mainContent) {
          //console.log("checkForPendingSearchData: fieldData is:");
          //console.log(fieldData);

          function setTextFields(fieldData) {
            for (var key in fieldData) {
              if (key) {
                let value = fieldData[key];
                if (value) {
                  let inputElement = document.getElementById(key);
                  if (inputElement) {
                    inputElement.value = value;

                    // Create a new 'input' event
                    var event = new Event("input", {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    });
                    // Dispatch it.
                    inputElement.dispatchEvent(event);
                  }
                }
              }
            }
          }

          function sleep() {
            // we are just wating for pending events to be processed so waiting 1ms works for that
            return new Promise((r) => setTimeout(r, 1));
          }

          setTextFields(searchData.stage1TextFieldData);

          for (var key in searchData.stage1RadioFieldData) {
            //console.log("checkForPendingSearchData: key is: " + key);
            if (key) {
              let value = searchData.stage1RadioFieldData[key];
              //console.log("checkForPendingSearchData: value is: " + value);

              let yesElement = document.getElementById(key + "-yes");
              let noElement = document.getElementById(key + "-no");
              if (yesElement && noElement) {
                if (value) {
                  yesElement.checked = true;
                } else {
                  noElement.checked = true;
                }
              }
            }
          }

          let stage1FormButton = document.querySelector("#main-content > form > button");
          if (stage1FormButton) {
            await sleep(); // wait for the input events to be processed
            stage1FormButton.click();
            //console.log("checkForPendingSearchData: submitted stage1");
          }

          await sleep(); // wait for new inputs to be created
          setTextFields(searchData.stage2TextFieldData);

          let stage2FormButton = document.querySelector("#main-content > form > button");
          if (stage2FormButton) {
            await sleep(); // wait for the input events to be processed
            stage2FormButton.click();
          }
        }
      }

      // clear the search data
      chrome.storage.local.set({ searchData: undefined }, function () {
        //console.log('cleared searchData');
      });
    }
  }
}

checkForPendingSearchData();
siteContentInit(`psuk`, `site/psuk/core/psuk_extract_data.mjs`);
addClickedRowListener();
