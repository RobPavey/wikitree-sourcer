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

import { CitationParser } from "../../../base/core/citation_parser.mjs";
import { buildScotlandsPeopleContextSearchData } from "./scotp_context_menu.mjs";

function transformPlainText(plainText, phase, options) {
  if (!plainText) {
    return undefined;
  }

  if (phase != 1) {
    return undefined;
  }

  let scotpResult = buildScotlandsPeopleContextSearchData(plainText);
  if (scotpResult.messages) {
    console.log(scotpResult.messages);
  }

  if (!scotpResult.searchData) {
    return undefined;
  }

  let result = {
    isComplexSearchData: true,
    searchDataList: [],
    siteName: "scotp",
    reuseTab: false,
    permissionsMessage: "Sourcer needs to load a content script on the Scotlands People site to complete the search",
  };

  // for scotp we have three separate objects that we want saved to storage

  let searchData = scotpResult.searchData;

  let formData = searchData.formData;
  let refineData = searchData.refineData;
  let refNum = searchData.refNum;
  let recordType = searchData.recordType;

  const searchUrl = "https://www.scotlandspeople.gov.uk/search-records/" + formData.urlPart;

  const scotpSearchData = {
    timeStamp: Date.now(),
    url: searchUrl,
    formData: formData,
  };
  result.searchDataList.push({ scotpSearchData: scotpSearchData });

  if (refineData && refineData.fields.length > 0) {
    const scotpSearchRefineData = {
      timeStamp: Date.now(),
      url: searchUrl,
      formData: refineData,
    };
    result.searchDataList.push({ scotpSearchRefineData: scotpSearchRefineData });
  }

  if (refNum) {
    const scotpSearchRefNumData = {
      timeStamp: Date.now(),
      url: searchUrl,
      refNum: refNum,
      recordType: recordType,
    };
    result.searchDataList.push({ scotpSearchRefNumData: scotpSearchRefNumData });
  }

  return result;
}

export { transformPlainText };
