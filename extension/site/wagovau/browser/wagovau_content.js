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
  const resultsTableBody = document.querySelector("table.pi-table > tbody");
  if (resultsTableBody) {
    const selectedRow = resultsTableBody.querySelector("tr.sourcerSelected");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  // find the section that contains the tabs for births/deathc/marriages
  const section = document.querySelector("pioneers-index > section");

  if (section && !section.hasAttribute("listenerOnClick")) {
    section.setAttribute("listenerOnClick", "true");
    section.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }

      // check this is a result row and not the heading
      let selectedElement = ev.target;
      if (selectedElement) {
        //console.log("clickedRowListener: selectedRow is ");
        //console.log(selectedRow);

        let containingTable = selectedElement.closest("table.pi-table");
        if (containingTable) {
          let containingTbody = selectedElement.closest("tbody");
          if (containingTbody) {
            let selectedRow = selectedElement.closest("tr");
            if (selectedRow) {
              highlightRow(selectedRow);
            }
          }
        }
      }
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Do the search
////////////////////////////////////////////////////////////////////////////////

function setSearchingBanner() {
  // Modify the page to say it is a WikiTree Sourcer search
  //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
  // insert code here to change the search page HTML to make it obvious that a
  // WikiTree Sourcer search is happening so that they don't start typing in the search form.
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

async function simulateTabClick(tabElement) {
  if (!tabElement) {
    return;
  }

  const eventOptions = {
    view: window,
    bubbles: true,
    cancelable: true,
    button: 0, // 0 indicates the main/left mouse button
  };

  tabElement.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  await sleep(100);
  tabElement.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  tabElement.dispatchEvent(new MouseEvent("click", eventOptions));

  tabElement.blur(); // Drops the browser's internal :focus style
}

async function selectCorrectTab(searchType) {
  if (searchType) {
    let tabElementId = "";
    if (searchType == "birth") {
      tabElementId = "mat-tab-label-0-0";
    } else if (searchType == "death") {
      tabElementId = "mat-tab-label-0-1";
    } else if (searchType == "marriage") {
      tabElementId = "mat-tab-label-0-2";
    }

    if (tabElementId) {
      const tabElement = document.getElementById(tabElementId);
      if (tabElement) {
        await simulateTabClick(tabElement);
      }
    }
  }
}

async function getAppElement(searchType) {
  if (searchType) {
    let appElementTag = "";
    if (searchType == "birth") {
      appElementTag = "app-birth-search";
    } else if (searchType == "death") {
      appElementTag = "app-death-search";
    } else if (searchType == "marriage") {
      appElementTag = "app-marriage-search";
    }

    if (appElementTag) {
      const appElement = document.querySelector(appElementTag);
      console.log("doPendingSearch: appElement is:");
      console.log(appElement);
      return appElement;
    }
  }
}

async function setSearchTextFields(fieldData, appElement) {
  // then set the text fields
  for (let key of Object.keys(fieldData)) {
    //console.log("doPendingSearch: key is: " + key);

    let value = fieldData[key];
    //console.log("doPendingSearch: value is: " + value);

    if (value !== undefined && value !== "") {
      console.log("doPendingSearch: key is: " + key);

      let inputElement = appElement.querySelector(`input[formcontrolname=${key}]`);
      console.log("doPendingSearch: inputElement is:");
      console.log(inputElement);

      if (inputElement) {
        if (inputElement.type != "checkbox") {
          // just setting the value sometimes does not seem to register with the form
          inputElement.focus();
          // Clear current content
          inputElement.value = "";

          // Mimic a physical user typing to keep Angular's UI Engine aligned
          inputElement.dispatchEvent(new Event("input", { bubbles: true }));
          inputElement.value = value;
          inputElement.dispatchEvent(new Event("input", { bubbles: true }));

          // 2. Wait a brief moment for the mat-autocomplete panel to open and render options
          await sleep(150);

          // 3. Find the matching option in the global overlay container
          const options = document.querySelectorAll("mat-option");
          if (options.length > 0 && inputElement.getAttribute("aria-autocomplete")) {
            // Only trigger fallback click if the input element explicitly uses autocomplete wrappers
            let matchedOption = null;

            for (let option of options) {
              // Trim whitespace and check if option text matches our search target value
              if (option.textContent.trim() === String(value).trim()) {
                matchedOption = option;
                break;
              }
            }

            // 4. Click the matching dropdown option to properly bind the data to the Angular Form
            if (matchedOption) {
              matchedOption.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
              matchedOption.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
              matchedOption.click();
            }
          }

          // Break the focus cleanly to dismiss the floating list box
          inputElement.blur();

          await sleep(50); // Small cooldown to allow the floating UI box to slide shut
        }
      }
    }
  }
}

function waitForFilterInput(timeout = 60000) {
  return new Promise((resolve, reject) => {
    // 1. Check if the element already exists immediately
    const selector = "mat-card.filterCard input";
    const immediateElement = document.querySelector(selector);
    if (immediateElement) return resolve(immediateElement);

    // 2. Set an enforcement safety timer so the script doesn't hang indefinitely
    const timeoutId = setTimeout(() => {
      console.log("waitForFilterInput, timed out");
      observer.disconnect();
      reject(new Error(`Timeout: Filter input "${selector}" did not appear within ${timeout}ms.`));
    }, timeout);

    // 3. Define the observer routine
    const observer = new MutationObserver((mutations) => {
      //console.log("MutationObserver, mutations is", mutations);

      const targetElement = document.querySelector(selector);
      console.log("MutationObserver, targetElement is", targetElement);
      if (targetElement) {
        clearTimeout(timeoutId);
        observer.disconnect(); // CRITICAL: Stop watching immediately to optimize performance
        resolve(targetElement);
      } else {
        // if the results are there there could just be one of two results with no filter
        let tableHeaders = document.querySelectorAll("table.mat-sort thead tr th");
        if (this.length > 5) {
          clearTimeout(timeoutId);
          observer.disconnect(); // CRITICAL: Stop watching immediately to optimize performance
          resolve(null);
        }
      }
    });

    // 4. Start tracking the entire document lifecycle
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Programmatically filters the live table rows by matching the exact column text.
 * @param {string} targetRefText - The specific reference number you want to isolate (e.g., "995").
 * @param {number} columnPosition - The index of the Reference Number column (e.g., 2 if it's the 3rd column).
 */
function filterTableByExactColumn(appElement, filterText) {
  const tableElement = appElement.querySelector("table.mat-sort");
  if (!tableElement) {
    return;
  }

  const headers = appElement.querySelectorAll("thead th");
  if (!headers.length) {
    return;
  }

  let columnIndex = 9;
  if (columnIndex > headers.length - 1) {
    columnIndex = headers.length - 1;
  }
  for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
    let headerElement = headers[headerIndex];
    if (headerElement.textContent.trim() == "Registration Number") {
      columnIndex = headerIndex;
      break;
    }
  }

  // 1. Locate all table rows inside the results body
  const rows = tableElement.querySelectorAll("tbody tr");

  if (rows.length === 0) {
    console.log("No rows found in the results table to filter.");
    return;
  }

  let visibleCount = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const targetCell = cells[columnIndex];

    if (targetCell) {
      const cellText = targetCell.textContent.trim();

      // 2. Check if the cell text explicitly contains or exactly matches the string
      if (cellText.includes(filterText)) {
        row.style.display = ""; // Keep the matching row visible
        visibleCount++;
      } else {
        row.style.display = "none"; // Hide the row matching invisible data
      }
    }
  });

  console.log(`Manually isolated ${visibleCount} rows matching "${filterText}" in column ${columnIndex}.`);
}

async function doPendingSearch() {
  console.log("##############################################################################");
  console.log("doPendingSearch: called");
  console.log("doPendingSearch: URL is");
  console.log(document.URL);
  console.log("doPendingSearch: pendingSearchData is:");
  console.log(pendingSearchData);

  if (pendingSearchData) {
    const searchType = pendingSearchData.searchType;
    const fieldData = pendingSearchData.fieldData;

    console.log("doPendingSearch: fieldData is:");
    console.log(fieldData);

    await selectCorrectTab(searchType);

    // CRITICAL: Wait for Angular to destroy the old form and fully mount the new form into the live DOM
    await sleep(300);

    const appElement = await getAppElement(searchType);
    if (appElement) {
      let searchButtonElement = appElement.querySelector("button.piSearchBtn[type=submit]");
      if (searchButtonElement) {
        await setSearchTextFields(fieldData, appElement, searchButtonElement);

        // Dispatch an Escape key stroke globally to tell Angular to collapse autocomplete panels
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
        await sleep(50);

        // BRUTE FORCE PROTECTION: If Angular fails to close them, wipe the panes from the DOM
        const lingeringPanes = document.querySelectorAll(".cdk-overlay-pane");
        lingeringPanes.forEach((pane) => pane.remove());
        await sleep(50);

        // do the search
        searchButtonElement.focus();
        searchButtonElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        searchButtonElement.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        searchButtonElement.dispatchEvent(new MouseEvent("click", { bubbles: true })); // Triggers Angular form submission

        // align button with top so search results are visible
        searchButtonElement.scrollIntoView(true);

        // if pendingSearchData.refineData is set then try to refine
        if (pendingSearchData.refineData && pendingSearchData.refineData.text) {
          console.log("waiting for filter element");
          try {
            let inputElement = await waitForFilterInput();
            if (inputElement) {
              console.log("found filter element");

              inputElement.focus();
              // Clear current content
              inputElement.value = "";

              // Mimic a physical user typing to keep Angular's UI Engine aligned
              inputElement.dispatchEvent(new Event("input", { bubbles: true }));
              inputElement.value = pendingSearchData.refineData.text;
              inputElement.dispatchEvent(new Event("input", { bubbles: true }));

              // 1. Setup the event data configuration for the Enter Key
              const enterKeyEventOptions = {
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
              };

              // 2. Dispatch the exact Enter key sequence
              inputElement.dispatchEvent(new KeyboardEvent("keydown", enterKeyEventOptions));
              inputElement.dispatchEvent(new KeyboardEvent("keyup", enterKeyEventOptions));

              // 3. Fire a change commit notification
              inputElement.dispatchEvent(new Event("change", { bubbles: true }));

              // Drop focus to cleanly lock in the layout
              inputElement.blur();

              await sleep(50);

              // the Angular filter can get many false positives - do our own additional filter
              filterTableByExactColumn(appElement, pendingSearchData.refineData.text);
            }
          } catch {
            // do nothing
          }
        } else {
          await sleep(500);
        }
      }
    }

    // clear the pending data so that we don't use it again on refine search
    pendingSearchData = undefined;
  }
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");
  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  //console.log("checkForPendingSearch: URL is");
  //console.log(document.URL);

  let searchData = undefined;
  try {
    searchData = await getPendingSearch();
  } catch (error) {
    console.log("checkForPendingSearch: getPendingSearch reject");
  }

  //console.log("checkForPendingSearch: searchData is:");
  //console.log(searchData);

  if (searchData) {
    setSearchingBanner();

    //console.log("checkForPendingSearch: got formValues:");
    //console.log(searchData);

    let timeStamp = searchData.timeStamp;
    let timeStampNow = Date.now();
    let timeSinceSearch = timeStampNow - timeStamp;

    //console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
    //console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
    //console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

    // It can take a long time to populate the page with the input fields
    if (timeSinceSearch < 50000) {
      pendingSearchData = searchData;
      doPendingSearch();
    }

    // clear the search data no that we have set pendingSearchData
    chrome.storage.local.remove(["searchData"], function () {
      //console.log("cleared searchData");
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Top level functions
////////////////////////////////////////////////////////////////////////////////

function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doSearchInExistingTab") {
    doSearchInExistingTab(request, sender, sendResponse);
    return { wasHandled: true, returnValue: true };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  // probably should be done only for search window, maybe from check for pending search
  registerTabWithBackground("wagovau");

  checkForPendingSearch();

  siteContentInit(
    "wagovau",
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );

  addClickedRowListener();
}

checkForSearchThenInit();
