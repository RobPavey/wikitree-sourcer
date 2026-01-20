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

async function getPendingSearch() {
  //console.log("getPendingSearch");

  // Gets any pending search data from local storage
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["panbSearchData"], function (value) {
        //console.log("getPendingSearch resolve");
        resolve(value.panbSearchData);
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

  if (document.URL == "https://archives2.gnb.ca/Search/FEDS/Default.aspx?culture=en-CA") {
    //console.log("checkForPendingSearch: URL is");
    //console.log(document.URL);

    let panbSearchData = undefined;
    try {
      panbSearchData = await getPendingSearch();
    } catch (error) {
      console.log("checkForPendingSearch: getPendingSearch reject");
    }

    //console.log("checkForPendingSearch: searchData is:");
    //console.log(searchData);

    if (panbSearchData) {
   
    //console.log("checkForPendingSearch: got formValues:");
    //console.log(searchData);

    let searchUrl = panbSearchData.url;
    let timeStamp = panbSearchData.timeStamp;
    let timeStampNow = Date.now();
    let timeSinceSearch = timeStampNow - timeStamp;

    //console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
    //console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
    //console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

    // It can take a long time to populate the page with the input fields
    if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let fieldData = panbSearchData.fieldData;

        //console.log("checkForPendingSearch: fieldData is:");
        //console.log(fieldData);

        for (var key in fieldData) {
          //console.log("checkForPendingSearch: key is: " + key);
          if (key) {
            let value = fieldData[key];
            //console.log("checkForPendingSearch: value is: " + value);

            let inputElement = document.getElementById(key);
            if (inputElement) {
              //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);

              if (inputElement.type == "checkbox" || inputElement.type == "radio") {
                inputElement.checked = value;
              } else {
                inputElement.value = value;
              }
            }
          }
        }

        // try to submit form
        let formElement = document.getElementById("new_search_query");
        if (formElement) {
          //console.log("checkForPendingSearch: found formElement:");
          //console.log(formElement);

          // Now hide the form so that the use doesn't try to use it.
          formElement.style.display = "none";

          const titleElement = document.querySelector("main.site__content div.container h1.title");
          if (titleElement) {
            titleElement.innerText = "Performing WikiTree Sourcer search...";
          }

          // now submit the form to do the search
          formElement.submit();
        }
      }

      // clear the search data now that we have set pendingSearchData
      chrome.storage.local.remove(["panbSearchData"], function () {
        //console.log("cleared panbSearchData");
      });
    }
  }
}
////////////////////////////////////////////////////////////////////////////////
// Top level functions
////////////////////////////////////////////////////////////////////////////////

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(
    `panb`,
    `site/panb/core/panb_extract_data.mjs`);
  
}

checkForSearchThenInit();
