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

async function getPendingMergeEdit() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["wikitreeMergeEditData"], function (value) {
        resolve(value.wikitreeMergeEditData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function checkForPendingSearchData() {
  //console.log("checkForPendingSearchData: called");

  //console.log("checkForPendingSearchData: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  if (document.URL == "https://www.wikitree.com/wiki/Special:SearchPerson") {
    //console.log("checkForPendingSearchData: URL matches");

    let wikitreeSearchData = await getPendingSearch();

    if (wikitreeSearchData) {
      //console.log("checkForPendingSearchData: got formValues:");
      //console.log(wikitreeSearchData);

      let searchUrl = wikitreeSearchData.url;
      let timeStamp = wikitreeSearchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearchData: searchUrl is :" + searchUrl);
      //console.log("checkForPendingSearchData: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearchData: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearchData: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        let formElement = document.getElementById("searchForm");
        if (formElement) {
          let fieldData = wikitreeSearchData.fieldData;

          //console.log("checkForPendingSearchData: fieldData is:");
          //console.log(fieldData);

          for (var key in fieldData.simpleIdFields) {
            //console.log("checkForPendingSearchData: key is: " + key);
            if (key) {
              let value = fieldData.simpleIdFields[key];
              //console.log("checkForPendingSearchData: value is: " + value);

              let inputElement = document.getElementById(key);
              if (inputElement) {
                //console.log("checkForPendingSearchData: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;
              }
            }
          }

          for (var key in fieldData.simpleNameFields) {
            //console.log("checkForPendingSearchData: key is: " + key);
            if (key) {
              let value = fieldData.simpleNameFields[key];
              //console.log("checkForPendingSearchData: value is: " + value);

              let selector = "input[name=" + CSS.escape(key) + "]";
              //console.log("checkForPendingSearchData: simple name selector is: " + selector);
              let inputElement = formElement.querySelector(selector);

              if (inputElement) {
                //console.log("checkForPendingSearchData: inputElement found, existing value is: " + inputElement.value);
                inputElement.value = value;
              }
            }
          }

          for (var radioField of fieldData.radioFields) {
            let name = radioField.name;
            let value = radioField.value;
            //console.log("checkForPendingSearchData: radio name is: " + name);
            //console.log("checkForPendingSearchData: radio value is: " + value);

            let selector = "input[name=" + CSS.escape(name) + "]";
            //console.log("checkForPendingSearchData: radio selector is: " + selector);
            let inputElements = formElement.querySelectorAll(selector);
            for (let inputElement of inputElements) {
              if (inputElement.value == value) {
                inputElement.checked = true;
              } else {
                inputElement.false = true;
              }
            }
          }

          //console.log("checkForPendingSearchData: found formElement:");
          //console.log(formElement);

          // Now hide most of the page so that the use doesn't try to use it.
          let contentElement = document.getElementById("content");
          if (contentElement) {
            //console.log("checkForPendingSearchData: found contentElement:");
            //console.log(contentElement);

            let topDivElement = contentElement.querySelector("div.sixteen.columns");
            if (topDivElement) {
              //console.log("checkForPendingSearchData: found topDivElement:");
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

async function checkForPendingMergeEditData() {
  //console.log("checkForPendingMergeEditData: called");

  //console.log("checkForPendingMergeEditData: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  if (document.URL == "https://www.wikitree.com/wiki/Special:MergeEdit") {
    //console.log("checkForPendingMergeEditData: URL matches");

    let wikitreeMergeEditData = await getPendingMergeEdit();

    if (wikitreeMergeEditData) {
      //console.log("checkForPendingMergeEditData: got wikitreeMergeEditData:");
      //console.log(wikitreeMergeEditData);

      let mergeUrl = wikitreeMergeEditData.url;

      let timeStamp = wikitreeMergeEditData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceEvent = timeStampNow - timeStamp;

      //console.log("checkForPendingMergeEditData: timeStamp is :" + timeStamp);
      //console.log("checkForPendingMergeEditData: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingMergeEditData: timeSinceEvent is :" + timeSinceEvent);

      // clear the search data before doing the post
      chrome.storage.local.set({ wikitreeMergeEditData: undefined }, function () {
        //console.log('cleared wikitreeMergeEditData');

        if (timeSinceEvent < 10000 && mergeUrl == document.URL) {
          // set status element
          let statusElement = document.querySelector("#content div.status.red");
          if (statusElement) {
            statusElement.textContent = "Please wait - setting up WikiTree Sourcer merge/edit";
            statusElement.className = "status";
          }

          postMergeEditData(wikitreeMergeEditData);
        }
      });
    }
  }
}

function setEditFamilyFields(personData) {
  //console.log("setEditFamilyFields, personData is:");
  //console.log(personData);

  function addNewNodesForField(label, nodeSelector, followingNodeSelector) {
    let followingNode = document.querySelector(followingNodeSelector);
    if (!followingNode) return;

    let trNode = followingNode.parentNode.parentNode;
    if (!trNode) return;

    let tbodyNode = trNode.parentNode;
    if (!tbodyNode) return;

    console.log("possiblyAddMissingNode, found parents");

    let idName = nodeSelector.replace("#", "");

    let newTrNode = document.createElement("tr");
    let newLabelTdNode = document.createElement("td");
    newLabelTdNode.textContent = label + ":";
    newLabelTdNode.align = "right";
    newLabelTdNode.style.verticalAlign = "top";

    let newValueTdNode = document.createElement("td");
    let newInputNode = document.createElement("input");

    newInputNode.id = idName;
    newInputNode.type = "text";
    newInputNode.name = idName;
    newInputNode.className = "small";
    newInputNode.size = "40";

    newTrNode.appendChild(newLabelTdNode);
    newTrNode.appendChild(newValueTdNode);
    newValueTdNode.appendChild(newInputNode);

    tbodyNode.insertBefore(newTrNode, trNode);

    return newInputNode;
  }

  function possiblyAddMissingNode(nodeSelector) {
    console.log("possiblyAddMissingNode, nodeSelector = " + nodeSelector);

    if (nodeSelector == "#mPrefix") {
      return addNewNodesForField("Prefix", nodeSelector, "#mFirstName");
    } else if (nodeSelector == "#mNicknames") {
      return addNewNodesForField("Other Nicknames", nodeSelector, "#mLastNameAtBirth");
    } else if (nodeSelector == "#mLastNameOther") {
      return addNewNodesForField("Other Last Name(s)", nodeSelector, "#mBirthDate");
    } else if (nodeSelector == "#mSuffix") {
      return addNewNodesForField("Suffix", nodeSelector, "#mBirthDate");
    }
  }

  function setValue(nodeSelector, fieldName) {
    if (personData[fieldName]) {
      let node = document.querySelector(nodeSelector);
      if (!node) {
        node = possiblyAddMissingNode(nodeSelector);
      }
      if (node) {
        node.value = personData[fieldName];
      }
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
  setValue("#mMarrriageDate", "marriageDate"); // typo in old style page
  setValue("#mMarriageDate", "marriageDate");
  setRadio("mMarriageStatus_marriage_date", "marriageDateStatus");
  setValue("#mMarriageLocation", "marriageLocation");
  setValue("#mMarriageEndDate", "marriageEndDate");

  // text boxes
  let notesNode = document.querySelector("#mBioWithoutSources");
  if (notesNode) {
    setValue("#mBioWithoutSources", "notes");
    setValue("#mSources", "sources");
  } else {
    let needAdvancedMode = false;
    if (personData.notes || personData.sources) {
      needAdvancedMode = true;
    }

    if (needAdvancedMode) {
      let advancedSourcesNode = document.querySelector("#useAdvancedSources");
      if (advancedSourcesNode) {
        if (advancedSourcesNode.value != "1") {
          advancedSourcesNode.value = "1";
          let sourcesContentNode = document.querySelector("#sourcesSection > p.sourcesContent");
          if (sourcesContentNode) {
            // change text on switch:
            let switchLinkNode = sourcesContentNode.querySelector("a.toggleAdvancedSources");
            if (switchLinkNode) {
              switchLinkNode.textContent = "Switch to Basic Sourcing";
            }
            // hide the "Default to Advanced option" checkbox and label:
            let asOptionContainerNode = document.querySelector("#asOptionContainer");
            if (asOptionContainerNode) {
              asOptionContainerNode.style = "display: none;";
            }
          }
        }

        // Change the label for the sources/bio box
        let sourcesLabelNode = document.querySelector("#sourcesLabel");
        if (sourcesLabelNode) {
          sourcesLabelNode.innerHTML = "Sourcer generated bio.<br>See Sourcer options<br>to control this.";
        }
      }

      // must be in beta mode, put everything in mSources
      let bioText = "== Biography ==\n";
      if (personData.notes) {
        bioText += personData.notes + "\n\n";
      }
      bioText += "== Sources ==\n<references />\n";
      if (personData.sources) {
        bioText += personData.sources;
      }
      let fullBioNode = document.querySelector("#mSources");
      if (fullBioNode) {
        fullBioNode.value = bioText;
      }
    }
  }

  // change explanation
  setValue("#wpSummary", "changeExplanation");

  // Let the page know that changes have been made so that the matches are updated
  let inputNode = document.querySelector("#mLastNameAtBirth");
  var inputEvent = new Event("input", { bubbles: true });
  inputNode.dispatchEvent(inputEvent);
  var changeEvent = new Event("change", { bubbles: true });
  inputNode.dispatchEvent(changeEvent);
}

/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param {string} path the path to send the post request to
 * @param {object} params the parameters to add to the url
 * @param {string} [method=post] the method to use on the form
 *
 * See: https://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
 */

function post(path, params, method = "post") {
  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  const form = document.createElement("form");
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  //console.log("about to submit form:");
  //console.log(form);

  document.body.appendChild(form);
  form.submit();
}

function postMergeEditData(wikitreeMergeEditData) {
  const personData = wikitreeMergeEditData.wtPersonData;
  const wikiId = wikitreeMergeEditData.wikiId;

  //console.log("postMergeEditData, personData is:");
  //console.log(personData);

  const person = {
    person: {
      Prefix: personData.prefix,
      FirstName: personData.firstName,
      RealName: personData.prefName,
      MiddleName: personData.middleName,
      LastNameCurrent: personData.cln,
      Suffix: personData.suffix,

      BirthDate: personData.birthDate,
      BirthLocation: personData.birthLocation,

      DeathDate: personData.deathDate,
      DeathLocation: personData.deathLocation,

      Gender: personData.gender,
    },
    summary: personData.changeExplanation,
  };

  if (personData.bio) {
    person.person.Bio = personData.bio;
    person.options = { mergeBio: 1 };
  }

  const body = {
    user_name: wikiId,
    person: JSON.stringify(person),
  };

  const url = "https://www.wikitree.com/wiki/Special:MergeEdit";

  post(url, body);
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
  // check for a pending search or other form data first,
  // there is no need to do the site init if there is one
  await checkForPendingSearchData();
  await checkForPendingMergeEditData();

  siteContentInit(
    `wikitree`,
    `site/wikitree/core/wikitree_extract_data.mjs`,
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );
}

checkForSearchThenInit();
