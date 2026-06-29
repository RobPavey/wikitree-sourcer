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

function transformPlainText(plainText, phase, options) {
  if (!plainText) {
    return undefined;
  }

  let lcText = plainText.toLowerCase();

  // check for NSW BDM on phase 1
  if (phase != 1) {
    return undefined;
  }

  // To be NSW BDM we need some identifiers
  if (!(lcText.includes("nsw") || lcText.includes("n.s.w.") || lcText.includes("new south wales"))) {
    return undefined;
  }

  if (
    !(lcText.includes("bdm") || lcText.includes("birth") || lcText.includes("death") || lcText.includes("marriage"))
  ) {
    return undefined;
  }

  let parser = new CitationParser(lcText);
  const extractInput = {
    defaultToYearFirst: false,
    startYear: 1700,
  };
  let yearAndNum = parser.extractYearAndRegistrationNumberFromText(extractInput);

  if (!yearAndNum) {
    return undefined;
  }

  let regNum = yearAndNum.regNum;
  let regYear = yearAndNum.regYear;

  // see if we can decide whether to search for births, deaths or marriages
  let birthOccurrences = (lcText.match(/birth/g) || []).length;
  let deathOccurrences = (lcText.match(/death/g) || []).length;
  let marriageOccurrences = (lcText.match(/marriage/g) || []).length;

  birthOccurrences += (lcText.match(/born/g) || []).length;
  deathOccurrences += (lcText.match(/died/g) || []).length;
  marriageOccurrences += (lcText.match(/married/g) || []).length;

  //console.log("birthOccurrences is '" + birthOccurrences + "'");
  //console.log("deathOccurrences is '" + deathOccurrences + "'");
  //console.log("marriageOccurrences is '" + marriageOccurrences + "'");

  let link = "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/";
  let searchType = "";

  let baseName = "";
  if (birthOccurrences && birthOccurrences > deathOccurrences && birthOccurrences > marriageOccurrences) {
    link += "births";
    searchType = "Births";
    baseName = "searchSwitch:birthContainer:birthIdSearchSwitch:birthIdSearchContainer:";
  } else if (deathOccurrences && deathOccurrences > birthOccurrences && deathOccurrences > marriageOccurrences) {
    link += "deaths";
    searchType = "Deaths";
    baseName = "searchSwitch:deathContainer:deathIdSearchSwitch:deathIdSearchContainer:";
  } else if (marriageOccurrences && marriageOccurrences > birthOccurrences && marriageOccurrences > deathOccurrences) {
    link += "marriages";
    searchType = "Marriages";
    baseName = "searchSwitch:marriageContainer:marriageIdSearchSwitch:marriageIdSearchContainer:";
  } else {
    return undefined;
  }

  let fieldData = {};
  fieldData["regNumber:regNumber"] = regNum;
  fieldData["regNumber:regYear"] = regYear;

  const searchData = {
    timeStamp: Date.now(),
    url: link,
    baseName: baseName,
    fieldData: fieldData,
    searchType: searchType,
    isRegNumSearch: true,
  };

  const result = {
    searchData: searchData,
    siteName: "nswbdm",
    reuseTab: options.search_nswbdm_reuseExistingTab,
    permissionsMessage:
      "To perform a search on NSW BDM a content script needs to be loaded on the bdm.nsw.gov.au search page.",
  };

  return result;
}

export { transformPlainText };
