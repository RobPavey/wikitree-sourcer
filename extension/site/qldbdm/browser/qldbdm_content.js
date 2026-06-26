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
// Do the search
////////////////////////////////////////////////////////////////////////////////

function setSearchingBanner() {
  // Do nothing for now - the results appear at the bottom of the page
}

async function checkForPendingSearch() {
  console.log("checkForPendingSearch: called");
  console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  console.log("checkForPendingSearch: URL is");
  console.log(document.URL);

  const resetEnding = "reset";
  if (document.URL.endsWith(resetEnding)) {
    // As a way to clear the form we always put /reset on the end
    // This clears and redirects to the URL without /reset
    return;
  }

  let searchData = undefined;
  try {
    searchData = await getPendingSearch();
  } catch (error) {
    console.log("checkForPendingSearch: getPendingSearch reject");
  }

  console.log("checkForPendingSearch: searchData is:");
  console.log(searchData);

  if (!searchData) {
    return;
  }

  let cleanUrl = searchData.url;

  if (cleanUrl.endsWith(resetEnding)) {
    cleanUrl = cleanUrl.substring(0, cleanUrl.length - resetEnding.length);
  }

  if (cleanUrl != document.URL) {
    console.log(`checkForPendingSearch: URLs do not match: cleanUrl:${cleanUrl}, document.URL=${document.URL}`);
    return;
  }

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

  // clear the search data no that we have set pendingSearchData
  chrome.storage.local.remove(["searchData"], function () {
    //console.log("cleared searchData");
  });
}

async function doPendingSearch() {
  console.log("##############################################################################");
  console.log("doPendingSearch: called");
  console.log("doPendingSearch: URL is");
  console.log(document.URL);

  if (pendingSearchData) {
    let isRetry = pendingSearchData.isRetry;
    let fieldData = pendingSearchData.fieldData;

    console.log("doPendingSearch: fieldData is:");
    console.log(fieldData);
    console.log("doPendingSearch: isRetry is");
    console.log(isRetry);

    let searchButtonElement = document.querySelector("#search");

    for (let key in fieldData) {
      //console.log("doPendingSearch: key is: " + key);

      if (key) {
        let value = fieldData[key];
        //console.log("doPendingSearch: value is: " + value);

        if (value !== undefined && value !== "") {
          console.log("doPendingSearch: key is: " + key);

          let inputElement = document.querySelector(`#${key}`);
          console.log("doPendingSearch: inputElement is:");
          console.log(inputElement);

          if (inputElement) {
            // just setting the value sometimes does not seem to register with the form
            inputElement.focus();
            document.execCommand("selectAll", false);
            document.execCommand("insertText", false, value);
            if (searchButtonElement) {
              // moves to another input so that this field gets processed
              searchButtonElement.focus();
            }
            //mainElement.scrollIntoView(); // so user can see the "please wait" message
            //addMutationObserver(inputElement);
            //setSearchingBanner();
            await sleep(100);
          } else {
            inputNotFound = true;
            break;
          }
        }
      }
    }

    // clear the pending data so that we don't use it again on refine search
    pendingSearchData = undefined;

    if (searchButtonElement) {
      searchButtonElement.click();
    }
  }
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
  // probably should be done only for search window, maybe from check for pending search
  registerTabWithBackground("qldbdm");

  checkForPendingSearch();

  siteContentInit(
    "qldbdm",
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
