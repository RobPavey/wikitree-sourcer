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

// Example search url:
// https://www.thegenealogist.com/search/master/
// ?layout=compact&type=person&source=&master_event=&person_event=
// &include_uk=1&include_ireland=1&include_elsewhere=1
// &fn=Charles&sn=Pavey&yr=1840&range=5
// &kw=Sussex&kw_mode=simple&kw_simple_type=any
// &search=Search#show-result

// example with a master event:
// https://www.thegenealogist.com/search/master/?layout=compact&type=person&source=
// &master_event=1939+Register
// &include_uk=1&include_ireland=1&include_elsewhere=1
// &fn=Charles&sn=Pavey&yr=1840&range=5
// &kw=Sussex&kw_mode=simple&kw_simple_type=any
// &search=Search#show-result

class ThegenUriBuilder {
  constructor() {
    this.uri = "https://www.thegenealogist.com/search/master/?layout=compact&type=person";
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

  addSurname(string) {
    this.addSearchParameter("sn", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("fn", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addYear(string) {
    this.addSearchParameter("yr", string);
  }

  addRange(string) {
    this.addSearchParameter("range", string);
  }

  getUri() {
    return this.uri;
  }
}

export { ThegenUriBuilder };
