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

class TaslibUriBuilder {
  constructor() {
    // https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qf=NI_INDEX%09Record+type%09Births%09Births&qu=
    this.uri = "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results";
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

  addQuParameter(value) {
    if (value == undefined || value == "") {
      return;
    }

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?qu=", value);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&qu=", value);
    }
  }

  addQfParameter(value) {
    if (value == undefined || value == "") {
      return;
    }

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?qf=", value);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&qf=", value);
    }
  }

  addType(string) {
    this.addSearchParameter("type", string);
  }

  addName(string) {
    this.addQuParameter("NI_NAME%3D" + string);
  }

  addExactNameName(forenames, lastName) {
    this.addQuParameter('NI_NAME%3D"' + lastName + ", " + forenames + '"');
  }

  addYearRange(startYear, endYear) {
    // &qf=PUBDATE%09Year%091849-1862%091849-1862
    // &qf=PUBDATE%09Year%091849-1862%091849-1862&qf=PUBDATE%09Year%091849%091849
    if (startYear == endYear) {
      let string = "PUBDATE%09Year%09" + startYear + "%09" + startYear;
      this.addQfParameter(string);
    } else {
      let range = startYear + "-" + endYear;
      let string = "PUBDATE%09Year%09" + range + "%09" + range;
      this.addQfParameter(string);
    }
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

export { TaslibUriBuilder };
