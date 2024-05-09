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
var currentPageType;

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
    var event = new Event("click");
    clearButtonElement.dispatchEvent(event);
    await sleep(50);
  }
}

async function doPendingSearch() {
  //console.log("doPendingSearch: called");
  //console.log("doPendingSearch: URL is");
  //console.log(document.URL);

  if (pendingSearchData) {
    await sleep(100);
    await clearSearchFields();
    await sleep(20);

    //console.log("checkForPendingSearch: URL matches ready to fill form");

    //console.log("checkForPendingSearch: got formValues:");
    //console.log(pendingSearchData);

    let fieldData = pendingSearchData.fieldData;

    //console.log("doPendingSearch: fieldData is:");
    //console.log(fieldData);

    // Inputs have IDs like:
    // #historicalSearch-name-familyName

    let submitted = false;
    let inputNotFound = false;

    let formElement = document.querySelector("div.historical-search-criteria form");
    //console.log("doPendingSearch: formElement is:");
    //console.log(formElement);
    if (formElement) {
      let searchTypeElement = document.querySelector("#historicalSearch-type0");
      let menuBarElement = document.querySelector("bdm-header > div.bdm-header > div.desktop-empty-menu-bar");

      //console.log("doPendingSearch: searchTypeElement is:");
      //console.log(searchTypeElement);
      //console.log("doPendingSearch: menuBarElement is:");
      //console.log(menuBarElement);

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
          //console.log("doPendingSearch: inputElement is:");
          //console.log(inputElement);
          await sleep(10);
          let inputType = inputElement.getAttribute("type");
          if (inputType == "checkbox") {
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

      if (!inputNotFound) {
        await sleep(10);

        // try to submit form
        let searchButtonElement = document.querySelector("historical-search div.btnRow button.btn-primary");
        if (searchButtonElement) {
          //console.log("about to click button");
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
            currentPageType = addedNode.tagName.toLowerCase();
            if (currentPageType == "search-results-page") {
              //console.log("search-results-page added");
              clearSearchingBanner();
              registerTabWithBackground();
              addSearchResultsListener();
              break;
            } else if (currentPageType == "historical-search") {
              //console.log("historical-search added");
              registerTabWithBackground();
              if (pendingSearchData) {
                doPendingSearch();
              }
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
    //console.log("vicbdm: additionalMessageHandler, currentPageType is: " + currentPageType);

    pendingSearchData = request.searchData;

    if (currentPageType == "historical-search") {
      setSearchingBanner();

      doPendingSearch();
    } else if (currentPageType == "search-result-details") {
      doPendingSearchFromDetailsPage();
    } else if (currentPageType == "search-results-page") {
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
