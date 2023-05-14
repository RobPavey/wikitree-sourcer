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

// An example search:
// https://churchrecords.irishgenealogy.ie/churchrecords/search.jsp?namefm=mary&namel=malone&location=&yyfrom=&yyto=&submit=Search
// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namefm=John&namel=Smith&location=Dublin&yyfrom=1850&yyto=1890&submit=Search

// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namefm=John&namel=O%27Connor&location=&yyfrom=&yyto=&submit=Search&sort=&pageSize=&century=&decade=&exact=&ddBfrom=&ddMfrom=&ddDfrom=&ddPfrom=&mmBfrom=&mmMfrom=&mmDfrom=&mmPfrom=&yyBfrom=&yyMfrom=&yyDfrom=&yyPfrom=&ddBto=&ddMto=&ddDto=&ddPto=&mmBto=&mmMto=&mmDto=&mmPto=&yyBto=&yyMto=&yyDto=&yyPto=&locationB=&locationM=&locationD=&locationP=&keywordb=&keywordm=&keywordd=&keywordp=&event=&district=
// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namel=O%27Connor&namefm=John

class IrishgUriBuilder {
  constructor(typeOfSearch) {
    let searchJsp = "search";
    if (typeOfSearch == "civilrecords") {
      searchJsp = "civil-perform-search";
    }
    this.uri = "https://" + typeOfSearch + ".irishgenealogy.ie/churchrecords/" + searchJsp + ".jsp";
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
    this.addSearchParameter("namel", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("namefm", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addLocation(string) {
    this.addSearchParameter("location", WTS_String.removeExtendedAsciiCharacters(string));
  }

  addLocation(string) {
    this.addSearchParameter("location", string);
  }

  addStartYear(string) {
    this.addSearchParameter("yyfrom", string);
  }

  addEndYear(string) {
    this.addSearchParameter("yyto", string);
  }

  getUri() {
    return this.uri + "&submit=Search";
  }
}

export { IrishgUriBuilder };
