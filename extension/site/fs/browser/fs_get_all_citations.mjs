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
import { getUserClassification, getUserProvidedVitals } from "/base/browser/popup/popup_build_all.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";
import { checkPermissionForSiteMatches } from "/base/browser/popup/popup_permissions.mjs";

import { fetchFsSourcesJson, fetchRecordJson, fetchRecordHtml } from "./fs_fetch.mjs";
import {
  filterAndEnhanceFsSourcesIntoSources,
  buildSourcerCitationGivenGd,
  buildSourcerCitation,
  buildSourcerCitations,
  buildFsSourceInfoCitations,
  pruneSources,
} from "../core/fs_build_all_citations.mjs";

import { generalizeDataGivenRecordType } from "../core/fs_generalize_data.mjs";
import { getQueueOptions } from "./fs_fetch_queue.mjs";

import { RT } from "/base/core/record_type.mjs";
import { logDebug } from "/base/core/log_debug.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldUseJsonFetch(uri) {
  // There are many kinds of pages on the FamilySearch site.
  // We only want to use JSON fetch for record pages (and not images)
  // So not for search results, collection pages etc

  // An image page has:
  // #main-content-section
  // Many pages have:
  // #main
  // On the element with id #main the record pages have aria-label="Main Content"
  // However this is true for other pages like this:
  // https://www.familysearch.org/search/genealogies
  // For thise we return true and it will just fail when it doesn't get JSON data back from the fetch.

  let useFetch = false;

  if (personDetailsRegex.test(uri)) {
    useFetch = true;
  } else if (personSourcesRegex.test(location.href)) {
    useFetch = true;
  } else if (imageWithSidebarUrlRegEx.test(uri)) {
    // This is an image with a person details selected
    useFetch = true;
  } else {
    if (uri.startsWith("https://www.familysearch.org/ark:/")) {
      let url = uri;
      let recordId = url.replace(/^https\:\/\/www\.familysearch\.org\/ark\:\/\d+\/([^/?&]+).*$/, "$1");
      if (recordId && recordId != url) {
        if (recordId.startsWith("1:1:")) {
          useFetch = true;
        }
      }
    }
  }

  //console.log("shouldUseFetch, returning useFetch = " + useFetch);

  return useFetch;
}

async function fetchRecordJsonAfterAdjustingUrl(uri, sessionId) {
  //console.log("doFetch, document.location is: " + document.location);

  let fetchType = "record";
  let fetchUrl = uri;
  //console.log("doFetch, fetchUrl is: " + fetchUrl);

  // sometimes the URL has an extra / on the end. This causes the fetch to fail. So remove it
  fetchUrl = fetchUrl.replace(/\/\?/, "?");
  fetchUrl = fetchUrl.replace(/\/$/, "");

  if (personDetailsRegex.test(fetchUrl) || personSourcesRegex.test(fetchUrl) || personVitalsRegex.test(fetchUrl)) {
    let personId = "";
    if (personDetailsRegex.test(fetchUrl)) {
      personId = fetchUrl.replace(personDetailsRegex, "$1");
    } else if (personSourcesRegex.test(fetchUrl)) {
      personId = fetchUrl.replace(personSourcesRegex, "$1");
    } else if (personVitalsRegex.test(fetchUrl)) {
      personId = fetchUrl.replace(personVitalsRegex, "$1");
    }
    let slashOrQueryIndex = personId.search(/[/?]/);
    if (slashOrQueryIndex != -1) {
      personId = personId.substring(0, slashOrQueryIndex);
    }

    // API URL looks like this: https://api.familysearch.org/platform/tree/persons/K2F9-F5Z
    if (personId) {
      fetchUrl = "https://www.familysearch.org/platform/tree/persons/" + personId + "?relatives";
      fetchType = "person";
    }
  } else if (imageWithSidebarUrlRegEx.test(fetchUrl)) {
    //console.log("This is an image with a sidebar");

    // This is an image with a person details selected.
    let newUrl = fetchUrl.replace(imageWithSidebarUrlRegEx, "https://www.familysearch.org/ark:/$1/1:1:$2");
    if (newUrl && newUrl != fetchUrl) {
      fetchUrl = newUrl;
    }
  }

  // This seems like a recent change on FamilySearch (noticed on 25 May 2022).
  // Sometimes the URL contains "/search/" and this stops the fetch working
  if (fetchUrl.indexOf("www.familysearch.org/search/ark:/") != -1) {
    fetchUrl = fetchUrl.replace("www.familysearch.org/search/ark:/", "www.familysearch.org/ark:/");
  }

  return await fetchRecordJson(fetchUrl, sessionId);
}

async function getUserChoicesForLackingSources(result, runDate, type, options) {
  let isRefTitleNeeded = false;
  let isRecordTypeNeeded = false;
  let isNameNeeded = false;
  let isEventDateNeeded = false;
  let isNarrativeNeeded = false;

  if (options.citation_general_meaningfulNames != "none") {
    isRefTitleNeeded = true;
  }

  if (type == "narrative") {
    isRecordTypeNeeded = true;
    isNarrativeNeeded = true;
    isEventDateNeeded = true;
    isNameNeeded = true;
  }

  if (options.citation_fs_dataStyle == "string") {
    isRecordTypeNeeded = true;
  }

  let userFilteredSources = [];
  for (let source of result.sources) {
    let includeSource = true;
    let gd = source.generalizedData;
    if (gd) {
      if (gd.recordType == RT.Unclassified && (isRecordTypeNeeded || isRefTitleNeeded)) {
        let response = await getUserClassification(source, isRecordTypeNeeded, isRefTitleNeeded);
        if (response.include) {
          if (response.refTitle) {
            gd.overrideRefTitle = response.refTitle;
          }
          if (response.recordType != RT.Unclassified) {
            gd.recordType = response.recordType;
            let ed = source.extractedData;
            generalizeDataGivenRecordType(ed, gd);
            buildSourcerCitationGivenGd(runDate, source, type, options);
          }
        } else {
          includeSource = false;
          result.numUserExcludedSources++;
        }
      }

      if (includeSource) {
        let eventDate = gd.inferEventDate(true);
        let name = gd.inferFullName();
        if ((!eventDate && isEventDateNeeded) || (!name && isNameNeeded)) {
          let message = "FamilySearch Source has insufficient data";
          let needs = {
            name: isNameNeeded,
            eventDate: isEventDateNeeded,
            narrative: isNarrativeNeeded,
          };

          let response = await getUserProvidedVitals(source, message, needs);
          if (response.include) {
            let changedGd = false;
            if (response.name && response.name != name) {
              gd.setFullName(response.name);
              changedGd = true;
            }
            if (response.eventDate && response.eventDate != eventDate) {
              gd.setEventDate(response.eventDate);
              source.eventDate = response.eventDate;
              changedGd = true;
            } else if (!eventDate) {
              if (source.eventDate) {
                gd.setEventDate(source.eventDate);
                changedGd = true;
              }
            }
            if (response.narrative) {
              gd.userOverrideForNarrative = response.narrative;
            }
            if (changedGd) {
              buildSourcerCitationGivenGd(runDate, source, type, options);
            }
          } else {
            includeSource = false;
            result.numUserExcludedSources++;
          }
        }
      }
    } else if (isNarrativeNeeded || isRefTitleNeeded) {
      // There is no gd. This is probably a source that is not a FamilySearch source
      // or it is a FamilySearch image - extractData is not working for images currently
      let message = "Non-FamilySearch Source";
      const fsRegex = /^https?\:\/\/(?:www\.)?familysearch\.org\/.*/;
      if (source.extractedData || fsRegex.test(source.uri)) {
        const fsImageRegex = /^https?\:\/\/(?:www\.)?familysearch\.org\/ark\:\/61903\/3\:1\:.*/;
        if (fsImageRegex.test(source.uri)) {
          message = "Source is a FamilySearch image";
        } else {
          message = "Source references unknown FamilySearch page";
        }
      }
      let needs = {
        refTitle: isRefTitleNeeded,
        eventDate: isEventDateNeeded,
        narrative: isNarrativeNeeded,
      };
      let response = await getUserProvidedVitals(source, message, needs);
      if (response.include) {
        if (response.refTitle) {
          source.userOverrideForRefTitle = response.refTitle;
        }
        if (response.eventDate) {
          source.eventDate = response.eventDate;
        }
        if (response.narrative) {
          source.userOverrideForNarrative = response.narrative;
        }
      } else {
        includeSource = false;
        result.numUserExcludedSources++;
      }
    }
    if (includeSource) {
      userFilteredSources.push(source);
    }
  }
  result.sources = userFilteredSources;
}

async function getSourcerCitation(runDate, source, type, sessionId, tabId, options, updateStatusFunction) {
  logDebug("getSourcerCitation, source is:", source);

  let uri = source.uri;

  let fetchResult = { success: false };

  let fetchFailed = false;

  if (uri && uri.includes("familysearch.org/")) {
    // standardize URI
    uri = uri.replace(/\/familysearch.org/, "/www.familysearch.org");

    let useJsonFetch = shouldUseJsonFetch(uri);

    if (useJsonFetch) {
      fetchResult = await fetchRecordJsonAfterAdjustingUrl(uri, sessionId);
    } else {
      fetchResult = await fetchRecordHtml(uri, sessionId, tabId);
    }
    let retryCount = 0;
    while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
      retryCount++;
      updateStatusFunction("retry " + retryCount);
      await sleep(20);
      if (useJsonFetch) {
        fetchResult = await fetchRecordJsonAfterAdjustingUrl(uri, sessionId);
      } else {
        fetchResult = await fetchRecordHtml(uri, sessionId, tabId);
      }
    }
    if (!fetchResult.success) {
      // we can still get info from the source
      logDebug("getSourcerCitation, fetch failed fetchResult is:", fetchResult);
      fetchFailed = true;
    }

    if (useJsonFetch) {
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
    } else {
      if (fetchResult.success) {
        if (fetchResult.extractedData) {
          source.extractedData = fetchResult.extractedData;
        }
      }
    }
  } else {
    // we can still get info from the source
    logDebug("getSourcerCitation, no familysearch url found");
  }

  logDebug("getSourcerCitation, fetchResult is:");
  logDebug(fetchResult);

  buildSourcerCitation(runDate, source, type, options);

  if (fetchFailed) {
    let result = { success: false };
    source.fetchStatus = {
      success: false,
    };
    if (fetchResult.status) {
      source.fetchStatus.statusCode = fetchResult.status;
    }
    return result;
  }

  return { success: true };
}

async function getSourcerCitations(runDate, result, type, sessionId, tabId, options) {
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
    let newResponse = await getSourcerCitation(runDate, input, type, sessionId, tabId, options, updateStatusFunction);
    return newResponse;
  }

  const queueOptions = getQueueOptions(options, "sources");
  let requestsResult = await doRequestsInParallel(requests, requestFunction, queueOptions);

  result.failureCount = requestsResult.failureCount;

  pruneSources(result, options);

  await getUserChoicesForLackingSources(result, runDate, type, options);

  buildSourcerCitations(result, type, options);
}

async function fsGetAllCitations(input) {
  let ed = input.extractedData;
  let options = input.options;
  let runDate = input.runDate;
  let sessionId = ed.sessionId;
  let tabId = input.tabId;

  let result = { success: false };
  result.numExcludedOtherRoleSources = 0;
  result.numExcludedRetiredSources = 0;
  result.numExcludedDuplicateSources = 0;
  result.numExcludedNonFsSources = 0;
  result.numExcludedFsImageSources = 0;
  result.numExcludedTreeSources = 0;
  result.numUserExcludedSources = 0;

  // request permission if needed
  const checkPermissionsOptions = {
    reason: "Sourcer needs to request the list of sources from FamilySearch.",
    needsPopupDisplayed: true,
  };
  if (!(await checkPermissionForSiteMatches("fs", checkPermissionsOptions))) {
    return result;
  }

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds, sessionId);
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
        case "fsSourceInfoInline":
          buildFsSourceInfoCitations(result, "inline", options);
          break;
        case "fsSourceInfoSource":
          buildFsSourceInfoCitations(result, "source", options);
          break;
        case "narrative":
        case "inline":
        case "source":
          await getSourcerCitations(runDate, result, citationType, sessionId, tabId, options);
          break;
      }
    } catch (error) {
      result.errorMessage = error.message;
    }
  } else {
    result.errorMessage = "Could not get list of sources.";
    let onSourcesPage = ed.url.includes("person/sources");
    if (onSourcesPage) {
      result.errorMessage += " Try reloading the page in the browser.";
    } else {
      result.errorMessage += " Try running from the 'SOURCES' page or reloading the page in the browser.";
    }
  }

  return result;
}

export { fsGetAllCitations };
