/*
MIT License

Copyright (c) 2024 Robert M Pavey

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
  let menuBarElement = document.querySelector("bdm-header > div.bdm-header > div.desktop-empty-menu-bar");
  //console.log("menuBarElement is:");
  //console.log(menuBarElement);
  if (menuBarElement) {
    let sourcerFragment = menuBarElement.querySelector("span");
    if (!sourcerFragment) {
      let fragment = document.createDocumentFragment();

      let pageTitle = document.createElement("div");
      pageTitle.className = "pageTitle";
      fragment.appendChild(pageTitle);

      let container = document.createElement("div");
      container.className = "container";
      pageTitle.appendChild(container);

      let h1 = document.createElement("h1");
      container.appendChild(h1);

      let span = document.createElement("span");
      span.textContent = "WikiTree Sourcer search. Please wait for form to be populated and submitted...";
      span.style.color = "white";
      h1.appendChild(span);

      menuBarElement.appendChild(fragment);
    } else {
      sourcerFragment.style.display = "block";
    }
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

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");
  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  //console.log("checkForPendingSearch: URL is");
  //console.log(document.URL);

  // Expect something like this:
  // https://my.rio.bdm.vic.gov.au/efamily-history/-

  const startingSearchRegEx = /^https\:\/\/my\.rio\.bdm\.vic\.gov\.au\/efamily-history\/\-$/;
  let isStartingSearchPage = startingSearchRegEx.test(document.URL);
  if (isStartingSearchPage) {
    //console.log("checkForPendingSearch: URL matches ready to fill form");

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

      //console.log("checkForPendingSearch: searchUrl is: " + searchUrl);
      //console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
      //console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
      //console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

      // It can take a long time to populate the page with the input fields
      if (timeSinceSearch < 50000) {
        pendingSearchData = searchData;
      }

      // clear the search data
      chrome.storage.local.remove(["searchData"], function () {
        //console.log("cleared searchData");
      });
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearSearchFields() {
  // try to clear form
  let clearButtonElement = document.querySelector("historical-search div.btnRow button.btn-secondary");
  if (clearButtonElement) {
    //console.log("about to click clear button");
    // now click the button to do clear the search
    clearButtonElement.focus();
    var event = new Event("click");
    clearButtonElement.dispatchEvent(event);
    //console.log("clicked clear button");
    await sleep(50);
    //console.log("done sleep after clear button");
  }
}

async function resendSearchMessage() {
  console.log("resendSearchMessage");
  // resend message to background to do search
  try {
    pendingSearchData.isRetry = true;
    chrome.runtime.sendMessage(
      {
        type: "doSearchWithSearchData",
        siteName: "vicbdm",
        searchData: pendingSearchData,
        reuseTabIfPossible: true,
      },
      function (response) {
        // We get a detailed response for debugging this
        console.log("resendSearchMessage: doSearchWithSearchData got response: ");
        console.log(response);

        // the message should only ever get a successful response but it could be delayed
        // if the background is asleep.
        if (chrome.runtime.lastError) {
          const message = "resendSearchMessage: Failed to open search page, runtime.lastError is set";
          console.log(message);
        } else if (!response || !response.success) {
          const message = "resendSearchMessage: Failed to open search page, no response or success=false";
          console.log(message);
        } else {
          // message was received OK
          console.log("resendSearchMessage: message was sent and recived OK");
        }
      }
    );
  } catch (error) {
    const message = "resendSearchMessage: Failed to open search page, caught exception";
    console.log(message);
  }
}

var alertsObserver = undefined;

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

    let docHasFocus = document.hasFocus();
    if (!docHasFocus) {
      // send message to background script to get platformInfo
      let isIos = false;
      let getPlatformInfoResponse = await chrome.runtime.sendMessage({
        type: "getPlatformInfo",
      });
      if (getPlatformInfoResponse && getPlatformInfoResponse.success) {
        if (getPlatformInfoResponse.platformInfo && getPlatformInfoResponse.platformInfo.os == "ios") {
          isIos = true;
          //console.log("platform is iOS");
        }
      }

      if (!isIos) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("The document is not focused!");
        console.log("This can happen if the Javascript console is open and focused.");
        console.log("Because this web page uses Angular, filling out the form will not work");
        console.log("if the console is focused.");
        console.log("Please close the Javascript console");
        console.log("or click on the document and try again.");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

        window.focus();
        if (document.activeElement) {
          document.activeElement.blur();
        }

        docHasFocus = document.hasFocus();
        console.log("after window.focus() and activeElement.blur(): docHasFocus is");
        console.log(docHasFocus);
        activeElement = document.activeElement;
        console.log("after window.focus() and activeElement.blur(): activeElement is");
        console.log(activeElement);

        if (!docHasFocus) {
          // this is not going to work, try resending the message but this is also unlikely to work
          if (!isRetry) {
            resendSearchMessage();
            return;
          }
        }
      }
    }

    // Remove focus from any focused element, this probably isn't necesary except possibly
    // when the document doesn't have focus (which is handled above)
    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (!docHasFocus) {
      console.log("doc is still not focused but continuing...");
    }

    // It is possible that not all of the required elements have been created yet
    // Do a check here if not, wait and retry
    async function areAllRequiredElementsPresent() {
      let searchButtonElement = document.querySelector("historical-search div.btnRow button.btn-primary");
      if (!searchButtonElement) {
        console.log("areAllRequiredElementsPresent: searchButtonElement not found");
        return false;
      }

      let clearButtonElement = document.querySelector("historical-search div.btnRow button.btn-secondary");
      if (!clearButtonElement) {
        console.log("areAllRequiredElementsPresent: clearButtonElement not found");
        return false;
      }

      let searchTypeElement = document.querySelector("#historicalSearch-type0");
      if (!searchTypeElement) {
        console.log("areAllRequiredElementsPresent: searchTypeElement not found");
        return false;
      }

      let formElement = document.querySelector("div.historical-search-criteria form");
      if (!formElement) {
        console.log("areAllRequiredElementsPresent: formElement not found");
        return false;
      }

      const additionalOptionsId = "historicalSearch-additionalOptions";
      const additionalOptionsElement = formElement.querySelector("#" + additionalOptionsId);
      if (!additionalOptionsElement) {
        console.log("areAllRequiredElementsPresent: additionalOptionsElement not found");
        return false;
      }

      if (additionalOptionsElement && fieldData[additionalOptionsId]) {
        //console.log("doPendingSearch: additionalOptionsElement is:");
        //console.log(additionalOptionsElement);
        await sleep(10);
        let inputType = additionalOptionsElement.getAttribute("type");
        if (inputType == "checkbox") {
          additionalOptionsElement.focus();
          additionalOptionsElement.checked = true;
          var event = new Event("change", { bubbles: true });
          additionalOptionsElement.dispatchEvent(event);
          await sleep(50);
        }
      }

      for (var key in fieldData) {
        if (key) {
          let inputElement = formElement.querySelector("#" + key);
          if (!inputElement) {
            console.log("areAllRequiredElementsPresent: formElement #" + key + " not found");
            return false;
          }
        }
      }

      //console.log("areAllRequiredElementsPresent: returning true");
      return true;
    }

    const maxTestElementRetries = 3;
    let testElementRetries = 0;
    let requiredElementsArePresent = await areAllRequiredElementsPresent();
    while (testElementRetries < maxTestElementRetries && !requiredElementsArePresent) {
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
      console.log("requiredElementsArePresent is false, retrying, testElementRetries = " + testElementRetries);
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
      await sleep(100);
      requiredElementsArePresent = await areAllRequiredElementsPresent();
      testElementRetries++;
    }
    if (!requiredElementsArePresent) {
      console.log("even after retries the required elements are not present.");
    }

    await sleep(100);
    await clearSearchFields();
    await sleep(20);

    //console.log("checkForPendingSearch: URL matches ready to fill form");

    //console.log("checkForPendingSearch: got formValues:");
    //console.log(pendingSearchData);

    // Inputs have IDs like:
    // #historicalSearch-name-familyName

    let submitted = false;
    let inputNotFound = false;

    let alertsElement = document.querySelector("historical-search alerts");
    //console.log("alertsElement is:");
    //console.log(alertsElement);
    if (alertsElement) {
      // this is because it will get cleared after submit
      let lastPendingSearchData = pendingSearchData;
      let hasTriggeredRetry = false;
      const callback = (mutationList, observer) => {
        //console.log("Mutation observer callback, mutationList is:");
        //console.log(mutationList);
        //console.log(observer);

        for (const mutation of mutationList) {
          if (mutation.type === "childList") {
            //console.log("A child node has been added or removed to the alerts. mutation is:");
            //console.log(mutation);
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              for (let addedNode of mutation.addedNodes) {
                let tagName = addedNode.tagName.toLowerCase();
                if (tagName == "alert") {
                  //console.log("alert added");
                  let firstTextSpan = addedNode.querySelector("div.alert > span");
                  if (firstTextSpan) {
                    let text = firstTextSpan.textContent;
                    //console.log("alert text is:");
                    //console.log(text);

                    if (text.startsWith("Please provide")) {
                      console.log("An alert was added with 'Please provide' at the start");
                      console.log("pendingSearchData is:");
                      console.log(pendingSearchData);
                      console.log("lastPendingSearchData is:");
                      console.log(lastPendingSearchData);

                      if (lastPendingSearchData && !pendingSearchData) {
                        pendingSearchData = lastPendingSearchData;
                      }
                      if (pendingSearchData && !isRetry && !hasTriggeredRetry) {
                        console.log("doing retry, about to call doPendingSearch");
                        if (alertsObserver) {
                          alertsObserver.disconnect();
                          alertsObserver = undefined;
                          console.log("disconnected alertsObserver");
                        }
                        hasTriggeredRetry = true;
                        resendSearchMessage();
                        return;
                      }
                    }
                  }
                  break;
                }
              }
            }
          }
        }
      };

      alertsObserver = new MutationObserver(callback);
      const config = { attributes: false, childList: true, subtree: false };
      alertsObserver.observe(alertsElement, config);
    }

    let formElement = document.querySelector("div.historical-search-criteria form");
    //console.log("doPendingSearch: formElement is:");
    //console.log(formElement);
    if (formElement) {
      let searchTypeElement = document.querySelector("#historicalSearch-type0");
      let menuBarElement = document.querySelector("bdm-header > div.bdm-header > div.desktop-empty-menu-bar");
      let searchButtonElement = document.querySelector("historical-search div.btnRow button.btn-primary");

      //console.log("doPendingSearch: searchTypeElement is:");
      //console.log(searchTypeElement);
      //console.log("doPendingSearch: menuBarElement is:");
      //console.log(menuBarElement);
      //console.log("doPendingSearch: searchButtonElement is:");
      //console.log(searchButtonElement);

      if (searchTypeElement) {
        // extra attempt to make sure changes get registered in angular model
        searchTypeElement.focus();
      }

      // because the additionalOptions checkbox affects which other fields are present it is best to do
      // it forst. It was not a problem on Chrome but was in Safari. It seems that the order
      // that the keys are iterated in is not consistent.

      const additionalOptionsId = "historicalSearch-additionalOptions";
      if (fieldData[additionalOptionsId]) {
        let inputElement = formElement.querySelector("#" + additionalOptionsId);
        if (inputElement) {
          //console.log("doPendingSearch: additionalOptionsId inputElement is:");
          //console.log(inputElement);
          await sleep(10);
          let inputType = inputElement.getAttribute("type");
          if (inputType == "checkbox") {
            inputElement.focus();
            //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.checked);
            inputElement.checked = true;
            var event = new Event("change", { bubbles: true });
            inputElement.dispatchEvent(event);
            await sleep(50);
          }
        }
      }

      for (var key in fieldData) {
        //console.log("checkForPendingSearch: key is: " + key);
        if (key) {
          let value = fieldData[key];
          //console.log("checkForPendingSearch: value is: " + value);

          let inputElement = formElement.querySelector("#" + key);
          //console.log("doPendingSearch: inputElement is:");
          //console.log(inputElement);

          if (inputElement) {
            await sleep(20);

            let inputType = inputElement.getAttribute("type");
            if (inputType == "checkbox") {
              //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.checked);
              inputElement.focus();
              inputElement.checked = value;
              var event = new Event("change", { bubbles: true });
              inputElement.dispatchEvent(event);
            } else {
              //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
              // NOTE: this seems to fix the problem with Angular
              // https://stackoverflow.com/questions/50419013/how-to-make-the-a-input-field-dirty-through-javascript-of-a-angular-1-pag
              // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
              inputElement.focus();
              document.execCommand("selectAll", false);
              document.execCommand("insertText", false, value);
              await sleep(20);
            }
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
          //console.log("about to click button");
          docHasFocus = document.hasFocus();
          //console.log("doPendingSearch: docHasFocus is");
          //console.log(docHasFocus);
          let activeElement = document.activeElement;
          //console.log("doPendingSearch: activeElement is");
          //console.log(activeElement);

          // now click the button to do the search
          // We wait for a few milliseconds to ensure other events have been dispatched
          searchButtonElement.focus();
          await sleep(30);
          var event = new Event("click");
          searchButtonElement.dispatchEvent(event);

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

async function doPendingSearchFromDetailsPage() {
  //console.log("doPendingSearchFromDetailsPage");

  setSearchingBanner();

  await sleep(10);

  // we have to go back to search results and then refine search
  let backButtonElement = document.querySelector("search-result-details div.btnRow button.btn-secondary");
  //console.log("backButtonElement is:");
  //console.log(backButtonElement);
  if (backButtonElement) {
    //console.log("about to click button");
    // click the button to go back to search results
    var event = new Event("click");
    backButtonElement.dispatchEvent(event);
    await sleep(50);
    doPendingSearchFromSearchResultsPage();
  }
}

async function doPendingSearchFromSearchResultsPage() {
  //console.log("doPendingSearchFromSearchResultsPage");
  setSearchingBanner();
  await sleep(10);

  // we have to refine search
  // we have to go back to search results and then refine search
  let refineButtonElement = document.querySelector("search-results-page div.btnRow button.btn-secondary");
  //console.log("refineButtonElement is:");
  //console.log(refineButtonElement);
  if (refineButtonElement) {
    //console.log("about to click button");
    // click the button to go back to search results
    var event = new Event("click");
    refineButtonElement.dispatchEvent(event);
    // The mutationObserver will do the pending search when we get to the correct page
  }
}

function captureRowData(rowElement) {
  let headerElement = document.querySelector("datatable-header");
  if (!headerElement) {
    return;
  }

  let headerLabelSpans = headerElement.querySelectorAll("datatable-header-cell span.datatable-header-cell-label");

  let rowCellSpans = rowElement.querySelectorAll("datatable-body-cell div.datatable-body-cell-label");

  //console.log("headerLabelSpans.length = " + headerLabelSpans.length);
  //console.log("rowCellSpans.length = " + rowCellSpans.length);

  if (headerLabelSpans.length == rowCellSpans.length) {
    let rowData = {};
    for (let i = 0; i < headerLabelSpans.length; i++) {
      let headerText = headerLabelSpans[i].textContent.trim();
      let cellText = rowCellSpans[i].textContent.trim();
      rowData[headerText] = cellText;
    }
    //console.log("rowData is:");
    //console.log(rowData);

    if (loadedExtractDataModule) {
      if (loadedExtractDataModule.setClickedRowData) {
        loadedExtractDataModule.setClickedRowData(rowData);
      }
    }
  }
}

async function addSearchResultsListener() {
  //console.log("addSearchResultsListener: adding event listener");

  let tableElement = document.querySelector("search-results-page div.main-content ngx-datatable");
  if (!tableElement) {
    return;
  }

  //console.log("addSearchResultsListener: found tableElement");

  tableElement.addEventListener("click", function (event) {
    //console.log("click event: event is:");
    //console.log(event);
    if (event.target) {
      let element = event.target;
      while (element) {
        if (element.tagName.toLowerCase() == "datatable-body-cell") {
          break;
        }
        element = element.parentElement;
      }

      if (element) {
        //console.log("found datatable-body-cell element");
        let rowElement = element.parentElement;
        if (rowElement) {
          if (rowElement.classList.contains("datatable-row-center")) {
            //console.log("found row element:");
            //console.log(rowElement);
            captureRowData(rowElement);
          }
        }
      }
    }
  });
}

async function unregisterTabWithBackground() {
  //console.log("unregisterTabWithBackground");

  // send message to background script that we have a vicbdm tab open
  let unregisterResponse = await chrome.runtime.sendMessage({
    type: "unregisterTab",
    siteName: "vicbdm",
    tab: registeredTabId,
  });

  //console.log("vicbdm, response from unregisterTab message");
  //console.log(unregisterResponse);

  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("vicbdm: No response from background script, lastError message is:");
    console.log(chrome.runtime.lastError.message);
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a vicbdm tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "vicbdm" });

    //console.log("vicbdm, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("vicbdm: No response from background script, lastError message is:");
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
    console.log("vicbdm: No response from background script, error is:");
    console.log(error);
  }
}

async function registerTabThenCallDoPendingSearch() {
  // we need to await here, because of retries we need to be sure that this tab is
  // registered before doing the pending search
  await registerTabWithBackground();
  if (pendingSearchData) {
    doPendingSearch();
  }
}

function addMutationObserver() {
  // the problem is that the page changes after the load event.
  // We need some way to get an event when angular changes the page?
  // https://stackoverflow.com/questions/60697864/chrome-extension-to-react-to-angular-page-changes-reload-upon-changes
  // https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/39508954#39508954
  // The suggestion is to use MutationObserver:
  //  https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  // Would have to observer an element that exists from the start - e.g. div.main

  //console.log("addMutationObserver");

  let mainElement = document.querySelector("div.main");
  if (!mainElement) {
    //console.log("addMutationObserver: mainElement not found. document is:");
    //console.log(document);

    // this doesn't happen in Chrome but does in Firefox.
    setTimeout(function () {
      addMutationObserver();
    }, 100);

    return;
  }

  //console.log("addMutationObserver: main element found");

  const callback = (mutationList, observer) => {
    //console.log("Mutation observer callback, mutationList is:");
    //console.log(mutationList);
    //console.log(observer);

    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        //console.log("A child node has been added or removed. mutation is:");
        //console.log(mutation);
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let addedNode of mutation.addedNodes) {
            let currentPageType = addedNode.tagName.toLowerCase();
            if (currentPageType == "search-results-page") {
              //console.log("search-results-page added");
              clearSearchingBanner();
              registerTabWithBackground();
              addSearchResultsListener();
              break;
            } else if (currentPageType == "historical-search") {
              //console.log("historical-search added");
              registerTabThenCallDoPendingSearch();
            }
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  const config = { attributes: false, childList: true, subtree: false };
  observer.observe(mainElement, config);
}

async function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doSearchInExistingTab") {
    //console.log("vicbdm: additionalMessageHandler, request is:");
    //console.log(request);

    pendingSearchData = request.searchData;

    // we originally stored the currentPageType in a global var but that could get
    // lost if the content script got unloaded somehow (being defensive here) so work it out
    // here;

    let mainElement = document.querySelector("div.main");
    if (!mainElement) {
      sendResponse({ success: false });
      return { wasHandled: true };
    }

    if (mainElement.querySelector("historical-search")) {
      setSearchingBanner();

      doPendingSearch();
    } else if (mainElement.querySelector("search-result-details")) {
      doPendingSearchFromDetailsPage();
    } else if (mainElement.querySelector("search-results-page")) {
      doPendingSearchFromSearchResultsPage();
    }

    sendResponse({ success: true });
    return { wasHandled: true, returnValue: false };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  checkForPendingSearch();

  addMutationObserver();

  siteContentInit(
    `vicbdm`,
    `site/vicbdm/core/vicbdm_extract_data.mjs`,
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
