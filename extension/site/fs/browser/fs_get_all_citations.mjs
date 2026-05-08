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
import { checkPermissionForSiteMatches } from "/base/browser/popup/popup_permissions.mjs";

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";
import {
  filterAndEnhanceFsSourcesIntoSources,
  buildSourcerCitation,
  buildSourcerCitations,
  buildFsPlainCitations,
} from "../core/fs_build_all_citations.mjs";

import { logDebug } from "/base/core/log_debug.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSourcerCitation(runDate, source, type, sessionId, options, updateStatusFunction) {
  logDebug("getSourcerCitation, source is:", source);

  let uri = source.uri;

  let fetchResult = { success: false };

  let fetchFailed = false;

  if (uri && uri.includes("familysearch.org/")) {
    fetchResult = await fetchRecord(uri, sessionId);
    let retryCount = 0;
    while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
      retryCount++;
      updateStatusFunction("retry " + retryCount);
      await sleep(20);
      fetchResult = await fetchRecord(uri, sessionId);
    }
    if (!fetchResult.success) {
      // we can still get info from the source
      logDebug("getSourcerCitation, fetch failed fetchResult is:", fetchResult);
      fetchFailed = true;
    }
  } else {
    // we can still get info from the source
    logDebug("getSourcerCitation, no familysearch url found");
  }

  logDebug("getSourcerCitation, fetchResult is:");
  logDebug(fetchResult);

  let sourceDataObjects = undefined;
  if (fetchResult.success) {
    sourceDataObjects = fetchResult.dataObjects;
  }

  if (sourceDataObjects) {
    source.dataObjects = sourceDataObjects;
    let sessionId = "";
    let extractedData = extractDataFromFetch(undefined, "", source.dataObjects, "record", sessionId, options);
    if (extractedData) {
      source.extractedData = extractedData;
    }
  }

  buildSourcerCitation(runDate, source, type, options);

  if (fetchFailed) {
    return { success: false };
  }

  return { success: true };
}

async function getSourcerCitations(runDate, result, type, sessionId, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    result.success = true;
    return;
  }

  let requests = [];
  for (let source of result.sources) {
    let request = {
      name: source.id,
      input: source,
    };
    requests.push(request);
  }

  async function requestFunction(input, updateStatusFunction) {
    updateStatusFunction("fetching...");
    let newResponse = await getSourcerCitation(runDate, input, type, sessionId, options, updateStatusFunction);
    return newResponse;
  }

  const queueOptions = {
    initialWaitBetweenRequests: 1,
    maxWaitime: 1600,
    additionalRetryWaitime: 1600,
    additionalManyRecent429sWaitime: 1600,
  };
  let requestsResult = await doRequestsInParallel(requests, requestFunction, queueOptions);

  result.failureCount = requestsResult.failureCount;

  buildSourcerCitations(result, type, options);
}

async function fsGetAllCitations(input) {
  let ed = input.extractedData;
  let options = input.options;
  let runDate = input.runDate;
  let sessionId = ed.sessionId;

  let result = { success: false };
  result.numExcludedOtherRoleSources = 0;
  result.numExcludedDuplicateSources = 0;
  result.numExcludedNonFsSources = 0;
  result.numExcludedFsImageSources = 0;
  result.numExcludedTreeSources = 0;

  // request permission if needed
  const checkPermissionsOptions = {
    reason: "Sourcer needs to request the list of sources from FamilySearch.",
    needsPopupDisplayed: true,
  };
  if (!(await checkPermissionForSiteMatches("fs", checkPermissionsOptions))) {
    return result;
  }

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  let retryCount = 0;
  while (retryCount < 3 && !sourcesObj.success && sourcesObj.allowRetry) {
    retryCount++;
    displayBusyMessage("Getting sources, retry " + retryCount + " ...");
    sourcesObj = await fetchFsSourcesJson(ed.sourceIds, sessionId);
  }

  if (sourcesObj.success) {
    try {
      result.fsSources = sourcesObj.dataObj.sources;

      filterAndEnhanceFsSourcesIntoSources(result, options);

      let citationType = input.citationType;

      switch (citationType) {
        case "fsPlainInline":
          buildFsPlainCitations(result, "inline", options);
          break;
        case "fsPlainSource":
          buildFsPlainCitations(result, "source", options);
          break;
        case "narrative":
        case "inline":
        case "source":
          await getSourcerCitations(runDate, result, citationType, sessionId, options);
          break;
      }
    } catch (error) {
      result.errorMessage = error.message;
    }
  } else {
    result.errorMessage = "Could not get list of sources. Try running from the 'SOURCES' page.";
  }

  return result;
}

export { fsGetAllCitations };
