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

class PpnzUriBuilder {
  constructor() {
    this.uri = "https://paperspast.natlib.govt.nz/newspapers";
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

  addQueryString(string) {
    if (!string) {
      return;
    }
    // note that when searching via the site it puts "+" between words rather than "%20"
    // however, this doesn't seem to make a difference and if we replace space with + here
    // it ends up puting %2B in the URL which is an actual +
    string = string.trim();
    this.addSearchParameter("query", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addStartYear(string) {
    let dateString = "01-01-" + string;
    this.addSearchParameter("start_date", dateString);
  }

  addEndYear(string) {
    let dateString = "31-12-" + string;
    this.addSearchParameter("end_date", dateString);
  }

  getUri() {
    return this.uri;
  }
}

export { PpnzUriBuilder };
