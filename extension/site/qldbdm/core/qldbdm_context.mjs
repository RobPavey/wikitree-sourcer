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

import { CitationParser, doesTextMatchForContextPhase } from "../../../base/core/citation_parser.mjs";

const phaseMatches = [
  [[/Queensland \w+ Index/i], [/Queensland Government/i], [/Queensland .* Registration/i]],
  [[/Queensland/i]],
  [[/qld/i]],
];

const removeMatches = [
  // e.g. "(Genealogy SA, https://www.genealogysa.org.au : accessed 11 May 2020)
  /\([^\)]*(?:accessed|viewed|retrieved)[^\)]+\)/i,
  // e.g. "Daly 143/400, accessed 10 May 2026 via Genealogy SA"
  /(?:accessed|viewed|retrieved)\s+(?:\d\d?\s+)(?:[a-z]+\s+)?\d\d\d\d\W/i,
  // remove year ranges. E.g.:
  // Marriage: "Australia, Marriage Index, 1788-1950"
  // Australia, Marriage Index, 1788-1950; Page number: 877
  /\d\d\d\d-\d\d\d\d/gi,
  // remove this so it doesn't confuse type
  /Births, Deaths(?:,| and) Marriages/i,
];

function getReferenceNumber(parser, fieldData) {
  const registrationDetailsExtractInput = {
    wholeText: {
      matches: [
        // e.g.: , 1892/C/171
        /(\d\d\d\d\/[A-C]\/\d+)/i,
      ],
    },
  };
  let details = parser.extractMatchingValueFromText(registrationDetailsExtractInput);
  if (details) {
    const parts = details.split("/");
    if (parts.length == 3) {
      fieldData["regyear"] = parts[0];
      fieldData["regtype"] = parts[1];
      fieldData["regnum"] = parts[2];
      return true;
    }
  }

  const registrationNumberExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g.: , 1892/C/171
        /registration number: (\d+\/\d+)[,\.; ]/i,
        /(\d+\/\d+)/i,
      ],
    },
  };
  let number = parser.extractMatchingValueFromText(registrationNumberExtractInput);
  if (number) {
    const parts = number.split("/");
    if (parts.length == 2) {
      let foundNum = false;
      let num1 = parts[0];
      let num2 = parts[1];
      if (num1.length == 4) {
        if (num2.length == 4) {
          // either number could be year
          if (parser.isValueYear(num1)) {
            if (!parser.isValidYear(num2)) {
              fieldData["regyear"] = num1;
              fieldData["regnum"] = num2;
              foundNum = true;
            }
          } else if (parser.isValidYear(num2)) {
            fieldData["regyear"] = num2;
            fieldData["regnum"] = num1;
            foundNum = true;
          }
        } else {
          fieldData["regyear"] = num1;
          fieldData["regnum"] = num2;
          foundNum = true;
        }
      } else if (num2.length == 4) {
        fieldData["regyear"] = num2;
        fieldData["regnum"] = num1;
        foundNum = true;
      }

      if (foundNum) {
        return true;
      }
    }
  }

  const singleRegistrationNumberExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g.: , 1892/C/171
        /registration number: ([A-C]\d+)[,\.; ]/i,
        /registration number: (\d+)[,\.; ]/i,
        /([A-C]\d+)/i,
      ],
    },
  };

  let singleNumber = parser.extractMatchingValueFromText(singleRegistrationNumberExtractInput);
  if (singleNumber) {
    if (/^[A-C]/i.test(singleNumber)) {
      fieldData["regtype"] = singleNumber[0];
      singleNumber = singleNumber.substring(1);
    }
    fieldData["regnum"] = singleNumber;
    return true;
  }

  return false;
}

function transformPlainText(plainText, phase, options) {
  if (!doesTextMatchForContextPhase(plainText, phase, phaseMatches)) {
    return undefined;
  }

  //console.log("qldbdm: transformPlainText: string is a match", plainText);

  let fieldData = {};
  const searchData = {
    timeStamp: Date.now(),
    url: "https://www.familyhistory.bdm.qld.gov.au/reset",
    fieldData: fieldData,
  };
  const result = {
    siteName: "qldbdm",
    reuseTab: options.search_qldbdm_reuseExistingTab,
    permissionsMessage:
      "To perform a search on Queensland BDM a content script needs to be loaded on the familyhistory.bdm.qld.gov.au search page.",
    searchData: searchData,
  };

  let parser = new CitationParser(plainText);

  let gotRefNum = getReferenceNumber(parser, fieldData);

  if (gotRefNum) {
    return result;
  }
  return undefined;
}

export { transformPlainText };
