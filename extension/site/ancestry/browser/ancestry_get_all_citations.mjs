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

import { displayBusyMessage } from "/base/browser/popup/popup_menu_building.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";
import { checkPermissionForSiteFromUrl } from "/base/browser/popup/popup_permissions.mjs";

import { doesCitationWantHouseholdTable } from "/base/browser/popup/popup_citation.mjs";

import { fetchAncestrySharingDataObj } from "./ancestry_fetch.mjs";
import { getExtractedDataFromRecordUrl } from "./ancestry_url_to_ed.mjs";

import { buildSourcerCitation, buildSourcerCitations } from "../core/ancestry_build_all_citations.mjs";
import { generalizeData, regeneralizeDataWithLinkedRecords } from "../core/ancestry_generalize_data.mjs";

import { getDataForLinkedHouseholdRecords, processWithFetchedLinkData } from "./ancestry_popup_linked_records.mjs";

async function getSharingDataObj(source) {
  try {
    if (source.extractedData) {
      let response = await fetchAncestrySharingDataObj(source.extractedData);

      if (response.success) {
        source.sharingDataObj = response.dataObj;
      } else {
        // It can fail even if there is an image URL, for example findagrave images:
        // https://www.ancestry.com/discoveryui-content/view/2221897:60527
        // This is not considered an error there just will be no sharing link
      }
    } else {
      console.log("getSharingDataObj, no extractedData. source is:");
      console.log(source);
    }
  } catch (e) {
    console.log("getAncestrySharingDataObj caught exception on fetchAncestrySharingDataObj:");
    console.log(e);
  }
}

async function updateWithLinkData(data) {
  return new Promise((resolve, reject) => {
    try {
      processWithFetchedLinkData(data, function (data) {
        resolve(data);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function updateWithHouseholdData(data, options) {
  //console.log("updateWithHouseholdData, data is:");
  //console.log(data);
  return new Promise((resolve, reject) => {
    try {
      getDataForLinkedHouseholdRecords(
        data,
        function (data) {
          resolve(data);
        },
        options
      );
    } catch (ex) {
      reject(ex);
    }
  });
}

async function updateDataUsingLinkedRecords(data, citationType, options) {
  if (!data || !data.extractedData) {
    return;
  }

  await updateWithLinkData(data);

  if (doesCitationWantHouseholdTable(citationType, data.generalizedData)) {
    await updateWithHouseholdData(data, options);
  }

  //console.log("updateDataUsingLinkedRecords, data is");
  //console.log(data);

  if (data.linkedRecords) {
    regeneralizeDataWithLinkedRecords(data);
  }
}

async function getExtractedAndGeneralizedData(source) {
  //console.log("getExtractedAndGeneralizedData, source is:");
  //console.log(source);

  let newResponse = { success: false };

  let uri = source.recordUrl;

  let fetchResult = { success: false };

  if (uri) {
    fetchResult = await getExtractedDataFromRecordUrl(uri);
    if (!fetchResult.success) {
      newResponse.allowRetry = response.allowRetry;
      newResponse.statusCode = response.statusCode;
      return newResponse;
    }
  } else {
    return newResponse;
  }

  //console.log("getExtractedAndGeneralizedData, fetchResult is:");
  //console.log(fetchResult);

  //let htmlText = undefined;
  //htmlText = fetchResult.htmlText;

  source.htmlText = fetchResult.htmlText;

  let extractedData = fetchResult.extractedData;
  source.extractedData = extractedData;

  //console.log("getExtractedAndGeneralizedData: extractedData is:");
  //console.log(extractedData);

  //console.log("getExtractedAndGeneralizedData: extractedData.pageType is: " + extractedData.pageType);

  if (extractedData && extractedData.pageType && extractedData.pageType != "unknown") {
    // get generalized data
    //console.log("getExtractedAndGeneralizedData: calling generalizeData");
    source.generalizedData = generalizeData({ extractedData: extractedData });

    //console.log("getExtractedAndGeneralizedData: source.generalizedData is:");
    //console.log(source.generalizedData);
  }

  newResponse.link = fetchResult.recordUrl;
  newResponse.extractedData = extractedData;
  newResponse.success = true;
  return newResponse;
}

async function getSourcerCitations(runDate, result, type, options) {
  //console.log("getSourcerCitations, result is:");
  //console.log(result);

  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    return;
  }

  let requests = [];
  for (let source of result.sources) {
    let request = {
      name: source.title,
      input: source,
    };
    requests.push(request);
  }

  async function fetchSourceRequestFunction(input, updateStatusFunction) {
    //console.log("getSourcerCitations, requestFunction input is:");
    //console.log(input);

    updateStatusFunction("fetching...");
    let newResponse = { success: true };
    await getExtractedAndGeneralizedData(input);

    //console.log("getSourcerCitations, requestFunction, newResponse is:");
    //console.log(newResponse);

    return newResponse;
  }

  const queueOptions = {
    initialWaitBetweenRequests: 1,
    maxWaitime: 1600,
    additionalRetryWaitime: 1600,
    additionalManyRecent429sWaitime: 1600,
  };
  const message = "WikiTree Sourcer fetching record for each source";
  let requestsResult = await doRequestsInParallel(requests, fetchSourceRequestFunction, queueOptions, message);
  //console.log("getSourcerCitations: after getExtractedAndGeneralizedData parallel, requestsResult is:");
  //console.log(requestsResult);

  result.failureCount = requestsResult.failureCount;

  let sharingRequests = [];
  for (let source of result.sources) {
    let request = {
      name: source.title,
      input: source,
    };
    sharingRequests.push(request);
  }
  async function getSharingObjRequestFunction(input, updateStatusFunction) {
    updateStatusFunction("getting sharing link...");
    let newResponse = { success: true };
    await getSharingDataObj(input);
    return newResponse;
  }
  const sharingMessage = "WikiTree Sourcer fetching sharing link each source";
  let sharingRequestsResult = await doRequestsInParallel(
    sharingRequests,
    getSharingObjRequestFunction,
    queueOptions,
    sharingMessage
  );
  result.failureCount += sharingRequestsResult.failureCount;

  // we now have the directly referenced source records extracted and generalized.
  // For some records we need to get linked records.
  for (let source of result.sources) {
    if (source.extractedData && source.generalizedData) {
      let data = { extractedData: source.extractedData, generalizedData: source.generalizedData };

      displayBusyMessage("Getting Linked records");
      await updateDataUsingLinkedRecords(data, type, options);

      source.linkedRecords = data.linkedRecords; // only for unit test capture

      //console.log("getSourcerCitations: after updateDataUsingLinkedRecords, source is:");
      //console.log(source);

      displayBusyMessage("buildSourcerCitation");
      buildSourcerCitation(runDate, source, type, options);
    }
  }

  //console.log("getSourcerCitations: before buildSourcerCitations, result is:");
  //console.log(result);

  buildSourcerCitations(result, type, options);
}

function filterSourceIdsToSources(result, sourceIds, options) {
  //console.log("filterSourceIdsToSources, result is:");
  //console.log(result);
  //console.log("filterSourceIdsToSources, sourceIds is:");
  //console.log(sourceIds);

  result.sources = [];

  for (let sourceId of sourceIds) {
    let recordUrl = result.urlStart + "/discoveryui-content/view/" + sourceId.recordId + ":" + sourceId.dbId;
    let source = {
      recordUrl: recordUrl,
      title: sourceId.title,
    };
    result.sources.push(source);
  }

  //console.log("filterSourceIdsToSources end, result is:");
  //console.log(result);
}

async function ancestryGetAllCitations(input) {
  let ed = input.extractedData;
  let options = input.options;
  let runDate = input.runDate;

  let result = { success: false };

  let sourceIds = ed.sources;
  if (!sourceIds || sourceIds.length == 0) {
    result.errorMessage = "No sources for person";
    return result;
  }

  // request permission if needed
  // personUrl will be something like:
  // https://www.ancestry.com/family-tree/person/tree/86808578/person/260180350040/facts
  let personUrl = ed.url;
  // we want a record URL like this:
  // https://www.ancestry.com/discoveryui-content/view/7080503:8978
  let urlStart = personUrl.replace(/^(https?\:\/\/[^\.\.]+\.ancestry\.[^\/]+)\/.*$/, "$1");
  if (!urlStart || urlStart == personUrl) {
    result.errorMessage = "Could not parse url: " + personUrl;
    return result;
  }
  let firstSource = sourceIds[0];
  let firstSourceRecordUrl = urlStart + "/discoveryui-content/view/" + firstSource.recordId + ":" + firstSource.dbId;
  result.urlStart = urlStart;
  const checkPermissionsOptions = {
    reason: "In order to get all the source records the extension must request the data from the server.",
    needsPopupDisplayed: true,
  };
  if (!(await checkPermissionForSiteFromUrl(firstSourceRecordUrl, checkPermissionsOptions))) {
    result.errorMessage = "No permissions to get sources. If you just allowed it then please try again.";
    return result;
  }

  //console.log("ancestryGetAllCitations, checked permissions, result is:");
  //console.log(result);

  try {
    filterSourceIdsToSources(result, sourceIds, options);
    let citationType = input.citationType;
    await getSourcerCitations(runDate, result, citationType, options);
  } catch (error) {
    result.errorMessage = error.message;
    console.log("caught exception, error is:");
    console.log(error);
    return result;
  }
  return result;
}

export { ancestryGetAllCitations };
