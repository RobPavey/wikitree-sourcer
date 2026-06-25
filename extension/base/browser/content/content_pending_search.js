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

// Code shared by most content scripts that use pending search - i.e. search using a form.
// This file is included by putting it in the additionalContentJsFiles in site_data.

// NOET: The functions doPendingSearch and setSearchingBanner must be implemented in the
// <site>_content.js file for this to work

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

async function checkForPendingSearch() {
  console.log("checkForPendingSearch: called");
  console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  console.log("checkForPendingSearch: URL is");
  console.log(document.URL);

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

  if (searchData.url != document.URL) {
    console.log("checkForPendingSearch: URLs do not match");
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

  window.open(request.searchData.url, "_self", "noreferrer");
  sendResponse({ success: true });
}
