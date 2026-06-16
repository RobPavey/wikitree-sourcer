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

  // check for Victorian BDM (do this last because another site citation might have the given name
  // Victoria in it).
  if (phase != 2) {
    return undefined;
  }

  if (!lcText.includes("vic")) {
    return undefined;
  }

  //console.log("looks like Victorian BDM, lcText is:");
  //console.log(lcText);

  let parser = new CitationParser(lcText);

  const extractInput = {
    defaultToYearFirst: false,
    startYear: 1800,
  };
  let yearAndNum = parser.extractYearAndRegistrationNumberFromText(extractInput);

  if (!yearAndNum) {
    return undefined;
  }

  let regNum = yearAndNum.regNum;
  let regYear = yearAndNum.regYear;

  let fieldData = {};
  fieldData["historicalSearch-events-registrationNumber-number"] = regNum;
  fieldData["historicalSearch-events-registrationNumber-year"] = regYear;

  // see if we can decide whether to search for births, deaths or marriages
  // Exxample text:
  // Victoria State Government, Registry of Births, Deaths and Marriages Victoria. Richard Goodall Elrington. Birth. Registration number 3218 / 1870. Father: Name. Mother: Name. District: Place. Link to search page
  let birthOccurrences = (lcText.match(/birth/g) || []).length;
  let deathOccurrences = (lcText.match(/death/g) || []).length;
  let marriageOccurrences = (lcText.match(/marriage/g) || []).length;

  //console.log("birthOccurrences is '" + birthOccurrences + "'");
  //console.log("deathOccurrences is '" + deathOccurrences + "'");
  //console.log("marriageOccurrences is '" + marriageOccurrences + "'");

  if (birthOccurrences && birthOccurrences > deathOccurrences && birthOccurrences > marriageOccurrences) {
    fieldData["historicalSearch-events-birth"] = true;
  } else if (deathOccurrences && deathOccurrences > birthOccurrences && deathOccurrences > marriageOccurrences) {
    fieldData["historicalSearch-events-death"] = true;
  } else if (marriageOccurrences && marriageOccurrences > birthOccurrences && marriageOccurrences > deathOccurrences) {
    fieldData["historicalSearch-events-marriage"] = true;
  }

  let link = "https://my.rio.bdm.vic.gov.au/efamily-history/-";

  const searchData = {
    timeStamp: Date.now(),
    url: link,
    fieldData: fieldData,
  };

  const result = {
    searchData: searchData,
    siteName: "vicbdm",
    reuseTab: options.search_vicbdm_reuseExistingTab,
    permissionsMessage:
      "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
  };

  return result;
}

export { transformPlainText };
