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
  const elResultsTable = document.querySelector("div.ke_search_results table tbody");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const elResultsTable = document.querySelector("div.ke_search_results table tbody");
  //console.log("addClickedRowListener: elResultsTable is");
  //console.log(elResultsTable);

  if (elResultsTable && !elResultsTable.hasAttribute("listenerOnClick")) {
    elResultsTable.setAttribute("listenerOnClick", "true");
    elResultsTable.addEventListener("click", function (ev) {
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

        selectedRow = selectedRow.closest("tr");
        if (selectedRow) {
          if (
            selectedRow.classList.contains("Cell_Search_Field") ||
            selectedRow.classList.contains("Cell_Search_Field_even")
          ) {
            highlightRow(selectedRow);
          }
        }
      }
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Code for registering/unregistering tab with background
////////////////////////////////////////////////////////////////////////////////

async function unregisterTabWithBackground() {
  //console.log("unregisterTabWithBackground");

  // send message to background script that we have a nzbdm tab open
  let unregisterResponse = await chrome.runtime.sendMessage({
    type: "unregisterTab",
    siteName: "nzbdm",
    tab: registeredTabId,
  });

  //console.log("nzbdm, response from unregisterTab message");
  //console.log(unregisterResponse);

  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("nzbdm: No response from background script, lastError message is:");
    console.log(chrome.runtime.lastError.message);
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a nzbdm tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "nzbdm" });

    //console.log("nzbdm, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("nzbdm: No response from background script, lastError message is:");
      console.log(chrome.runtime.lastError.message);
    } else {
      //console.log("addng event listener for unregister");

      // NOTE: this listener does not get triggered on iOS when the X is pressed to close tab.
      // It is a known bug and no workaround is known. Not unregistering the tab doesn't cause
      // problems - an error is reported to console when it tries to reuse it but then it falls back
      // to opening a new tab.
      window.addEventListener("pagehide", function () {
        //console.log("pagehide event");
        unregisterTabWithBackground();
      });
    }
  } catch (error) {
    // possibly there is no background script loaded, this should never happen
    // Could also be that the extension was just reloaded/updated
    console.log("nzbdm: No response from background script, error is:");
    console.log(error);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Do the search
////////////////////////////////////////////////////////////////////////////////

var pendingSearchData;

async function getPendingSearch() {
  //console.log("getPendingSearch");
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["searchData"], function (value) {
        //console.log("getPendingSearch resolve");
        resolve(value.searchData);
      });
    } catch (ex) {
      console.log("getPendingSearch catch");
      reject(ex);
    }
  });
}

function setSearchingBanner() {
  // Modify the page to say it is a WikiTree Sourcer search
  let headerGapElement = document.querySelector("#headerGap");
  if (headerGapElement) {
    let span = document.createElement("span");
    span.textContent = "WikiTree Sourcer search. Please wait for form to be populated and submitted...";
    span.style.color = "white";
    headerGapElement.appendChild(span);
  }
}

async function clearSearchingBanner() {
  // Clear the message that we added to the menu bar
  let menuBarElement = document.querySelector("bdm-header > div.bdm-header > div.desktop-empty-menu-bar");
  if (menuBarElement) {
    let sourcerFragment = menuBarElement.querySelector("span");
    if (sourcerFragment) {
      sourcerFragment.style.display = "none";
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doPendingSearch() {
  //console.log("##############################################################################");
  //console.log("doPendingSearch: called");
  //console.log("doPendingSearch: URL is");
  //console.log(document.URL);

  if (pendingSearchData) {
    let submitted = false;
    let inputNotFound = false;

    let isRetry = pendingSearchData.isRetry;
    let fieldData = pendingSearchData.fieldData;

    let formElement = document.querySelector("#inputForm");
    //console.log("doPendingSearch: formElement is:");
    //console.log(formElement);
    if (formElement) {
      let searchButtonElement = formElement.querySelector("a.ke_end_button");

      console.log("doPendingSearch: searchButtonElement is:");
      console.log(searchButtonElement);

      for (var key in fieldData) {
        console.log("checkForPendingSearch: key is: " + key);
        if (key) {
          let value = fieldData[key];
          console.log("checkForPendingSearch: value is: " + value);

          let inputElement = formElement.querySelector("input[name='" + key + "']");
          console.log("doPendingSearch: inputElement is:");
          console.log(inputElement);

          if (inputElement) {
            inputElement.value = value;
          } else {
            inputNotFound = true;
            break;
          }
        }
      }

      //console.log("inputNotFound is:");
      //console.log(inputNotFound);

      if (!inputNotFound) {
        // TEMP: wait to see if fields filled
        //await sleep(30000);
        await sleep(20);

        // try to submit form
        if (searchButtonElement) {
          console.log("about to click button");
          docHasFocus = document.hasFocus();
          //console.log("doPendingSearch: docHasFocus is");
          //console.log(docHasFocus);
          let activeElement = document.activeElement;
          //console.log("doPendingSearch: activeElement is");
          //console.log(activeElement);

          // now submit the form to do the search
          formElement.submit();

          submitted = true;
        }
      }
    }

    if (!submitted) {
      console.log("not submitted");
    } else {
      //console.log("submitted");
    }

    // clear the pending data so that we don't use it again on refine search
    pendingSearchData = undefined;

    await sleep(4000);
    clearSearchingBanner();
  }
}

async function checkForPendingSearch() {
  console.log("checkForPendingSearch: called");
  console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    // but when we call window.open to reuse the tab it will not be empty so do not return here
    //return;
  }

  console.log("checkForPendingSearch: URL is");
  console.log(document.URL);

  // Expect something like this:
  // https://my.rio.bdm.vic.gov.au/efamily-history/-

  const startingSearchRegEx = /^https\:\/\/www.bdmhistoricalrecords.dia.govt.nz\/search\/search\?.*$/;
  let isStartingSearchPage = startingSearchRegEx.test(document.URL);
  if (isStartingSearchPage) {
    console.log("checkForPendingSearch: URL matches ready to fill form");

    let searchData = undefined;
    try {
      searchData = await getPendingSearch();
    } catch (error) {
      console.log("checkForPendingSearch: getPendingSearch reject");
    }

    console.log("checkForPendingSearch: searchData is:");
    console.log(searchData);

    if (searchData) {
      setSearchingBanner();

      console.log("checkForPendingSearch: got formValues:");
      console.log(searchData);

      let timeStamp = searchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
      console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
      console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

      // It can take a long time to populate the page with the input fields
      if (timeSinceSearch < 50000) {
        pendingSearchData = searchData;
        doPendingSearch();
      }

      // clear the search data
      chrome.storage.local.remove(["searchData"], function () {
        //console.log("cleared searchData");
      });
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Message hander to receive search message from background
////////////////////////////////////////////////////////////////////////////////

async function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doSearchInExistingTab") {
    console.log("nzbdm: additionalMessageHandler, request is:");
    console.log(request);
    console.log("nzbdm: additionalMessageHandler, document.URL is:");
    console.log(document.URL);

    let canReusePage = false;
    if (document.URL == request.searchData.url) {
      canReusePage = true;
    } else {
      let formElement = document.querySelector("#inputForm");
      //console.log("doPendingSearch: formElement is:");
      //console.log(formElement);
      if (formElement) {
        let foundElements = true;

        let fieldData = request.searchData.fieldData;
        for (let key in fieldData) {
          if (key) {
            let inputElement = formElement.querySelector("input[name='" + key + "']");
            if (!inputElement) {
              foundElements = false;
              break;
            }
          }
        }
        if (foundElements) {
          canReusePage = true;
        }
      }
    }

    if (!canReusePage) {
      try {
        // this stores the search data in local storage which is then picked up by the
        // content script in the new tab/window
        await chrome.storage.local.set({ searchData: request.searchData }, function () {
          console.log("saved request.searchData, request.searchData is:");
          console.log(request.searchData);
        });
      } catch (ex) {
        console.log("store of searchData failed");
      }

      window.open(request.searchData.url, "_self");
      sendResponse({ success: true });
      return { wasHandled: true, returnValue: false };
    }

    pendingSearchData = request.searchData;

    setSearchingBanner();
    doPendingSearch();

    sendResponse({ success: true });
    return { wasHandled: true, returnValue: false };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(
    `nzbdm`,
    `site/nzbdm/core/nzbdm_extract_data.mjs`,
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );

  addClickedRowListener();
  // doHighlightForRefQuery();

  // probably should be done only for search window, maybe from check for pending search
  registerTabWithBackground();
}

checkForSearchThenInit();
