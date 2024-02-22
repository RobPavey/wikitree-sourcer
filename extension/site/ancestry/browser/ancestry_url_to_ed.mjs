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
import {
  registerAsyncCacheTag,
  getCachedAsyncResult,
  addCachedAsyncResult,
} from "../../../base/core/async_result_cache.mjs";

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

async function getExtractedDataFromRecordUrl(recordUrl) {
  //console.log("getExtractedDataFromRecordUrl: recordUrl = " + recordUrl);
  const cacheTag = "AncestryFetchRecord";
  const oneDayInMs = 24 * 1000 * 60 * 60;
  registerAsyncCacheTag(cacheTag, 100, oneDayInMs);

  let cachedExtractedData = await getCachedAsyncResult(cacheTag, recordUrl);
  if (cachedExtractedData) {
    let result = { success: true, extractedData: cachedExtractedData };
    //console.log("getExtractedDataFromRecordUrl: found cached result:");
    //console.log(result);
    return result;
  }

  let extractResult = await extractRecordHtmlFromUrl(recordUrl);

  //console.log("getExtractedDataFromRecordUrl: extractResult is:");
  //console.log(extractResult);

  if (extractResult.success) {
    let extractedData = extractDataFromHtml(extractResult.htmlText, recordUrl);
    addCachedAsyncResult(cacheTag, recordUrl, extractedData);

    delete extractResult.htmlText;
    extractResult.extractedData = extractedData;
  }

  //console.log("getExtractedDataFromRecordUrl: returning:");
  //console.log(extractResult);

  return extractResult;
}

export { getExtractedDataFromRecordUrl };
