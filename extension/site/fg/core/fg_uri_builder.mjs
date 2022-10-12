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

class FgUriBuilder {
  // Example URL:
  // https://www.findagrave.com/memorial/search
  // ?firstname=William&middlename=&lastname=Pavey
  // &birthyear=1850&birthyearfilter=
  // &deathyear=1900&deathyearfilter=
  // &location=&locationId=&memorialid=&mcid=&linkedToName=&datefilter=&orderby=r&plot=

  // https://www.findagrave.com/memorial/search?firstname=John&middlename=Michael&lastname=Smith
  // &birthyear=1850&birthyearfilter=10
  // &deathyear=1900&deathyearfilter=after
  // &location=&locationId=&memorialid=&mcid=&linkedToName=&datefilter=&orderby=r&plot=

  constructor() {
    this.uri = "https://www.findagrave.com/memorial/search";
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

  addCountryId(countryName) {
    const nameToId = {
      England: "country_5",
      Wales: "country_67",
      Scotland: "country_50",

      Ireland: "country_35",
      France: "country_7",
      Germany: "country_8",
      Italy: "country_9",
      Netherlands: "country_69",
      Sweden: "country_66",
      Denmark: "country_27",
      Norway: "country_52",

      "United States": "country_4",
      Canada: "country_10",
      Mexico: "country_45",

      Australia: "country_15",
      "New Zealand": "country_85",
      "South Africa": "country_64",
    };

    let id = nameToId[countryName];

    if (id) {
      this.addSearchParameter("locationId", id);
    }
  }

  addFirstName(string) {
    this.addSearchParameter("firstname", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addMiddleName(string) {
    this.addSearchParameter("middlename", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addLastName(string) {
    this.addSearchParameter("lastname", WTS_String.removeExtendedAsciiCharacters(string));
  }

  includeMaidenName() {
    // includeMaidenName=true
    this.addSearchParameter("includeMaidenName", true);
  }

  addBirthYear(string, dateQualifier) {
    this.addSearchParameter("birthyear", string);
    this.addSearchParameter("birthyearfilter", dateQualifier);
  }

  addDeathYear(string, dateQualifier) {
    this.addSearchParameter("deathyear", string);
    this.addSearchParameter("deathyearfilter", dateQualifier);
  }

  addCountry(string) {
    this.addSearchParameter("location", string);
    this.addCountryId(string);
  }

  getUri() {
    return this.uri;
  }
}

export { FgUriBuilder };
