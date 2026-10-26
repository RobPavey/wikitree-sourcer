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

// IMDb's advanced name search, e.g.
// https://www.imdb.com/search/name/?name=Fred%20Astaire&birth_date=1899-01-01,1899-12-31
class ImdbUriBuilder {
  constructor() {
    this.uri = "https://www.imdb.com/search/name/";
    this.searchTermAdded = false;
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    // The comma in a date range must not be encoded
    const encodedValue = encodeURIComponent(value).replace(/%2C/g, ",");

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addName(string) {
    this.addSearchParameter("name", StringUtils.removeExtendedAsciiCharacters(string));
  }

  // A single birth year. This is the form IMDb itself uses in the links on a person's page, e.g. ?birth_year=1971
  addBirthYear(year) {
    this.addSearchParameter("birth_year", String(year));
  }

  // Both dates are inclusive years. If only one end is known the other is left open.
  addBirthYearRange(fromYear, toYear) {
    this.addDateRange("birth_date", fromYear, toYear);
  }

  addDeathYearRange(fromYear, toYear) {
    this.addDateRange("death_date", fromYear, toYear);
  }

  addDateRange(parameter, fromYear, toYear) {
    if (!fromYear || !toYear) {
      return;
    }
    const from = String(fromYear).padStart(4, "0") + "-01-01";
    const to = String(toYear).padStart(4, "0") + "-12-31";
    this.addSearchParameter(parameter, from + "," + to);
  }

  getUri() {
    return this.uri;
  }
}

export { ImdbUriBuilder };
