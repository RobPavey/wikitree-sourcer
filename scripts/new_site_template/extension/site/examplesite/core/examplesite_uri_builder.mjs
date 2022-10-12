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

class ExamplesiteUriBuilder {
  constructor() {
    this.uri = "https://www.examplesite.org.uk/cgi/search.pl";
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

  addType(string) {
    this.addSearchParameter("type", string);
  }

  addSurname(string) {
    this.addSearchParameter("surname", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("given", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addOtherSurname(string) {
    this.addSearchParameter("s_surname", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addOtherGivenNames(string) {
    this.addSearchParameter("s_given", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addStartYear(string) {
    this.addSearchParameter("start", string);
  }

  addEndYear(string) {
    this.addSearchParameter("end", string);
  }

  addAgeAtDeath(string) {
    this.addSearchParameter("aad", string);
  }

  addVolume(string) {
    this.addSearchParameter("vol", string);
  }

  addPage(string) {
    this.addSearchParameter("pgno", string);
  }

  getUri() {
    return this.uri;
  }
}

export { ExamplesiteUriBuilder };
