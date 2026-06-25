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

    const allTextFieldsIdsToClear = ["subjectgivennames", "subjectfamilyname"];

    const allCheckboxestoClear = ["exactTermsGivennamesOnly", "exactTermsFamilynameOnly"];

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
