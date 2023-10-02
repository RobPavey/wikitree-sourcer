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

import { loadDataCache, cachedDataCache, isCachedDataCacheReady } from "/base/browser/common/data_cache.mjs";
import {
  addBuildCitationMenuItems,
  addItalicMessageMenuItem,
  addMenuItem,
  addMenuDivider,
  beginMainMenu,
  displayMessage,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import {
  saveCitation,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";

import { generalizeData, generalizeDataGivenRecordType } from "../core/fmp_generalize_data.mjs";
import { buildCitation } from "../core/fmp_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function fmpBuildCitation(data) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    // console.log("fmpBuildCitation, waiting another 10ms")
    setTimeout(function () {
      fmpBuildCitation(data);
    }, 10);
    return;
  }

  let householdTableString = buildHouseholdTableString(
    data.extractedData,
    data.generalizedData,
    data.type,
    buildHouseholdTable
  );

  doAsyncActionWithCatch("Building Citation", data, async function () {
    const input = {
      extractedData: data.extractedData,
      generalizedData: data.generalizedData,
      runDate: new Date(),
      type: data.type,
      dataCache: cachedDataCache,
      options: options,
      householdTableString: householdTableString,
    };
    const citationObject = buildCitation(input);
    citationObject.generalizedData = data.generalizedData;
    //console.log("fmpBuildCitation, citationObject is:");
    //console.log(citationObject);

    saveCitation(citationObject);
  });
}

async function fmpBuildHouseholdTable(data) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("fmpBuildHouseholdTable, waiting another 10ms");
    setTimeout(function () {
      fmpBuildHouseholdTable(data);
    }, 10);
    return;
  }

  // There is an option to put an inline citation at the end of the table caption
  // If this is set then generate the citation string.
  let citationObject = buildCitationObjectForTable(data.extractedData, data.generalizedData, undefined, buildCitation);

  doAsyncActionWithCatch("Building table", data, async function () {
    const input = {
      extractedData: data.extractedData,
      generalizedData: data.generalizedData,
      dataCache: cachedDataCache,
      options: options,
      citationObject: citationObject,
    };
    const tableObject = buildHouseholdTable(input);

    writeToClipboard(tableObject.tableString, "Household Table");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFmpBuildHouseholdTableMenuItem(menu, data) {
  let fieldNames = data.generalizedData.householdArrayFields;
  let objectArray = data.generalizedData.householdArray;

  if (fieldNames && objectArray) {
    if (data.extractedData.household && data.extractedData.household.expanded === false) {
      addItalicMessageMenuItem(
        menu,
        "To build a household table: First click the 'Show x more rows' arrow below 'Household members' on the page so that all members are visible."
      );
    } else {
      addMenuItem(menu, "Build Household Table", function (element) {
        displayMessage("Building table...");
        fmpBuildHouseholdTable(data);
      });
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Main Menu
//////////////////////////////////////////////////////////////////////////////////////////

async function setupFmpPopupMenu(extractedData) {
  let backFunction = function () {
    setupFmpPopupMenu(extractedData);
  };

  //console.log("setupFmpPopupMenu");

  let isTranscript = extractedData.urlPath == "transcript";
  let isRecord = extractedData.urlPath == "record";
  let isProfile = extractedData.urlProfileId && extractedData.urlProfileId.length > 0;

  if (!extractedData || (!isTranscript && !isRecord && !isProfile) || !extractedData.success) {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message +=
      "\n\nIt looks like FindMyPast page but not a transcript or a record/image with a parent id nor a person profile on the Overview tab.";
    message += "\n\nThis can also happen if the page has not finished loading when you click on the extension icon.";
    let data = { extractedData: extractedData };
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  let hasTranscript = isTranscript || (isRecord && extractedData.recordData);

  // get generalized data
  let generalizedData = generalizeData({ extractedData: extractedData });
  let data = { extractedData: extractedData, generalizedData: generalizedData };

  //console.log("setupFmpPopupMenu: generalizedData is:");
  //console.log(generalizedData);

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like a supported FindMyPast page but does not contain the required data.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  let menu = beginMainMenu();

  if (hasTranscript) {
    await addSearchMenus(menu, data, backFunction, "fmp");
    addMenuDivider(menu);

    // do async prefetches
    loadDataCache();

    addBuildCitationMenuItems(menu, data, fmpBuildCitation, backFunction, generalizeDataGivenRecordType);
    addFmpBuildHouseholdTableMenuItem(menu, data);
  } else if (isProfile) {
    await addSearchMenus(menu, data, backFunction, "fmp");
    addMenuDivider(menu);
    addSavePersonDataMenuItem(menu, data);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("fmp", setupFmpPopupMenu);
