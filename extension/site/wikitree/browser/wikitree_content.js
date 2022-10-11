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
      chrome.storage.local.get(["wikitreeSearchData"], function (value) {
        resolve(value.wikitreeSearchData);
      });
    } catch (ex) {
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

  if (document.URL == "https://www.wikitree.com/wiki/Special:SearchPerson") {
    //console.log("checkForPendingSearch: URL matches");

    let wikitreeSearchData = await getPendingSearch();

    if (wikitreeSearchData) {
      //console.log("checkForPendingSearch: got formValues:");
      //console.log(wikitreeSearchData);

      let searchUrl = wikitreeSearchData.url;
      let timeStamp = wikitreeSearchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
      //console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let formElement = document.getElementById("searchForm");
        if (formElement) {
          let fieldData = wikitreeSearchData.fieldData;

          //console.log("checkForPendingSearch: fieldData is:");
          //console.log(fieldData);

          for (var key in fieldData.simpleIdFields) {
            //console.log("checkForPendingSearch: key is: " + key);
            if (key) {
              let value = fieldData.simpleIdFields[key];
              //console.log("checkForPendingSearch: value is: " + value);

              let inputElement = document.getElementById(key);
              if (inputElement) {
                //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;
              }
            }
          }

          for (var key in fieldData.simpleNameFields) {
            //console.log("checkForPendingSearch: key is: " + key);
            if (key) {
              let value = fieldData.simpleNameFields[key];
              //console.log("checkForPendingSearch: value is: " + value);

              let selector = "input[name=" + CSS.escape(key) + "]";
              //console.log("checkForPendingSearch: simple name selector is: " + selector);
              let inputElement = formElement.querySelector(selector);

              if (inputElement) {
                //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;
              }
            }
          }

          for (var radioField of fieldData.radioFields) {
            let name = radioField.name;
            let value = radioField.value;
            //console.log("checkForPendingSearch: radio name is: " + name);
            //console.log("checkForPendingSearch: radio value is: " + value);

            let selector = "input[name=" + CSS.escape(name) + "]";
            //console.log("checkForPendingSearch: radio selector is: " + selector);
            let inputElements = formElement.querySelectorAll(selector);
            for (let inputElement of inputElements) {
              if (inputElement.value == value) {
                inputElement.checked = true;
              } else {
                inputElement.false = true;
              }
            }
          }

          //console.log("checkForPendingSearch: found formElement:");
          //console.log(formElement);

          // Now hide most of the page so that the use doesn't try to use it.
          let contentElement = document.getElementById("content");
          if (contentElement) {
            //console.log("checkForPendingSearch: found contentElement:");
            //console.log(contentElement);

            let topDivElement = contentElement.querySelector(
              "div.sixteen.columns"
            );
            if (topDivElement) {
              //console.log("checkForPendingSearch: found topDivElement:");
              //console.log(topDivElement);

              topDivElement.style.display = "none";
            }

            let titleElement = document.createElement("h1");
            titleElement.innerText = "Performing WikiTree Sourcer search...";
            contentElement.appendChild(titleElement);
          }

          // now submit the form to do the search
          formElement.submit();
        }
      }

      // clear the search data
      chrome.storage.local.set({ wikitreeSearchData: undefined }, function () {
        //console.log('cleared wikitreeSearchData');
      });
    }
  }
}

function setEditFamilyFields(personData) {
  //console.log("setEditFamilyFields, personData is:");
  //console.log(personData);

  function setValue(nodeSelector, fieldName) {
    let node = document.querySelector(nodeSelector);
    if (node && personData[fieldName]) {
      node.value = personData[fieldName];
    }
  }

  function setRadio(radioName, fieldName) {
    let value = personData[fieldName];
    if (value) {
      let nodeSelector = "input[name=" + radioName + "][value=" + value + "]";
      let node = document.querySelector(nodeSelector);
      if (node) {
        node.checked = value;
      }
    }
  }

  // The fields in Step 1
  setValue("#mFirstName", "firstName");
  setValue("#mRealName", "prefName");
  setValue("#mLastNameAtBirth", "lnab");
  setValue("#mLastNameCurrent", "cln");

  setValue("#mBirthDate", "birthDate");
  setRadio("mStatus_BirthDate", "birthDateStatus");

  setValue("#mDeathDate", "deathDate");
  setRadio("mStatus_DeathDate", "deathDateStatus");

  setValue("select[name=mGender]", "gender");

  // The fields in Step 2
  setValue("#mPrefix", "prefix");
  setValue("#mMiddleName", "middleName");
  setValue("#mNicknames", "nicknames");
  setValue("#mLastNameOther", "otherLastNames");
  setValue("#mSuffix", "suffix");

  setValue("#mBirthLocation", "birthLocation");
  setValue("#mDeathLocation", "deathLocation");

  // marriage details - only set in case of a spouse
  setValue("#mMarrriageDate", "marriageDate");
  setRadio("mMarriageStatus_marriage_date", "marriageDateStatus");
  setValue("#mMarriageLocation", "marriageLocation");
  setValue("#mMarriageEndDate", "marriageEndDate");

  // text boxes
  setValue("#mBioWithoutSources", "notes");
  setValue("#mSources", "sources");

  // Let the page know that changes have been made so that the matches are updated
  let inputNode = document.querySelector("#mLastNameAtBirth");
  var inputEvent = new Event("input", { bubbles: true });
  inputNode.dispatchEvent(inputEvent);
  var changeEvent = new Event("change", { bubbles: true });
  inputNode.dispatchEvent(changeEvent);
}

function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "setFields") {
    setEditFamilyFields(request.personData);
    sendResponse({ success: true });
    return { wasHandled: true, returnValue: false };
  }

  return { wasHandled: false };
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(
    `wikitree`,
    `site/wikitree/core/wikitree_extract_data.mjs`,
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
