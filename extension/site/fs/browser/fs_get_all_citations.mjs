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

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";
import {
  filterAndEnhanceFsSourcesIntoSources,
  buildSourcerCitation,
  buildSourcerCitations,
  buildFsPlainCitations,
} from "../core/fs_build_all_citations.mjs";

async function getSourcerCitation(runDate, source, type, options, updateStatusFunction) {
  let uri = source.uri;

  let fetchResult = { success: false };

  if (uri) {
    fetchResult = await fetchRecord(uri);
    let retryCount = 0;
    while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
      retryCount++;
      updateStatusFunction("retry " + retryCount);
      fetchResult = await fetchRecord(uri);
    }
  }

  //console.log("getSourcerCitation, fetchResult is:");
  //console.log(fetchResult);

  let sourceDataObjects = undefined;
  if (fetchResult.success) {
    sourceDataObjects = fetchResult.dataObjects;
  }

  buildSourcerCitation(runDate, sourceDataObjects, source, type, options);
}

async function getSourcerCitations(runDate, result, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
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
    let newResponse = { success: true };
    await getSourcerCitation(runDate, input, type, options, updateStatusFunction);
    return newResponse;
  }

  let requestsResult = await doRequestsInParallel(requests, requestFunction);

  result.failureCount = requestsResult.failureCount;

  buildSourcerCitations(result, type, options);
}

async function fsGetAllCitations(input) {
  let ed = input.extractedData;
  let options = input.options;
  let runDate = input.runDate;

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  let retryCount = 0;
  while (retryCount < 3 && !sourcesObj.success && sourcesObj.allowRetry) {
    retryCount++;
    displayBusyMessage("Getting sources, retry " + retryCount + " ...");
    sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  }

  let result = { success: false };

  if (sourcesObj.success) {
    try {
      result.fsSources = sourcesObj.dataObj.sources;

      filterAndEnhanceFsSourcesIntoSources(result, options);

      let citationType = options.addMerge_fsAllCitations_citationType;

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
          await getSourcerCitations(runDate, result, citationType, options);
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
