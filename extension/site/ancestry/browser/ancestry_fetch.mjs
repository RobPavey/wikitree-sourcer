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

  let fetchUrl = "https://www." + domain + "/sharing/shares/create/v2";

  //console.log("fetchUrl is");
  //console.log(fetchUrl);

  const postData = {
    collection_id: imageDbId,
    cta_view_original_url: url,
    image_id: imageRecordId,
    locale: "en-US",
    record_id: recordId,
    referrer_client: "LIVE",
    shared_page_url: url,
  };

  let response = await fetch(fetchUrl, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
    },
    referrer: "https://search." + domain + "/",
    referrerPolicy: "origin-when-cross-origin",
    body: JSON.stringify(postData),
    method: "POST",
    mode: mode,
    credentials: "include",
  }).catch((err) => {
    console.log("Fetch threw an exception, message is: " + err.message);
    console.log(err);
    return { success: false };
  });

  //console.log("response is");
  //console.log(response);

  // On Firefox it may return zero any time you use "no-cors"
  if (response.status !== 200) {
    console.log("Looks like there was a problem. Status Code: " + response.status);
    return { success: false };
  }

  // Examine the text in the response
  let data = await response.text();

  //console.log("data is:");
  //console.log(data);

  if (data.startsWith(`{`)) {
    const jsonData = data;
    const dataObj = JSON.parse(jsonData);

    //console.log("dataObj is:");
    //console.log(dataObj);

    if (dataObj) {
      return { success: true, dataObj: dataObj };
    }
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

var recordPageCache = undefined;

async function getRecordPageCache() {
  if (!recordPageCache) {
    recordPageCache = {};
    console.log("getRecordPageCache, calling getLocalStorageItem");
    let item = await getLocalStorageItem("ancestry_recordPageCache");
    if (item) {
      recordPageCache = item;
    }
  }
  return recordPageCache;
}

const maxCacheLength = 30;

async function setRecordPageCache(recordPageCache) {
  let items = { ancestry_recordPageCache: recordPageCache };
  chrome.storage.local.set(items);
}

async function cacheRecordPage(cacheTag, recordUrl, result) {
  if (cacheTag) {
    let ancestryRecordPageCache = await getRecordPageCache();

    let existingCache = ancestryRecordPageCache[cacheTag];
    if (existingCache && Array.isArray(existingCache)) {
      if (existingCache.length >= maxCacheLength) {
        existingCache.shift(); // remove the first element
      }
      existingCache.push({ recordUrl: recordUrl, result: result });
    } else {
      let cache = [{ recordUrl: recordUrl, result: result }];
      ancestryRecordPageCache[cacheTag] = cache;
    }

    setRecordPageCache(ancestryRecordPageCache);
  }
}

async function getCachedRecordPage(cacheTag, recordUrl) {
  let ancestryRecordPageCache = await getRecordPageCache();
  console.log("getCachedRecordPage, cacheTag is: " + cacheTag + ", recordUrl is: " + recordUrl);

  if (cacheTag) {
    console.log("getCachedRecordPage, ancestryRecordPageCache is:");
    console.log(ancestryRecordPageCache);

    let cache = ancestryRecordPageCache[cacheTag];

    console.log("getCachedRecordPage, cache is: ");
    console.log(cache);

    if (cache && Array.isArray(cache) && cache.length > 0) {
      for (let index = cache.length - 1; index > 0; index--) {
        let cacheEntry = cache[index];
        if (cacheEntry.recordUrl == recordUrl) {
          console.log("getCachedRecordPage, match found");
          return cacheEntry.result;
        }
      }
    }
  }

  return undefined;
}

async function fetchAncestryRecordPage(recordUrl, cacheTag) {
  let result = { success: false, recordUrl: recordUrl, cacheTag: cacheTag };

  if (!recordUrl) {
    return result;
  }

  try {
    let cachedResult = await getCachedRecordPage(cacheTag, recordUrl);
    if (cachedResult) {
      return cachedResult;
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
      result.allowRetry = true;
      return result; // Note this returns from this catch function, not fetchAncestryRecordPage
    });

    if (chrome.runtime.lastError) {
      console.log("LastError set on fetch");
      console.log(chrome.runtime.lastError);
      result.allowRetry = true;
      return result;
    }

    // On Firefox it may return zero any time you use "no-cors"
    if (!response || response.status !== 200) {
      console.log("Looks like there was a problem. Status Code: " + response.status);
      result.allowRetry = true;
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

    cacheRecordPage(cacheTag, recordUrl, result);
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
