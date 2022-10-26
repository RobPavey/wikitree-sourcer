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

import { displayMessage, displayMessageWithIcon } from "/base/browser/popup/popup_menu_building.mjs";

import { extractRecord } from "../core/ancestry_extract_data.mjs";

import { extractRecordHtmlFromUrl } from "./ancestry_fetch.mjs";

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

var linkedRecordsData;
var expectedLinkedRecordCount = 0;
var receivedLinkedRecordCount = 0;
var linkedRecordFailureCount = 0;
var linkedRecordsFunction;

function resetStaticCounts() {
  expectedLinkedRecordCount = 0;
  receivedLinkedRecordCount = 0;
  linkedRecordFailureCount = 0;
}

function displayStatusMessage() {
  const baseMessage = "WikiTree Sourcer fetching additional records ...\n\n(This might take several seconds)...\n";

  let message = baseMessage;
  for (let record of linkedRecordsData.linkedRecords) {
    message += "\n'" + record.name + "' " + record.status;
  }
  displayMessage(message);
}

function displayLinkedRecordsFetchErrorsMessage(actionName) {
  let baseMessage = "During " + actionName + " some linked records could not be retreived.";
  baseMessage += "\nThis could be due to internet connectivity issues or server issues.";
  baseMessage += "\nPlease try again.\n";

  let message = baseMessage;
  for (let record of linkedRecordsData.linkedRecords) {
    message += "\n'" + record.name + "' " + record.status;
  }
  displayMessageWithIcon("warning", message);
}

function receiveFetchedRecord(response) {
  const baseMessage = "WikiTree Sourcer fetching additional records ...\n(This might take several seconds)...";

  //console.log("received response from extractRecordFromUrl message");
  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("No response from ancestry extractRecordFromUrl");
    console.log(chrome.runtime.lastError);
    displayMessageWithIcon("warning", "Error fetching record.");
    linkedRecordFailureCount++;
    receivedLinkedRecordCount++;
  } else {
    //console.log("received response:");
    //console.log(response);

    // find linkedRecord for this url
    let matchingRecord = undefined;
    for (let record of linkedRecordsData.linkedRecords) {
      if (record.link == response.recordUrl) {
        matchingRecord = record;
        break;
      }
    }

    if (response.success) {
      let extractedData = extractDataFromHtml(response.htmlText, response.recordUrl);

      if (matchingRecord) {
        matchingRecord.extractedData = extractedData;
        matchingRecord.status = "fetched";
      }
      receivedLinkedRecordCount++;
    } else {
      // ??
      console.log(
        "receiveFetchedRecord: Failed response from ancestry extractRecordFromUrl. recordUrl is: " + response.recordUrl
      );

      if (!matchingRecord.timeouts) {
        matchingRecord.timeouts = 0;
      }

      if (matchingRecord.timeouts < 3) {
        matchingRecord.timeouts++;
        matchingRecord.status = "retry " + matchingRecord.timeouts + " ...";
        setTimeout(function () {
          extractRecordFromUrl(matchingRecord.link, response.cacheTag);
        }, 1000);
      } else {
        matchingRecord.status = "failed";
        linkedRecordFailureCount++;
        receivedLinkedRecordCount++;
        console.log("receiveFetchedRecord: timed out. receivedLinkedRecordCount is: " + receivedLinkedRecordCount);
      }
    }
  }

  displayStatusMessage();

  if (receivedLinkedRecordCount == expectedLinkedRecordCount) {
    // if there were any failures then remember that for caller
    linkedRecordsData.linkedRecordFailureCount = linkedRecordFailureCount;
    linkedRecordsFunction(linkedRecordsData);
    resetStaticCounts();
  }
}

async function extractRecordFromUrlBg(recordUrl, cacheTag) {
  //console.log("extractRecordFromUrl");
  displayMessage("WikiTree Sourcer fetching additional records ...\n(This might take several seconds)...");

  chrome.runtime.sendMessage(
    {
      domain: "ancestry",
      type: "extractRecordFromUrl",
      recordUrl: recordUrl,
      cacheTag: cacheTag,
    },
    receiveFetchedRecord
  );
}

async function extractRecordFromUrl(recordUrl, cacheTag) {
  //console.log("extractRecordFromUrl");
  displayMessage("WikiTree Sourcer fetching additional records ...\n(This might take several seconds)...");

  let extractResult = await extractRecordHtmlFromUrl(recordUrl, cacheTag);
  receiveFetchedRecord(extractResult);
}

async function getDataForLinkedRecords(data, linkedRecords, processFunction) {
  resetStaticCounts();
  expectedLinkedRecordCount = linkedRecords.length;
  linkedRecordsFunction = processFunction;
  linkedRecordsData = data;

  linkedRecordsData.linkedRecords = [];
  for (let record of linkedRecords) {
    let linkedRecord = {
      name: record.name,
      link: record.link,
      status: "fetching...",
    };
    linkedRecordsData.linkedRecords.push(linkedRecord);
  }

  for (let record of linkedRecords) {
    extractRecordFromUrl(record.link, record.cacheTag);
  }

  displayStatusMessage();
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
        linkedRecords.push({ link: member.link, name: name, cacheTage: "" });
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
          cacheTag: "Child",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
          cacheTag: "Father",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
          cacheTag: "Mother",
        });
      }
    } else if (role == "Sibling") {
      let childLink = linkData["Siblings"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Siblings",
          cacheTag: "Siblings",
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
        linkedRecords.push({ link: member.link, name: name, cacheTage: "" });
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
          cacheTag: "Child",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
          cacheTag: "Father",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
          cacheTag: "Mother",
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
  displayLinkedRecordsFetchErrorsMessage,
};
