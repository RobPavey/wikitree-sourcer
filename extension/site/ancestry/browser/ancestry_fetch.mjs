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

import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function fetchAncestrySharingDataObjGivenIds(imageDbId, imageRecordId, recordId, url) {
  let mode = "cors";

  let domain = url.replace(/https?\:\/\/[^\.]+\.([^\/]+)\/.*/, "$1");
  if (!domain || domain == url) {
    domain = "ancestry.com";
  }

  //console.log("domain is: " + domain);

  // NOTE: It appears that things are working fine always using ancestry.com as the domain.
  // It is possible that changing to sometimes use ancestrylibrary.com would break things.
  // It is reported that creating sharing links from ancestrylibrary.com is working when using
  // ancestry.com as the domain. So for now always use ancestry.com
  // NO... I tested by actually signing out of ancestry.com and using ancestry.co.uk and it
  // could not build the link when I was setting domain here to ancestry.com.
  //domain = "ancestry.com";

  const callbackNamePart1Start = "31108426";
  const callbackNamePart1End = getRandomInt(100000000000, 999999999999);
  const callbackNamePart1 = callbackNamePart1Start + callbackNamePart1End;
  const callbackNamePart2 = getRandomInt(1621100000000, 1659999999999);
  const callbackName = "jQuery" + callbackNamePart1 + "_" + callbackNamePart2;

  let fetchUrl =
    "https://www." +
    domain +
    "/sharing/shares/create?callback=" +
    callbackName +
    "&locale=en-US&referrer%5Bclient%5D=website&referrer%5Bpage%5D=iiv-share-webpart&collection_id=" +
    imageDbId + // extractedUrlInfo.dbId
    "&image_id=" +
    imageRecordId; // extractedUrlInfo.imageId

  if (recordId) {
    fetchUrl += "&record_id=" + recordId; // extractedUrlInfo.pId
  }

  fetchUrl += "&_=" + callbackNamePart2;

  let response = await fetch(fetchUrl, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
    },
    referrer: "https://search." + domain + "/",
    referrerPolicy: "origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: mode,
    credentials: "include",
  }).catch((err) => {
    console.log("Fetch threw an exception, message is: " + err.message);
    console.log(err);
    return { success: false };
  });

  // On Firefox it may return zero any time you use "no-cors"
  if (response.status !== 200) {
    console.log("Looks like there was a problem. Status Code: " + response.status);
    return { success: false };
  }

  //console.log("response is");
  //console.log(response);

  // Examine the text in the response
  let data = await response.text();

  //console.log("data is:");
  //console.log(data);

  if (data.startsWith(callbackName)) {
    const jsonData = data.substring(callbackName.length + 1, data.length - 2);
    const dataObj = JSON.parse(jsonData);

    //console.log("dataObj is:");
    //console.log(dataObj);

    return { success: true, dataObj: dataObj };
  }

  return { success: false };
}

async function getLastSharingData() {
  return await getLocalStorageItem("ancestry_lastSharingData");
}

async function setLastSharingData(lastSharingData) {
  let items = { ancestry_lastSharingData: lastSharingData };
  chrome.storage.local.set(items);
}

async function fetchAncestrySharingDataObj(ed) {
  let result = { success: false, dataObj: undefined };

  // If the request is the same as the last one made then reuse the result to avoid sending too
  // many fetch requests to server.
  let lastSharingData = await getLastSharingData();
  if (lastSharingData && ed.url == lastSharingData.url) {
    //console.log("fetchAncestrySharingDataObj, reusing result:");
    //console.log(lastSharingData.dataObj);
    result.success = true;
    result.dataObj = lastSharingData.dataObj;
    return result;
  }

  let sharingData = {
    dbId: null,
    recordId: null,
    personId: null,
    url: ed.url,
    dataObj: null,
  };

  if (ed.pageType == "record") {
    if (ed.imageUrl) {
      sharingData.dbId = ed.imageDbId;
      sharingData.recordId = ed.imageRecordId;
      sharingData.personId = ed.recordId;
    }
  } else if (ed.pageType == "image") {
    sharingData.dbId = ed.dbId;
    sharingData.recordId = ed.recordId;
    sharingData.personId = ed.pid;
  }

  //console.log("sharingData is:");
  //console.log(sharingData);

  if (sharingData.dbId && sharingData.recordId) {
    result = await fetchAncestrySharingDataObjGivenIds(
      sharingData.dbId,
      sharingData.recordId,
      sharingData.personId,
      sharingData.url
    );
    //console.log("fetchAncestrySharingDataObj, result is");
    //console.log(sharingData.dataObj);

    if (result.success && result.dataObj) {
      sharingData.dataObj = result.dataObj;
      setLastSharingData(sharingData);
    }
  }

  //console.log("result is:");
  //console.log(result);

  return result;
}

async function getRecordPageCache() {
  let recordPageCache = {};
  let item = await getLocalStorageItem("ancestry_recordPageCache");
  if (item) {
    recordPageCache = item;
  }
  return recordPageCache;
}

async function setRecordPageCache(recordPageCache) {
  let items = { ancestry_recordPageCache: recordPageCache };
  chrome.storage.local.set(items);
}

async function fetchAncestryRecordPage(recordUrl, cacheTag) {
  let result = { success: false, recordUrl: recordUrl, cacheTag: cacheTag };

  if (!recordUrl) {
    return result;
  }

  try {
    let ancestryRecordPageCache = await getRecordPageCache();
    //console.log("fetchAncestryRecordPage, cacheTag is: " + cacheTag);

    if (cacheTag) {
      //console.log("fetchAncestryRecordPage, ancestryRecordPageCache is:");
      //console.log(ancestryRecordPageCache);

      let cache = ancestryRecordPageCache[cacheTag];

      //console.log("fetchAncestryRecordPage, cache is: ");
      //console.log(cache);

      if (cache && cache.recordUrl == recordUrl) {
        return cache.result;
      }
    }

    let mode = "cors";

    let domain = recordUrl.replace(/https?\:\/\/[^\.]+\.([^\/]+)\/.*/, "$1");
    if (!domain || domain == recordUrl) {
      domain = "ancestry.com";
    }

    //console.log("domain is: " + domain);

    let response = await fetch(recordUrl, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
      },
      referrer: "https://search." + domain + "/",
      referrerPolicy: "origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: mode,
      credentials: "include",
    }).catch((err) => {
      console.log("Fetch threw an exception, message is: " + err.message);
      console.log(err);
      return result; // Note this returns from this catch function, not fetchAncestryRecordPage
    });

    // On Firefox it may return zero any time you use "no-cors"
    if (!response || response.status !== 200) {
      console.log("Looks like there was a problem. Status Code: " + response.status);
      return result;
    }

    //console.log("response is");
    //console.log(response);

    if (response.url && response.url.includes("offers/join")) {
      // the user does not have a subscription that includes this record
      result.errorStatus = "subscriptionHasNoAccess";
      return result;
    }

    // Examine the text in the response
    let data = await response.text();

    //console.log("data is:");
    //console.log(data);

    // There are different ways to try to parse it.

    result.htmlText = data;
    result.success = true;

    //console.log("result is: ");
    //console.log(result);

    if (cacheTag) {
      let cache = { recordUrl: recordUrl, result: result };
      ancestryRecordPageCache[cacheTag] = cache;
      setRecordPageCache(ancestryRecordPageCache);
    }
  } catch (error) {
    console.log("WikiTree Sourcer:: fetchAncestryRecordPage, failed. Error message is: " + error.message);
  }

  return result;
}

async function extractRecordHtmlFromUrl(recordUrl, cacheTag) {
  //console.log("extractRecordFromUrl, recordUrl is: " + recordUrl);

  let result = await fetchAncestryRecordPage(recordUrl, cacheTag);

  //console.log("extractRecordFromUrl, sending response: ");
  //console.log(result);

  return result;
}

export { fetchAncestrySharingDataObj, extractRecordHtmlFromUrl };
