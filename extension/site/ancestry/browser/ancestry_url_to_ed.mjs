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

import { extractRecordHtmlFromUrl, extractJsonFromUrl } from "./ancestry_fetch.mjs";
import {
  registerAsyncCacheTag,
  getCachedAsyncResult,
  addCachedAsyncResult,
} from "../../../base/core/async_result_cache.mjs";

function extractDataFromHtml(htmlText, url) {
  //console.log("extractDataFromHtml, url is: " + url);
  //console.log("extractDataFromHtml, htmlText is: ");
  //console.log(htmlText);

  let parser = new DOMParser();
  let document = parser.parseFromString(htmlText, "text/html");
  //console.log("document is:");
  //console.log(document);

  let extractedData = {};
  extractedData.url = url;
  detectPageType(document, extractedData, url);

  if (extractedData.pageType == "record") {
    // Note: this will not be loaded if popup.html was loaded rather than ancestry_popup.html
    // It would be better to use a message to content for this
    if (extractRecord) {
      extractRecord(document, url, extractedData);
    }
  } else if (extractedData.pageType == "image") {
    // Note: this will not be loaded if popup.html was loaded rather than ancestry_popup.html
    // It would be better to use a message to content for this
    if (extractImage) {
      extractImage(document, url, extractedData);
    }
  }
  return extractedData;
}

async function getExtractedDataFromRecordUrl(recordUrl) {
  //console.log("getExtractedDataFromRecordUrl: recordUrl = " + recordUrl);
  const cacheTag = "AncestryFetchRecord";
  const oneDayInMs = 24 * 1000 * 60 * 60;
  registerAsyncCacheTag(cacheTag, 100, oneDayInMs);

  let cachedExtractedData = await getCachedAsyncResult(cacheTag, recordUrl);
  if (cachedExtractedData) {
    let result = { success: true, wasInCache: true, recordUrl: recordUrl, extractedData: cachedExtractedData };
    //console.log("getExtractedDataFromRecordUrl: found cached result:");
    //console.log(result);
    return result;
  }

  let extractResult = await extractRecordHtmlFromUrl(recordUrl);

  //console.log("getExtractedDataFromRecordUrl: extractResult is:");
  //console.log(extractResult);

  if (extractResult.success) {
    let url = recordUrl;
    if (extractResult.redirected) {
      url = extractResult.redirectedUrl;
    }

    let extractedData = extractDataFromHtml(extractResult.htmlText, url);

    // special case code to fetch the collection title if missing for an image
    // This can happen when previewing an image source on person page
    if (extractedData.pageType == "image" && !extractedData.titleCollection && extractedData.pId) {
      if (extractedData.dbId) {
        let fetchUrl = "https://www.ancestry.com/imageviewer/api/collection/id";
        fetchUrl += "?pId=" + extractedData.pId;
        fetchUrl += "&dbId=" + extractedData.dbId;
        fetchUrl += "&isInstitutionalUser=false&treespage=1";

        let json = await extractJsonFromUrl(fetchUrl);
        console.log("json is", json);
        if (json) {
          if (json.collectionTitle) {
            extractedData.titleCollection = json.collectionTitle;
          }
        }
      }
    }

    addCachedAsyncResult(cacheTag, recordUrl, extractedData);

    extractResult.extractedData = extractedData;
  }

  //console.log("getExtractedDataFromRecordUrl: returning:");
  //console.log(extractResult);

  return extractResult;
}

export { getExtractedDataFromRecordUrl };
