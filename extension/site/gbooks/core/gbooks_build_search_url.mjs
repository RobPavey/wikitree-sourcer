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

import { GbooksUriBuilder } from "./gbooks_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new GbooksUriBuilder();

  let searchString = "";

  function addTerm(term) {
    if (term) {
      if (searchString) {
        searchString += " ";
      }
      searchString += term;
    }
  }

  if (gd.bookTitle) {
    addTerm('"' + gd.bookTitle + '"');
    addTerm(gd.bookAuthor);
  } else {
    addTerm(gd.inferFullName());
  }

  let birthYear = gd.inferBirthYear();
  let deathYear = gd.inferDeathYear();
  let eventYear = gd.inferEventYear();

  if (birthYear || deathYear) {
    addTerm(birthYear);
    addTerm(deathYear);
  } else {
    addTerm(eventYear);
  }

  builder.addSearchQuery(searchString);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
