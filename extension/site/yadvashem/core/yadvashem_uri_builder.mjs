/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

class YadvashemUriBuilder {
  constructor() {
    this.uri = "https://collections.yadvashem.org/en/names/search-results";
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

  addSurname(string) {
    this.addSearchParameter("s_last_name_search_en", StringUtils.removeExtendedAsciiCharacters(string));
    this.addSearchParameter("t_last_name_search_en", "yvSynonym");
  }

  addGivenNames(string) {
    this.addSearchParameter("s_first_name_search_en", StringUtils.removeExtendedAsciiCharacters(string));
    this.addSearchParameter("t_first_name_search_en", "yvSynonym");
  }

  // TODO: maiden name?

  addYearOfBirth(string) {
    this.addSearchParameter("s_year_birth_search", string);
    this.addSearchParameter("t_year_birth_search", "rangeFive");
  }

  addYearOfDeath(string) {
    this.addSearchParameter("s_year_death_search", string);
    this.addSearchParameter("t_year_death_search", "rangeFive");
  }

  getUri() {
    return this.uri;
  }
}

export { YadvashemUriBuilder };
