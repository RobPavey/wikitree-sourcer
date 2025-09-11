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
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["eggsagrvsSearchData"], function (value) {
        resolve(value.eggsagrvsSearchData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function checkForPendingSearch() {
  //   console.log("checkForPendingSearch: called, URL is " + document.URL);
  //   console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  const lcUrl = document.URL.toLowerCase();
  if (lcUrl.includes("graves.eggsa.org") && lcUrl.includes("searchgraves")) {
    // console.log("checkForPendingSearch: URLs match");

    const eggsaSearchData = await getPendingSearch();

    if (eggsaSearchData) {
      //   console.log("checkForPendingSearch: got searcData:");
      //   console.log(eggsaSearchData);

      const searchUrl = eggsaSearchData.url;
      const timeStamp = eggsaSearchData.timeStamp;
      const timeStampNow = Date.now();
      const timeSinceSearch = timeStampNow - timeStamp;

      //   console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
      //   console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //   console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //   console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        //   if (timeSinceSearch < 10000 && eggsaSearchData.searchTarget == "eGGSAgraves") {
        const formElement = document.querySelector("form");
        if (formElement) {
          const fieldData = eggsaSearchData.fieldData;

          //   console.log("checkForPendingSearch: fieldData is:");
          //   console.log(fieldData);

          let fName;
          let lName;
          for (var key in fieldData.simpleNameFields) {
            // console.log("checkForPendingSearchData: key is: " + key);
            if (key) {
              const value = fieldData.simpleNameFields[key];
              //   console.log("checkForPendingSearchData: value is: " + value);

              const selector = "input[name=" + CSS.escape(key) + "]";
              //   console.log("checkForPendingSearchData: simple name selector is: " + selector);
              const inputElement = formElement.querySelector(selector);

              if (inputElement) {
                // console.log("checkForPendingSearchData: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;
              }
              if (key == "what_firstname") {
                fName = value;
              } else if (key == "what_surname") {
                lName = value;
              }
            }
          }

          // try to submit form
          //console.log("checkForPendingSearch: found formElement:");
          //console.log(formElement);

          // Now hide the form so that the user doesn't try to use it.
          formElement.style.display = "none";

          const titleElement = document.querySelector("#content h2");
          if (titleElement) {
            const text = titleElement.textContent;
            titleElement.innerText = "Sourcer: " + text;
          }
          const div = document.querySelector(".form-style-search");
          const p = document.createElement("p");
          p.textContent = `Searching for ${fName} ${lName}...`;
          div.prepend(p);

          // now submit the form to do the search
          formElement.submit();
        }
      } else {
        console.log(`searcTarget mismatch: ${eggsaSearchData.searchTarget}`);
      }

      // clear the search data
      chrome.storage.local.remove(["eggsagrvsSearchData"], function () {
        //console.log("cleared freeregSearchData");
      });
    } else {
      console.log("No search data found");
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();
  siteContentInit(`eggsagrvs`, `site/eggsagrvs/core/eggsagrvs_extract_data.mjs`);
}
// console.log(`Sourcer is here, url=${document.URL}, referrer=${document.referrer}`);

checkForSearchThenInit();
