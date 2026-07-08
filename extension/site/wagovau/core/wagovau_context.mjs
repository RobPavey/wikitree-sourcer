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
  [[/wa\.gov\.au\/organisation\/department\-of\-justice/i], [/Government of Western Australia/i]],
  [[/Western Australia/i]],
  [[/wa/i, /index/i, /registration/i]],
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
      searchType: "birth",
      matches: [/Place of Birth/i],
    },
    {
      searchType: "death",
      matches: [/Place of Death/i],
    },
    {
      searchType: "marriage",
      matches: [/Place of Marriage/i],
    },
  ];

  const typeExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    typeMatches: typeMatches,
  };

  const searchType = parser.identifyType(typeExtractInput);
  return searchType;
}

function extractSurname(parser, fieldData) {
  const surnameExtractInput = {
    wholeText: {
      matches: [
        /(?:^|[\s,\n])(?:surname|last name)\s*:?\s*(\w+)/i,
        /entry for\s+([a-z ]+),\s*[a-z]/i, // Aus project case
        /(?:^|[^a-z']\s+)(?:name|for)[^a-z]+([a-z]+),\s+[a-z ]+/i,
        /(?:^|[^a-z ']\s+)(?:name|for)[^a-z]+[a-z ]+\s+([a-z]+)/i,
        /(?:^|[^a-z ']\s+)([a-z]+),\s+[a-z ]*[a-z]\s*,?\s*child of/i,
        /(?:^|[^a-z ']\s+)[a-z ]*[a-z]\s+([a-z]+)\s*,?\s*child of/i,
        // "Surname, fornames" at start of whole text (possible with some non-alpha chars before it)
        /^\W*([a-z]+),\s?[a-z ]+/i,
        // "Surname, fornames" at start of line or sentence
        /(?:\.|\n|<br ?\/?>|<br ?\/?>\n)\s*([a-z]+),\s?[a-z ]+/i,
      ],
    },
  };
  let surname = parser.extractMatchingValueFromText(surnameExtractInput);
  if (surname) {
    fieldData["surname"] = surname.trim();
    return true;
  }
}

function extractGivenNames(parser, fieldData) {
  const surnameExtractInput = {
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
  let givenNames = parser.extractMatchingValueFromText(surnameExtractInput);
  if (givenNames) {
    fieldData["givenNames"] = givenNames.trim();
  }
}

function extractYear(parser, fieldData, searchType) {
  const removeMatches = [
    // e.g. "(Genealogy SA, https://www.genealogysa.org.au : accessed 11 May 2020)
    /\([^\)]*(?:accessed|viewed|retrieved)[^\)]+\)/i,
    // e.g. "Daly 143/400, accessed 10 May 2026 via Genealogy SA"
    /(?:accessed|viewed|retrieved)\s+(?:\d\d?\s+)(?:[a-z]+\s+)?\d\d\d\d\W/i,
    // remove year ranges. E.g.:
    // Marriage: "Australia, Marriage Index, 1788-1950"
    // Australia, Marriage Index, 1788-1950; Page number: 877
    /\d\d\d\d-\d\d\d\d/gi,
  ];
  const yearExtractInput = {
    preClean: {
      removeMatches: removeMatches,
    },
    wholeText: {
      matches: [
        // The "year" in this makes the others redundant?
        /(?:year|event year|eventyear|event date|eventdate|date|in)\s*:?\s*(\d\d\d\d)(?:\W|$)/i,
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
        return;
      }
    }
  }

  let year = parser.extractMatchingValueFromText(yearExtractInput);
  if (year) {
    fieldData["yearFromCtrl"] = year;
    fieldData["yearToCtrl"] = year;
  }
}

function transformPlainText(plainText, phase, options) {
  if (!doesTextMatchForContextPhase(plainText, phase, phaseMatches)) {
    return undefined;
  }

  console.log("wagovau: transformPlainText: string is a match", plainText);

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

  const gotSurname = extractSurname(parser, fieldData);
  if (!gotSurname) {
    return undefined;
  }

  extractGivenNames(parser, fieldData);
  extractYear(parser, fieldData, searchType);

  return result;
}

export { transformPlainText };
