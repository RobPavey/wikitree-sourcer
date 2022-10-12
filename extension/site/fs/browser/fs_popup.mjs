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
  addMenuItemWithSubtitle,
  addMenuItem,
  addMenuDivider,
  beginMainMenu,
  displayMessage,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import {
  saveCitation,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";

import { generalizeData, generalizeDataGivenRecordType } from "../core/fs_generalize_data.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function fsBuildCitation(data) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    // console.log("fsBuildCitation, waiting another 10ms")
    setTimeout(function () {
      fsBuildCitation(data);
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
    //console.log("fsBuildCitation, citationObject is:");
    //console.log(citationObject);

    saveCitation(citationObject);
  });
}

async function fsBuildHouseholdTable(data) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("fsBuildHouseholdTable, waiting another 10ms");
    setTimeout(function () {
      fsBuildHouseholdTable(data);
    }, 10);
    return;
  }

  // There is an option to put an inline citation at the end of the table caption
  // If this is set then generate the citation string.
  let citationObject = buildCitationObjectForTable(data.extractedData, data.generalizedData, undefined, buildCitation);

  doAsyncActionWithCatch("Building Table", data, async function () {
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

function fsOpenExternalImage(data) {
  // currently the externalImageUrl always points to findmypast.co.ok
  // This is not easy to fix in extractData because options are not available there
  let externalImageUrl = data.extractedData.externalImageUrl;

  if (externalImageUrl) {
    chrome.tabs.create({ url: externalImageUrl });
    window.close();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFsBuildHouseholdTableMenuItem(menu, data) {
  let fieldNames = data.generalizedData.householdArrayFields;
  let objectArray = data.generalizedData.householdArray;

  if (fieldNames && objectArray) {
    addMenuItem(menu, "Build Household Table", function (element) {
      displayMessage("Building table...");
      fsBuildHouseholdTable(data);
    });
  }
}

function addFsOpenExternalImageMenuItem(menu, data) {
  let extImageUrl = data.extractedData.externalImageUrl;

  if (extImageUrl) {
    let title = extImageUrl.includes("findmypast") ? "Open Image on FindMyPast" : "Open Image on External Site";
    addMenuItem(menu, title, function (element) {
      fsOpenExternalImage(data);
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

function addFsImageBuildCitationMenuItems(menu, data) {
  addMenuItemWithSubtitle(
    menu,
    "Build Inline Image Citation",
    function (element) {
      data.type = "inline";
      fsBuildCitation(data);
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Image Citation",
    function (element) {
      data.type = "source";
      fsBuildCitation(data);
    },
    "It is recommended to Build Source Citation on the Record Page instead if one exists."
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// Main Menu
//////////////////////////////////////////////////////////////////////////////////////////

async function setupFsPopupMenu(extractedData) {
  let backFunction = function () {
    setupFsPopupMenu(extractedData);
  };

  //console.log("setupFsPopupMenu: extractedData is:");
  //console.log(extractedData);

  if (
    !extractedData ||
    (extractedData.pageType != "record" && extractedData.pageType != "image" && extractedData.pageType != "person")
  ) {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\nIt looks like a FamilySearch page but not a record, image or person page.";
    message += " Sometimes this is because you are no longer logged into FamilySearch.";
    message += " If that may be the case try reloading this page and see if it asks you to login.";
    message += "\n\nSometimes this is because the page had not finished loading when you clicked the extension icon.";
    message += " If that may be the case try clicking the extension icon again.";
    let data = { extractedData: extractedData };
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // get generalized data
  let generalizedData = generalizeData({ extractedData: extractedData });
  let data = { extractedData: extractedData, generalizedData: generalizedData };

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like a supported FamilySearch page but the data generalize failed.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  //console.log("generalizedData is");
  //console.log(generalizedData);

  // do async prefetches
  loadDataCache();

  let menu = beginMainMenu();

  if (extractedData.pageType == "record") {
    await addSearchMenus(menu, data, backFunction, "fs");
    addMenuDivider(menu);

    addBuildCitationMenuItems(menu, data, fsBuildCitation, backFunction, generalizeDataGivenRecordType);
    addFsBuildHouseholdTableMenuItem(menu, data);
    addFsOpenExternalImageMenuItem(menu, data);
  } else if (extractedData.pageType == "image") {
    addFsImageBuildCitationMenuItems(menu, data);
  } else if (extractedData.pageType == "person") {
    await addSearchMenus(menu, data, backFunction, "fs");
    addSavePersonDataMenuItem(menu, data);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("fs", setupFsPopupMenu);
