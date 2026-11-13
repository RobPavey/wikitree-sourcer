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
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["agathaSearchData"], function (value) {
        //console.log("getPendingSearch resolve");
        resolve(value.agathaSearchData);
      });
    } catch (ex) {
      //console.log("getPendingSearch catch");
      reject(ex);
    }
  });
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

  agathaSearchData = await getPendingSearch();

  //console.log("checkForPendingSearch: searchData is:");
  //console.log(agathaSearchData);

  if (agathaSearchData) {
    let timeStamp = agathaSearchData.timeStamp;
    let timeStampNow = Date.now();
    let timeSinceSearch = timeStampNow - timeStamp;

    //console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
    //console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
    //console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

    // It can take a long time to populate the page with the input fields
    if (timeSinceSearch < 10000) {
      let fieldData = agathaSearchData.fieldData;
      // Switch tabs to person search
      const personTabButton = document.getElementById("PERS_a");
      if (personTabButton) {
        personTabButton.click();
      }
      const timePeriodSelector = document.getElementById("CHOOSE_DATE_PERIODE_PERS");
      if (timePeriodSelector) {
        timePeriodSelector.value = "3";
      }

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
      let formElement = document.getElementById("PERS_FORM");
      if (formElement) {
        formElement.submit();
      }
    }

    // clear the search data
    chrome.storage.local.remove(["agathaSearchData"], function () {
      //console.log("cleared searchData");
    });
  }
}

async function checkForSearchThenInit() {
  await checkForPendingSearch();

  siteContentInit("agatha");
}

checkForSearchThenInit();
