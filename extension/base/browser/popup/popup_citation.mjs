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

import {
  addBackMenuItem,
  addMenuItem,
  addBreak,
  beginMainMenu,
  endMainMenu,
  shouldPopupWindowResize,
} from "./popup_menu_building.mjs";

import { writeToClipboard, clearClipboard } from "./popup_clipboard.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import { cachedDataCache } from "/base/browser/common/data_cache.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Citation
//////////////////////////////////////////////////////////////////////////////////////////

async function getLatestCitation() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["latestCitation"], function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function clearCitation() {
  clearClipboard();
  chrome.storage.local.remove("latestCitation", function () {
    //console.log("latestCitation is removed");
  });
}

async function saveCitation(citationObject) {
  citationObject.timeStamp = Date.now();

  chrome.storage.local.set({ latestCitation: citationObject }, function () {
    //console.log('latestCitation is set to ' + citation);
  });

  // Make the whole window the width it was before (not on iOS)
  if (shouldPopupWindowResize && widthBeforeEditCitation) {
    document.body.style.width = widthBeforeEditCitation;
  }

  let message2 = "";
  if (citationObject.type == "source") {
    message2 = "\nThis is a source type citation and should be pasted after the Sources heading.";
  } else {
    message2 = "\nThis is an inline citation and should be pasted before the Sources heading.";
  }

  return await writeToClipboard(citationObject.citation, "Citation", true, message2);
}

// Global to remember the popup menu width before EditCitation
var widthBeforeEditCitation = "";

// Special backFunction for leaving EditCitation
async function resizeBackFunction(backFunction) {
  // Make the whole window the width it was before (not on iOS)
  if (shouldPopupWindowResize && widthBeforeEditCitation) {
    document.body.style.width = widthBeforeEditCitation;
  }

  backFunction();
}

async function editCitation(backFunction) {
  // this switches the popup to display a different frame and populates the edit box

  let storedObject = await getLatestCitation();
  let citationObject = storedObject.latestCitation;
  let citation = "";
  if (citationObject) {
    citation = citationObject.citation;
  }
  if (!citation) {
    citation = "";
  }

  // Make the whole window wider (if not on iOS)
  if (shouldPopupWindowResize) {
    widthBeforeEditCitation = document.body.style.width;
    document.body.style.width = "600px";
  }

  let menu = beginMainMenu();

  let fragment = document.createDocumentFragment();

  addBackMenuItem(menu, function () {
    resizeBackFunction(backFunction);
  });

  addBreak(fragment);
  let label = document.createElement("label");
  label.innerHTML = `Edit Citation:`;
  label.className = "largeEditBoxLabel";
  fragment.appendChild(label);
  addBreak(fragment);

  let textarea = document.createElement("textarea");
  textarea.className = "largeEditBox";
  textarea.value = citation;
  fragment.appendChild(textarea);

  let saveButton = document.createElement("button");
  saveButton.className = "dialogButton";
  saveButton.innerText = "Save";
  saveButton.onclick = async function (element) {
    citation = textarea.value;
    citationObject.citation = citation;
    saveCitation(citationObject);
  };

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(saveButton);

  fragment.appendChild(buttonDiv);

  menu.list.appendChild(fragment);
  endMainMenu(menu);
}

function addEditCitationMenuItem(menu, backFunction) {
  addMenuItem(menu, "Edit Citation...", function (element) {
    editCitation(backFunction);
  });
}

function doesCitationWantHouseholdTable(citationType, generalizedData) {
  if (!generalizedData.hasHouseholdTable()) {
    return false;
  }

  let optionsWantCitation = false;

  let autoTableOpt = options.table_general_autoGenerate;

  if (autoTableOpt != "none" && autoTableOpt != "citationInTableCaption") {
    optionsWantCitation = true;
    if (citationType == "source") {
      if (autoTableOpt != "withinRefOrSource") {
        optionsWantCitation = false;
      }
    }
  } else if (citationType == "narrative") {
    let includeHouseholdOpt = options.narrative_census_includeHousehold;
    if (includeHouseholdOpt != "no") {
      let householdFormatOpt = options.narrative_census_householdPartFormat;
      if (householdFormatOpt == "withFamily") {
        optionsWantCitation = true;
      }
    }
  }

  if (optionsWantCitation) {
    return true;
  }

  return false;
}

function buildHouseholdTableString(extractedData, generalizedData, citationType, buildHouseholdTable) {
  let householdTableString = "";
  if (buildHouseholdTable && doesCitationWantHouseholdTable(citationType, generalizedData)) {
    const input = {
      extractedData: extractedData,
      generalizedData: generalizedData,
      dataCache: cachedDataCache,
      options: options,
    };

    const tableObject = buildHouseholdTable(input);
    householdTableString = tableObject.tableString;
  }

  return householdTableString;
}

function buildCitationObjectForTable(extractedData, generalizedData, sharingDataObj, buildCitation) {
  // There is an option to put an inline citation at the end of the table caption
  // If this is set then generate the citation string.
  let citationObject = undefined;

  if (buildCitation) {
    let autoTableOpt = options.table_general_autoGenerate;
    if (autoTableOpt == "citationInTableCaption" && options.table_table_caption != "none") {
      const input = {
        extractedData: extractedData,
        generalizedData: generalizedData,
        runDate: new Date(),
        sharingDataObj: sharingDataObj,
        type: "inline",
        options: options,
      };

      citationObject = buildCitation(input);
    }
  }

  return citationObject;
}

export {
  clearCitation,
  saveCitation,
  addEditCitationMenuItem,
  getLatestCitation,
  doesCitationWantHouseholdTable,
  buildHouseholdTableString,
  buildCitationObjectForTable,
};
