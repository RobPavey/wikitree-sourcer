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
import { GensauUriBuilder } from "./gensau_uri_builder.mjs";

const phaseMatches = [
  [[/GenealogySA/i], [/Genealogy SA/i], [/Genealogy South Australia/i]],
  [[/South Australia/i]],
  [[/(?:^\s*|\W)S\s*A(?:\W|$)/], [/(?:^\s*|\W)S\.\s*A\.(?:\W|$)/]],
];

const defaultSearchFields = ["surname", "givennames", "year"];

const typeMatches = [
  {
    // death comes before birth since a death citation can mention birth date
    collectionId: "death",
    matches: [/Deaths? Registration/i],
    fuzzyMatches: [/Death/i],
    searchFields: ["surname", "givennames", "year", "district"],
  },
  {
    collectionId: "birth",
    matches: [/Births? Registration/i],
    fuzzyMatches: [/Birth/i],
    searchFields: ["surname", "givennames", "year", "district", "bookpage"],
  },
  {
    collectionId: "marriage",
    matches: [/Marriages? Registration/i],
    fuzzyMatches: [/Marriage/i],
    searchFields: ["surname", "givennames", "year", "district"],
  },
  {
    collectionId: "newspaper-birth",
    matches: [/Newspaper Birth/i],
  },
  {
    collectionId: "newspaper-death",
    matches: [/Newspaper Death/i, /Death Notice/i],
  },
  {
    collectionId: "newspaper-marriage",
    matches: [/Newspaper Marriage/i],
  },
  {
    collectionId: "divorce",
    matches: [/Newspaper Divorces/i],
  },
  {
    collectionId: "cemeteries",
    matches: [/South Australia Cemeteries/i, /South Australia Cemetery/i],
    fuzzyMatches: [/Cemeteries/i, /Cemetery/i],
  },
  {
    collectionId: "church-burial",
    matches: [/South Australian Church records - Burial/i],
    fuzzyMatches: [/Burial/i],
  },
  {
    collectionId: "church-baptism",
    matches: [/South Australian Church records - Baptism/i],
    fuzzyMatches: [/Baptism/i],
  },
  {
    collectionId: "church-marriage",
    matches: [/South Australian Church records - Marriage/i, /Church Marriage/i],
  },
  {
    collectionId: "church-others",
    matches: [/South Australian Church records - Other/i],
  },
  {
    collectionId: "school-admissions",
    matches: [/South Australian School Admission/i, /School Admission/i],
    fuzzyMatches: [/School/i],
  },
  {
    collectionId: "hospital",
    matches: [
      /Hospital, Asylum and Lying-in Home Admission/i,
      /Hospital Admission/i,
      /Asylum Admission/i,
      /Lying-in Home Admission/i,
    ],
    fuzzyMatches: [/Hospital/i, /Asylum/i, /Lying-in/i],
  },
  {
    collectionId: "bisa",
    matches: [/Biographical Index of South Australians/i, /BISA/],
    fuzzyMatches: [/Biographical/i],
  },
  {
    collectionId: "bisasupp",
    matches: [/Biographical Index of South Australians - Supplementary/i],
  },
  {
    collectionId: "certificates",
    matches: [/Certificates-Australia and Overseas/i],
    fuzzyMatches: [/Certificate/i],
  },
  {
    collectionId: "ibsa",
    matches: [/Irish Born South Australians (IBSA)/i, /IBSA/],
    fuzzyMatches: [/Irish/i],
  },
  {
    collectionId: "shipping",
    matches: [/Ship Passenger Arrivals in South Australia/i],
    fuzzyMatches: [/Arrival/i],
  },
  {
    collectionId: "shipping-departures",
    matches: [/Shipping Passenger Departures from South Australia/i],
    fuzzyMatches: [/Departure/i],
  },
  {
    collectionId: "public-trustees",
    matches: [/South Australian Public Trustees\/Deceased Estate/i, /Public Trustee/i, /Deceased Estate/i],
    fuzzyMatches: [/Trust/i, /Estate/i],
  },
];

function extractSurname(parser, builder) {
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
    builder.addSurname(surname.trim());
  }
}

function extractGivenNames(parser, builder) {
  const givenNamesExtractInput = {
    wholeText: {
      matches: [
        /(?:^|[\s,\n])(?:forenames|given names|given name)\s*:?\s*([a-z ]+)/i,
        /entry for\s+[a-z ]+,\s*([a-z](?:[a-z ]*[a-z])?)/i, // Aus project case
        /(?:^|[^a-z']\s+)(?:name|for)[^a-z]+[a-z]+,\s+([a-z ]+)/i,
        /(?:^|[^a-z ']\s+)(?:name|for)[^a-z]+([a-z ]+)\s+[a-z]/i,
        /(?:^|[^a-z ']\s+)[a-z]+,\s+([a-z ]*[a-z])\s*,?\s*child of/i,
        /(?:^|[^a-z ']\s+)([a-z ]*[a-z])\s+[a-z]+\s*,?\s*child of/i,
        // "Surname, fornames" at start of whole text (possible with some non-alpha chars before it)
        /^\W*[a-z]+,\s?([a-z ]+)/i,
        // "Surname, fornames" at start of line or sentence
        /(?:\.|\n|<br ?\/?>|<br ?\/?>\n)\s*[a-z]+,\s?([a-z ]+)/i,
      ],
    },
  };

  let givenNames = parser.extractMatchingValueFromText(givenNamesExtractInput);
  if (givenNames) {
    // in an example like this:
    // Surname: HARRISON Given Names: Leonard George Date of Birth: 03-Apr-1887 Gender: M Father:
    // we with get the given name as:
    // Leonard George Date of Birth
    let fieldNameIndex = givenNames.search(/(date|gender|father|mother|district)/i);
    if (fieldNameIndex > 0) {
      givenNames = givenNames.substring(0, fieldNameIndex);
    }

    builder.addGivenNames(givenNames.trim());
  }
}

function extractYear(parser, builder) {
  const yearExtractInput = {
    preClean: {
      removeMatches: [
        // e.g. "(Genealogy SA, https://www.genealogysa.org.au : accessed 11 May 2020)
        /\([^\)]*(?:accessed|viewed|retrieved)[^\)]+\)/i,
        // e.g. "Daly 143/400, accessed 10 May 2026 via Genealogy SA"
        /(?:accessed|viewed|retrieved)\s+(?:\d\d?\s+)(?:[a-z]+\s+)?\d\d\d\d\W/i,
        // remove year ranges. E.g.:
        // Marriage: "Australia, Marriage Index, 1788-1950"
        // Australia, Marriage Index, 1788-1950; Page number: 877
        /\d\d\d\d-\d\d\d\d/gi,
      ],
    },
    wholeText: {
      matches: [
        /(?:year|event year|birth year|death year)\s*:?\s*(\w+)(?:[,; ]|$)/i,
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
        // e.g. born 1876
        /(?:in|on|born|died|birth|death|married|b\.|d\.|m\.)\s+(\d\d\d\d)/i,
      ],
    },
  };
  let year = parser.extractMatchingValueFromText(yearExtractInput);
  if (year) {
    builder.addEventYear(year);
  }
}

function extractDistrict(parser, builder) {
  const districtExtractInput = {
    wholeText: {
      matches: [
        // e.g.: , Reference: District Adelaide, Book 11,
        /(?:^\s*|[^a-z]\s+)(?:district|registration district)\s*:?\s*(\w+)(?:[,; ]|$)/i,
        /(?:^\s*|[^a-z]\s+)(?:registration place|reg place)\s*:?\s*(\w+)(?:[,; ]|$)/i,
      ],
    },
  };
  let district = parser.extractMatchingValueFromText(districtExtractInput);
  if (district) {
    builder.addDistrict(district);
  }
}

function extractBookPage(parser, builder) {
  const bookExtractInput = {
    wholeText: {
      matches: [
        // e.g.
        //  citing Norwood District book#657; p72; for
        /(?:book number|volume number|book|volume)\s*[:#]?\s*([0-9]+[a-z]*)(?:\W|$)/i,
        /book\/page[^a-z0-9]+([a-z0-9]+)\/[0-9]+(?:\W|$)/i,
        /[^a-z0-9]+([0-9]+[a-z]?)\/[0-9]+(?:\W|$)/i,
      ],
    },
  };
  const pageExtractInput = {
    wholeText: {
      matches: [
        /(?:page number|[^/]page)\s*:?\s*([0-9]+)(?:\W|$)/i,
        // e.g. citing Norwood District book#657; p72; for
        /(?:^|\W)p\s*:?\s*([0-9]+)(?:\W|$)/i,
        /book\/page[^a-z0-9]+[a-z0-9]+\/([0-9]+)(?:\W|$)/i,
        /[^a-z0-9]+[a-z0-9]+\/([0-9]+)(?:\W|$)/i,
      ],
    },
  };
  let book = parser.extractMatchingValueFromText(bookExtractInput);
  let page = parser.extractMatchingValueFromText(pageExtractInput);
  if (book && page) {
    let bookPageString = book + "/" + page;
    builder.addBookPage(bookPageString);
  }
}

function transformPlainText(plainText, phase, options) {
  if (!plainText) {
    return undefined;
  }

  let isMatch = false;
  let matches = phaseMatches[phase];
  for (let matchSet of matches) {
    let matchesThisSet = true;
    for (let regex of matchSet) {
      if (!regex.test(plainText)) {
        matchesThisSet = false;
      }
    }
    if (matchesThisSet) {
      isMatch = true;
      break;
    }
  }

  if (!isMatch) {
    return undefined;
  }

  //console.log("gensau: transformPlainText: string is a match", plainText);

  let matchedType = undefined;
  for (let typeMatch of typeMatches) {
    for (let regex of typeMatch.matches) {
      if (regex.test(plainText)) {
        matchedType = typeMatch;
        break;
      }
    }
    if (matchedType) {
      break;
    }
  }

  if (!matchedType) {
    for (let typeMatch of typeMatches) {
      if (typeMatch.fuzzyMatches) {
        for (let regex of typeMatch.fuzzyMatches) {
          if (regex.test(plainText)) {
            matchedType = typeMatch;
            break;
          }
        }
      }
      if (matchedType) {
        break;
      }
    }
  }

  //console.log("gensau: transformPlainText: matchedType is", matchedType);

  if (!matchedType) {
    return {
      link: "https://www.genealogysa.org.au/resources/online-database-search",
    };
  }

  let collectionId = matchedType.collectionId;
  let searchFields = defaultSearchFields;
  if (matchedType.searchFields) {
    searchFields = matchedType.searchFields;
  }

  let builder = new GensauUriBuilder();
  builder.addCollectionId(collectionId);

  let parser = new CitationParser(plainText);

  if (searchFields.includes("surname")) {
    extractSurname(parser, builder);
  }

  if (searchFields.includes("givennames")) {
    extractGivenNames(parser, builder);
  }

  if (searchFields.includes("year")) {
    extractYear(parser, builder);
  }

  if (searchFields.includes("district")) {
    extractDistrict(parser, builder);
  }

  if (searchFields.includes("bookpage")) {
    extractBookPage(parser, builder);
  }

  const link = builder.getUri();

  const result = {
    link: link,
  };

  return result;
}

export { transformPlainText };
