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
      chrome.storage.local.get(
        ["freeregSearchData"],
        function (value) {
          resolve(value.freeregSearchData);
        });
    }
    catch (ex) {
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

  if (document.URL == "https://www.freereg.org.uk/search_queries/new?locale=en") {
    //console.log("checkForPendingSearch: URL matches");


    let freeregSearchData = await getPendingSearch();

    if (freeregSearchData) {
      //console.log("checkForPendingSearch: got formValues:");
      //console.log(freeregSearchData);

      let searchUrl = freeregSearchData.url;
      let timeStamp = freeregSearchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
      //console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let fieldData = freeregSearchData.fieldData;

        //console.log("checkForPendingSearch: fieldData is:");
        //console.log(fieldData);

        for(var key in fieldData) {
          //console.log("checkForPendingSearch: key is: " + key);
          if (key) {
            let value = fieldData[key];
            //console.log("checkForPendingSearch: value is: " + value);

            let inputElement = document.getElementById(key);
            if (inputElement) {
              //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);

              if (inputElement.type == "checkbox" || inputElement.type == "radio") {
                inputElement.checked = value;
              }
              else {
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

      // clear the search data
      chrome.storage.local.set({freeregSearchData: undefined}, function() {
        //console.log('cleared freeregSearchData');
      });
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(`freereg`,
    `site/freereg/core/freereg_extract_data.mjs`,
  );
}

checkForSearchThenInit();