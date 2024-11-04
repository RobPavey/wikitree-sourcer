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
  addMenuDivider,
  addMenuItem,
  beginMainMenu,
  displayBusyMessage,
  doAsyncActionWithCatch,
  openExceptionPage,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import {
  clearCitation,
  saveCitation,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import { writeToClipboard, clearClipboard } from "/base/browser/popup/popup_clipboard.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

var simplePopupFunctions = {
  buildCitationFunction: undefined,
  buildHouseholdTableFunction: undefined,
};

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function simplePopupBuildCitation(data) {
  clearCitation();

  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    //console.log("simplePopupBuildCitation, waiting another 10ms")
    setTimeout(function () {
      simplePopupBuildCitation(data);
    }, 10);
    return;
  }

  //console.log("simplePopupBuildCitation");

  let householdTableString = buildHouseholdTableString(
    data.extractedData,
    data.generalizedData,
    data.type,
    simplePopupFunctions.buildHouseholdTableFunction
  );

  //console.log(householdTableString);

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
    const citationObject = simplePopupFunctions.buildCitationFunction(input);
    citationObject.generalizedData = data.generalizedData;
    //console.log("simplePopupBuildCitation, citationObject is:");
    //console.log(citationObject);

    //console.log("simplePopupBuildCitation, citationObject is:");
    //console.log(citationObject);

    saveCitation(citationObject);
  });
}

async function simplePopupBuildHouseholdTable(data) {
  clearClipboard();

  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    //console.log("simplePopupBuildHouseholdTable, waiting another 10ms")
    setTimeout(function () {
      simplePopupBuildHouseholdTable(data);
    }, 10);
    return;
  }

  // There is an option to put an inline citation at the end of the table caption
  // If this is set then generate the citation string.
  let citationObject = buildCitationObjectForTable(
    data.extractedData,
    data.generalizedData,
    undefined,
    simplePopupFunctions.buildCitationFunction
  );

  doAsyncActionWithCatch("Building table", data, async function () {
    const input = {
      extractedData: data.extractedData,
      generalizedData: data.generalizedData,
      dataCache: cachedDataCache,
      options: options,
      citationObject: citationObject,
    };
    const tableObject = simplePopupFunctions.buildHouseholdTableFunction(input);

    writeToClipboard(tableObject.tableString, "Household Table");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addBuildHouseholdTableMenuItem(menu, data) {
  let fieldNames = data.generalizedData.householdArrayFields;
  let objectArray = data.generalizedData.householdArray;

  if (fieldNames && objectArray) {
    addMenuItem(menu, "Build Household Table", function (element) {
      displayBusyMessage("Building table...");
      simplePopupBuildHouseholdTable(data);
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// Main Menu
//////////////////////////////////////////////////////////////////////////////////////////

async function setupSimplePopupMenu(input) {
  let backFunction = function () {
    setupSimplePopupMenu(input);
  };

  let extractedData = input.extractedData;

  //console.log("setupSimplePopupMenu, extractedData is:");
  //console.log(extractedData);

  if (!extractedData || !extractedData.success) {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\n" + input.extractFailedMessage;
    let data = { extractedData: extractedData };
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // get generalized data
  if (!input.generalizeDataFunction) {
    openExceptionPage(
      "Error during creating popup menu for content.",
      "generalizeDataFunction missing",
      undefined,
      true
    );
  }
  let generalizedData = undefined;

  try {
    generalizedData = input.generalizeDataFunction({
      extractedData: extractedData,
    });
  } catch (err) {
    openExceptionPage("Error during creating popup menu for content.", "generalizeData failed", err, true);
  }

  //console.log("setupSimplePopupMenu, generalizedData is:");
  //console.log(generalizedData);

  let data = { extractedData: extractedData, generalizedData: generalizedData };

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\n" + input.generalizeFailedMessage;
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  simplePopupFunctions.buildCitationFunction = input.buildCitationFunction;
  simplePopupFunctions.buildHouseholdTableFunction = input.buildHouseholdTableFunction;

  // do async prefetches
  loadDataCache();

  let menu = beginMainMenu();

  if (input.doNotIncludeSearch != true) {
    await addSearchMenus(menu, data, backFunction, input.siteNameToExcludeFromSearch);
    addMenuDivider(menu);
  }

  if (generalizedData.sourceType == "profile") {
    addSavePersonDataMenuItem(menu, data);
  } else {
    if (input.buildCitationFunction) {
      addBuildCitationMenuItems(
        menu,
        data,
        simplePopupBuildCitation,
        backFunction,
        input.regeneralizeFunction,
        input.userInputFunction
      );
    }
    if (input.buildHouseholdTableFunction) {
      addBuildHouseholdTableMenuItem(menu, data);
    }
  }

  if (input.customMenuFunction) {
    input.customMenuFunction(menu, data);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

export { setupSimplePopupMenu, simplePopupFunctions };
