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
  closePopup,
  keepPopupOpenForDebug,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
  saveUnitTestData,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import {
  saveCitation,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";
import { getDefaultOptions } from "/base/core/options/options_database.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";

import { generalizeData, generalizeDataGivenRecordType } from "../core/fs_generalize_data.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";

import { fsGetAllCitations } from "./fs_get_all_citations.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function fsBuildCitation(data) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    //console.log("fsBuildCitation, waiting another 10ms")
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
    closePopup();
  }
}

async function fsBuildPersonTemplate(data) {
  let ed = data.extractedData;
  let url = ed.url;
  if (url) {
    let treePrefix = "/tree/person/details/";
    let treePrefixIndex = url.indexOf(treePrefix);
    if (treePrefixIndex == -1) {
      treePrefix = "/tree/person/sources/";
      treePrefixIndex = url.indexOf(treePrefix);
    }
    if (treePrefixIndex == -1) {
      treePrefix = "/tree/person/vitals/";
      treePrefixIndex = url.indexOf(treePrefix);
    }
    if (treePrefixIndex != -1) {
      let treeIndex = treePrefixIndex + treePrefix.length;
      let endIndex = url.indexOf("/", treeIndex);
      if (endIndex == -1) {
        endIndex = url.indexOf("?", treeIndex);
      }
      if (endIndex == -1) {
        endIndex = url.length;
      }
      let personId = url.substring(treeIndex, endIndex);
      const linkString = "{{FamilySearch|" + personId + "}}";

      writeToClipboard(linkString, "FamilySearch Template");
    }
  }
}

async function fsSaveUnitTestDataForAllCitations(input, response) {
  // delete all the data that was generated by fsGetAllCitations keeping
  // just the data that was fetched.

  let saveObj = {};
  saveObj.fsSources = response.fsSources;
  let sourceData = {};
  for (let source of response.sources) {
    sourceData[source.uri] = source.dataObjects;
  }
  saveObj.sourceData = sourceData;

  let debugText = JSON.stringify(saveObj, null, 2);
  let message = "unit test data";
  writeToClipboard(debugText, message);
}

async function fsGetAllCitationsAction(data) {
  try {
    let input = Object.assign({}, data);
    input.options = options;
    input.runDate = new Date();

    if (saveUnitTestData) {
      // if saving unit test data we don't want to exclude any sources
      let testOptions = getDefaultOptions();
      testOptions.addMerge_fsAllCitations_excludeRetiredSources = "never";
      testOptions.addMerge_fsAllCitations_excludeNonFsSources = false;
      testOptions.addMerge_fsAllCitations_excludeOtherRoleSources = false;
      input.options = testOptions;
    }

    let response = await fsGetAllCitations(input);

    if (response.success) {
      //console.log("fsGetAllCitationsAction, response is");
      //console.log(response);
      //keepPopupOpenForDebug();

      if (response.citationsString) {
        if (saveUnitTestData) {
          fsSaveUnitTestDataForAllCitations(input, response);
        } else {
          let message = response.citationCount + " citations";
          writeToClipboard(response.citationsString, message);
        }
      } else {
        const message = "All sources were excluded due to option settings.";
        displayMessageWithIconThenClosePopup("warning", message, "");
      }
    } else {
      // It can fail even if there is an image URL, for example findagrave images:
      // https://www.ancestry.com/discoveryui-content/view/2221897:60527
      // This is not considered an error there just will be no sharing link
      const message = "An error occurred geting sources.";
      displayMessageWithIcon("warning", message, response.errorMessage);
    }
  } catch (e) {
    console.log("fsGetAllCitationsAction caught exception on fsGetAllCitations:");
    console.log(e);
    keepPopupOpenForDebug();

    const message = "An exception occurred getting sources.";
    displayMessageWithIcon("warning", message, "");
  }
}

async function fsGetAllCitationsForSavePersonData(data) {
  try {
    let input = Object.assign({}, data);
    input.options = options;
    input.runDate = new Date();

    displayMessage("Getting sources...");
    let response = await fsGetAllCitations(input);

    if (response.success) {
      //console.log("fsGetAllCitations, response is");
      //console.log(response);

      data.allCitationsString = response.citationsString;
      data.allCitationsType = response.citationsStringType;
      return { success: true };
    } else {
      // If it fails we want to let the user know
      return { success: false, errorMessage: response.errorMessage };
    }
  } catch (e) {
    console.log("fsGetAllCitationsForSavePersonData caught exception on fsGetAllCitations:");
    console.log(e);
    return { success: false, errorMessage: e.message };
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

function addBuildFsTemplateMenuItem(menu, data) {
  addMenuItem(menu, "Build FamilySearch Template", function (element) {
    fsBuildPersonTemplate(data);
  });
}

function addBuildBookCitationMenuItems(menu, data) {
  addMenuItem(menu, "Build Inline Citation", function (element) {
    // This is a bit hacky. We don't want to change the input data object but we need a different type in
    // the one for each menu item
    let input = Object.assign({}, data);
    input.type = "inline";

    displayMessage("Building citation...");
    fsBuildCitation(input);
  });
  addMenuItem(menu, "Build Source Citation", function (element) {
    let input = Object.assign({}, data);
    input.type = "source";
    displayMessage("Building citation...");
    fsBuildCitation(input);
  });
}

function addSaveAllCitationsMenuItem(menu, data) {
  if (data.extractedData.sourceIds && data.extractedData.sourceIds.length > 0) {
    addMenuItem(menu, "Build All Citations", function (element) {
      displayMessage("Getting sources...");
      fsGetAllCitationsAction(data);
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
    (extractedData.pageType != "record" &&
      extractedData.pageType != "image" &&
      extractedData.pageType != "person" &&
      extractedData.pageType != "book")
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
    addMenuDivider(menu);
    addSavePersonDataMenuItem(menu, data, fsGetAllCitationsForSavePersonData);
    addSaveAllCitationsMenuItem(menu, data);
    addBuildFsTemplateMenuItem(menu, data);
  } else if (extractedData.pageType == "book") {
    addBuildBookCitationMenuItems(menu, data);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("fs", setupFsPopupMenu);
