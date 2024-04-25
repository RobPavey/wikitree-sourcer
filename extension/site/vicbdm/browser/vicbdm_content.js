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

async function getPendingSearch() {
  console.log("getPendingSearch");
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["vicbdmSearchData"], function (value) {
        console.log("getPendingSearch resolve");
        resolve(value.vicbdmSearchData);
      });
    } catch (ex) {
      console.log("getPendingSearch catch");
      reject(ex);
    }
  });
}

const maxRetries = 20;
var numRetries = 0;

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called");
  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  //console.log("checkForPendingSearch: URL is");
  //console.log(document.URL);

  // Expect smoething like this:
  // https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa

  const startingSearchRegEx = /^https\:\/\/my\.rio\.bdm\.vic\.gov\.au\/efamily-history\/\-$/;
  const midSearchRegEx = /^https\:\/\/my\.rio\.bdm\.vic\.gov\.au\/$/;
  const readySearchRegEx = /^https\:\/\/my\.rio\.bdm\.vic\.gov\.au\/efamily-history\/\w\w\w\w\w\w+$/;

  let isStartingSearchPage = startingSearchRegEx.test(document.URL);
  let isMidSearchPage = midSearchRegEx.test(document.URL);
  let isReadySearchPage = readySearchRegEx.test(document.URL);

  if (isStartingSearchPage || isMidSearchPage || isReadySearchPage) {
    //console.log("checkForPendingSearch: URL matches ready to fill form");

    let vicbdmSearchData = undefined;
    try {
      vicbdmSearchData = await getPendingSearch();
    } catch (error) {
      console.log("checkForPendingSearch: getPendingSearch reject");
    }

    if (vicbdmSearchData) {
      // Modify the page to say it is a WikiTree Sourcer search
      let menuBarElement = document.querySelector("bdm-header > div.bdm-header > div.desktop-empty-menu-bar");
      console.log("menuBarElement is:");
      console.log(menuBarElement);
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
        }
      }

      // if not ready to fill the form yet then wait
      if (isStartingSearchPage || isMidSearchPage) {
        //console.log("have search data but not on ready to search page yet, numRetries = " + numRetries);

        if (numRetries < maxRetries) {
          //console.log("setTimeout for retry");
          numRetries++;
          setTimeout(function () {
            checkForPendingSearch();
          }, 1000);
        }
        return;
      }

      //console.log("checkForPendingSearch: got formValues:");
      //console.log(vicbdmSearchData);

      let searchUrl = vicbdmSearchData.url;
      let timeStamp = vicbdmSearchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      console.log("checkForPendingSearch: searchUrl is: " + searchUrl);
      console.log("checkForPendingSearch: timeStamp is: " + timeStamp);
      console.log("checkForPendingSearch: timeStampNow is: " + timeStampNow);
      console.log("checkForPendingSearch: timeSinceSearch is: " + timeSinceSearch);

      // It can take a long time to populate the page with the input fields
      if (timeSinceSearch < 50000) {
        let fieldData = vicbdmSearchData.fieldData;

        console.log("checkForPendingSearch: fieldData is:");
        console.log(fieldData);

        // Inputs have IDs like:
        // #historicalSearch-name-familyName

        let submitted = false;
        let inputNotFound = false;

        let formElement = document.querySelector("div.historical-search-criteria form");
        if (formElement) {
          let searchTypeElement = document.querySelector("#historicalSearch-type0");
          for (var key in fieldData) {
            console.log("checkForPendingSearch: key is: " + key);
            if (key) {
              let value = fieldData[key];
              console.log("checkForPendingSearch: value is: " + value);

              let inputElement = formElement.querySelector("#" + key);
              if (inputElement) {
                let inputType = inputElement.getAttribute("type");
                if (inputType == "checkbox") {
                  console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.checked);
                  inputElement.checked = value;
                  var event = new Event("change", { bubbles: true });
                  inputElement.dispatchEvent(event);
                } else {
                  console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
                  // NOTE: this seems to fix the problem with Angular
                  // https://stackoverflow.com/questions/50419013/how-to-make-the-a-input-field-dirty-through-javascript-of-a-angular-1-pag
                  // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
                  inputElement.focus();
                  document.execCommand("selectAll", false);
                  document.execCommand("insertText", false, value);
                  if (searchTypeElement) {
                    // need to move focus on to register change
                    searchTypeElement.focus();
                  }
                }
              } else {
                inputNotFound = true;
                break;
              }
            }
          }

          if (!inputNotFound) {
            // try to submit form
            let searchButtonElement = document.querySelector("historical-search div.btnRow button.btn-primary");
            if (searchButtonElement) {
              console.log("about to click button");
              // now click the button to do the search
              var event = new Event("click");
              searchButtonElement.dispatchEvent(event);

              let sourcerFragment = menuBarElement.querySelector("span");
              if (sourcerFragment) {
                sourcerFragment.style.display = "none";
              }

              submitted = true;
            }
          }

          if (submitted) {
            // clear the search data
            chrome.storage.local.set({ vicbdmSearchData: undefined }, function () {
              console.log("cleared vicbdmSearchData");
            });
          } else {
            console.log("formElement not found");
          }
        }

        if (!submitted) {
          console.log("not submitted, numRetries = " + numRetries);

          if (numRetries < maxRetries) {
            console.log("setTimeout for retry");
            numRetries++;
            setTimeout(function () {
              checkForPendingSearch();
            }, 1000);
          }
        }
      } else {
        // timeStamp has expired clear the search data
        chrome.storage.local.set({ vicbdmSearchData: undefined }, function () {
          console.log("cleared vicbdmSearchData");
        });
      }
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(`vicbdm`, `site/vicbdm/core/vicbdm_extract_data.mjs`);
}

checkForSearchThenInit();
