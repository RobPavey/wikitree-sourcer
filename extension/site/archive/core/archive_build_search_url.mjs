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

import { ArchiveUriBuilder } from "./archive_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new ArchiveUriBuilder();

  let searchString = "";

  // the searchs string can specify various parts. e.g.
  // https://archive.org/search?query=
  //  title%3A%28Dugdale%27s%20Visitation%20of%20Yorkshire%2C%20with%20additions%29
  //  %20AND%20date%3A%5B1899-01-01%20TO%201899-12-31%5D
  // unencoded that is:
  //  title:(Dugdale's Visitation of Yorkshire, with additions) AND date:[1899-01-01 TO 1899-12-31]
  // Another example:
  // https://archive.org/search?query=%28John%20Smith%29%20AND%20date%3A1856-06-02
  // (John Smith) AND date:1856-06-02

  function addTerm(term) {
    if (term) {
      if (searchString) {
        searchString += " AND ";
      }
      searchString += term;
    }
  }

  let eventYear = gd.inferEventYear();

  if (gd.bookTitle) {
    let title = gd.bookTitle;
    if (options.search_archive_nameInQuotes) {
      title = '"' + title + '"';
    }
    addTerm("title:(" + title + ")");
    addTerm("date:" + eventYear);
  } else {
    let name = gd.inferFullName();
    if (options.search_archive_nameInQuotes) {
      name = '"' + name + '"';
    }

    addTerm("(" + name + ")");

    let birthYear = gd.inferBirthYear();
    let deathYear = gd.inferDeathYear();

    if (birthYear && deathYear) {
      addTerm("date:[" + birthYear + " TO " + deathYear + "]");
    } else if (eventYear) {
      addTerm("date:" + eventYear);
    } else if (birthYear) {
      addTerm("date:" + birthYear);
    } else if (deathYear) {
      addTerm("date:" + deathYear);
    }
  }

  builder.addSearchQuery(searchString);

  if (options.search_archive_searchType == "text") {
    builder.addSearchIn("TXT");
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
