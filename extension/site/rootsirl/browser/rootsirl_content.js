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

  // send message to background script that we have a rootsirl tab open
  let unregisterResponse = await chrome.runtime.sendMessage({
    type: "unregisterTab",
    siteName: "rootsirl",
    tab: registeredTabId,
  });

  //console.log("rootsirl, response from unregisterTab message");
  //console.log(unregisterResponse);

  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("rootsirl: No response from background script, lastError message is:");
    console.log(chrome.runtime.lastError.message);
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a rootsirl tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "rootsirl" });

    //console.log("rootsirl, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("rootsirl: No response from background script, lastError message is:");
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
    console.log("rootsirl: No response from background script, error is:");
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

function showSearchMessage(message, color) {
  // Show a message above the search form so the user knows WikiTree Sourcer is using the form
  let messageElement = document.getElementById("wikitree-sourcer-search-message");
  if (!messageElement) {
    messageElement = document.createElement("div");
    messageElement.id = "wikitree-sourcer-search-message";
    messageElement.style.fontWeight = "bold";
    messageElement.style.fontSize = "1.2em";
    messageElement.style.margin = "0.5em 0";

    // under the search form's heading, or at the top of the page content (e.g. on the reCAPTCHA page)
    let heading = document.querySelector("h1.info-table-heading");
    let content = document.querySelector("#content_full") || document.body;
    if (heading && heading.parentElement) {
      heading.parentElement.insertBefore(messageElement, heading.nextSibling);
    } else if (content) {
      content.insertBefore(messageElement, content.firstChild);
    } else {
      return;
    }
  }
  messageElement.textContent = message;
  messageElement.style.color = color ? color : "green";
}

function setSearchingBanner() {
  showSearchMessage("WikiTree Sourcer search. Please wait for the form to be filled in and submitted...");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearSearchForm(formElement) {
  // The site remembers the last search, even on a new search form, so clear everything first
  for (let input of formElement.querySelectorAll("input[type='text']")) {
    input.value = "";
  }
  for (let checkbox of formElement.querySelectorAll("input[type='checkbox']")) {
    // no counties ticked means all of Ireland
    checkbox.checked = false;
  }
  let ageInput = formElement.querySelector("input[name='age']");
  if (ageInput) {
    ageInput.value = "0"; // the site's own default, which means any age
  }
}

function setSelectValue(selectElement, value) {
  for (let option of selectElement.options) {
    if (option.value == value) {
      selectElement.value = value;
      return true;
    }
  }
  return false;
}

async function doPendingSearch() {
  //console.log("##############################################################################");
  //console.log("doPendingSearch: called");
  //console.log("doPendingSearch: URL is");
  //console.log(document.URL);

  if (pendingSearchData) {
    let isRetry = pendingSearchData.isRetry;
    let fieldData = pendingSearchData.fieldData;

    //console.log("doPendingSearch: fieldData is:");
    //console.log(fieldData);
    //console.log("doPendingSearch: isRetry is");
    //console.log(isRetry);

    let selectData = pendingSearchData.selectData;
    let formType = pendingSearchData.formType;
    let submitted = false;

    // If the site shows a reCAPTCHA, the user must complete it themselves. Never try to get past it.
    if (document.querySelector(".g-recaptcha, textarea[name='g-recaptcha-response']")) {
      showSearchMessage(
        "WikiTree Sourcer: please complete the reCAPTCHA, then run the search from WikiTree Sourcer again.",
        "red"
      );
      pendingSearchData = undefined;
      return;
    }

    let formElement = document.querySelector("form#search");
    let typeSelect = formElement ? formElement.querySelector("select[name='type']") : null;
    let searchButton = formElement ? formElement.querySelector("input[type='submit'][name='SUBMIT']") : null;

    // Check this is the form for the right kind of record, e.g. the marriage form for a marriage search
    if (formElement && searchButton && (!formType || !typeSelect || typeSelect.value == formType)) {
      clearSearchForm(formElement);

      for (let key in fieldData) {
        let inputElement = formElement.querySelector("input[name='" + key + "']");
        if (inputElement) {
          inputElement.value = fieldData[key];
        } else {
          // e.g. a field that only some forms have. The rest of the search still works without it.
          console.log("rootsirl: search form has no input named " + key);
        }
      }

      if (selectData) {
        for (let key in selectData) {
          let selectElement = formElement.querySelector("select[name='" + key + "']");
          if (!selectElement || !setSelectValue(selectElement, selectData[key])) {
            console.log("rootsirl: could not set select " + key + " to " + selectData[key]);
          }
        }
      }

      await sleep(20);

      // Submit as if the Search button was clicked, so that the button's name is sent with the form
      if (typeof formElement.requestSubmit === "function") {
        formElement.requestSubmit(searchButton);
      } else {
        searchButton.click();
      }
      submitted = true;
    }

    if (!submitted) {
      showSearchMessage(
        "WikiTree Sourcer could not fill in this search form. Please try the search again from WikiTree Sourcer.",
        "red"
      );
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
  checkForPendingSearch();

  siteContentInit(
    "rootsirl",
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
