/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { ImdbUriBuilder } from "./imdb_uri_builder.mjs";
import { buildNameVariants } from "./imdb_name_variants.mjs";

// The typeOfSearch can be "name:<name to search for>" to use one of the variants of the name.
// Otherwise the first variant is used, which is the first name and current last name.
function getSearchName(gd, typeOfSearch) {
  if (typeOfSearch && typeOfSearch.startsWith("name:")) {
    return typeOfSearch.substring(5);
  }
  const variants = buildNameVariants(gd);
  return variants.length > 0 ? variants[0].name : gd.inferFullName();
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new ImdbUriBuilder();

  const searchName = getSearchName(gd, buildUrlInput.typeOfSearch);
  if (searchName) {
    builder.addName(searchName);
  }

  // IMDb only has a date filter by exact date range so use the year +/- the range
  const range = options && options.search_imdb_yearRange != undefined ? Number(options.search_imdb_yearRange) : 0;

  const birthYear = parseInt(gd.inferBirthYear(), 10);
  if (birthYear) {
    if (range == 0) {
      builder.addBirthYear(birthYear);
    } else {
      builder.addBirthYearRange(birthYear - range, birthYear + range);
    }
  }

  const deathYear = parseInt(gd.inferDeathYear(), 10);
  if (deathYear) {
    builder.addDeathYearRange(deathYear - range, deathYear + range);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
