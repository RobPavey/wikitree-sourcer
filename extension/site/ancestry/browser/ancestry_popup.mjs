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
  addMenuItemWithSubMenu,
  addMenuDivider,
  addItalicMessageMenuItem,
  beginMainMenu,
  addBackMenuItem,
  endMainMenu,
  displayBusyMessage,
  displayBusyMessageAfterDelay,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
  doAsyncActionWithCatch,
  keepPopupOpenForDebug,
  closePopup,
  saveUnitTestData,
  clearCachedFetchData,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  convertTimestampDiffToText,
  getPersonDataSubtitleText,
  getCitationObjectSubtitleText,
} from "/base/browser/popup/popup_utils.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";
import { getLatestCitation } from "/base/browser/popup/popup_citation.mjs";

import { isFirefox } from "/base/browser/common/browser_check.mjs";

import { checkPermissionForSiteFromUrl } from "/base/browser/popup/popup_permissions.mjs";

import {
  addStandardMenuEnd,
  addShowCitationAssistantMenuItem,
  buildMinimalMenuWithMessage,
} from "/base/browser/popup/popup_menu_blocks.mjs";

import { addBuildListsMenuItem } from "/base/browser/popup/popup_build_lists.mjs";

import { addSearchMenus } from "/base/browser/popup/popup_search.mjs";

import {
  clearCitation,
  saveCitation,
  doesCitationWantHouseholdTable,
  buildHouseholdTableString,
  buildCitationObjectForTable,
} from "/base/browser/popup/popup_citation.mjs";

import { addSavePersonDataMenuItem } from "/base/browser/popup/popup_person_data.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { getDefaultOptions } from "/base/core/options/options_database.mjs";

import { writeToClipboard, clearClipboard } from "/base/browser/popup/popup_clipboard.mjs";

import {
  getDataForLinkedHouseholdRecords,
  processWithFetchedLinkData,
  getDataForCitationAndHouseholdRecords,
} from "./ancestry_popup_linked_records.mjs";

import { getExtractedDataFromRecordUrl } from "./ancestry_url_to_ed.mjs";

import { parallelRequestsDisplayErrorsMessage } from "/base/browser/popup/popup_parallel_requests.mjs";

import { RT } from "../../../base/core/record_type.mjs";

import { GeneralizedData } from "/base/core/generalize_data_utils.mjs";

import { getSiteDataForSite } from "/base/core/site_registry.mjs";

import { initPopup } from "/base/browser/popup/popup_init.mjs";

import {
  generalizeData,
  generalizeDataGivenRecordType,
  regeneralizeDataWithLinkedRecords,
} from "../core/ancestry_generalize_data.mjs";
import { buildCitation } from "../core/ancestry_build_citation.mjs";
import { buildHouseholdTable, buildCustomTable } from "/base/core/table_builder.mjs";

import { fetchAncestrySharingDataObj } from "./ancestry_fetch.mjs";

import { ancestryGetAllCitations } from "./ancestry_get_all_citations.mjs";

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

const prefetchTimeoutMax = 100; // retry 100 times
const prefetchTimeoutDelay = 100; // in ms

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

    displayBusyMessage(message);
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

var getSharingObjRetryCount = 0;
var getSharingObjRetryMax = 3;
var getSharingObjTimeoutDelay = 100;

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
      console.log("fetchAncestrySharingDataObj did not succeed, response is:");
      console.log(response);

      if (getSharingObjRetryCount < getSharingObjRetryMax) {
        getSharingObjRetryCount++;
        setTimeout(function () {
          getAncestrySharingDataObj(data, dependencyListener);
        }, getSharingObjTimeoutDelay);
        return;
      }
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
      await parallelRequestsDisplayErrorsMessage("building citation");
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
    saveCitation(citationObject);
  });
}

async function ancestryBuildCitation(data) {
  clearCitation();

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
    getDataForCitationAndHouseholdRecords(data, ancestryBuildCitationWithLinkData, options);
  } else {
    processWithFetchedLinkData(data, ancestryBuildCitationWithLinkData);
  }
}

async function ancestryBuildSharingTemplate(extractedData) {
  clearClipboard();

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
  clearClipboard();

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
  //console.log("ancestryBuildHouseholdTableWithLinkedRecords, data is:");
  //console.log(data);

  clearClipboard();

  // if there are linked records then add that data to the generalized data
  if (data.linkedRecords && data.linkedRecords.length > 0) {
    if (data.linkedRecordFailureCount > 0) {
      // some of the linked records could not be retrieved.
      await parallelRequestsDisplayErrorsMessage("building household table");
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
  //console.log("ancestryBuildHouseholdTable");
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
  getDataForLinkedHouseholdRecords(data, ancestryBuildHouseholdTableWithLinkedRecords, options);
}

async function ancestryBuildCensusPageTable(data) {
  //console.log("ancestryBuildCensusPageTable");

  clearClipboard();

  if (!ancestryPrefetch.areBuildSharingDependenciesReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("ancestryBuildSharingTemplate, waiting another 10ms");
    if (ancestryPrefetch.timeoutCount < prefetchTimeoutMax) {
      setTimeout(function () {
        ancestryBuildCensusPageTable(data);
      }, prefetchTimeoutDelay);
      ancestryPrefetch.timeoutCount++;
      displayPrefetchWaitingMessage("Building Census Page Table", true);
    } else {
      displayPrefetchErrorForSharingData();
    }
    return;
  }

  let ed = data.extractedData;
  if (ed.indexHeadings && ed.indexRows) {
    let fieldNames = ["No.", "House", "Name", "Relation", "MS", "Age", "Sex", "Occupation", "Where Born"];
    let objectArray = [];

    let lastHouse = "";
    let lastRelation = "";

    let isFirstRow = true;
    for (let row of ed.indexRows) {
      let rowObject = {};
      rowObject["No."] = "";
      let house = row["Address"];
      rowObject["House"] = house;

      let givenName = row["Given Name"];
      let surname = row["Surname"];
      let name = givenName;
      if (surname) {
        if (name) {
          name += " ";
        }
        name += surname;
      }
      rowObject["Name"] = name;

      let relation = row["Relationship to Head"];

      let ageString = row["Age"];
      let ageNum = Number(ageString);
      if (!ageString && rowObject["Name"] && rowObject["Address"] != "Uninhabited") {
        // age is blank in transcription is months, weeks etc
        ageString = "age?";
      }
      rowObject["Age"] = ageString;

      let maritalStatus = row["Marital Status"];
      if (maritalStatus == "Married") {
        maritalStatus = "M";
      } else if (maritalStatus == "Unmarried") {
        maritalStatus = "U";
      } else if (maritalStatus == "Widow" || maritalStatus == "Widower") {
        maritalStatus = "W";
      } else if (maritalStatus == "") {
        if (!isNaN(ageNum) && ageNum >= 16) {
          maritalStatus = "U";
        }
      }

      rowObject["MS"] = maritalStatus;
      let sex = row["Gender"];
      if (sex == "Male") {
        sex = "M";
      } else if (sex == "Female") {
        sex = "F";
      }
      rowObject["Sex"] = sex;
      rowObject["Occupation"] = row["Occupation"];
      let birthPlace = "";
      let birthCity = row["Birth City"];
      let birthCounty = row["Birth County"];
      let birthCountry = row["Birth Country"];

      function addPart(part) {
        if (part) {
          if (birthPlace) {
            birthPlace += ", ";
          }
          birthPlace += part;
        }
      }

      if (birthCountry == "England") {
        addPart(birthCounty);
        addPart(birthCity);
      } else {
        addPart(birthCountry);
        addPart(birthCounty);
        addPart(birthCity);
      }
      rowObject["Where Born"] = birthPlace;

      rowObject.includeInTable = true;

      // decide if this is a new household
      let isNewHouse = false;
      if (house != lastHouse) {
        isNewHouse = true;
      } else if (relation == "Head") {
        isNewHouse = true;
      } else if (relation.includes("(Head)")) {
        isNewHouse = true;
      } else if (relation == "Wife" && lastRelation != "Head") {
        isNewHouse = true;
      }
      if (!isFirstRow && isNewHouse) {
        rowObject.addDividerBefore = true;
      }

      if (!isNewHouse) {
        rowObject["House"] = "";
      }

      if (isNewHouse || relation == "Lodger") {
        rowObject["No."] = "#";
      }

      const headHeadString = " (Head) (Head)";
      if (relation.includes(headHeadString)) {
        relation = relation.replace(headHeadString, "");
      }
      rowObject["Relation"] = relation;

      lastHouse = house;
      lastRelation = relation;

      objectArray.push(rowObject);

      isFirstRow = false;
    }

    console.log("objectArray is");
    console.log(objectArray);

    doAsyncActionWithCatch("Building Census Page Table", data, async function () {
      const input = {
        extractedData: data.extractedData,
        generalizedData: data.generalizedData,
        fieldNames: fieldNames,
        objectArray: objectArray,
        options: options,
      };

      // attempt to add the sharing link for the image as a caption
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
          input.captionString = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";
        } else {
          displayMessageWithIcon("warning", "Error building sharing template.");
          return;
        }
      }

      const tableObject = buildCustomTable(input);

      writeToClipboard(tableObject.tableString, "Census PageTable");
    });
  }
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
    closePopup();
  } else {
    // failed
    displayMessageWithIcon("warning", "The Image URL is not in the expected format.");
  }
}

function ancestryGoToImage(data) {
  let imageUrl = data.extractedData.imageUrl;
  if (imageUrl) {
    chrome.tabs.create({ url: imageUrl });
    closePopup();
  }
}

async function ancestryAddLinkBuilderComment(data, personData, tabId) {
  displayBusyMessage("Adding comment ...");

  let personEd = personData.extractedData;
  if (!personEd) {
    displayMessageWithIcon("error", "No extracted data found.");
    return;
  }
  let wikiId = personEd.wikiId;
  if (!wikiId) {
    displayMessageWithIcon("error", "No wikiId found.");
    return;
  }

  // We want to add a comment like:
  // Pavey-444 on WikiTree

  let commentText = wikiId + " on WikiTree";

  let fieldData = {
    wikiId: wikiId,
    commentText: commentText,
  };

  // send a message to content script
  try {
    //console.log("ancestryAddLinkBuilderComment");
    //console.log(tabId);
    //console.log(personData);

    chrome.tabs.sendMessage(tabId, { type: "addComment", fieldData: fieldData }, function (response) {
      displayBusyMessage("Adding comment ...");

      //console.log("doSetFieldsFromPersonData, chrome.runtime.lastError is:");
      //console.log(chrome.runtime.lastError);
      //console.log("doSetFieldsFromPersonData, response is:");
      //console.log(response);

      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      if (chrome.runtime.lastError || !response) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.
        let message = "doSetFieldsFromPersonData failed";
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          message += ": " + chrome.runtime.lastError.message;
        }
        displayMessageWithIcon("warning", message);
      } else if (response.success) {
        // Used to display a message on success but that meant an extra click to close popup
        //displayMessageWithIconThenClosePopup("check", "Fields updated");
        closePopup();
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function ancestryGoToFullSizeSharingImage(data) {
  let imageUrl = data.extractedData.fullSizeSharingImageUrl;
  if (imageUrl) {
    chrome.tabs.create({ url: imageUrl });
    closePopup();
  }
}

async function extractRecordFromUrlFromPersonSourceCitation(recordUrl, originalExtractedData) {
  //console.log("extractRecordFromUrlFromPersonSourceCitation");
  //console.log("recordUrl = " + recordUrl);

  // request permission if needed
  const checkPermissionsOptions = {
    reason: "Because this not a complete source record the extension must request the data from the full record.",
    needsPopupDisplayed: true,
  };
  if (!(await checkPermissionForSiteFromUrl(recordUrl, checkPermissionsOptions))) {
    let message = "Error fetching linked record from URL:\n\n" + recordUrl;
    message += "\n\nThe permission to access that URL either could not be checked or was denied.";
    displayMessageWithIcon("warning", message);
    return;
  }

  //console.log("extractRecordFromUrlFromPersonSourceCitation, calling getExtractedDataFromRecordUrl");

  displayBusyMessageAfterDelay("WikiTree Sourcer fetching full record page ...\n(This might take several seconds)");

  let extractResult = await getExtractedDataFromRecordUrl(recordUrl);

  //console.log("extractRecordFromUrlFromPersonSourceCitation, extractResult is:");
  //console.log(extractResult);

  if (extractResult.success) {
    let extractedData = extractResult.extractedData;

    if (originalExtractedData.personExtractedData) {
      extractedData.personExtractedData = originalExtractedData.personExtractedData;
    }
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

    // This may not be required since we request permissions above
    if (isFirefox()) {
      message += "\n\nIt could be because you have not granted the extension permissions for the ancestry site.";
      message +=
        "\nTo to that go to 'about:addons' in Firefox and click on the '...' next to Sourcer and click 'Manage'";
      message += " then click on the 'Permissions' tab.";
    }

    message += "\n\nPlease try again.\n";
    displayMessageWithIcon("warning", message);
  }
}

async function ancestrySaveUnitTestDataForAllCitations(input, response) {
  // delete all the data that was generated by ancestryGetAllCitations keeping
  // just the data that was fetched.

  console.log("ancestrySaveUnitTestDataForAllCitations");
  console.log("input is:");
  console.log(input);
  console.log("response is:");
  console.log(response);

  let saveObj = {};
  saveObj.extractedData = input.extractedData;
  let recordHtml = {};
  let recordSharingObj = {};
  for (let source of response.sources) {
    if (source.recordUrl && source.htmlText) {
      recordHtml[source.recordUrl] = source.htmlText;
    }
    if (source.recordUrl && source.sharingDataObj) {
      recordSharingObj[source.recordUrl] = source.sharingDataObj;
    }

    if (source.linkedRecords) {
      for (let linkedRecord of source.linkedRecords) {
        if (linkedRecord.link && linkedRecord.htmlText) {
          recordHtml[linkedRecord.link] = linkedRecord.htmlText;
        }
      }
    }
  }
  saveObj.recordHtml = recordHtml;
  saveObj.recordSharingObj = recordSharingObj;

  let debugText = JSON.stringify(saveObj, null, 2);
  let message = "unit test data";
  writeToClipboard(debugText, message);
}

function getExcludedSourcesString(response, data) {
  let message = "";

  function addMessage(numExcluded, reason) {
    if (numExcluded) {
      message += "\n\nNote: " + numExcluded;
      if (numExcluded == 1) {
        message += " source was";
      } else {
        message += " sources were";
      }
      message += " excluded " + reason;
    }
  }

  addMessage(
    response.numExcludedOtherRoleSources,
    "due to option settings because the source person was not a primary person for the event."
  );

  addMessage(response.numExcludedDuplicateSources, "because the source is a duplicate.");

  addMessage(data.extractedData.numExcludedSources, "because the source just references another family tree.");

  return message;
}

async function ancestryBuildAllCitationsAction(data, citationType) {
  try {
    clearClipboard();

    displayBusyMessage("Getting sources...");

    let input = Object.assign({}, data);
    input.options = options;
    input.runDate = new Date();
    input.citationType = citationType;

    if (saveUnitTestData) {
      // if saving unit test data we don't want to exclude any sources
      let testOptions = await getDefaultOptions();
      testOptions.buildAll_ancestry_excludeOtherRoleSources = false;
      // also don't want to limit size of household tables as unit test options may set diff limits
      testOptions.table_general_maxLimit = 1000;
      input.options = testOptions;
      clearCachedFetchData();
    }

    let response = await ancestryGetAllCitations(input);

    if (response.success) {
      //console.log("ancestryBuildAllCitationsAction, response is");
      //console.log(response);
      //keepPopupOpenForDebug();

      let excludedSourcesMessage = getExcludedSourcesString(response, data);

      if (response.citationsString) {
        if (saveUnitTestData) {
          ancestrySaveUnitTestDataForAllCitations(input, response);
        } else {
          let message = response.citationCount + " citations";
          let message2 = "";
          if (response.citationsStringType == "source" || response.citationsStringType == "fsPlainSource") {
            message2 = "\nThese are source type citations and should be pasted after the Sources heading.";
          } else {
            message2 = "\nThese are inline citations and should be pasted before the Sources heading.";
          }

          if (excludedSourcesMessage) {
            message2 += excludedSourcesMessage;
          }

          let iconType = "check";
          if (response.failureCount || response.linkedRecordFailureCount) {
            iconType = "warning";
            message2 +=
              "\n\nWarning: Some data could not be retreived from Ancestry so the citations may be incomplete.";
            if (response.failureCount) {
              message2 += "\n- There were " + response.failureCount + " failures getting sources";
            }
            if (response.linkedRecordFailureCount) {
              message2 += "\n- There were " + response.linkedRecordFailureCount + " failures getting linked records";
            }
            message2 +=
              "\n\nNote: Sourcer caches the data that was retreived, so if you wait a few seconds and try again you may be able to get all of the records and thus get a full list of citations.\n";
          }

          writeToClipboard(response.citationsString, message, false, message2, iconType);
        }
      } else {
        if (response.failureCount) {
          const message = "No citations could be built due to errors getting sources.";
          displayMessageWithIconThenClosePopup("warning", message, "");
        } else {
          const message = "All sources were excluded due to option settings.";

          let message2 = "";
          if (response.numExcludedOtherRoleSources) {
            message2 += "\n\nNote: " + response.numExcludedOtherRoleSources;
            if (response.numExcludedOtherRoleSources == 1) {
              message2 += " source was";
            } else {
              message2 += " sources were";
            }
            message2 +=
              " excluded due to option settings because the source person was not a primary person for the event.";
          }

          numExcludedDuplicateSources;

          displayMessageWithIcon("warning", message, message2);
        }
      }
    } else {
      // It can fail even if there is an image URL, for example findagrave images:
      // https://www.ancestry.com/discoveryui-content/view/2221897:60527
      // This is not considered an error there just will be no sharing link
      console.log("ancestryBuildAllCitationsAction, failed response is");
      console.log(response);

      const message = "An error occurred getting sources.";
      displayMessageWithIcon("warning", message, response.errorMessage);
    }
  } catch (e) {
    console.log("ancestryBuildAllCitationsAction caught exception on ancestryGetAllCitations:");
    console.log(e);
    keepPopupOpenForDebug();

    const message = "An exception occurred getting sources.";
    let message2 = "";
    if (e && e.message) {
      message2 = e.message;
    }
    displayMessageWithIcon("warning", message, message2);
  }
}

async function ancestryGetAllCitationsForSavePersonData(data) {
  try {
    if (!data.extractedData.sources || data.extractedData.sources.length <= 0) {
      // no sources - nothing to do
      return { success: true };
    }

    let input = Object.assign({}, data);
    input.options = options;
    input.runDate = new Date();
    input.citationType = options.buildAll_ancestry_citationType;

    displayBusyMessage("Getting sources...");
    let response = await ancestryGetAllCitations(input);

    if (response.success) {
      //console.log("ancestryGetAllCitationsForSavePersonData, response is");
      //console.log(response);

      data.allCitationsCount = response.citationCount;
      data.allCitationsString = response.citationsString;
      data.allCitationsType = response.citationsStringType;
      data.allCitationsNoteMessage = getExcludedSourcesString(response, data);
      return { success: true };
    } else {
      // If it fails we want to let the user know
      return { success: false, errorMessage: response.errorMessage };
    }
  } catch (e) {
    console.log("ancestryGetAllCitationsForSavePersonData caught exception on ancestryGetAllCitations:");
    console.log(e);
    return { success: false, errorMessage: e.message };
  }
}

async function setFieldsFromPersonDataOrCitation(data, personData, tabId, citationObject, backFunction) {
  displayBusyMessage("Setting fields ...");

  let ed = data.extractedData;
  let pageType = ed.pageType;

  let fieldData = {
    pageType: pageType,
  };

  function getSourceNameForCitation(gd, otherSiteData) {
    // a source name like "Devon Baptisms" is not unique, ther could be
    // collections like that on multiple repositories

    if (!citationObject.sourceTitle && !citationObject.sourceNameWithinRepository) {
      return "";
    }

    if (!otherSiteData) {
      return citationObject.sourceTitle;
    }

    let repositoryName = otherSiteData.repositoryName;
    if (!repositoryName) {
      return citationObject.sourceTitle;
    }

    if (!citationObject.sourceNameWithinRepository && citationObject.sourceTitle.includes(repositoryName)) {
      return citationObject.sourceTitle;
    }

    let sourceName = citationObject.sourceNameWithinRepository;
    if (!sourceName) {
      sourceName = citationObject.sourceTitle;
    }

    return sourceName + " at " + repositoryName;
  }

  function getSourceNameForPersonData(gd, otherSiteData) {
    if (!otherSiteData) {
      return "";
    }

    let repositoryName = otherSiteData.repositoryName;
    let repositorySourceName = otherSiteData.personDataSourceName;

    if (repositorySourceName) {
      return repositorySourceName;
    }

    if (repositoryName) {
      return repositoryName;
    }

    return "";
  }

  function getSourceName(gd, otherSiteData) {
    if (citationObject) {
      return getSourceNameForCitation(gd, otherSiteData);
    } else if (personData) {
      return getSourceNameForPersonData(gd, otherSiteData);
    }
  }

  let gd = undefined;
  if (citationObject) {
    gd = GeneralizedData.createFromPlainObject(citationObject.generalizedData);
  } else if (personData) {
    gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
  }
  let otherSiteData = undefined;
  if (gd) {
    otherSiteData = await getSiteDataForSite(gd.sourceOfData);
  }

  if (pageType == "createCitation") {
    fieldData.sourceName = getSourceName(gd, otherSiteData);
    // details is a required field, of there is no sourceReference then the site's buildCitation must
    // provide a referenceWithinRepository
    if (citationObject) {
      if (citationObject.sourceReference) {
        fieldData.detail = citationObject.sourceReference;
      } else {
        fieldData.detail = citationObject.referenceWithinRepository;
      }
      fieldData.otherInfo = citationObject.standardDataString;
      fieldData.webAddress = citationObject.url;
      if (gd) {
        fieldData.date = gd.inferEventDate();
      }
    } else if (personData && gd) {
      if (gd.personRepoRef) {
        fieldData.detail = gd.personRepoRef;
      }
      let ed = personData.extractedData;
      if (ed) {
        if (ed.url) {
          fieldData.webAddress = ed.url;
        }
      }
      // generate some text showing name, birth data and death date
      let text = "";
      text += gd.inferFullName();
      let birthDate = gd.inferBirthDate();
      let deathDate = gd.inferDeathDate();
      if (birthDate || deathDate) {
        text += " (";
        if (birthDate) {
          text += birthDate;
        }
        text += " - ";
        if (deathDate) {
          text += deathDate;
        }
        text += ")";
      }
      fieldData.text = text;
    }
  } else if (pageType == "createSource") {
    fieldData.sourceName = getSourceName(gd, otherSiteData);
    if (otherSiteData) {
      fieldData.repositoryName = otherSiteData.repositoryName;
    }
  } else if (pageType == "createRepository") {
    if (otherSiteData) {
      fieldData.repositoryName = otherSiteData.repositoryName;
      fieldData.address = otherSiteData.address;
      fieldData.phoneNumber = otherSiteData.usPhoneNumber;
      fieldData.email = otherSiteData.email;
      fieldData.note = "Base URL is " + otherSiteData.baseUrl;
    }
  } else if (pageType == "personAddWebLink") {
    if (citationObject) {
      fieldData.linkName = citationObject.sourceTitle;
      fieldData.webAddress = citationObject.url;
    } else if (personData && gd) {
      let ed = personData.extractedData;
      if (ed) {
        if (ed.url) {
          fieldData.webAddress = ed.url;
        }
      }
      // generate some text showing name, birth data and death date
      let text = "";
      if (gd.sourceOfData == "wikitree") {
        text = ed.wikiId + " on WikiTree";
      } else {
        text += gd.inferFullName();
        let birthDate = gd.inferBirthDate();
        let deathDate = gd.inferDeathDate();
        if (birthDate || deathDate) {
          text += " (";
          if (birthDate) {
            text += birthDate;
          }
          text += " - ";
          if (deathDate) {
            text += deathDate;
          }
          text += ")";
        }
        if (otherSiteData.repositoryName) {
          text += " on " + otherSiteData.repositoryName;
        }
      }
      fieldData.linkName = text;
    }
  }

  // send a message to content script
  try {
    //console.log("doSetFieldsFromPersonData");
    //console.log(tabId);
    //console.log(wtPersonData);

    chrome.tabs.sendMessage(tabId, { type: "setFields", fieldData: fieldData }, function (response) {
      displayBusyMessage("Setting fields ...");

      //console.log("doSetFieldsFromPersonData, chrome.runtime.lastError is:");
      //console.log(chrome.runtime.lastError);
      //console.log("doSetFieldsFromPersonData, response is:");
      //console.log(response);

      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      if (chrome.runtime.lastError || !response) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.
        let message = "doSetFieldsFromPersonData failed";
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          message += ": " + chrome.runtime.lastError.message;
        }
        displayMessageWithIcon("warning", message);
      } else if (response.success) {
        // Used to display a message on success but that meant an extra click to close popup
        //displayMessageWithIconThenClosePopup("check", "Fields updated");
        closePopup();
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
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
    displayBusyMessage("Building sharing template...");
    ancestryBuildSharingTemplate(data.extractedData);
  });
}

function addAncestryBuildSharingUrlMenuItem(menu, data) {
  if (data.extractedData.pageType == "record") {
    return;
  }
  addMenuItem(menu, "Build Sharing URL", function (element) {
    displayBusyMessage("Building sharing URL...");
    ancestryBuildSharingUrl(data.extractedData);
  });
}

function addAncestryBuildHouseholdTableMenuItem(menu, data) {
  if (data.generalizedData.hasHouseholdTable()) {
    addMenuItem(menu, "Build Household Table", function (element) {
      displayBusyMessage("Building table...");
      ancestryBuildHouseholdTable(data);
    });
  }
}

function addAncestryBuildCensusTable(menu, data) {
  let ed = data.extractedData;
  if (ed.indexHeadings && ed.indexRows) {
    addMenuItem(menu, "Build Census Page Table", function (element) {
      displayBusyMessage("Building census table...");
      ancestryBuildCensusPageTable(data);
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

async function addAncestryAddCommentMenuItem(menu, data, tabId) {
  let ed = data.extractedData;
  if (ed.hasCommentTextArea) {
    let personData = await getLatestPersonData();
    if (!personData) {
      return; // no saved data, do not add menu item
    }

    let personDataTimeText = convertTimestampDiffToText(personData.timeStamp);
    if (!personDataTimeText) {
      return;
    }

    if (personData.generalizedData && personData.generalizedData.sourceOfData == "wikitree") {
      let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
      personData.generalizedData = gd;
      let menuText = "Add link builder comment referencing:";
      let subtitleText = getPersonDataSubtitleText(gd, personDataTimeText);

      addMenuItemWithSubtitle(
        menu,
        menuText,
        function (element) {
          ancestryAddLinkBuilderComment(data, personData, tabId);
        },
        subtitleText
      );
    }
  }
}

function addAncestryImageBuildCitationMenuItems(menu, data) {
  addMenuItemWithSubtitle(
    menu,
    "Build Inline Image Citation",
    function (element) {
      displayBusyMessage("Building citation...");
      data.type = "inline";
      ancestryBuildCitation(data);
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Image Citation",
    function (element) {
      displayBusyMessage("Building citation...");
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
      displayBusyMessage("Building citation...");
      data.type = "inline";
      ancestryBuildCitationWithLinkData(data); // avoid prefetch
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists and you have access."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Citation",
    function (element) {
      displayBusyMessage("Building citation...");
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

function addBuildAllCitationsMenuItem(menu, data, backFunction) {
  if (data.extractedData.sources && data.extractedData.sources.length > 0) {
    addMenuItemWithSubMenu(
      menu,
      "Build All Citations",
      function (element) {
        let citationType = options.buildAll_ancestry_citationType;
        ancestryBuildAllCitationsAction(data, citationType);
      },
      function () {
        setupBuildAllCitationsSubMenu(data, backFunction);
      }
    );
  }
}

function addBuildAllCitationsSubmenuMenuItem(menu, data, text, citationType) {
  if (data.extractedData.sources && data.extractedData.sources.length > 0) {
    addMenuItem(menu, text, function (element) {
      ancestryBuildAllCitationsAction(data, citationType);
    });
  }
}

async function addFillCreateCitationFromPersonDataMenuItem(menu, data, tabId, backFunction) {
  let personData = await getLatestPersonData();
  if (!personData) {
    return; // no saved data, do not add menu item
  }

  let personDataTimeText = convertTimestampDiffToText(personData.timeStamp);
  if (!personDataTimeText) {
    return;
  }

  if (personData.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
    personData.generalizedData = gd;
    let menuText = "Set Fields from Person Data for:";
    let subtitleText = getPersonDataSubtitleText(gd, personDataTimeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonDataOrCitation(data, personData, tabId, null, backFunction);
      },
      subtitleText
    );
  }
}

async function addFillCreateCitationFromCitationMenuItem(menu, data, tabId, backFunction) {
  let storedObject = await getLatestCitation();
  if (!storedObject) {
    return; // no saved data, do not add menu item
  }

  let citationObject = storedObject.latestCitation;
  if (!citationObject) {
    return;
  }

  let citationTimeText = convertTimestampDiffToText(citationObject.timeStamp);
  if (!citationTimeText) {
    return;
  }

  if (citationObject && citationObject.generalizedData) {
    let gd = GeneralizedData.createFromPlainObject(citationObject.generalizedData);
    let personData = { extractedData: citationObject.extractedData, generalizedData: gd };

    let menuText = "Set Fields from Citation Data for:";
    let subtitleText = getCitationObjectSubtitleText(gd, citationTimeText);

    addMenuItemWithSubtitle(
      menu,
      menuText,
      function (element) {
        setFieldsFromPersonDataOrCitation(data, personData, tabId, citationObject, backFunction);
      },
      subtitleText
    );
  }
}

async function addFillCreateCitationMenuItems(menu, data, tabId, backFunction) {
  await addFillCreateCitationFromPersonDataMenuItem(menu, data, tabId, backFunction);
  await addFillCreateCitationFromCitationMenuItem(menu, data, tabId, backFunction);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

function setupBuildAllCitationsSubMenu(data, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addBuildAllCitationsSubmenuMenuItem(menu, data, "Narratives plus inline citations", "narrative");
  addBuildAllCitationsSubmenuMenuItem(menu, data, "Inline citations", "inline");
  addBuildAllCitationsSubmenuMenuItem(menu, data, "Source citations", "source");

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Main Menu
//////////////////////////////////////////////////////////////////////////////////////////

// Common function used by both the normal path and the path taken for an unclassified
// non-primary record.
async function setupAncestryPopupMenuWithLinkData(data, tabId) {
  // if there are linked records then try to determine record type
  if (data.linkedRecords && data.linkedRecords.length > 0) {
    if (data.linkedRecordFailureCount > 0) {
      // some of the linked records could not be retrieved.
      await parallelRequestsDisplayErrorsMessage("initializing menu");
    }

    regeneralizeDataWithLinkedRecords(data);
  }

  let extractedData = data.extractedData;

  let backFunction = function () {
    setupAncestryPopupMenuWithLinkData(data, tabId);
  };

  let menu = beginMainMenu();

  if (extractedData.pageType == "personFacts") {
    await addSearchMenus(menu, data, backFunction, "ancestry");
    addMenuDivider(menu);
    addSavePersonDataMenuItem(menu, data, ancestryGetAllCitationsForSavePersonData);
    addBuildAllCitationsMenuItem(menu, data, backFunction);
    addBuildListsMenuItem(menu, data, backFunction, true);
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
    await addAncestryAddCommentMenuItem(menu, data, tabId);
  } else if (extractedData.pageType == "image") {
    addAncestryImageBuildCitationMenuItems(menu, data);
    addAncestryBuildSharingTemplateMenuItem(menu, data);
    addAncestryBuildSharingUrlMenuItem(menu, data);
    addAncestryGoToRecordMenuItem(menu, data);

    if (data.extractedData.dbId == "7572") {
      addAncestryBuildCensusTable(menu, data);
    }
  } else if (extractedData.pageType == "sharingImageOrRecord") {
    addAncestrySharingPageBuildCitationMenuItems(menu, data);
    addAncestryGoToFullImageMenuItem(menu, data);
  } else if (extractedData.pageType == "treeMedia") {
    addBuildAncestryTreeMediaTemplateMenuItem(menu, data);
  } else if (
    extractedData.pageType == "createCitation" ||
    extractedData.pageType == "createSource" ||
    extractedData.pageType == "createRepository" ||
    extractedData.pageType == "personAddWebLink"
  ) {
    await addFillCreateCitationMenuItems(menu, data, tabId, backFunction);
  } else {
    addMenuDivider(menu);
    addShowCitationAssistantMenuItem(menu);
  }

  addStandardMenuEnd(menu, data, backFunction);
}

// This is used when the record type is not known by the initial extract/generalize
// If this is something like the parent record for a baptism then it may not be classifiable.
// e.g. https://www.ancestry.com/discoveryui-content/view/151040635:2243
// But extracting the linked record (child in this example) gets enough data to classify it.
async function useLinkedRecordsToDetermineType(data, tabId) {
  processWithFetchedLinkData(data, setupAncestryPopupMenuWithLinkData);
}

async function setupAncestryPopupMenu(extractedData, tabId) {
  //console.log("setupAncestryPopupMenu: extractedData is:");
  //console.log(extractedData);

  if (extractedData && extractedData.pageType == "personSourceCitation") {
    // we want to go to the record URL and do an extract there
    extractRecordFromUrlFromPersonSourceCitation(extractedData.recordUrl, extractedData);
    return; // the above call will asyncronously call setupAncestryPopupMenu again
  }

  let backFunction = function () {
    setupAncestryPopupMenu(extractedData, tabId);
  };

  if (!extractedData || !extractedData.pageType || extractedData.pageType == "unknown") {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\nIt looks like an Ancestry page but not a record, image or person (facts) page.";
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
    useLinkedRecordsToDetermineType(data, tabId);
  } else {
    setupAncestryPopupMenuWithLinkData(data, tabId);
  }
}

initPopup("ancestry", setupAncestryPopupMenu);
