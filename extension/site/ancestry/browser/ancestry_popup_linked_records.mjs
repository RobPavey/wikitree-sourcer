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

import { extractRecordHtmlFromUrl } from "./ancestry_fetch.mjs";
import { registerAsyncCacheTag } from "../../../base/core/async_result_cache.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";
import { getCachedAsyncResult } from "../../../base/core/async_result_cache.mjs";

const oneHourInMs = 1000 * 60 * 60;
registerAsyncCacheTag("AncestryFetchHousehold", 30, oneHourInMs);
registerAsyncCacheTag("AncestryFetchChild", 10, oneHourInMs);
registerAsyncCacheTag("AncestryFetchFather", 10, oneHourInMs);
registerAsyncCacheTag("AncestryFetchMother", 10, oneHourInMs);
registerAsyncCacheTag("AncestryFetchSiblings", 20, oneHourInMs);
registerAsyncCacheTag("AncestryFetchSpouse", 10, oneHourInMs);

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
  let requests = [];
  let cachedResponses = [];
  for (let record of linkedRecords) {
    let cachedResult = await getCachedAsyncResult(record.cacheTag, record.link);

    if (cachedResult) {
      let extractedData = extractDataFromHtml(cachedResult.htmlText, record.link);
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
    let response = await extractRecordHtmlFromUrl(input.link, input.cacheTag);

    if (response.success) {
      let extractedData = extractDataFromHtml(response.htmlText, response.recordUrl);
      newResponse.link = response.recordUrl;
      newResponse.extractedData = extractedData;
      newResponse.success = true;
    } else {
      newResponse.allowRetry = response.allowRetry;
      newResponse.statusCode = response.statusCode;
    }
    return newResponse;
  }

  let requestsResult = await doRequestsInParallel(requests, requestFunction, 100);

  //console.log("returned from doRequestsInParallel, requestsResult is:  ");
  //console.log(requestsResult);

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
      }
    }

    processInput.linkedRecords.push(linkedRecord);
  }

  //keepPopupOpenForDebug();
  //console.log("processInput is:");
  //console.log(processInput);
  processFunction(processInput);
}

async function getDataForLinkedHouseholdRecords(data, processfunction) {
  //console.log("getDataForLinkedHouseholdRecords. data is : ");
  //console.log(data);
  let linkedRecords = [];
  let headings = data.extractedData.household.headings;
  for (let member of data.extractedData.household.members) {
    if (member.recordId && member.link && data.extractedData.recordId != member.recordId) {
      if (!member.isClosed) {
        // waste of time fetching closed record pages
        let name = member["Household Members"];
        if (!name) {
          name = member["Household Member(s)"];
        }
        if (!name) {
          name = member["Name"];
        }
        if (!name && headings.length > 0) {
          let nameHeading = headings[0];
          if (nameHeading) {
            name = member[nameHeading];
          }
        }
        if (!name) {
          name = "Unknown name";
        }
        linkedRecords.push({ link: member.link, name: name, cacheTag: "AncestryFetchHousehold" });
      }
    }
  }

  if (linkedRecords.length > 0) {
    getDataForLinkedRecords(data, linkedRecords, processfunction);
  } else {
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
          cacheTag: "AncestryFetchChild",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
          cacheTag: "AncestryFetchFather",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
          cacheTag: "AncestryFetchMother",
        });
      }
    } else if (role == "Sibling") {
      let childLink = linkData["Siblings"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Siblings",
          cacheTag: "AncestryFetchSiblings",
        });
      }
    } else if (role == "Spouse") {
      let childLink = linkData["Spouse"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Spouse",
          cacheTag: "AncestryFetchSpouse",
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

async function getDataForCitationAndHouseholdRecords(data, processfunction) {
  //console.log("getDataForLinkedHouseholdRecords. data is : ");
  //console.log(data);
  let linkedRecords = [];
  let headings = data.extractedData.household.headings;
  for (let member of data.extractedData.household.members) {
    if (member.recordId && member.link && data.extractedData.recordId != member.recordId) {
      if (!member.isClosed) {
        // waste of time fetching closed record pages
        let name = member["Household Members"];
        if (!name) {
          name = member["Household Member(s)"];
        }
        if (!name) {
          name = member["Name"];
        }
        if (!name && headings.length > 0) {
          let nameHeading = headings[0];
          if (nameHeading) {
            name = member[nameHeading];
          }
        }
        if (!name) {
          name = "Unknown name";
        }
        linkedRecords.push({ link: member.link, name: name, cacheTag: "AncestryFetchHousehold" });
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
          cacheTag: "AncestryFetchChild",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
          cacheTag: "AncestryFetchFather",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
          cacheTag: "AncestryFetchMother",
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
