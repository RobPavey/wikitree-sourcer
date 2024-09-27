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

class GroUriBuilder {
  constructor(includeEmptyParams = false) {
    this.uri = "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp";
    this.searchTermAdded = false;
    this.includeEmptyParams = includeEmptyParams;
  }

  addSearchTerm(string) {
    if (string === undefined || string === "") {
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
    if (!this.includeEmptyParams && (value === undefined || value === "")) {
      return;
    }
    if (value === undefined) {
      value = "";
    }

    const encodedValue = encodeURIComponent(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addIndex(string) {
    this.addSearchParameter("index", string);
  }

  addFirstForename(string) {
    this.addSearchParameter("Forename1", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addForenameMatches(string) {
    this.addSearchParameter("ForenameMatches", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSecondForename(string) {
    let forename2 = StringUtils.getFirstWord(string);
    this.addSearchParameter("Forename2", StringUtils.removeExtendedAsciiCharacters(forename2));
  }

  addSurname(string) {
    this.addSearchParameter("Surname", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSurnameMatches(string) {
    this.addSearchParameter("SurnameMatches", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addMothersSurname(string) {
    if (string != "-") {
      this.addSearchParameter("MothersSurname", StringUtils.removeExtendedAsciiCharacters(string));
    }
  }

  addMothersSurnameMatches(string) {
    this.addSearchParameter("MothersSurnameMatches", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addYear(string) {
    this.addSearchParameter("Year", string);
  }

  addYearRange(string) {
    this.addSearchParameter("Range", string);
  }

  addAge(string) {
    this.addSearchParameter("Age", string);
  }

  addAgeRange(string) {
    this.addSearchParameter("AgeRange", string);
  }

  addGenderMale() {
    this.addSearchTerm("Gender=M");
  }

  addGenderFemale() {
    this.addSearchTerm("Gender=F");
  }

  addQuarter(string) {
    this.addSearchParameter("Quarter", string);
  }

  addMonth(string) {
    this.addSearchParameter("Month", string);
  }

  addDistrict(string) {
    this.addSearchParameter("District", string);
  }

  addVolume(string) {
    this.addSearchParameter("Volume", string);
  }

  addPage(string) {
    this.addSearchParameter("Page", string);
  }

  addRegister(string) {
    this.addSearchParameter("Reg", string);
  }

  addCurrentPage(string) {
    this.addSearchParameter("CurrentPage", string);
  }

  addUrlText(string) {
    this.uri += string;
  }

  getUri() {
    return this.uri;
  }
}

export { GroUriBuilder };
