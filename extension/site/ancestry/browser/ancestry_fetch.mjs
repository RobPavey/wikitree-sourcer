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

import {
  registerAsyncCacheTag,
  getCachedAsyncResult,
  addCachedAsyncResult,
} from "../../../base/core/async_result_cache.mjs";

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

async function fetchAncestrySharingDataObj(ed) {
  let result = { success: false, dataObj: undefined };
  if (!ed) {
    return result;
  }

  const cacheTag = "AncestryFetchSharingObj";
  registerAsyncCacheTag(cacheTag, 30);

  const recordUrl = ed.url;
  let cachedResult = await getCachedAsyncResult(cacheTag, recordUrl);
  if (cachedResult) {
    //console.log("fetchAncestrySharingDataObj, found in cache");
    return cachedResult;
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
      //console.log("fetchAncestrySharingDataObj, generated and saving to cache");
      addCachedAsyncResult(cacheTag, recordUrl, result);
    }
  }

  //console.log("result is:");
  //console.log(result);

  return result;
}

async function fetchAncestryRecordPage(recordUrl) {
  let result = { success: false, recordUrl: recordUrl };

  if (!recordUrl) {
    return result;
  }

  try {
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
      // it would be nice if the response told us how long to wait but it does not
      // as of 6 Nov 2023
      //console.log("Full response is : ");
      //console.log(response);
      result.allowRetry = true;
      result.statusCode = response.status;
      return result;
    }

    //console.log("response is");
    //console.log(response);

    if (response.url && response.url.includes("offers/join")) {
      // the user does not have a subscription that includes this record
      result.errorStatus = "subscriptionHasNoAccess";
      return result;
    }

    // !!!!!!!!!!!!!!!!! TEMP HACK
    //if (response.url) {
    //  if (response.url.includes("22564932") || response.url.includes("8049710")) {
    //    result.errorStatus = "test error";
    //    return result;
    //  }
    //}

    // Examine the text in the response
    let data = await response.text();

    //console.log("data is:");
    //console.log(data);

    // There are different ways to try to parse it.

    result.htmlText = data;
    result.success = true;

    //console.log("result is: ");
    //console.log(result);
  } catch (error) {
    console.log("WikiTree Sourcer:: fetchAncestryRecordPage, failed. Error message is: " + error.message);
  }

  return result;
}

async function extractRecordHtmlFromUrl(recordUrl) {
  //console.log("extractRecordFromUrl, recordUrl is: " + recordUrl);

  let result = await fetchAncestryRecordPage(recordUrl);

  //console.log("extractRecordFromUrl, sending response: ");
  //console.log(result);

  return result;
}

export { fetchAncestrySharingDataObj, extractRecordHtmlFromUrl };
