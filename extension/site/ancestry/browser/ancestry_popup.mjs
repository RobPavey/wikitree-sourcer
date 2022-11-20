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
  addItalicMessageMenuItem,
  beginMainMenu,
  displayMessage,
  displayMessageWithIcon,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import {
  saveCitation,
  doesCitationWantHouseholdTable,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";

import {
  extractDataFromHtml,
  getDataForLinkedHouseholdRecords,
  processWithFetchedLinkData,
  getDataForCitationAndHouseholdRecords,
  displayLinkedRecordsFetchErrorsMessage,
} from "./ancestry_popup_linked_records.mjs";

import { RT } from "../../../base/core/record_type.mjs";

import { initPopup } from "/base/browser/popup/popup_init.mjs";

import {
  generalizeData,
  generalizeDataGivenRecordType,
  regeneralizeDataWithLinkedRecords,
} from "../core/ancestry_generalize_data.mjs";
import { buildCitation } from "../core/ancestry_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";

import { fetchAncestrySharingDataObj, extractRecordHtmlFromUrl } from "./ancestry_fetch.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Prefetch data and functions
//////////////////////////////////////////////////////////////////////////////////////////

// variables for the prefetch data specific to Ancestry "build" actions
// Note that the cachedDataCache variables are shared and stored elsewhere
var ancestryPrefetch = {
  prefetchedSharingDataObj: undefined,
  isPrefetchedSharingDataObjReady: false,

  areBuildCitationDependenciesReady: false,
  areBuildTableDependenciesReady: false,
  areBuildSharingDependenciesReady: false,

  timeoutCount: 0,
};

const prefetchTimeoutMax = 100;
const prefetchTimeoutDelay = 100;

function displayPrefetchErrorForSharingData() {
  console.log("displayPrefetchError: ancestryPrefetch is:");
  console.log(ancestryPrefetch);

  let message = "Could not retrieve the Ancestry sharing data\n";

  displayMessageWithIcon("warning", message);
}

function displayPrefetchWaitingMessage(baseMessage, isRequired) {
  if (ancestryPrefetch.isPrefetchedSharingDataObjReady && ancestryPrefetch.timeoutCount > 5) {
    let message = baseMessage + "...\nWaiting for Ancestry sharing data\n";

    let timeRemaining = ((prefetchTimeoutMax - ancestryPrefetch.timeoutCount) * prefetchTimeoutDelay) / 1000;

    message += "If not retrieved in:\n" + timeRemaining.toFixed(1) + " seconds\n";

    if (isRequired) {
      message += "the operation cannot be performed.\n";
    } else {
      message += "WikiTree Sourcer will proceed without the sharing data.\n";
    }

    displayMessage(message);
  }
}

function ancestryDependencyListener() {
  // this is called when the state of one of the dependencies changes
  // It could be used to enable a menu item for example when everything is ready
  // Though so far that doesn't seem to be necessary, even in Safari
  if (0) {
    console.log(
      "ancestryDependencyListener" +
        ", dataCache = " +
        isCachedDataCacheReady +
        ", sharingObj = " +
        ancestryPrefetch.isPrefetchedSharingDataObjReady
    );
  }

  if (isCachedDataCacheReady && ancestryPrefetch.isPrefetchedSharingDataObjReady) {
    ancestryPrefetch.areBuildCitationDependenciesReady = true;
  }

  if (isCachedDataCacheReady) {
    ancestryPrefetch.areBuildTableDependenciesReady = true;
  }

  if (ancestryPrefetch.isPrefetchedSharingDataObjReady) {
    ancestryPrefetch.areBuildSharingDependenciesReady = true;
  }
}

// This is done in advance when the popup comes up. That avoids any stalls when buildingCitation.
// Stalls on Safari can make saveCitation fail.
async function getAncestrySharingDataObj(data, dependencyListener) {
  if (ancestryPrefetch.isPrefetchedSharingDataObjReady) {
    return;
  }

  if (data.extractedData.pageType == "record" && !data.extractedData.imageUrl) {
    // this is a record with no image so do not attempt to get sharing data.
    // But we will want to set the flags to say it is read so that BuildCitation will work
    ancestryPrefetch.isPrefetchedSharingDataObjReady = true;
    dependencyListener();
    return;
  }

  try {
    let response = await fetchAncestrySharingDataObj(data.extractedData);

    if (response.success) {
      ancestryPrefetch.prefetchedSharingDataObj = response.dataObj;
    } else {
      // It can fail even if there is an image URL, for example findagrave images:
      // https://www.ancestry.com/discoveryui-content/view/2221897:60527
      // This is not considered an error there just will be no sharing link
    }
  } catch (e) {
    console.log("getAncestrySharingDataObj caught exception on fetchAncestrySharingDataObj:");
    console.log(e);
  }

  // set flag to say response is ready, it may have failed but no point doing it again
  ancestryPrefetch.isPrefetchedSharingDataObjReady = true;
  dependencyListener();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function ancestryBuildCitationWithLinkData(data) {
  //console.log("ancestryBuildCitationWithLinkData, data is");
  //console.log(data);

  // if there are linked records then add that data to the generalized data
  if (data.linkedRecords && data.linkedRecords.length > 0) {
    if (data.linkedRecordFailureCount > 0) {
      // some of the linked records could not be retrieved.
      displayLinkedRecordsFetchErrorsMessage("building citation");
      return;
    }

    regeneralizeDataWithLinkedRecords(data);
  }

  let householdTableString = buildHouseholdTableString(
    data.extractedData,
    data.generalizedData,
    data.type,
    buildHouseholdTable
  );

  // build the citation
  // this is only for use on an Ancestry record page - not an image page or person page
  doAsyncActionWithCatch("Building Citation", data, async function () {
    const input = {
      extractedData: data.extractedData,
      generalizedData: data.generalizedData,
      runDate: new Date(),
      sharingDataObj: ancestryPrefetch.prefetchedSharingDataObj,
      type: data.type,
      options: options,
      householdTableString: householdTableString,
    };

    const citationObject = buildCitation(input);
    citationObject.generalizedData = data.generalizedData;
    saveCitation(citationObject);
  });
}

async function ancestryBuildCitation(data) {
  if (!ancestryPrefetch.areBuildCitationDependenciesReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("ancestryBuildCitation, waiting another 10ms");
    if (ancestryPrefetch.timeoutCount < prefetchTimeoutMax) {
      setTimeout(function () {
        ancestryBuildCitation(data);
      }, prefetchTimeoutDelay);
      ancestryPrefetch.timeoutCount++;
      displayPrefetchWaitingMessage("Building citation", false);
      return;
    }
    // proceed without the sharing data
  }

  // poss household
  if (doesCitationWantHouseholdTable(data.type, data.generalizedData)) {
    getDataForCitationAndHouseholdRecords(data, ancestryBuildCitationWithLinkData);
  } else {
    processWithFetchedLinkData(data, ancestryBuildCitationWithLinkData);
  }
}

async function ancestryBuildSharingTemplate(extractedData) {
  if (!ancestryPrefetch.areBuildSharingDependenciesReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("ancestryBuildSharingTemplate, waiting another 10ms");
    if (ancestryPrefetch.timeoutCount < prefetchTimeoutMax) {
      setTimeout(function () {
        ancestryBuildSharingTemplate(extractedData);
      }, prefetchTimeoutDelay);
      ancestryPrefetch.timeoutCount++;
      displayPrefetchWaitingMessage("Building sharing template", true);
    } else {
      displayPrefetchErrorForSharingData();
    }
    return;
  }

  doAsyncActionWithCatch("Building Sharing Template", extractedData, async function () {
    if (extractedData.pageType == "sharingUrl") {
      // we already have the sharing template in the extractedData so we just need to store it.
      var template = extractedData.ancestryTemplate;
      writeToClipboard(template, "Sharing template");
    } else {
      // this is a record or image page
      let dataObj = ancestryPrefetch.prefetchedSharingDataObj;
      if (dataObj) {
        // V1 versions
        // https://www.ancestry.com/sharing/24274440?h=95cf5c
        let num1 = dataObj.id;
        let num2 = dataObj.hmac_id;

        // V2 versions
        if (dataObj.v2 && dataObj.v2.share_id && dataObj.v2.share_token) {
          num1 = dataObj.v2.share_id;
          num2 = dataObj.v2.share_token;
        }

        if (num1 && num2) {
          let template = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";

          writeToClipboard(template, "Sharing template");
        } else {
          displayMessageWithIcon("warning", "Error building sharing template.");
        }
      } else {
        displayMessageWithIcon("warning", "Error building sharing template.");
      }
    }
  });
}

async function ancestryBuildSharingUrl(extractedData) {
  if (!ancestryPrefetch.areBuildSharingDependenciesReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("ancestryBuildSharingUrl, waiting another 10ms");
    if (ancestryPrefetch.timeoutCount < prefetchTimeoutMax) {
      setTimeout(function () {
        ancestryBuildSharingUrl(extractedData);
      }, prefetchTimeoutDelay);
      ancestryPrefetch.timeoutCount++;
      displayPrefetchWaitingMessage("Building sharing URL", true);
    } else {
      displayPrefetchErrorForSharingData();
    }
    return;
  }

  doAsyncActionWithCatch("Building Sharing URL", extractedData, async function () {
    if (extractedData.pageType == "sharingUrl") {
      // we already have the sharing template in the extractedData so we just need to store it.
      var sharingUrl = extractedData.sharingUrl;
      writeToClipboard(sharingUrl, "Sharing URL");
    } else {
      // this is a record or image page
      let dataObj = ancestryPrefetch.prefetchedSharingDataObj;
      if (dataObj) {
        let url = dataObj.url;
        if (dataObj.v2 && dataObj.v2.share_url) {
          url = dataObj.v2.share_url;
        }
        if (url) {
          writeToClipboard(url, "Sharing URL");
        } else {
          displayMessageWithIcon("warning", "Error building sharing URL.");
        }
      } else {
        displayMessageWithIcon("warning", "Error building sharing URL.");
      }
    }
  });
}

async function ancestryBuildHouseholdTableWithLinkedRecords(data) {
  // if there are linked records then add that data to the generalized data
  if (data.linkedRecords && data.linkedRecords.length > 0) {
    if (data.linkedRecordFailureCount > 0) {
      // some of the linked records could not be retrieved.
      displayLinkedRecordsFetchErrorsMessage("building household table");
      return;
    }

    regeneralizeDataWithLinkedRecords(data);
  }

  // There is an option to put an inline citation at the end of the table caption
  // If this is set then generate the citation string.
  let citationObject = buildCitationObjectForTable(
    data.extractedData,
    data.generalizedData,
    ancestryPrefetch.prefetchedSharingDataObj,
    buildCitation
  );

  doAsyncActionWithCatch("Building Household Table", data, async function () {
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

async function ancestryBuildHouseholdTable(data) {
  if (!ancestryPrefetch.areBuildTableDependenciesReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("ancestryBuildHouseholdTable, waiting another 10ms");
    if (ancestryPrefetch.timeoutCount < prefetchTimeoutMax) {
      setTimeout(function () {
        ancestryBuildHouseholdTable(data);
      }, prefetchTimeoutDelay);
      ancestryPrefetch.timeoutCount++;
      return;
    }
    // else proceed without the data cache
  }

  // for Ancestry it is necessary to get extra info from linked records
  getDataForLinkedHouseholdRecords(data, ancestryBuildHouseholdTableWithLinkedRecords);
}

async function ancestryBuildTreeTemplate(data) {
  if (data.extractedData.ancestryTemplate) {
    writeToClipboard(data.extractedData.ancestryTemplate, "Ancestry Tree Template");
  }
}

async function ancestryBuildTreeMediaTemplate(data) {
  if (data.extractedData.ancestryTemplate) {
    writeToClipboard(data.extractedData.ancestryTemplate, "Ancestry Tree Media Template");
  }
}

function ancestryGoToRecord(data) {
  let url = data.extractedData.url;

  let recordUrl = "";

  const pidString = "pId=";
  const colString = "/imageviewer/collections/";

  let pidIndex = url.indexOf(pidString);
  let colIndex = url.indexOf(colString);

  if (pidIndex != -1 && colIndex != -1) {
    let pid = url.substring(pidIndex + pidString.length);
    let pidExtraIndex = pid.search(/[^\d]/);
    if (pidExtraIndex != -1) {
      pid = pid.substring(0, pidExtraIndex);
    }

    let dbIdIndex = colIndex + colString.length;
    let dbIdEndIndex = url.indexOf("/images/", dbIdIndex);
    if (dbIdEndIndex != -1) {
      let dbId = url.substring(dbIdIndex, dbIdEndIndex);

      let domainPart = url.substring(0, colIndex);

      recordUrl = domainPart + "/discoveryui-content/view/" + pid + ":" + dbId;
    }
  }

  if (recordUrl) {
    chrome.tabs.create({ url: recordUrl });
    window.close();
  } else {
    // failed
    displayMessageWithIcon("warning", "The Image URL is not in the expected format.");
  }
}

function ancestryGoToImage(data) {
  let imageUrl = data.extractedData.imageUrl;
  if (imageUrl) {
    chrome.tabs.create({ url: imageUrl });
    window.close();
  }
}

function ancestryGoToFullSizeSharingImage(data) {
  let imageUrl = data.extractedData.fullSizeSharingImageUrl;
  if (imageUrl) {
    chrome.tabs.create({ url: imageUrl });
    window.close();
  }
}

async function extractRecordFromUrlFromPersonSourceCitation(recordUrl, originalExtractedData) {
  //console.log("extractRecordFromUrlFromPersonSourceCitation");
  displayMessage("WikiTree Sourcer fetching full record page ...\n(This might take several seconds)");

  let extractResult = await extractRecordHtmlFromUrl(recordUrl, "Full");

  if (extractResult.success) {
    let extractedData = extractDataFromHtml(extractResult.htmlText, recordUrl);
    setupAncestryPopupMenu(extractedData);
  } else if (extractResult.errorStatus == "subscriptionHasNoAccess") {
    originalExtractedData.pageType = "record";
    originalExtractedData.isLimitedDueToSubscription = true;
    setupAncestryPopupMenu(originalExtractedData);
  } else {
    // ??
    console.log(
      "Failed response from ancestry extractRecordFromUrlFromPersonSourceCitation. recordUrl is: " + recordUrl
    );
    let message = "Error fetching linked record from URL:\n\n" + recordUrl;
    message += "\n\nThis could be due to internet connectivity issues or server issues.";
    message += "\n\nPlease try again.\n";
    displayMessageWithIcon("warning", message);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addAncestryBuildSharingTemplateMenuItem(menu, data) {
  if (data.extractedData.pageType == "record") {
    return;
  }
  addMenuItem(menu, "Build Sharing Template", function (element) {
    displayMessage("Building sharing template...");
    ancestryBuildSharingTemplate(data.extractedData);
  });
}

function addAncestryBuildSharingUrlMenuItem(menu, data) {
  if (data.extractedData.pageType == "record") {
    return;
  }
  addMenuItem(menu, "Build Sharing URL", function (element) {
    displayMessage("Building sharing URL...");
    ancestryBuildSharingUrl(data.extractedData);
  });
}

function addAncestryBuildHouseholdTableMenuItem(menu, data) {
  if (data.generalizedData.hasHouseholdTable()) {
    addMenuItem(menu, "Build Household Table", function (element) {
      displayMessage("Building table...");
      ancestryBuildHouseholdTable(data);
    });
  }
}

function addAncestryGoToRecordMenuItem(menu, data) {
  let url = data.extractedData.url;
  let pidIndex = url.indexOf("pId=");

  if (pidIndex != -1) {
    addMenuItem(menu, "Go to Record Page", function (element) {
      ancestryGoToRecord(data);
    });
  }
}

function addAncestryGoToImageMenuItem(menu, data) {
  let imageUrl = data.extractedData.imageUrl;

  if (imageUrl) {
    addMenuItem(menu, "Go to Image Page", function (element) {
      ancestryGoToImage(data);
    });
  }
}

function addAncestryImageBuildCitationMenuItems(menu, data) {
  addMenuItemWithSubtitle(
    menu,
    "Build Inline Image Citation",
    function (element) {
      displayMessage("Building citation...");
      data.type = "inline";
      ancestryBuildCitation(data);
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Image Citation",
    function (element) {
      displayMessage("Building citation...");
      data.type = "source";
      ancestryBuildCitation(data);
    },
    "It is recommended to Build Source Citation on the Record Page instead if one exists."
  );
}

function addAncestrySharingPageBuildCitationMenuItems(menu, data) {
  addMenuItemWithSubtitle(
    menu,
    "Build Inline Citation",
    function (element) {
      displayMessage("Building citation...");
      data.type = "inline";
      ancestryBuildCitationWithLinkData(data); // avoid prefetch
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists and you have access."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Citation",
    function (element) {
      displayMessage("Building citation...");
      data.type = "source";
      ancestryBuildCitationWithLinkData(data); // avoid prefetch
    },
    "It is recommended to Build Source Citation on the Record Page instead if one exists and you have access."
  );
}

function addAncestryGoToFullImageMenuItem(menu, data) {
  const pageType = data.extractedData.pageType;
  if (pageType == "sharingImageOrRecord" && data.extractedData.fullSizeSharingImageUrl) {
    addMenuItem(menu, "Go to Fullsize Sharing Image Page", function (element) {
      ancestryGoToFullSizeSharingImage(data);
    });
  }
}

function addBuildAncestryTreeTemplateMenuItem(menu, data) {
  if (data.extractedData.ancestryTemplate) {
    addMenuItem(menu, "Build Ancestry Tree Template", function (element) {
      ancestryBuildTreeTemplate(data);
    });
  }
}

function addBuildAncestryTreeMediaTemplateMenuItem(menu, data) {
  if (data.extractedData.ancestryTemplate) {
    addMenuItem(menu, "Build Ancestry Tree Media Template", function (element) {
      ancestryBuildTreeMediaTemplate(data);
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Main Menu
//////////////////////////////////////////////////////////////////////////////////////////

// Common function used by both the normal path and the path taken for an unclassified
// non-primary record.
async function setupAncestryPopupMenuWithLinkData(data) {
  // if there are linked records then try to determine record type
  if (data.linkedRecords && data.linkedRecords.length > 0) {
    if (data.linkedRecordFailureCount > 0) {
      // some of the linked records could not be retrieved.
      displayLinkedRecordsFetchErrorsMessage("initializing menu");
      return;
    }

    regeneralizeDataWithLinkedRecords(data);
  }

  let extractedData = data.extractedData;

  let backFunction = function () {
    setupAncestryPopupMenuWithLinkData(data);
  };

  let menu = beginMainMenu();

  if (extractedData.pageType == "personFacts") {
    await addSearchMenus(menu, data, backFunction, "ancestry");
    addMenuDivider(menu);
    addSavePersonDataMenuItem(menu, data);
    addBuildAncestryTreeTemplateMenuItem(menu, data);
  } else if (extractedData.pageType == "record") {
    // if the user doesn't have a subscription add a heading to that effect
    if (extractedData.isLimitedDueToSubscription) {
      let subMessage = "It appears that your subscription does not give access to this record.";
      subMessage += " Only limited information could be extracted.";
      addItalicMessageMenuItem(menu, subMessage, "yellowBackground");
    }

    await addSearchMenus(menu, data, backFunction, "ancestry");
    addMenuDivider(menu);

    addBuildCitationMenuItems(menu, data, ancestryBuildCitation, backFunction, generalizeDataGivenRecordType);
    addAncestryBuildHouseholdTableMenuItem(menu, data);
    addAncestryGoToImageMenuItem(menu, data);
  } else if (extractedData.pageType == "image") {
    addAncestryImageBuildCitationMenuItems(menu, data);
    addAncestryBuildSharingTemplateMenuItem(menu, data);
    addAncestryBuildSharingUrlMenuItem(menu, data);
    addAncestryGoToRecordMenuItem(menu, data);
  } else if (extractedData.pageType == "sharingImageOrRecord") {
    addAncestrySharingPageBuildCitationMenuItems(menu, data);
    addAncestryGoToFullImageMenuItem(menu, data);
  } else if (extractedData.pageType == "treeMedia") {
    addBuildAncestryTreeMediaTemplateMenuItem(menu, data);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

// This is used when the record type is not known by the initial extract/generalize
// If this is something like the parent record for a baptism then it may not be classifiable.
// e.g. https://www.ancestry.com/discoveryui-content/view/151040635:2243
// But extracting the linked record (child in this example) gets enough data to classify it.
async function useLinkedRecordsToDetermineType(data) {
  processWithFetchedLinkData(data, setupAncestryPopupMenuWithLinkData);
}

async function setupAncestryPopupMenu(extractedData) {
  //console.log("setupAncestryPopupMenu: extractedData is:");
  //console.log(extractedData);

  if (extractedData && extractedData.pageType == "personSourceCitation") {
    // we want to go to the record URL and do an extract there
    extractRecordFromUrlFromPersonSourceCitation(extractedData.recordUrl, extractedData);
    return; // the above call will asyncronously call setupAncestryPopupMenu again
  }

  let backFunction = function () {
    setupAncestryPopupMenu(extractedData);
  };

  if (!extractedData || !extractedData.pageType || extractedData.pageType == "unknown") {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\nIt looks like an Ancestry page but not a record, image or person page.";
    let data = { extractedData: extractedData };
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // get generalized data
  let generalizedData = generalizeData({ extractedData: extractedData });
  let data = { extractedData: extractedData, generalizedData: generalizedData };

  //console.log("setupAncestryPopupMenu: generalizedData is:");
  //console.log(generalizedData);

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like a supported Ancestry page but the data generalize failed.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  // do async prefetches
  loadDataCache(ancestryDependencyListener);
  if (extractedData.pageType == "record" || extractedData.pageType == "image") {
    // will get an error if we try to do this for pageType == "sharingImageOrRecord" for example
    getAncestrySharingDataObj(data, ancestryDependencyListener);
  }

  if (generalizedData.sourceType == "record" && generalizedData.recordType == RT.Unclassified && generalizedData.role) {
    // use linked record to try to determine record type
    useLinkedRecordsToDetermineType(data);
  } else {
    setupAncestryPopupMenuWithLinkData(data);
  }
}

initPopup("ancestry", setupAncestryPopupMenu);
