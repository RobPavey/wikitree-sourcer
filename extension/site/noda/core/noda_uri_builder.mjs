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

// Example search:
// https://www.digitalarkivet.no/en/search/persons/advanced?
//  from=1885&to=1978&firstname=Johanna&lastname=Johansdatter&genders%5B%5D=k
//  &birth_year_from=1885&birth_year_to=1887&birth_date=06-10
//  &birth_place=S%C3%B8r-Tr%C3%B8ndelag%2C+Norway&domicile=
//  &position=&event_year_from=&event_year_to=&event_date=
//  &related_first_name=&related_last_name=&related_birth_year=

class NodaUriBuilder {
  constructor() {
    this.uri = "https://www.digitalarkivet.no/en/search/persons/advanced";
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

  // https://www.digitalarkivet.no/en/search/persons/advanced?birth_year_from=1886&birth_year_to=1886&firstname=Johanna&lastname=Johansdatter%20Wiggen%20Ingdal%20Johansen&from=1886&to=1974
  // &genders%5B%5D=k

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

  addStartYear(string) {
    this.addSearchParameter("from", string);
  }

  addEndYear(string) {
    this.addSearchParameter("to", string);
  }

  addLastName(string) {
    this.addSearchParameter("lastname", string);
  }

  addFirstName(string) {
    this.addSearchParameter("firstname", string);
  }

  addGender(string) {
    let gender = "";
    if (string == "male") {
      gender = "m";
    } else if (string == "female") {
      gender = "k";
    }
    this.addSearchParameter("genders%5B%5D", gender);
  }

  addBirthDate(year, month, day) {
    if (year) {
      this.addSearchParameter("birth_year_from", year);
      this.addSearchParameter("birth_year_to", year);
    }
    if (month && day) {
      this.addSearchParameter("birth_date", month + "-" + day);
    }
  }

  addBirthYearRange(startYear, endYear) {
    this.addSearchParameter("birth_year_from", startYear);
    this.addSearchParameter("birth_year_to", endYear);
  }

  addBirthPlace(string) {
    this.addSearchParameter("birth_place", string);
  }

  addRole(string) {
    // &roles%5B%5D=barn
    this.addSearchParameter("roles[]", string);
  }

  addRelatedPerson(firstName, lastName, role, birthYear) {
    // &related_first_name=Lars&related_last_name=Knutsen&related_birth_year=&related_roles%5B%5D=far
    this.addSearchParameter("related_first_name", firstName);
    this.addSearchParameter("related_last_name", lastName);
    this.addSearchParameter("related_birth_year", birthYear);
    this.addSearchParameter("related_roles[]", role);
  }

  addEventDate(year, month, day) {
    if (year) {
      this.addSearchParameter("event_year_from", year);
      this.addSearchParameter("event_year_to", year);
    }
    if (month && day) {
      this.addSearchParameter("event_date", month + "-" + day);
    }
  }

  addCategory(string) {
    // input string is something like "lt_dp" and we want to add something like
    // "&lt%5B%5D=dp" to URL
    let parts = string.split("_");
    if (parts.length == 2) {
      let parameter = parts[0] + "[]";
      let value = parts[1];

      this.addSearchParameter(parameter, value);
    } else if (parts.length == 1) {
      // this is a category rather than a collection. We want something like
      //&sc%5B%5D=kb
      let parameter = "sc[]";
      let value = parts[0];
      this.addSearchParameter(parameter, value);
    }
  }

  addPlace(placeCode) {
    this.addSearchParameter("m[]", placeCode);
  }

  addCounty(countyCode) {
    // &c%5B%5D=12
    this.addSearchParameter("c[]", countyCode);
  }

  addRegion(regionCode) {
    // &r%5B%5D=2
    this.addSearchParameter("r[]", regionCode);
  }

  getUri() {
    return this.uri;
  }
}

export { NodaUriBuilder };
