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

import { StringUtils } from "../../../base/core/string_utils.mjs";

// Example search URL (2024)
// https://billiongraves.com/search/results
// ?cemetery_country=United%20States&cemetery_state=California&cemetery_county=Marin
// &given_names=John%20Michael&family_names=Peters%20Smith
// &birth_year=1800&death_year=1870&year_range=4&size=15

// Optionally
// &exact=true&phonetic=true

class bgUriBuilder {
  constructor() {
    this.uri = "https://billiongraves.com/search/results";
    this.searchTermAdded = false;
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

  addPreamble() {
    this.addSearchTerm("size=15");
  }

  addSurname(string) {
    this.addSearchParameter("family_names", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("given_names", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCemeteryCountry(string) {
    this.addSearchParameter("cemetery_country", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCemeteryCounty(string) {
    this.addSearchParameter("cemetery_county", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCemeteryState(string) {
    this.addSearchParameter("cemetery_state", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addBirthYear(string) {
    this.addSearchParameter("birth_year", string);
  }

  addDeathYear(string) {
    this.addSearchParameter("death_year", string);
  }

  addYearRange(string) {
    this.addSearchParameter("year_range", string);
  }

  addSize(string) {
    this.addSearchParameter("size", string);
  }

  addExact() {
    this.addSearchParameter("exact", "true");
  }

  addPhonetic() {
    this.addSearchParameter("phonetic", "true");
  }

  getUri() {
    return this.uri;
  }
}

export { bgUriBuilder };
