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
import { NameObj } from "../../../base/core/generalize_data_utils.mjs";

const minYear = 1841;
const maxYear = 2000;

const phaseMatches = [
  [[/wa\.gov\.au\/organisation\/department\-of\-justice/i], [/Government of Western Australia/i]],
  [[/Western Australia/i], [/WA BDM/i]],
  [
    [/wa/i, /index/i, /reg/i],
    [/w\.\s?a/i, /index/i, /reg/i],
    [/wa/i, /(birth|death|marriage)/i],
    [/w\.\s?a/i, /(birth|death|marriage)/i],
  ],
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

function extractSearchType(parser) {
  const typeMatches = [
    {
      searchType: "death",
      matches: [/Death Registration/i, /Place of Death/i],
    },
    {
      searchType: "marriage",
      matches: [/Marriage Registration/i, /Place of Marriage/i],
    },
    // Note birth comes last because a death regeistration could have a birth date
    {
      searchType: "birth",
      matches: [/Birth Registration/i, /Place of Birth/i],
    },
  ];
  const typeMatches2 = [
    {
      searchType: "death",
      matches: [/Death/i],
    },
    {
      searchType: "marriage",
      matches: [/Marriage/i],
    },
    // Note birth comes last because a death regeistration could have a birth date
    {
      searchType: "birth",
      matches: [/Birth/i],
    },
  ];

  const typeExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    typeMatches: typeMatches,
    typeMatches2: typeMatches2,
  };

  const searchType = parser.identifyType(typeExtractInput);
  return searchType;
}

function extractSurname(parser, fieldData) {
  const surnameExtractInput = {
    wholeText: {
      matches: [
        /(?:^|[\s,\n])(?:surname|last name|family name)\s*:?\s*(\w+)/i,
        /entry for\s+([a-z ]+),\s*[a-z]/i, // Aus project case
        /(?:^|[^a-z']\s+)(?:name|for)[^a-z]+([a-z']+),\s+[a-z ]+/i,
        /(?:^|[^a-z ']\s+)(?:name|for)[^a-z]+[a-z ]+\s+([a-z']+)/i,
        /(?:^|[^a-z ']\s+)([a-z']+),\s+[a-z ]*[a-z]\s*,?\s*child of/i,
        /(?:^|[^a-z ']\s+)[a-z ]*[a-z]\s+([a-z']+)\s*,?\s*child of/i,
        // "Surname, forenames" at start of whole text (possible with some non-alpha chars before it)
        /^\W*([a-z]+),\s?[a-z ]+/i,
        // "Surname, forenames" at start of line or sentence
        /(?:\.|\n|<br ?\/?>|<br ?\/?>\n)\s*([a-z']+),\s?[a-z ]+/i,
      ],
    },
  };
  let surname = parser.extractMatchingValueFromText(surnameExtractInput);
  if (surname) {
    surname = surname.trim();
    surname = surname.replace(/^'+/g, "");
    surname = surname.replace(/'+$/g, "");
    return surname;
  }
}

function extractGivenNames(parser, fieldData) {
  const nameExtractInput = {
    wholeText: {
      matches: [
        /(?:^|[\s,\n])(?:forenames|given names|given name|given name\(s\)|first names|first name|first name\(s\))\s*:?\s*([a-z ]+)/i,
        /entry for\s+[a-z ]+,\s*([a-z](?:[a-z ]*[a-z])?)/i, // Aus project case
        /(?:^|[^a-z']\s+)(?:name|for)[^a-z]+[a-z]+,\s+([a-z ]+)/i,
        /(?:^|[^a-z ']\s+)(?:name|for)[^a-z]+([a-z ]+)\s+[a-z]/i,
        /(?:^|[^a-z ']\s+)[a-z]+,\s+([a-z ]*[a-z])\s*,?\s*child of/i,
        /(?:^|[^a-z ']\s+)([a-z ]*[a-z])\s+[a-z]+\s*,?\s*child of/i,
        // "Surname, fornames" at start of whole text (possible with some non-alpha chars before it)
        /^\W*[a-z]+,\s?([a-z ]+)/i,
        // "Surname, forenames" at start of line or sentence
        /(?:\.|\n|<br ?\/?>|<br ?\/?>\n)\s*[a-z]+,\s?([a-z ]+)/i,
      ],
    },
  };
  let givenNames = parser.extractMatchingValueFromText(nameExtractInput);
  if (givenNames) {
    givenNames = givenNames.trim();
    givenNames = givenNames.replace(/^'+/g, "");
    givenNames = givenNames.replace(/'+$/g, "");
    return givenNames;
  }
}

function extractFullName(parser, fieldData) {
  const nameExtractInput = {
    wholeText: {
      matches: [
        /entry for\s+'*([a-z' ]+)'*[,;\.(|:\-]/i, // Aus project case
        / for\s+'*([a-z' ]+)'*[,;\.(|:\-]/i,
        /name: '*([a-z' ]+)'+/i,
      ],
    },
  };
  let fullName = parser.extractMatchingValueFromText(nameExtractInput);
  if (fullName) {
    fullName = fullName.trim();
    fullName = fullName.replace(/^'+/g, "");
    fullName = fullName.replace(/'+$/g, "");
    return fullName;
  }
}

function extractYear(parser, fieldData, searchType) {
  const yearExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      // Note that just the year is more likely than a full date
      matches: [
        // The "year" in this makes the others redundant?
        /(?:year|event year|eventyear|event date|eventdate|date|in)\s*:?\s*(\d\d\d\d)(?:\W|$)/i,
        // e.g. Source: #S46 1900/WA Reg. no. 106.
        /(?:^|[^\d])(\d\d\d\d)\//i,
        // e.g. 02/12/1867
        /(?:^|[^\d])\d\d\/\d\d\/(\d\d\d\d)(?:\W|$)/i,
        // e.g. 2-Dec-1980
        /(?:^|[^\d])\d\d-[a-z]{3}-(\d\d\d\d)(?:\W|$)/i,
        // e.g. 2 December 1980 or 23 Dec 1857
        /(?:^|[^\d])\d\d? [a-z]{3,10} (\d\d\d\d)(?:\W|$)/i,
        // e.g. 2-10-1980
        /(?:^|[^\d])\d\d-\d\d-(\d\d\d\d)(?:\W|$)/i,
        // e.g. 2-Dec-1980
        /(?:^|[^\d])\d\d [a-z]{3} (\d\d\d\d)(?:\W|$)/i,
        // e.g. xyz, 1980.
        /[^a-z0-9/]+(\d\d\d\d)\s*(?:\W|$)/i,
      ],
    },
  };

  const birthYearExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g. born 1876 or Date of Birth: 1876
        /(?:birth year|birthyear|year of birth|born|birth|b\.)\s*:?\s*(\d\d\d\d)(?:\W|$)/i,
        // e.g. 02/12/1867
        /(?:birth date|birthdate|date of birth|born|birth|b\.)\s*:?\s*\s\d\d\/\d\d\/(\d\d\d\d)(?:\W|$)/i,
      ],
    },
  };

  const deathYearExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g. died 1876 or Date of Death: 1876
        /(?:death year|deathyear|year of death|born|birth|b\.)\s*:?\s*(\d\d\d\d)(?:\W|$)/i,
        // e.g. 02/12/1867
        /(?:death date|deathdate|date of death|died|death|b\.)\s*:?\s*\s\d\d\/\d\d\/(\d\d\d\d)(?:\W|$)/i,
      ],
    },
  };

  const marriageYearExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g. born 1876 or Date of Birth: 1876
        /(?:marriage year|marriageyear|year of marriage|marriage date|marriagedate|date of marriage|married|marriage|m\.)\s*:?\s*(\d\d\d\d)(?:\W|$)/i,
        // e.g. 02/12/1867
        /(?:marriage date|marriagedate|date of marriage|married|marriage|m\.)\s*:?\s*\s\d\d\/\d\d\/(\d\d\d\d)(?:\W|$)/i,
      ],
    },
  };

  const specExtractInputs = {
    birth: birthYearExtractInput,
    death: deathYearExtractInput,
    marriage: marriageYearExtractInput,
  };

  if (searchType) {
    let specExtractInput = specExtractInputs[searchType];
    if (specExtractInput) {
      let year = parser.extractMatchingValueFromText(specExtractInput);
      if (year) {
        fieldData["yearFromCtrl"] = year;
        fieldData["yearToCtrl"] = year;
        return true;
      }
    }
  }

  let year = parser.extractMatchingValueFromText(yearExtractInput);
  if (year) {
    fieldData["yearFromCtrl"] = year;
    fieldData["yearToCtrl"] = year;
    return true;
  }
}

function getReferenceNumber(parser, fieldData, refineData) {
  const registrationNumberExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // e.g.: , 1892/C/171
        /registration(?: number)?: (\d+\/\d+)/i,
        /reg(?: number)?: (\d+\/\d+)/i,
        /(\d\d\d\d\/\d+)/i,
        /(\d+\/\d\d\d\d)/i,
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
          if (parser.isValidYear(num1, minYear, maxYear)) {
            if (!parser.isValidYear(num2, minYear, maxYear)) {
              fieldData["yearFromCtrl"] = num1;
              fieldData["yearToCtrl"] = num1;
              refineData.text = num2;
              foundNum = true;
            }
          } else if (parser.isValidYear(num2, minYear, maxYear)) {
            fieldData["yearFromCtrl"] = num2;
            fieldData["yearToCtrl"] = num2;
            refineData.text = num1;
            foundNum = true;
          }
        } else {
          fieldData["yearFromCtrl"] = num1;
          fieldData["yearToCtrl"] = num1;
          refineData.text = num2;
          foundNum = true;
        }
      } else if (num2.length == 4) {
        fieldData["yearFromCtrl"] = num2;
        fieldData["yearToCtrl"] = num2;
        refineData.text = num1;
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
        // e.g.: , 1892/C/171
        /registration(?: number)?: (\d+)/i,
        /reg(?: number)?: (\d+)/i,
      ],
    },
  };

  let singleNumber = parser.extractMatchingValueFromText(singleRegistrationNumberExtractInput);
  if (singleNumber) {
    refineData.text = singleNumber;
    return true;
  }

  return false;
}

function transformPlainText(plainText, phase, options) {
  if (!doesTextMatchForContextPhase(plainText, phase, phaseMatches)) {
    return undefined;
  }

  //console.log("wagovau: transformPlainText: string is a match", plainText);

  let fieldData = {};
  const searchData = {
    timeStamp: Date.now(),
    url: "https://www.wa.gov.au/organisation/department-of-justice/online-index-search-tool",
    fieldData: fieldData,
  };
  const result = {
    siteName: "wagovau",
    reuseTab: options.search_wagovau_reuseExistingTab,
    permissionsMessage:
      "To perform a search on Western Australia BDM a content script needs to be loaded on the www.wa.gov.au/organisation/department-of-justice/online-index-search-tool search page.",
    searchData: searchData,
  };

  let parser = new CitationParser(plainText);

  const searchType = extractSearchType(parser);
  if (!searchType) {
    return undefined;
  }
  searchData.searchType = searchType;

  let gotSurname = false;
  const surname = extractSurname(parser);
  const givenNames = extractGivenNames(parser);
  const fullName = extractFullName(parser);
  let useFullName = false;
  if (fullName) {
    useFullName = true;
    if (surname && givenNames) {
      const invalidNames = ["registration", "registry", "department", "sex", "gender", "year", "father", "mother"];
      let lcSurname = surname.toLowerCase();
      let lcGivenNames = givenNames.toLowerCase();
      useFullName = false;
      for (let invalidName of invalidNames) {
        if (lcSurname.includes(invalidName) || lcGivenNames.includes(invalidName)) {
          useFullName = true;
        }
      }
    }
  }

  if (useFullName) {
    let nameObj = new NameObj();
    nameObj.setFullName(fullName);
    let inferredSurname = nameObj.inferLastName();
    let inferredGivenNames = nameObj.inferForenames();
    if (inferredSurname) {
      fieldData["surname"] = inferredSurname;
      gotSurname = true;
    }
    if (inferredGivenNames) {
      fieldData["givenNames"] = inferredGivenNames;
    }
  } else {
    if (surname) {
      fieldData["surname"] = surname;
      gotSurname = true;
    }
    if (givenNames) {
      fieldData["givenNames"] = givenNames;
    }
  }

  let refineData = {};
  let gotYear = false;
  const gotRefNum = getReferenceNumber(parser, fieldData, refineData);
  if (gotRefNum) {
    searchData.refineData = refineData;
    if (fieldData["yearFromCtrl"]) {
      gotYear = true;
    }
  }

  if (!gotYear) {
    gotYear = extractYear(parser, fieldData, searchType);
  }

  if (!gotSurname && !gotYear) {
    return undefined;
  }

  return result;
}

export { transformPlainText };
