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

class CwgcUriBuilder {
  constructor() {
    this.uri = "https://www.cwgc.org/find-records/find-war-dead/search-results/";
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

  addSurname(string, searchOption) {
    this.addSearchParameter("Surname", StringUtils.removeExtendedAsciiCharacters(string));
    if (searchOption) {
      this.addSearchParameter("SurnameExact", searchOption);
    }
  }

  addForename(string, searchOption) {
    this.addSearchParameter("Forename", StringUtils.removeExtendedAsciiCharacters(string));
    if (searchOption) {
      this.addSearchParameter("ForenameExact", searchOption);
    }
  }

  addInitials(string) {
    this.addSearchParameter("Initials", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addServiceNumber(string, searchOption) {
    this.addSearchParameter("ServiceNum", StringUtils.removeExtendedAsciiCharacters(string));
    this.addSearchParameter("ServiceNumExact", searchOption);
  }

  addRegiment(string, searchOption) {
    this.addSearchParameter("Regiment", StringUtils.removeExtendedAsciiCharacters(string));
    if (searchOption) {
      this.addSearchParameter("RegimentExact", searchOption);
    }
  }

  addServedWith(string) {
    this.addSearchParameter("ServedWith", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addServedIn(string) {
    this.addSearchParameter("ServedIn", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCountryCommemoratedIn(string) {
    this.addSearchParameter("CountryCommemoratedIn", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addCemetery(string) {
    this.addSearchParameter("Cemetery", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addUnit(string) {
    this.addSearchParameter("Unit", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addRank(string) {
    this.addSearchParameter("Rank", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addSecondaryRegiment(string) {
    this.addSearchParameter("SecondaryRegiment", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addAgeOfDeath(string) {
    this.addSearchParameter("AgeOfDeath", string);
  }

  addDateDeathFromYear(string) {
    this.addSearchParameter("DateDeathFromDay", "1");
    this.addSearchParameter("DateDeathFromMonth", "January");
    this.addSearchParameter("DateDeathFromYear", string);
  }

  addDateDeathToYear(string) {
    this.addSearchParameter("DateDeathToDay", "31");
    this.addSearchParameter("DateDeathToMonth", "December");
    this.addSearchParameter("DateDeathToYear", string);
  }

  addDateOfDeath(string) {
    this.addSearchParameter("DateOfDeath", string);
  }

  addRankHouners(string) {
    this.addSearchParameter("Rank", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addAdditionalInfo(string) {
    this.addSearchParameter("AdditionalInfo", StringUtils.removeExtendedAsciiCharacters(string));
  }

  getUri() {
    return this.uri;
  }
}

export { CwgcUriBuilder };
