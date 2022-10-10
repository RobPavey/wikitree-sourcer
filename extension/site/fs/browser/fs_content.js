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

async function doFetch() {

  //console.log('doFetch, document.location is: ' + document.location);

  let fetchType = "record";

  let fetchUrl = document.location.href;
  //console.log('doFetch, fetchUrl is: ' + fetchUrl);

  if (fetchUrl.indexOf("/search/record/results?") != -1) {
    //console.log('doFetch, looks like a search page, checking sidebar');
    // this looks like a search page, see if a record is selected in sidebar
    let viewRecord = document.querySelector('a[data-testid=viewSimilarRecordButton]');
    if (viewRecord) {
      //console.log("found view record");
      let text = viewRecord.textContent;
      let viewRecordUrl = viewRecord.getAttribute("href");
      if (viewRecordUrl) {
        // strangely on firefox viewRecordUrl can be something like:
        // /ark:/61903/1:1:J39Y-3Q6
        // while on Chrome it is:
        // https://www.familysearch.org/ark:/61903/1:1:J39Y-3Q6
        // Recently (25 May 2022) on Chrome it looks like:
        // /search/ark:/61903/1:1:QVJP-4T6V

        //console.log("viewRecordUrl = " + viewRecordUrl);

        if (viewRecordUrl.startsWith("/ark:/") || viewRecordUrl.startsWith("/search/ark:/")) {
          viewRecordUrl = "https://www.familysearch.org" + viewRecordUrl;
        }

        fetchUrl = viewRecordUrl;
      }
    }
  }
  else if (fetchUrl.startsWith("https://www.familysearch.org/tree/person/details/")) {
    let personId = fetchUrl.replace("https://www.familysearch.org/tree/person/details/", "");
    let slashOrQueryIndex = personId.search(/[/?]/);
    if (slashOrQueryIndex != -1) {
      personId = personId.substring(0, slashOrQueryIndex);
    }

    // API URL looks like this: https://api.familysearch.org/platform/tree/persons/K2F9-F5Z
    if (personId) {
      fetchUrl = "https://www.familysearch.org/platform/tree/persons/" + personId + "?relatives";
      fetchType = "person";
    }
  }

  // This seems like a recent change on FamilySearch (noticed on 25 May 2022).
  // Sometimes the URL contains "/search/" and this stops the fetch working
  if (fetchUrl.indexOf("www.familysearch.org/search/ark:/") != -1) {
    fetchUrl = fetchUrl.replace("www.familysearch.org/search/ark:/", "www.familysearch.org/ark:/")
  }

  //console.log('doFetch, fetchUrl is: ' + fetchUrl);

  let fetchOptionsHeaders = {
    "accept": "application/x-gedcomx-v1+json, application/json",
    "accept-language": "en",
    "from": "fsSearch.record.getGedcomX@familysearch.org",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  };

  let fetchOptions = {
    "headers": fetchOptionsHeaders,
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  };

  try {
    let response = await fetch(fetchUrl, fetchOptions);  

    //console.log('doFetch, response.status is: ' + response.status);


    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return {success: false, errorCondition: "FetchError", status: response.status};
    }

    let jsonData = await response.text();

    //console.log("doFetch: response text is:");
    //console.log(jsonData);

    if (!jsonData || jsonData[0] != `{`) {
      console.log('The response text does not look like JSON');
      //console.log(jsonData);
      return {success: false, errorCondition: "NotJSON"};
    }

    const dataObj = JSON.parse(jsonData);

    //console.log("dataObj is:");
    //console.log(dataObj);

    return {success: true, dataObj: dataObj, fetchType: fetchType};
  }
  catch (error) {
    console.log("fetch failed, error is:");
    console.log(error);
    return {success: false};
  }
}

async function extractDataFromFetchAndRespond(document, dataObj, fetchType,  options, sendResponse) {

  //console.log('extractDataFromFetchAndRespond entered');

  if (!isLoadedExtractDataModuleReady) {
    if (loadedExtractDataModuleFailed) {
      sendResponse({success: false, errorMessage: "Error loading extract data module"});
    }
    // dependencies not ready, wait a few milliseconds and try again
    else if (loadExtractDataModuleRetries < maxLoadModuleRetries) {
      loadExtractDataModuleRetries++;
      console.log('extractDataFromFetchAndRespond. Retry number: ', loadExtractDataModuleRetries);
      setTimeout(
        function() {extractDataFromFetchAndRespond(document, dataObj, options, sendResponse); },
        loadModuleTimeout
      );
      return true;
    }
    else {
      console.log('extractDataFromFetchAndRespond. Too many retries');
      sendResponse({success: false, errorMessage: "Extract data module never loaded"});
    }
    return false;
  }

  // Extract the data.
  let extractedData = loadedExtractDataModule.extractDataFromFetch(document, dataObj, fetchType, options);

  // respond with the type of content and the extracted data
  sendResponse({success: true, contentType: "fs", extractedData: extractedData});
}

async function doFetchAndSendResponse(sendResponse, options) {
  let result = await doFetch();

  if (result.success) {
    // Extract the data.
    extractDataFromFetchAndRespond(document, result.dataObj, result.fetchType, options, sendResponse);
  }
  else {
    if (result.errorCondition == "NotJSON") {
      // This is normal for some pages that could be records but are not.
      // For example:
      // https://www.familysearch.org/search/genealogies
      let extractedData = {pageType: "unknown"};
      sendResponse({success: true, contentType: "fs", extractedData: extractedData});
    }
    else if (result.errorCondition == "FetchError" && result.status == 401) {
      // This is normal if the login has expired, so don't raise an unexpected
      // error message. It will be handled in FS popup.
      let extractedData = {pageType: "unknown"};
      sendResponse({success: true, contentType: "fs", extractedData: extractedData});
    }
    else {
      // treat this as a serious error
      sendResponse({success: false, errorMessage: "Fetch failed", contentType: "fs"});
    }
  }
}

function shouldUseFetch() {
  // There are many kinds of pages on the FamilySearch site.
  // We only want to use fetch for record pages (and not images)
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

  if (location.href.startsWith("https://www.familysearch.org/tree/person/details/")) {
    useFetch = true;
  }
  else {
    let main = document.querySelector("#main");
    if (main) {
      //console.log("shouldUseFetch, main found");
      if (main.getAttribute("aria-label") == "Main Content") {
        //console.log("shouldUseFetch, aria-label of Main Content found");

        useFetch = true;
      }
    }
  }

  //console.log("shouldUseFetch, returning useFetch = " + useFetch);

  return useFetch;
}

function extractHandler(request, sendResponse) {
  const useFetch = shouldUseFetch();

  //console.log("received extract request, useFetch = " + useFetch);

  if (useFetch) {
    // extract the data via a fetch thatreturns JSON data
    doFetchAndSendResponse(sendResponse, request.options);
    return true;  // will respond async
  }
  else {
    // Extract the data via DOM scraping
    let isAsync = extractDataAndRespond(document, location.href, "fs", sendResponse);
    if (isAsync) {
      return true;
    }
  }
}

siteContentInit(`fs`,
  `site/fs/core/fs_extract_data.mjs`,
  extractHandler
);
