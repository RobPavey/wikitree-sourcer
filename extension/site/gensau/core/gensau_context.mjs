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
  [[/\WS\s*A\W/, /\WS\.\s*A\.\W/]],
];

const defaultSearchFields = ["surname", "givennames", "year"];

const typeMatches = [
  {
    // death comes before birth since a death citation can mention birth date
    collectionId: "death",
    matches: [/Death Registration/i],
    fuzzyMatches: [/Death/i],
    searchFields: ["surname", "givennames", "year", "district"],
  },
  {
    collectionId: "birth",
    matches: [/Birth Registration/i],
    fuzzyMatches: [/Birth/i],
    searchFields: ["surname", "givennames", "year", "district", "bookpage"],
  },
  {
    collectionId: "marriage",
    matches: [/Marriage Registration/i],
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
    const surnameExtractInput = {
      individual: {
        matches: [
          /(?:^|^.*[^a-z']\s+)(?:surname|last name)\s*:?\s*(\w+)(?:[,; ].*$|$)/is,
          /^.*entry for\s+([a-z ]+),[a-z ]+\W.*$/is, // Aus project case
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+([a-z]+),\s+[a-z ]+.*$/is,
        ],
      },
      combined: {
        matches: [
          /^.*entry for\s+([a-z ]+)\W.*$/is, // Aus project case
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+([a-z ]+)\W.*$/is,
        ],
        partMatches: [/^\s*(?:[^ ]+ )*([a-z]+)\s*$/i],
      },
      noKey: {
        matches: [/^[^a-z]*([a-z]+),\s?[a-z ]+[,:\-].*$/is, /(?:^|^.*[^a-z])([a-z]+),\s?[a-z ]+[,:\-].*$/is],
      },
    };
    let surname = parser.extractValueFromText(surnameExtractInput);
    if (surname) {
      builder.addSurname(surname);
    }
  }

  if (searchFields.includes("givennames")) {
    const givenNamesExtractInput = {
      individual: {
        matches: [
          /(?:^|^.*[^a-z']\s+)(?:forenames|given names|given name)\s*:?\s*(\w+)(?:[,; ].*$|$)/is,
          /^.*entry for\s+[a-z ]+,([a-z](?:[a-z ]*[a-z])?)\W.*$/is, // Aus project case
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+[a-z]+,\s+([a-z ]+).*$/is,
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+([a-z ]+)\s+[a-z]+\W.*$/is,
        ],
      },
      combined: {
        matches: [
          /^.*entry for\s+[a-z ]+,([a-z ]+)\W.*$/is, // Aus project case
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+[a-z]+,\s+([a-z ]+).*$/is,
          /(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+([a-z](?:[a-z ]*[a-z])?)\s+([a-z]+)\W.*$/is,
        ],
        partMatches: [/^\s*(?:[^ ]+ )*([a-z]+)\s*$/i],
      },
      noKey: {
        matches: [/^[^a-z]*[a-z]+,\s?([a-z ]+)[,:\-].*$/is, /^.*[^a-z][a-z]+,\s?([a-z ]+)[,:\-].*$/is],
      },
    };
    let givenNames = parser.extractValueFromText(givenNamesExtractInput);
    if (givenNames) {
      builder.addGivenNames(givenNames);
    }
  }

  if (searchFields.includes("year")) {
    const yearExtractInput = {
      preClean: {
        removeMatches: [
          // e.g. "(Genealogy SA, https://www.genealogysa.org.au : accessed 11 May 2020)
          /\([^\)]*(?:accessed|viewed)[^\)]+\)/i,
          // e.g. "Daly 143/400, accessed 10 May 2026 via Genealogy SA"
          /(?:accessed|viewed)\s+(?:\d\d?\s+)(?:[a-z]+\s+)?\d\d\d\d\W/i,
        ],
      },
      individual: {
        matches: [/(?:^|^.*[^a-z']\s+)(?:year|event year|birth year|death year)\s*:?\s*(\w+)(?:[,; ].*$|$)/is],
      },
      noKey: {
        matches: [/^.*[^a-z0-9/]+(\d\d\d\d)\W.*$/is, /^.*\d\d\/\d\d\/(\d\d\d\d)\W.*$/is],
      },
    };
    let year = parser.extractValueFromText(yearExtractInput);
    if (year) {
      builder.addEventYear(year);
    }
  }

  if (searchFields.includes("district")) {
    const districtExtractInput = {
      individual: {
        matches: [
          /(?:^|^.*[^a-z']\s+)(?:district|registration district)\s*:?\s*(\w+)(?:[,; ].*$|$)/is,
          /(?:^|^.*[^a-z']\s+)(?:registration place|reg place)\s*:?\s*(\w+)(?:[,; ].*$|$)/is,
        ],
      },
    };
    let district = parser.extractValueFromText(districtExtractInput);
    if (district) {
      builder.addDistrict(district);
    }
  }

  if (searchFields.includes("bookpage")) {
    // only birth allows search by Book/Page
    const bookExtractInput = {
      individual: {
        matches: [/^.*(?:book number|volume number|book|volume)\s*[:#]?\s*([0-9]+[a-z]*)(?:\W.*$|$)/is],
      },
      combined: {
        matches: [
          /^.*book\/page[^a-z0-9]+([a-z0-9]+\/[0-9]+)\W.*$/is,
          /^.*[^a-z0-9]+([0-9]+[a-z]?\/[0-9]+)(?:\W.*$|$)/is,
        ],
        partMatches: [/^([a-z0-9]+)\/[0-9]+$/i],
      },
    };
    const pageExtractInput = {
      individual: {
        matches: [/^.*(?:page number|[^/]page)\s*:?\s*([0-9]+)(?:\W.*$|$)/is, /^.*p\s*:?\s*([0-9]+)(?:\W.*$|$)/is],
      },
      combined: {
        matches: [/^.*book\/page[^a-z0-9]+([a-z0-9]+\/[0-9]+)\W.*$/is, /^.*[^a-z0-9]+([a-z0-9]+\/[0-9]+)(?:\W.*$|$)/is],
        partMatches: [/^[a-z0-9]+\/([0-9]+)$/i],
      },
    };
    let book = parser.extractValueFromText(bookExtractInput);
    let page = parser.extractValueFromText(pageExtractInput);
    if (book && page) {
      let bookPageString = book + "/" + page;
      builder.addBookPage(bookPageString);
    }
  }

  const link = builder.getUri();

  const result = {
    link: link,
  };

  return result;
}

export { transformPlainText };
