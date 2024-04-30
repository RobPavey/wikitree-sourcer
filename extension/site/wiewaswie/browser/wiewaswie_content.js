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

async function getPendingSearch() {
  //console.log("getPendingSearch");
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["wiewaswieSearchData"], function (value) {
        //console.log("getPendingSearch resolve");
        resolve(value.wiewaswieSearchData);
      });
    } catch (ex) {
      //console.log("getPendingSearch catch");
      reject(ex);
    }
  });
}

var refineRetries = 0;

async function refineResults(selectData) {
  elementsFound = false;
  //console.log("refineResults: selectData is: ");
  //console.log(selectData);

  let searchContainer = document.querySelector("div.row.search-advanced");
  //console.log("refineResults: searchContainer is: ");
  //console.log(searchContainer);

  let refineContainer = document.querySelector("div.row.search-facets");
  //console.log("refineResults: refineContainer is: ");
  //console.log(refineContainer);

  if (refineContainer) {
    for (var key in selectData) {
      //console.log("refineResults: selectData key is: " + key);
      if (key) {
        let value = selectData[key];
        //console.log("refineResults: selectData value is: " + value);

        let selector =
          "input[ng-model='" + key + "'] ~ div.selector-options > ul > li.ng-scope[data-value='" + value + "']";

        let liElement = refineContainer.querySelector(selector);
        if (liElement) {
          //console.log("refineResults: liElement found ");

          // we have found the element but it may take a few milliseconds to be working
          setTimeout(function () {
            var event = new Event("click");
            liElement.dispatchEvent(event);
          }, 100);

          elementsFound = true;
        }
      }
    }
  }

  if (!elementsFound && refineRetries < 10) {
    refineRetries += 1;
    setTimeout(function () {
      refineResults(selectData);
    }, 100);
  }
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");

  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  if (/https\:\/\/www\.wiewaswie\.nl\/\w\w\/\w+\/\?advancedsearch=1/.test(document.URL)) {
    //console.log("checkForPendingSearch: URL matches");

    let wiewaswieSearchData = undefined;
    try {
      wiewaswieSearchData = await getPendingSearch();
    } catch (error) {
      //console.log("checkForPendingSearch: getPendingSearch reject");
    }

    if (wiewaswieSearchData) {
      //console.log("checkForPendingSearch: got formValues:");
      //console.log(wiewaswieSearchData);

      let searchUrl = wiewaswieSearchData.url;
      let timeStamp = wiewaswieSearchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
      //console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let fieldData = wiewaswieSearchData.fieldData;

        //console.log("checkForPendingSearch: fieldData is:");
        //console.log(fieldData);

        let searchContainer = document.querySelector("div.row.search-advanced");
        if (searchContainer) {
          for (var key in fieldData) {
            //console.log("checkForPendingSearch: key is: " + key);
            if (key) {
              let value = fieldData[key];
              //console.log("checkForPendingSearch: value is: " + value);

              let selector = "input[ng-model='" + key + "']";
              let inputElement = searchContainer.querySelector(selector);
              if (inputElement) {
                //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;

                var event = new Event("change");
                inputElement.dispatchEvent(event);
              }
            }
          }
        }

        // try to submit form
        let searchButtonElement = searchContainer.querySelector("button[ng-click='vm.DoAdvancedSearch()']");
        if (searchButtonElement) {
          // now click the button to do the search
          var event = new Event("click");
          searchButtonElement.dispatchEvent(event);
        }
      }

      // clear the search data
      chrome.storage.local.remove(["wiewaswieSearchData"], function () {
        //console.log("cleared wiewaswieSearchData");
      });

      let selectData = wiewaswieSearchData.selectData;

      setTimeout(function () {
        refineResults(selectData);
      }, 100);
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(`wiewaswie`, `site/wiewaswie/core/wiewaswie_extract_data.mjs`);
}

checkForSearchThenInit();
