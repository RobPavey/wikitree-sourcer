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
  const deathCertTable = document.querySelector("table#DeathCertTable");
  if (deathCertTable) {
    const selectedRow = deathCertTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const deathCertTable = document.querySelector("table#DeathCertTable");
  //console.log("addClickedRowListener: deathCertTable is");
  //console.log(deathCertTable);

  if (deathCertTable && !deathCertTable.hasAttribute("listenerOnClick")) {
    deathCertTable.setAttribute("listenerOnClick", "true");
    deathCertTable.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }

      // get the (non-header) table row of the selected element
      selectedRow = ev.target.closest("tr:not([data-sortable])");
      if (selectedRow) {
        highlightRow(selectedRow);
      }
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Code for registering/unregistering tab with background
////////////////////////////////////////////////////////////////////////////////

async function unregisterTabWithBackground() {
  //console.log("unregisterTabWithBackground");

  // send message to background script that we have a sosmogov tab open
  let unregisterResponse = await chrome.runtime.sendMessage({
    type: "unregisterTab",
    siteName: "sosmogov",
    tab: registeredTabId,
  });

  //console.log("sosmogov, response from unregisterTab message");
  //console.log(unregisterResponse);

  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("sosmogov: No response from background script, lastError message is:");
    console.log(chrome.runtime.lastError.message);
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a sosmogov tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "sosmogov" });

    //console.log("sosmogov, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("sosmogov: No response from background script, lastError message is:");
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
    console.log("sosmogov: No response from background script, error is:");
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

var pleaseWaitDotCounter = 3;
function setSearchingBanner() {
  // Modify the page to say it is a WikiTree Sourcer search
  let mainElement = document.querySelector("#main");
  let containerElement = document.querySelector("#main > div#crumbs");
  if (mainElement && containerElement) {
    // let message = "WikiTree Sourcer search. Please wait for form to be populated and submitted";
    let message =
      "WikiTree Sourcer filled in the search fields. Please make any desired changes and click the Search button";
    for (let i = 0; i < pleaseWaitDotCounter; i++) {
      message += ".";
    }

    let existingSpan = mainElement.querySelector("#sourcerWaitMessage");
    if (existingSpan) {
      pleaseWaitDotCounter = (pleaseWaitDotCounter + 1) % 3;
      existingSpan.textContent = message;
    } else {
      let fragment = document.createDocumentFragment();

      let pageTitle = document.createElement("div");
      fragment.appendChild(pageTitle);

      let container = document.createElement("div");
      pageTitle.appendChild(container);

      let h1 = document.createElement("h1");
      container.appendChild(h1);

      let span = document.createElement("span");
      span.id = "sourcerWaitMessage";
      span.textContent = message;
      span.style.color = "green";
      h1.appendChild(span);

      mainElement.insertBefore(fragment, containerElement);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var inputElementsAwaitingMutation = [];

function addMutationObserver(inputElement) {
  // I added this because it was getting errors if the form was submitted too fast.
  // It seemed like each input field that was changed sent a POST and the response was some HTML that
  // was used to update the element sibling next to the input field.
  // However the next data I tested it on the normal search it was no longer sending posts for
  // every field.
  // It still seems to work for the context menu search though and shortens the wait time.

  //console.log("addMutationObserver on inputElement parent:");
  //console.log(inputElement);

  let parentElement = inputElement.closest("div");
  if (!parentElement) {
    console.log("addMutationObserver: parentElement not found.");
    return;
  }

  //console.log("addMutationObserver: main element found");

  let id = inputElement.id;

  const callback = (mutationList, observer) => {
    //console.log("Mutation observer callback for " + id + ", mutationList is:");
    //console.log(mutationList);
    //console.log(observer);

    const index = inputElementsAwaitingMutation.indexOf(inputElement);
    if (index != -1) {
      inputElementsAwaitingMutation.splice(index, 1);
      //console.log("addMutationObserver: removed element " + id);
      //console.log("list.length is now: " + inputElementsAwaitingMutation.length);
      //console.log(inputElementsAwaitingMutation);
    }
  };

  inputElementsAwaitingMutation.push(inputElement);
  //console.log("addMutationObserver: added element " + id);
  //console.log("list.length is now: " + inputElementsAwaitingMutation.length);
  //console.log(inputElementsAwaitingMutation);

  const observer = new MutationObserver(callback);
  const config = { attributes: false, childList: true, subtree: false };
  observer.observe(parentElement, config);
}

function resetSearchFormFields() {
  //   radio buttons: DeathCertNameSearchType, LNSearchMethod, FNSearchMethod, MNSearchMethod
  //   LastName, FirstName, and MiddleName,
  //   BeginYear, BeginMonth (selectable options), EndYear, and EndMonth (selectable options),
  //   CountyName (selectable options),
  let resetFieldData = {};
  document.querySelector("#BeginMonth").options[0].selected = true;
  document.querySelector("#EndMonth").options[0].selected = true;
  document.querySelector("#CountyName").options[0].selected = true;
  resetFieldData["DeathCertNameSearchType_0"] = true;
  resetFieldData["LNSearchMethod_0"] = true;
  resetFieldData["FNSearchMethod_0"] = true;
  resetFieldData["MNSearchMethod_0"] = true;
  resetFieldData["LastName"] = "";
  resetFieldData["FirstName"] = "";
  resetFieldData["MiddleName"] = "";
  // resetFieldData["BeginMonth"] = "0";
  resetFieldData["BeginYear"] = "";
  // resetFieldData["EndMonth"] = "0";
  resetFieldData["EndYear"] = "";
  // resetFieldData["CountyName"] = "-- Search All --";
  for (var key in resetFieldData) {
    console.log("resetSearchFormFields: key is: " + key);

    if (key) {
      let value = resetFieldData[key];
      //console.log("resetSearchFormFields: value is: " + value);

      // if (value !== undefined && value !== "") {
      if (value !== undefined) {
        let id = key;

        //console.log("resetSearchFormFields: id is: " + id);

        let inputElement = document.querySelector("input[id='" + id + "']");
        inputElement.value = value;

        //console.log("resetSearchFormFields: inputElement is:");
        //console.log(inputElement);

        /*
        if (inputElement) {
          // just setting the value sometimes does not seem to register with the form
          inputElement.focus();
          document.execCommand("selectAll", false);
          document.execCommand("insertText", false, value);
          if (searchButtonElement) {
            // moves to another input so that this field gets processed
            searchButtonElement.focus();
          }
          mainElement.scrollIntoView(); // so user can see the "WikiTree Sourcer" message
          addMutationObserver(inputElement);
          setSearchingBanner();
          await sleep(100);
        } else {
          inputNotFound = true;
          break;
        }
        */
      }
    }
  }
}

async function doPendingSearch() {
  //console.log("##############################################################################");
  //console.log("doPendingSearch: called");
  //console.log("doPendingSearch: URL is");
  //console.log(document.URL);
  //console.log("doPendingSearch: pendingSearchData is");
  //console.log(pendingSearchData);

  if (pendingSearchData) {
    let isRetry = pendingSearchData.isRetry;

    let submitted = false;
    let inputNotFound = false;

    let fieldData = pendingSearchData.fieldData;
    let selectData = pendingSearchData.selectData;

    let mainElement = document.querySelector("#main");
    let formElement = document.querySelector("form");
    //console.log("doPendingSearch: formElement is:");
    //console.log(formElement);
    //console.log("doPendingSearch: fieldData is:");
    //console.log(fieldData);
    //console.log("doPendingSearch: isRetry is");
    //console.log(isRetry);

    //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
    // insert code here to do the search by filling out the form and submitting it
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // search page key fields are: input id=
    //   LastName, FirstName, and MiddleName,
    //   BeginYear, BeginMonth (selectable options), EndYear, and EndMonth (selectable options),
    //   CountyName (selectable options),
    //   and input id=btnSearch click will submit the search
    if (formElement) {
      let searchButtonElement = document.querySelector("input[id='btnSearch']");

      // reset the search form fields before we start filling them in
      // resetSearchFormFields();

      //console.log("fieldData loop");
      for (var key in fieldData) {
        console.log("doPendingSearch: key is: " + key);

        if (key) {
          let value = fieldData[key];
          console.log("doPendingSearch: value is: " + value);

          //if (value !== undefined && value !== "") {
          if (value !== undefined) {
            let id = key;

            //console.log("doPendingSearch: id is: " + id);

            let inputElement = document.querySelector("input[id='" + id + "']");
            console.log("doPendingSearch: inputElement is:");
            console.log(inputElement);

            if (inputElement) {
              //inputElement.value = value;

              // just setting the value sometimes does not seem to register with the form
              inputElement.focus();
              document.execCommand("selectAll", false);
              document.execCommand("insertText", false, value);
              if (searchButtonElement) {
                // moves to another input so that this field gets processed
                searchButtonElement.focus();
              }
              mainElement.scrollIntoView(); // so user can see the "WikiTree Sourcer" message
              addMutationObserver(inputElement);
              setSearchingBanner();
              await sleep(100);
              console.log("after update: inputElement is:");
              console.log(inputElement);
            } else {
              inputNotFound = true;
              break;
            }
          }
        }
      }

      /*
      //console.log("selectData loop");
      for (var key in selectData) {
        //console.log("doPendingSearch: key is: " + key);

        if (key) {
          let value = fieldData[key];
          //console.log("doPendingSearch: value is: " + value);

          if (value !== undefined && value !== "") {
            let id = key;

            //console.log("doPendingSearch: id is: " + id);

            let inputElement = document.querySelector("input[id='" + id + "']");
            //console.log("doPendingSearch: inputElement is:");
            //console.log(inputElement);

            if (inputElement) {
              // just setting the value sometimes does not seem to register with the form
              inputElement.focus();
              document.execCommand("selectAll", false);
              document.execCommand("insertText", false, value);
              if (searchButtonElement) {
                // moves to another input so that this field gets processed
                searchButtonElement.focus();
              }
              mainElement.scrollIntoView(); // so user can see the "WikiTree Sourcer" message
              addMutationObserver(inputElement);
              setSearchingBanner();
              await sleep(100);
            } else {
              inputNotFound = true;
              break;
            }
          }
        }
      }
      */

      //console.log("inputNotFound is:");
      //console.log(inputNotFound);

      if (!inputNotFound) {
        // A long sleep seems to be required sometimes,
        // otherwise it can say the family name or given names need to be filled out.
        // 1000 is not always enough here.
        // Test case - search for death from https://www.wikitree.com/wiki/Clarke-15954
        // This was happening consistently for a while on 27 Aug 2024. I added the mutationObserver
        // code then and it seems to work but the next day the mutationObserver was not getting updates.
        // Ao it always seems to wait 2000 here.
        let waitTime = 0;
        while (inputElementsAwaitingMutation.length > 0 && waitTime < 2000) {
          await sleep(200);
          waitTime += 200;
          setSearchingBanner();
        }
        //console.log("doPendingSearch: completed wait for mutations, waitTime is: " + waitTime);

        // update this in case the HTML changed
        searchButtonElement = document.querySelector("input[id='btnSearch']");

        //console.log("doPendingSearch: searchButtonElement is:");
        //console.log(searchButtonElement);

        /* If we let the user click the Search button, the browser back arrow works, in case the user wants to refine the search criteria.
        // try to submit form
        if (searchButtonElement) {
          //console.log("about to click button");

          // now submit the form to do the search
          searchButtonElement.click();

          submitted = true;
        }
        */
      }
    }

    if (!submitted) {
      console.log("not submitted");
    } else {
      //console.log("submitted");
    }

    // clear the pending data so that we don't use it again on refine search
    pendingSearchData = undefined;
  }
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");
  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  /*
  // changed to match nswbdm
  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }
  */

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    // but when we call window.open to reuse the tab it will not be empty so do not return here
    //return false;
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
    return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// Top level functions
////////////////////////////////////////////////////////////////////////////////

async function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doSearchInExistingTab") {
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
    return { wasHandled: true, returnValue: false };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  // probably should be done only for search window, maybe from check for pending search
  registerTabWithBackground();

  // check for a pending search first, there is no need to do the site init if there is one
  let isPendingSearch = await checkForPendingSearch();

  // we don't need to do this if there is a pending search because the page will reload due to the search
  // it is possible this could interfere with filling out the form
  if (!isPendingSearch) {
    siteContentInit(
      `sosmogov`,
      `site/sosmogov/core/sosmogov_extract_data.mjs`,
      undefined, // overrideExtractHandler
      additionalMessageHandler
    );

    addClickedRowListener();
  }
}

checkForSearchThenInit();
