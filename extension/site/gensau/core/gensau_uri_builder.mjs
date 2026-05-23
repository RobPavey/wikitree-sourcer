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

import { StringUtils } from "../../../base/core/string_utils.mjs";

class GensauUriBuilder {
  constructor() {
    // The URL of the top level of the search is:
    // https://www.genealogysa.org.au/resources/online-database-search
    // As soon as you enter any search paramaters. For example just a surname of "Smith"
    // It gets very long:
    // https://www.genealogysa.org.au/index.php?option=com_gsa&view=gsa&layout=essearch&Itemid=193&collection_id=&page_no=1&sort_by=&sort_direction=asc&Surname=Smith&GivenName=&year_from=&accuracy=&ShipName=
    this.uri = "https://www.genealogysa.org.au/index.php?option=com_gsa&view=gsa&layout=essearch&Itemid=193";
    this.searchTermAdded = true;
  }

  addSearchTerm(string) {
    if (string == undefined || string == "") {
      return;
    }
    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", string);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", string);
    }
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    const encodedValue = encodeURIComponent(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addCollectionId(string) {
    this.addSearchParameter("collection_id", string);
  }

  addSurname(string) {
    this.addSearchParameter("Surname", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("GivenName", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addEventYear(year, accuracy) {
    // &year_from=1905&accuracy=35
    this.addSearchParameter("year_from", year);
    this.addSearchParameter("accuracy", accuracy);
  }

  addFather(string) {
    this.addSearchParameter("Father", string);
  }

  addBookPage(string) {
    this.addSearchParameter("Book_Page", string);
  }

  getUri() {
    return this.uri;
  }
}

export { GensauUriBuilder };
