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
// Code for registering/unregistering tab with background
////////////////////////////////////////////////////////////////////////////////

async function unregisterTabWithBackground() {
  //console.log("unregisterTabWithBackground");

  // send message to background script that we no longer have a wadigarch tab open
  // This can fail with an error like "Extension context invalidated" (or chrome.runtime being
  // undefined) if the extension was reloaded or updated while this page was open. So we do a try/catch
  try {
    let unregisterResponse = await chrome.runtime.sendMessage({
      type: "unregisterTab",
      siteName: "wadigarch",
      tab: registeredTabId,
    });

    //console.log("wadigarch, response from unregisterTab message");
    //console.log(unregisterResponse);

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("wadigarch: No response from background script, lastError message is:");
      console.log(chrome.runtime.lastError.message);
    }
  } catch (error) {
    // Most likely the extension was just reloaded/updated. There is nothing to unregister from.
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a wadigarch tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "wadigarch" });

    //console.log("wadigarch, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("wadigarch: No response from background script, lastError message is:");
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
    console.log("wadigarch: No response from background script, error is:");
    console.log(error);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Do the search
////////////////////////////////////////////////////////////////////////////////

var pendingSearchData;

async function getPendingSearch() {
  //console.log("getPendingSearch");

  // Gets any pending search data from local storage
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
  let container = document.querySelector("#Content");
  if (container && !document.querySelector("#wikitreeSourcerSearchBanner")) {
    let banner = document.createElement("div");
    banner.id = "wikitreeSourcerSearchBanner";
    banner.style.cssText = "background: #ffd; border: 1px solid #cc9; padding: 6px; margin-bottom: 6px;";
    banner.textContent = "WikiTree Sourcer is filling out the search form. Please wait...";
    container.insertBefore(banner, container.firstChild);
  }
}

function removeSearchingBanner() {
  let banner = document.querySelector("#wikitreeSourcerSearchBanner");
  if (banner) {
    banner.remove();
  }
}

async function waitForHashChange(startHash, timeoutMs = 8000) {
  const pollMs = 200;
  for (let waited = 0; waited < timeoutMs; waited += pollMs) {
    if (location.hash != startHash) {
      return true;
    }
    await sleep(pollMs);
  }
  return false;
}

async function waitForElement(selector, timeoutMs = 10000) {
  const pollMs = 100;
  for (let waited = 0; waited < timeoutMs; waited += pollMs) {
    let element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await sleep(pollMs);
  }
  return undefined;
}

async function doPendingSearch() {
  //console.log("doPendingSearch: called");

  if (pendingSearchData) {
    let fieldData = pendingSearchData.fieldData;
    let selectData = pendingSearchData.selectData;

    // clear the pending data so that we don't use it again
    pendingSearchData = undefined;

    // The fields on the detailed search form depend on the record series. So first select the
    // record series, which makes the page load the fields for that series.
    let recordSeriesSelect = await waitForElement("select#RecordSeries");
    if (!recordSeriesSelect || !selectData || !selectData.RecordSeries) {
      console.log("wadigarch: doPendingSearch: record series select not found");
      removeSearchingBanner();
      return;
    }

    let recordSeriesId = selectData.RecordSeries;
    recordSeriesSelect.value = recordSeriesId;
    recordSeriesSelect.dispatchEvent(new Event("change", { bubbles: true }));

    const formSelector = "#detailSearchOptions input[name=RecordSeriesID][value='" + recordSeriesId + "']";
    let formLoaded = await waitForElement(formSelector, 20000);
    if (!formLoaded) {
      console.log("wadigarch: doPendingSearch: search fields did not load");
      removeSearchingBanner();
      return;
    }

    for (let name of Object.keys(fieldData)) {
      let input = document.querySelector("#detailSearchOptions input[name=" + name + "]");
      if (input) {
        input.value = fieldData[name];
      }
    }

    for (let name of Object.keys(selectData)) {
      if (name != "RecordSeries") {
        let select = document.querySelector("#detailSearchOptions select[name=" + name + "]");
        if (select) {
          select.value = selectData[name];
        }
      }
    }

    let submitButton = document.querySelector("#detailSearchOptions button[type=submit]");
    if (submitButton) {
      // When the search is submitted the page posts the form and then changes the hash of the URL
      // to the id of the search (e.g. #3) and shows the results below the form.
      let startHash = location.hash;
      submitButton.click();

      if (!(await waitForHashChange(startHash))) {
        // the search does not seem to have started so try again once
        console.log("wadigarch: doPendingSearch: search did not start, submitting the form again");
        let form = submitButton.closest("form");
        if (form && form.requestSubmit) {
          form.requestSubmit();
        } else {
          submitButton.click();
        }
        await waitForHashChange(startHash);
      }
    }

    removeSearchingBanner();
  }
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");
  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  // Note: when this page was opened by the extension referrer is an empty string but when we call
  // window.open to reuse a tab it will not be empty so we cannot return if there is a referrer.

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

async function doSearchInExistingTab(request, sender, sendResponse) {
  //console.log("nswbdm: additionalMessageHandler, request is:");
  //console.log(request);
  //console.log("nswbdm: additionalMessageHandler, document.URL is:");
  //console.log(document.URL);

  // We could try to check if this is the correct type of page (Births, Deaths etc)
  // and clear the fields and refill them. But it is simpler to just load the desired URL
  // into this existing tab.

  try {
    // this stores the search data in local storage which is then picked up by the
    // content script in the new tab/window
    await chrome.storage.local.set({ searchData: request.searchData }, function () {
      //console.log("saved request.searchData, request.searchData is:");
      //console.log(request.searchData);
    });
  } catch (ex) {
    console.log("store of searchData failed");
  }

  window.open(request.searchData.url, "_self");
  sendResponse({ success: true });
}

// NOTE: this function must not be async
function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doSearchInExistingTab") {
    doSearchInExistingTab(request, sender, sendResponse);
    return { wasHandled: true, returnValue: true };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  // lets the background script find this tab if the search should reuse an existing tab
  registerTabWithBackground();

  checkForPendingSearch();

  siteContentInit(
    "wadigarch",
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
