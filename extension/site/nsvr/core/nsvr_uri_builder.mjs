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

class NsvrUriBuilder {
  constructor() {
    this.uri = "https://archives.novascotia.ca/vital-statistics/results/";
    // searches with a bride and groom can use https://archives.novascotia.ca/vital-statistics/marriage/
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
    if (value == undefined) {
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
    switch (string) {
      case "Births":
        this.addSearchParameter("B", "birth");
        break;
      case "Marriages":
        this.addSearchParameter("M", "marriage");
        break;
      case "Deaths":
        this.addSearchParameter("D", "death");
        break;
      default:
        this.addSearchParameter("B", "birth");
        this.addSearchParameter("M", "marriage");
        this.addSearchParameter("D", "death");
    }
  }

  // name style options:
  // contains = "";
  // exactly = "<>"
  // Starts With = "<"
  // Ends With = ">"

  addSurname(string) {
    this.addSearchParameter("Last", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSurnameStyle(string) {
    this.addSearchParameter("LastS", "");
  }

  addGivenName(string) {
    this.addSearchParameter("First", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGivenNameStyle(string) {
    this.addSearchParameter("FirstS", "");
  }

  addBrideSurname(string) {
    this.addSearchParameter("BLast", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addBrideSurnameStyle(string) {
    this.addSearchParameter("BLastS", "");
  }

  addBrideGivenNames(string) {
    this.addSearchParameter("BFirst", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addBrideGivenNameStyle(string) {
    this.addSearchParameter("BFirstS", "");
  }

  addGroomSurname(string) {
    this.addSearchParameter("GLast", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGroomSurnameStyle(string) {
    this.addSearchParameter("GLastS", "");
  }

  addGroomGivenNames(string) {
    this.addSearchParameter("GFirst", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGroomGivenNameStyle(string) {
    this.addSearchParameter("GFirstS", "");
  }

  addStartYear(string) {
    this.addSearchParameter("sYear", string);
  }

  addEndYear(string) {
    this.addSearchParameter("eYear", string);
  }

  addPlace(string) {
    this.addSearchParameter("Place", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCounty(string) {
    this.addSearchParameter("County", StringUtils.removeExtendedAsciiCharacters(string));
  }

  getUri() {
    return this.uri;
  }
}

export { NsvrUriBuilder };
