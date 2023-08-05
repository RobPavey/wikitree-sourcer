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

  let url = document.location.href;
  //console.log("doFetch, url is: " + url);

  let archive = "";
  let identifier = "";

  // Example record URL
  // https://www.openarch.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf
  // https://www.openarch.nl/zar:9035582F-0BCC-4640-8BC2-95DA8D148A9B

  if (/^https\:\/\/www\.openarch\.nl\/\w+\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/.test(url)) {
    archive = url.replace(/^https\:\/\/www\.openarch\.nl\/(\w+)\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/, "$1");
    if (!archive || archive == url) {
      archive = "";
    }
    identifier = url.replace(/^https\:\/\/www\.openarch\.nl\/\w+\:([a-zA-Z0-9\-]+)(?:\/\w\w)?\/?$/, "$1");
    if (!identifier || identifier == url) {
      identifier = "";
    }
  }

  //console.log("doFetch, archive is: " + archive);
  //console.log("doFetch, identifier is: " + identifier);

  if (!archive || !identifier) {
    return { success: false, errorCondition: "NotRecordURL" };
  }

  // e.g. https://api.openarch.nl/1.1/records/show.json?archive=frl&identifier=ddbcbbb4-6c3a-4fca-a222-505a70ac75bf
  let fetchUrl = "https://api.openarch.nl/1.1/records/show.json?archive=" + archive + "&identifier=" + identifier;

  //console.log("doFetch, fetchUrl is: " + fetchUrl);

  let fetchOptionsHeaders = {
    accept: "application/x-gedcomx-v1+json, application/json",
    "accept-language": "en",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  };

  let fetchOptions = {
    headers: fetchOptionsHeaders,
    body: null,
    method: "GET",
  };

  try {
    let response = await fetch(fetchUrl, fetchOptions);

    //console.log("doFetch, response.status is: " + response.status);

    if (response.status !== 200) {
      //console.log("Looks like there was a problem. Status Code: " + response.status);
      //console.log("Fetch URL is: " + fetchUrl);
      return {
        success: false,
        errorCondition: "FetchError",
        status: response.status,
      };
    }

    let jsonData = await response.text();

    //console.log("doFetch: response text is:");
    //console.log(jsonData);

    if (!jsonData || jsonData[0] != `{`) {
      console.log("The response text does not look like JSON");
      //console.log(jsonData);
      return { success: false, errorCondition: "NotJSON" };
    }

    const dataObj = JSON.parse(jsonData);

    //console.log("dataObj is:");
    //console.log(dataObj);

    // suport having multiple data objects for separate API queries
    let dataObjects = {
      dataObj: dataObj,
    };

    return { success: true, dataObjects: dataObjects };
  } catch (error) {
    console.log("fetch failed, error is:");
    console.log(error);
    console.log("Fetch URL is: " + fetchUrl);

    return { success: false, errorCondition: "Exception", exceptionObject: error };
  }
}

async function extractDataFromFetchAndRespond(document, dataObjects, options, sendResponse) {
  //console.log('extractDataFromFetchAndRespond entered');

  if (!isLoadedExtractDataModuleReady) {
    if (loadedExtractDataModuleFailed) {
      sendResponse({
        success: false,
        errorMessage: "Error loading extract data module",
      });
    }
    // dependencies not ready, wait a few milliseconds and try again
    else if (loadExtractDataModuleRetries < maxLoadModuleRetries) {
      loadExtractDataModuleRetries++;
      console.log("extractDataFromFetchAndRespond. Retry number: ", loadExtractDataModuleRetries);
      setTimeout(function () {
        extractDataFromFetchAndRespond(document, dataObjects, options, sendResponse);
      }, loadModuleTimeout);
      return true;
    } else {
      console.log("extractDataFromFetchAndRespond. Too many retries");
      sendResponse({
        success: false,
        errorMessage: "Extract data module never loaded",
      });
    }
    return false;
  }

  // Extract the data.
  let extractedData = loadedExtractDataModule.extractDataFromFetch(
    document,
    document.location.href,
    dataObjects,
    options
  );

  // respond with the type of content and the extracted data
  sendResponse({
    success: true,
    contentType: "openarch",
    extractedData: extractedData,
  });
}

async function doFetchAndSendResponse(sendResponse, options) {
  let result = await doFetch();

  if (result.success) {
    // Extract the data.
    extractDataFromFetchAndRespond(document, result.dataObjects, options, sendResponse);
  } else {
    if (result.errorCondition == "NotJSON" || result.errorCondition == "NotRecordURL") {
      // This is normal for some pages that could be records but are not.
      // For example:
      // https://www.familysearch.org/search/genealogies
      let extractedData = { pageType: "unknown" };
      sendResponse({
        success: true,
        contentType: "openarch",
        extractedData: extractedData,
      });
    } else if (result.errorCondition == "FetchError" && result.status == 401) {
      // This is normal if the login has expired, so don't raise an unexpected
      // error message. It will be handled in FS popup.
      let extractedData = { pageType: "unknown" };
      sendResponse({
        success: true,
        contentType: "openarch",
        extractedData: extractedData,
      });
    } else {
      // treat this as a serious error
      sendResponse({
        success: false,
        errorMessage: "Fetch failed. Status code: " + result.status + ", Error condition: " + result.errorCondition,
        exceptionObject: result.exceptionObject,
        wasFetchError: true,
        contentType: "openarch",
      });
    }
  }
}

function extractHandler(request, sendResponse) {
  doFetchAndSendResponse(sendResponse, request.options);
  return true; // will respond async
}

siteContentInit(`openarch`, `site/openarch/core/openarch_extract_data.mjs`, extractHandler);
