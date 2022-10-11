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

import { WTS_String } from "../../../base/core/wts_string.mjs";

class GroUriBuilder {
  constructor() {
    this.uri =
      "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp";
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

  addIndex(string) {
    this.addSearchParameter("index", string);
  }

  addFirstForename(string) {
    this.addSearchParameter(
      "forename1",
      WTS_String.removeExtendedAsciiCharacters(string)
    );
  }

  addSecondForename(string) {
    let forename2 = WTS_String.getFirstWord(string);
    this.addSearchParameter(
      "forename2",
      WTS_String.removeExtendedAsciiCharacters(forename2)
    );
  }

  addSurname(string) {
    this.addSearchParameter(
      "surname",
      WTS_String.removeExtendedAsciiCharacters(string)
    );
  }

  addMothersSurname(string) {
    if (string != "-") {
      this.addSearchParameter(
        "motherssurname",
        WTS_String.removeExtendedAsciiCharacters(string)
      );
    }
  }

  addYear(string) {
    this.addSearchParameter("year", string);
  }

  addYearRange(string) {
    this.addSearchParameter("range", string);
  }

  addAge(string) {
    this.addSearchParameter("age", string);
  }

  addAgeRange(string) {
    this.addSearchParameter("agerange", string);
  }

  addGenderMale() {
    this.addSearchTerm("gender=M");
  }

  addGenderFemale() {
    this.addSearchTerm("gender=F");
  }

  addQuarter(string) {
    this.addSearchParameter("quarter", string);
  }

  addMonth(string) {
    this.addSearchParameter("month", string);
  }

  addDistrict(string) {
    this.addSearchParameter("district", string);
  }

  addVolume(string) {
    this.addSearchParameter("volume", string);
  }

  addPage(string) {
    this.addSearchParameter("page", string);
  }

  addRegister(string) {
    this.addSearchParameter("reg", string);
  }

  getUri() {
    return this.uri;
  }
}

export { GroUriBuilder };
