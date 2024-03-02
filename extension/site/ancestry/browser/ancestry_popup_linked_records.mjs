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

import { extractRecord } from "../core/ancestry_extract_data.mjs";

import { getExtractedDataFromRecordUrl } from "./ancestry_url_to_ed.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";
import { getCachedAsyncResult } from "../../../base/core/async_result_cache.mjs";
import { checkPermissionForSiteFromUrl } from "/base/browser/popup/popup_permissions.mjs";

import { markHouseholdMembersToIncludeInTable } from "/base/core/table_builder.mjs";

function extractDataFromHtml(htmlText, recordUrl) {
  //console.log("extractDataFromHtml, recordUrl is: " + recordUrl);
  //console.log("extractDataFromHtml, htmlText is: ");
  //console.log(htmlText);

  let parser = new DOMParser();
  let document = parser.parseFromString(htmlText, "text/html");
  //console.log("document is:");
  //console.log(document);

  let extractedData = {};
  extractedData.url = recordUrl;
  extractedData.pageType = "record";

  extractRecord(document, recordUrl, extractedData);
  return extractedData;
}

async function getDataForLinkedRecords(data, linkedRecords, processFunction) {
  // request permission if needed
  if (linkedRecords.length > 0) {
    let url = linkedRecords[0].link;
    const checkPermissionsOptions = {
      reason: "The extension needs to request the data from linked records.",
      needsPopupDisplayed: true,
    };
    if (!(await checkPermissionForSiteFromUrl(url, checkPermissionsOptions))) {
      return;
    }
  }

  let requests = [];
  let cachedResponses = [];
  for (let record of linkedRecords) {
    let cachedResult = await getCachedAsyncResult("AncestryFetchRecord", record.link);

    if (cachedResult) {
      console.log("getDataForLinkedRecords: cached result found for: " + record.link);
      console.log(cachedResult);
      let extractedData = cachedResult;
      let cachedResponse = {
        name: record.name,
        link: record.link,
        extractedData: extractedData,
      };
      cachedResponses.push(cachedResponse);
    } else {
      let request = {
        name: record.name,
        input: record,
      };
      requests.push(request);
    }
  }

  async function requestFunction(input, updateStatusFunction) {
    updateStatusFunction("fetching...");
    let newResponse = { success: false };
    let fetchResult = await getExtractedDataFromRecordUrl(input.link);

    if (fetchResult.success) {
      let extractedData = fetchResult.extractedData;
      newResponse.link = fetchResult.recordUrl;
      newResponse.extractedData = extractedData;
      newResponse.htmlText = fetchResult.htmlText;
      newResponse.success = true;
    } else {
      newResponse.allowRetry = fetchResult.allowRetry;
      newResponse.statusCode = fetchResult.statusCode;
    }
    return newResponse;
  }

  const queueOptions = {
    initialWaitBetweenRequests: 20,
    maxWaitime: 3200,
    additionalRetryWaitime: 3200,
    additionalManyRecent429sWaitime: 5000,
    slowDownFromStartCount: 10,
    slowDownFromStartMult: 4,
  };
  console.log("getDataForLinkedRecords, about to call doRequestsInParallel, requests is:");
  console.log(requests);

  try {
    //console.log("getDataForLinkedRecords, about to call doRequestsInParallel, requests is:");
    //console.log(requests);

    let displayMessage = "WikiTree Sourcer fetching linked records";
    let ed = data.extractedData;
    if (ed && ed.titleCollection) {
      if (ed.titleName) {
        displayMessage =
          "Fetching linked records to complete citation for " + ed.titleName + " in " + ed.titleCollection;
      } else {
        displayMessage = "Fetching linked records to complete citation of " + ed.titleCollection;
      }
    }
    let requestsResult = await doRequestsInParallel(requests, requestFunction, queueOptions, displayMessage);

    console.log("getDataForLinkedRecords, returned from doRequestsInParallel, requestsResult is:");
    console.log(requestsResult);

    function findCachedResponseByLink(link) {
      for (let cachedResponse of cachedResponses) {
        if (cachedResponse.link == link) {
          return cachedResponse;
        }
      }
    }

    function findRequestResponseByLink(link) {
      if (requestsResult) {
        for (let response of requestsResult.responses) {
          if (response) {
            if (response.link == link) {
              return response;
            }
          }
        }
      }
    }

    let processInput = data;
    processInput.linkedRecordFailureCount = requestsResult.failureCount;
    processInput.linkedRecords = [];

    for (let i = 0; i < linkedRecords.length; i++) {
      let link = linkedRecords[i].link;
      let linkedRecord = {
        name: linkedRecords[i].name,
        link: link,
      };

      let cachedResponse = findCachedResponseByLink(link);
      if (cachedResponse) {
        linkedRecord.extractedData = cachedResponse.extractedData;
      } else {
        let requestResponse = findRequestResponseByLink(link);
        if (requestResponse) {
          linkedRecord.extractedData = requestResponse.extractedData;
          linkedRecord.htmlText = requestResponse.htmlText;
        }
      }

      processInput.linkedRecords.push(linkedRecord);
    }

    //keepPopupOpenForDebug();
    console.log("getDataForLinkedRecords: processInput is:");
    console.log(processInput);
    processFunction(processInput);
  } catch (error) {
    console.log("getDataForLinkedRecords, caught error in doRequestsInParallel, error is:");
    console.log(error);
  }
}

async function getDataForLinkedHouseholdRecords(data, processfunction, options) {
  console.log("getDataForLinkedHouseholdRecords. data is : ");
  console.log(data);

  let gd = data.generalizedData;

  // check which members should be included due to max size
  markHouseholdMembersToIncludeInTable(gd, options);

  let linkedRecords = [];
  for (let member of gd.householdArray) {
    if (member.uid && gd.recordId != member.uid) {
      // waste of time fetching closed record pages
      if (!member.isClosed && member.includeInTable) {
        let name = member.name;
        if (!name) {
          name = "Unknown name";
        }
        linkedRecords.push({ link: member.uid, name: name });
      }
    }
  }

  if (linkedRecords.length > 0) {
    console.log("getDataForLinkedHouseholdRecords. calling getDataForLinkedRecords, linkedRecords is:");
    console.log(linkedRecords);
    getDataForLinkedRecords(data, linkedRecords, processfunction);
  } else {
    //console.log("getDataForLinkedHouseholdRecords. calling processfunction directly");
    processfunction(data);
  }
}

async function processWithFetchedLinkData(data, processFunction) {
  let linkData = data.extractedData.linkData;

  let role = data.generalizedData.role;

  let linkedRecords = [];

  if (linkData && role) {
    // there is a role so this is not the primary person.
    if (role == "Parent") {
      let childLink = linkData["Child"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Child",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
        });
      }
    } else if (role == "Sibling") {
      let childLink = linkData["Siblings"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Siblings",
        });
      }
    } else if (role == "Spouse") {
      let childLink = linkData["Spouse"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Spouse",
        });
      }
    }
  } else if (data.extractedData.household && role) {
    if (data.extractedData.household.members.length > 1) {
      let primaryMember = data.extractedData.household.members[0];
      if (primaryMember.link) {
        linkedRecords.push({
          link: primaryMember.link,
          name: "Primary person",
        });
      }
    }
  }

  if (linkedRecords.length > 0) {
    getDataForLinkedRecords(data, linkedRecords, processFunction);
  } else {
    processFunction(data);
  }
}

async function getDataForCitationAndHouseholdRecords(data, processfunction, options) {
  //console.log("getDataForLinkedHouseholdRecords. data is : ");
  //console.log(data);

  let gd = data.generalizedData;

  // check which members should be included due to max size
  markHouseholdMembersToIncludeInTable(gd, options);

  let linkedRecords = [];
  for (let member of gd.householdArray) {
    if (member.uid && gd.recordId != member.uid) {
      // waste of time fetching closed record pages
      if (!member.isClosed && member.includeInTable) {
        let name = member.name;
        if (!name) {
          name = "Unknown name";
        }
        linkedRecords.push({ link: member.uid, name: name });
      }
    }
  }

  let linkData = data.extractedData.linkData;
  let role = data.generalizedData.role;
  if (linkData && role) {
    // there is a role so this is not the primary person.
    if (role == "Parent") {
      let childLink = linkData["Child"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Child",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
        });
      }
    }
  }

  if (linkedRecords.length > 0) {
    getDataForLinkedRecords(data, linkedRecords, processfunction);
  } else {
    processfunction(data);
  }
}

export {
  extractDataFromHtml,
  getDataForLinkedHouseholdRecords,
  processWithFetchedLinkData,
  getDataForCitationAndHouseholdRecords,
};
