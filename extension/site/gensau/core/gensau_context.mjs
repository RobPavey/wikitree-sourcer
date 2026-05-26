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
  [[/South Australia/]],
  [[/\WS\s*A\W/, /\WS\.\s*A\.\W/]],
];

const typeMatches = [
  {
    collectionId: "birth",
    matches: [/Birth Registration/i, /Birth/i],
  },
  {
    collectionId: "death",
    matches: [/Death Registration/i, /Death/i],
  },
];

function transformPlainText(plainText, phase, options) {
  if (!plainText) {
    return undefined;
  }

  let lcText = plainText.toLowerCase();

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

  let collectionId = "";
  for (let typeMatch of typeMatches) {
    for (let regex of typeMatch.matches) {
      if (regex.test(plainText)) {
        collectionId = typeMatch.collectionId;
        break;
      }
    }
  }

  //console.log("gensau: transformPlainText: collectionId is", collectionId);

  if (!collectionId) {
    return {
      link: "https://www.genealogysa.org.au/resources/online-database-search",
    };
  }

  let builder = new GensauUriBuilder();
  builder.addCollectionId(collectionId);

  let parser = new CitationParser(lcText);

  const surnameExtractInput = {
    individual: {
      matches: [/(?:^|^.*[^a-z']\s+)(?:surname|last name)\s*:?\s*(\w+)(?:[,; ].*$|$)/is],
    },
    combined: {
      matches: [/(?:^|^.*[^a-z']\s+)(?:name|for)[^a-z]+([a-z ]+)\W.*$/is],
      partMatches: [/^\s*(?:[^ ]+ )*([a-z]+)\s*$/i],
    },
    noKey: {
      matches: [/(?:^|^.*[^a-z])([a-z]+),\s?[a-z]+,.*$/is],
    },
  };
  let surname = parser.extractValueFromText(surnameExtractInput);
  if (surname) {
    builder.addSurname(surname);
  }

  if (collectionId == "birth") {
    // only birth allows search by Book/Page
    const bookExtractInput = {
      individual: {
        matches: [/^.*(?:book number|volume number|book|volume)\s*[:#]?\s*([0-9]+[a-z]*)(?:\W.*$|$)/is],
      },
      combined: {
        matches: [/^.*book\/page[^a-z0-9]+([a-z0-9]+\/[0-9]+)\W.*$/is, /^.*[^a-z]+([0-9]+[a-z]?\/[0-9]+)(?:\W.*$|$)/is],
        partMatches: [/^([a-z0-9]+)\/[0-9]+$/i],
      },
    };
    const pageExtractInput = {
      individual: {
        matches: [/^.*(?:page number|page)\s*:?\s*([0-9]+)(?:\W.*$|$)/is, /^.*p\s*:?\s*([0-9]+)(?:\W.*$|$)/is],
      },
      combined: {
        matches: [/^.*book\/page[^a-z0-9]+([a-z0-9]+\/[0-9]+)\W.*$/is, /^.*[^a-z]+([a-z0-9]+\/[0-9]+)(?:\W.*$|$)/is],
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
