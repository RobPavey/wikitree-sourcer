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

// http://www.census.nationalarchives.ie/search/results.jsp
// ?census_year=1911&surname=John&firstname=Long
// &county19011911=&county1821=&county1831=&county1841=&county1851=
// &parish=&ward=&barony=&townland=&houseNumber=&ded=
// &age=10&sex=M&search=Search

// http://www.census.nationalarchives.ie/search/results.jsp?searchMoreVisible=&census_year=1901&surname=Connors&firstname=Margaret&county19011911=&county1821=&county1831=&county1841=&county1851=&parish=&ward=&barony=&townland=&houseNumber=&ded=&age=31&sex=F&search=Search&ageInMonths=&relationToHead=&religion=&education=&occupation=&marriageStatus=&yearsMarried=&birthplace=&nativeCountry=&language=&deafdumb=&causeOfDeath=&yearOfDeath=&familiesNumber=&malesNumber=&femalesNumber=&maleServNumber=&femaleServNumber=&estChurchNumber=&romanCatNumber=&presbNumber=&protNumber=&marriageYears=&childrenBorn=&childrenLiving=
// http://www.census.nationalarchives.ie/search/results.jsp?census_year=1901&surname=Connors&firstname=Margaret&county19011911=&county1821=&county1831=&county1841=&county1851=&parish=&ward=&barony=&townland=&houseNumber=&ded=&age=31&sex=F&search=Search

class NaieUriBuilder {
  constructor(usePre2025Site) {
    this.usePre2025Site = usePre2025Site;
    if (usePre2025Site) {
      this.uri = "http://www.census.nationalarchives.ie/search/results.jsp";
    } else {
      this.uri = "http://nationalarchives.ie/collections/search-the-census/search-results/";
    }

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

  addYear(string) {
    this.addSearchParameter("census_year", string);
  }

  addSurname(string) {
    if (this.usePre2025Site) {
      this.addSearchParameter("surname", StringUtils.removeExtendedAsciiCharacters(string));
    } else {
      this.addSearchParameter("surname__icontains", StringUtils.removeExtendedAsciiCharacters(string));
    }
  }

  addGivenNames(string) {
    if (this.usePre2025Site) {
      this.addSearchParameter("firstname", StringUtils.removeExtendedAsciiCharacters(string));
    } else {
      this.addSearchParameter("firstname__icontains", StringUtils.removeExtendedAsciiCharacters(string));
    }
  }

  addAge(string, range = 0) {
    if (!this.usePre2025Site) {
      if (range) {
        let ageNum = Number(string);
        if (!isNaN(ageNum)) {
          let minAgeNum = ageNum - range;
          if (minAgeNum < 0) {
            minAgeNum = 0;
          }
          let maxAgeNum = ageNum + range;
          this.addSearchParameter("age__gte", minAgeNum);
          this.addSearchParameter("age__lte", maxAgeNum);
          return;
        }
      }
    }

    this.addSearchParameter("age", string);
  }

  addGender(gender) {
    if (gender == "male") {
      gender = "M";
    } else if (gender == "female") {
      gender = "F";
    } else {
      return;
    }
    this.addSearchParameter("sex", gender);
  }

  addCounty(censusYear, county) {
    if (!this.usePre2025Site) {
      this.addSearchParameter("county", county);
      return;
    }

    let paramName = "county" + censusYear;
    if (censusYear == "1901" || censusYear == "1911") {
      paramName = "county19011911";
    }

    this.addSearchParameter(paramName, county);
  }

  getUri() {
    if (this.usePre2025Site) {
      this.uri += "&search=Search";
    }

    return this.uri;
  }
}

export { NaieUriBuilder };
