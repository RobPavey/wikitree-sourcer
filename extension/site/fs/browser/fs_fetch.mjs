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

async function fetchFsSourcesJson(sourceIdList, sessionId) {
  //console.log("fetchFsSourcesJson, sessionId is: " + sessionId);

  if (!sourceIdList || sourceIdList.length == 0) {
    return { success: false };
  }

  let fetchUrl = "https://www.familysearch.org/service/tree/links/sources/";

  let isFirstSource = true;
  for (let sourceId of sourceIdList) {
    if (isFirstSource) {
      isFirstSource = false;
    } else {
      fetchUrl += ",";
    }
    fetchUrl += sourceId;
  }

  fetchUrl += "?readExternalData=true";

  //console.log("fetchUrl is");
  //console.log(fetchUrl);

  let fetchOptionsHeaders = {
    accept: "application/x-gedcomx-v1+json, application/json",
    "accept-language": "en",
    from: "fsSearch.record.getGedcomX@familysearch.org",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    authorization: "Bearer " + sessionId,
  };

  let fetchOptions = {
    headers: fetchOptionsHeaders,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };

  try {
    let response = await fetch(fetchUrl, fetchOptions).catch((err) => {
      console.log("Fetch threw an exception, message is: " + err.message);
      console.log(err);
      return { success: false };
    });

    //console.log("response is");
    //console.log(response);

    // On Firefox it may return zero any time you use "no-cors"
    if (response.status !== 200) {
      console.log("fetchFsSourcesJson: Looks like there was a problem. Status Code: " + response.status);
      return {
        success: false,
        errorCondition: "FetchError",
        status: response.status,
        allowRetry: true,
      };
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
    } else {
      console.log("response does not look like JSON");
    }
  } catch (error) {
    console.log("fetch failed, error is:");
    console.log(error);
    return { success: false };
  }

  return { success: false };
}

async function fetchRecord(fetchUrl, sessionId) {
  //console.log("fetchRecord, fetchUrl is: " + fetchUrl);
  //console.log("fetchRecord, sessionId is: " + sessionId);

  if (!fetchUrl.includes("familysearch.org/")) {
    return { success: false };
  }

  fetchUrl = fetchUrl.replace(/\/familysearch.org/, "/www.familysearch.org");

  //console.log("doFetch, fetchUrl is: " + fetchUrl);

  let fetchOptionsHeaders = {
    accept: "application/x-gedcomx-v1+json, application/json",
    "accept-language": "en",
    from: "fsSearch.record.getGedcomX@familysearch.org",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    authorization: "Bearer " + sessionId,
  };

  let fetchOptions = {
    headers: fetchOptionsHeaders,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };

  try {
    let response = await fetch(fetchUrl, fetchOptions);

    //console.log("doFetch, response.status is: " + response.status);

    if (response.status !== 200) {
      console.log("fetchRecord: Looks like there was a problem. Status Code: " + response.status);
      return {
        success: false,
        errorCondition: "FetchError",
        status: response.status,
        allowRetry: true,
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

    // support having multiple data objects for separate API queries
    let dataObjects = {
      dataObj: dataObj,
    };

    let result = {};
    result.dataObjects = dataObjects;
    result.success = true;
    return result;
  } catch (error) {
    console.log("fetch failed, error is:");
    console.log(error);
    return { success: false };
  }
}

export { fetchFsSourcesJson, fetchRecord };
