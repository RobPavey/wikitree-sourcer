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

// Example FMP search string:
// https://www.findmypast.co.uk/search/results
// ?sourcecategory=life+events%28bmds%29
// &sid=101
// &firstname=harry+alfred
// &firstname_variants=true
// &lastname=pavey
// &yearofbirth=1852
// &yearofbirth_offset=2
// &keywordsplace_proximity=5
// &sourcecountry=england

// &firstnamesother=fred&firstnamesother_variants=true&lastnamesother=bloggs
// &keywordsplace=welwyn%20garden%20city%2c%20hertfordshire%2c%20england&keywordsplace_proximity=5
// &fatherfirstname=william+henry&fatherfirstname_variants=true&fatherlastname=pavey&fatherlastname_variants=true
// &motherfirstname=elizabeth&motherfirstname_variants=true&mothersmaidenname=ellacott

// https://www.findmypast.co.uk/search/results
// ?sourcecategory=census%2c+land+%26+surveys&collection=census&sid=102
// &firstname=harry&firstname_variants=true&lastname=pavey&lastname_variants=true
// &eventyear=1861&eventyear_offset=2&yearofbirth=1852&yearofbirth_offset=2
// &firstnamesother=william+h&firstnamesother_variants=true&lastnamesother=pavey
// &keywordsplace_proximity=20&sourcecountry=england

// spousefirstname=amelia&spousefirstname_variants=true&spouselastname=littlemore

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(str) {
  return encodeURI(str).replace(/[()&,]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

class FmpUriBuilder {
  constructor(collection, options) {
    this.collection = collection;

    let domain = options.search_fmp_domain;
    if (domain == "none" || !domain) {
      domain = "findmypast.co.uk";
    }
    if (domain.startsWith("www")) {
      // this is to handle NLS access
      this.uri = "https://" + domain + "/search/results";
    } else {
      this.uri = "https://www." + domain + "/search/results";
    }
    this.searchTermAdded = false;
    this.titleMap = new Map();
    this.options = options;
  }

  getSearchQueryNameFromCollection(field, defaultName) {
    if (this.collection && this.collection.sites.fmp.searchQueryFields) {
      let name = this.collection.sites.fmp.searchQueryFields[field];
      if (name || name === "") {
        return name;
      }
    }

    return defaultName;
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
    if (parameter == undefined || parameter == "" || value == undefined || value == "") {
      return;
    }

    const encodedValue = fixedEncodeURIComponent(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addGender(gender) {
    this.addSearchParameter("gender", gender);
  }

  addName(title, name, nameVariants = true) {
    if (name != undefined && name != "") {
      name = name.trim().replace(/\s+/g, "+");

      this.addSearchParameter(title, WTS_String.removeExtendedAsciiCharacters(name));

      if (nameVariants) {
        this.addSearchParameter(title + "_variants", "true");
      }
    }
  }

  addYear(title, year, range = 2) {
    if (year != undefined && year != "") {
      this.addSearchParameter(title, year);
      this.addSearchParameter(title + "_offset", range);
    }
  }

  addPlace(title, location, proximity = 5) {
    if (location != undefined && location != "") {
      let string = location;
      this.addSearchParameter(title, WTS_String.removeExtendedAsciiCharacters(string));

      this.addSearchParameter(title + "_proximity", proximity);
    }
  }

  addPersonName(forenames, lastName) {
    this.addName("firstname", forenames);
    this.addName("lastname", lastName, this.options.search_fmp_lastNameVariants);
  }

  addEventPlace(place) {
    this.addPlace("keywordsplace", place);
  }

  addBirthPlace(place) {
    // only add birth place if collection has an entry for it
    let queryName = this.getSearchQueryNameFromCollection("birthPlace", "");
    this.addSearchParameter(queryName, place);
  }

  addBirthYear(year) {
    this.addYear("yearofbirth", year);
  }

  addDeathYear(year) {
    this.addYear("yearofdeath", year);
  }

  addEventYear(year) {
    this.addYear("eventyear", year);
  }

  addEventQuarter(quarter) {
    if (quarter != undefined && quarter != "") {
      this.addSearchParameter("eventquarter", quarter);
    }
  }

  addFather(forenames, lastName) {
    this.addName("fatherfirstname", forenames);
    this.addName("fatherlastname", lastName);
  }

  addMother(forenames, lastName) {
    this.addName("motherfirstname", forenames);
    this.addName("mothersmaidenname", lastName);
  }

  addSpouse(forenames, lastName) {
    this.addName("spousefirstname", forenames);
    this.addName("spouselastname", lastName);
  }

  addOtherPerson(forenames, lastName) {
    this.addName("firstnamesother", forenames);
    this.addName("lastnamesother", lastName);
  }

  addBirthCounty(county) {
    this.addSearchParameter("whereborncounty", county);
  }

  addSourceCountry(country) {
    this.addSearchParameter("sourcecountry", country);
  }

  addSourceCategory(category) {
    this.addSearchParameter("sourcecategory", category);
  }

  addCollection(collection) {
    this.addSearchParameter("collection", collection);
  }

  addDataSetName(dataSetName) {
    this.addSearchParameter("datasetname", dataSetName);
  }

  addRelationship(relationship) {
    this.addSearchParameter("relationship", relationship);
  }

  addMaritalStatus(status) {
    let queryName = this.getSearchQueryNameFromCollection("maritalStatus", "condition");
    this.addSearchParameter(queryName, status);
  }

  addDistrict(district) {
    this.addSearchParameter("district", district);
  }

  addRegistrationDistrict(district) {
    this.addSearchParameter("registrationdistrict", district);
  }

  addParish(district) {
    this.addSearchParameter("parish", district);
  }

  addVolume(volume) {
    let queryName = this.getSearchQueryNameFromCollection("volume", "volume");
    this.addSearchParameter(queryName, volume);
  }

  addPage(page) {
    let queryName = this.getSearchQueryNameFromCollection("page", "page");
    this.addSearchParameter(queryName, page);
  }

  addPiece(piece) {
    this.addSearchParameter("pieceno", piece);
  }

  addFolio(folio) {
    this.addSearchParameter("folio", folio);
  }

  getUri() {
    return this.uri;
  }
}

export { FmpUriBuilder };
