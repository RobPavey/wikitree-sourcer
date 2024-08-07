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
import { RC } from "../../../base/core/record_collections.mjs";

// Example FamilySearch search string:
// https://www.familysearch.org/search/record/results
// ?q.givenName=Ralph%20Edgar
// &q.surname=Pavey
// &q.birthLikePlace=Kentish%20Town%2C%20London%2C%20England
// &q.birthLikeDate.from=1890
// &q.birthLikeDate.to=1891
// &q.deathLikePlace=WGC%2C%20Herts
// &q.deathLikeDate.from=1930
// &q.deathLikeDate.to=1940
// &f.recordCountry=England

// &q.marriageLikePlace=abc%2C%20sussex
// &q.marriageLikeDate.from=1910
// &q.marriageLikeDate.to=1920&

// https://www.familysearch.org/search/record/results
// ?q.givenName=Elizabeth&q.surname=Ellacott
// &q.surname.1=Pavey&q.surname.require.1=off
// &q.birthLikePlace=Plymouth%2C%20Devon%2C%20England
// &q.birthLikeDate.from=1803
// &q.birthLikeDate.to=1808
// &q.deathLikePlace=Camberwell%2C%20London
// &q.deathLikeDate.from=1883
// &q.deathLikeDate.to=1887
// &q.spouseGivenName=William%20Henry
// &q.spouseSurname=Pavey
// &count=20&offset=0&m.defaultFacets=on&m.queryRequireDefault=on&m.facetNestCollectionInCategory=on

// https://www.familysearch.org/search/record/results?q.givenName=Elizabeth&q.surname=Ellacott&q.surname.1=Pavey&q.surname.require.1=off&q.birthLikePlace=Plymouth%2C%20Devon%2C%20England&q.birthLikeDate.from=1803&q.birthLikeDate.to=1808
// &q.deathLikePlace=Camberwell%2C%20London&q.deathLikeDate.from=1883&q.deathLikeDate.to=1887
// &q.spouseGivenName=William%20Henry&q.spouseSurname=Pavey
// &q.spouseGivenName.1=Joe&q.spouseSurname.1=Bloggs
// &count=20&offset=0&m.defaultFacets=on&m.queryRequireDefault=on&m.facetNestCollectionInCategory=on

// Extra stuff that FS adds but not required in URL:
// &m.defaultFacets=on&m.queryRequireDefault=on&m.facetNestCollectionInCategory=on&count=20&offset=0

class FsUriBuilder {
  constructor(type, fsCollectionId) {
    if (type == "tree") {
      this.uri = "https://www.familysearch.org/search/tree/results?count=20";
    } else if (type == "fullText") {
      this.uri = "https://www.familysearch.org/search/full-text/results?count=20";
    } else {
      this.uri = "https://www.familysearch.org/search/record/results?count=20";
    }
    this.searchTermAdded = true;
    this.titleMap = new Map();

    if (fsCollectionId) {
      this.collection = RC.findCollection("fs", fsCollectionId);
      this.addCollection(fsCollectionId);
    }
  }

  getSearchQueryNameFromCollection(field, defaultName) {
    if (this.collection && this.collection.sites.fs.searchQueryFields) {
      let name = this.collection.sites.fs.searchQueryFields[field];
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

  makeUniqueTitle(title) {
    let uniqueTitle = title;
    if (this.titleMap.has(title)) {
      let count = this.titleMap.get(title);
      uniqueTitle = title + "." + count;
      this.titleMap.set(title, count + 1);
    } else {
      this.titleMap.set(title, 1);
    }

    return uniqueTitle;
  }

  addPlace(title, location) {
    if (location != undefined && location != "") {
      var fullTitle = "q." + title + "Place";
      var uniqueTitle = this.makeUniqueTitle(fullTitle);
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(location));
    }
  }

  addDateFrom(title, year) {
    if (year != undefined && year != "") {
      var fullTitle = "q." + title + "Date.from";
      var uniqueTitle = this.makeUniqueTitle(fullTitle);
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(year));
    }
  }

  addDateTo(title, year) {
    if (year != undefined && year != "") {
      var fullTitle = "q." + title + "Date.to";
      var uniqueTitle = this.makeUniqueTitle(fullTitle);
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(year));
    }
  }

  addDate(title, yearRange) {
    if (yearRange) {
      this.addDateFrom(title, yearRange.fromYear);
      this.addDateTo(title, yearRange.toYear);
    }
  }

  addNameParameter(title, names) {
    var uniqueTitle = this.makeUniqueTitle(title);
    var string = "";
    if (names != undefined && names != "") {
      string += names.trim();
    }
    if (string != "") {
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(string));
    }
  }

  addName(forenames, lastName) {
    if (forenames != "") {
      this.addNameParameter("q.givenName", forenames);
    }
    if (lastName != "") {
      this.addNameParameter("q.surname", lastName);
    }
  }

  addGender(gender) {
    if (gender == "male") {
      gender = "Male";
    } else if (gender == "female") {
      gender = "Female";
    } else {
      return;
    }
    this.addSearchParameter("q.sex", gender);
  }

  addBirth(yearRange, location) {
    this.addPlace("birthLike", location);
    this.addDate("birthLike", yearRange);
  }

  addDeath(yearRange, location) {
    this.addPlace("deathLike", location);
    this.addDate("deathLike", yearRange);
  }

  addFather(forenames, lastName) {
    // &q.fatherGivenName=Ernest&q.fatherSurname=Bloggs
    this.addNameParameter("q.fatherGivenName", forenames);
    this.addNameParameter("q.fatherSurname", lastName);
  }

  addMother(forenames, lastName) {
    this.addNameParameter("q.motherGivenName", forenames);
    this.addNameParameter("q.motherSurname", lastName);
  }

  addSpouse(forenames, lastName) {
    this.addNameParameter("q.spouseGivenName", forenames);
    this.addNameParameter("q.spouseSurname", lastName);
  }

  addMarriage(yearRange, location) {
    // &q.marriageLikePlace=abc%2C%20sussex
    // &q.marriageLikeDate.from=1910
    // &q.marriageLikeDate.to=1920&
    this.addPlace("marriageLike", location);
    this.addDate("marriageLike", yearRange);
  }

  addResidence(yearRange, location) {
    // &q.residencePlace=Friern%20Barnet%2C%20Middlesex%2C%20England
    // &q.residenceDate.from=1901
    // &q.residenceDate.to=1901
    this.addPlace("residence", location);
    this.addDate("residence", yearRange);
  }

  addCollection(collectionId) {
    // &f.collectionId=1888129
    this.addSearchParameter("f.collectionId", collectionId);
  }

  addCountry(countryName) {
    // &f.recordCountry=England (filter) OR &q.recordCountry=England (query param)
    // It used to appear to work if you add multiple of these, no longer does
    this.addSearchParameter("q.recordCountry", countryName);
  }

  addRecordType(type) {
    // &f.recordType=0
    // There can be multiple in range 0 (births) to 7 (other)
    this.addSearchParameter("f.recordType", type);
  }

  addMaritalStatus(status) {
    // &f.maritalStatus=Married
    // In the latest search this is not shown in UI at all
    // It seems to stop search working so ignore
    // this.addSearchParameter("f.maritalStatus", status);
  }

  addRelationship(relationship) {
    // &q.maritalStatus=Married
    // In the latest search this is not shown in UI at all

    const supportedRelationships = [
      "Aunt",
      "Boarder",
      "Brother",
      "Cousin",
      "Daughter",
      "Employee",
      "Father",
      "Granddaughter",
      "Grandfather",
      "Grandmother",
      "Grandson",
      "Head",
      "Inmate",
      "Military",
      "Mother",
      "Nephew",
      "Niece",
      "Other",
      "Other relative",
      "Patient",
      "Religious",
      "Sister",
      "Son",
      "Student",
      "Uncle",
      "Unknown",
      "Wife",
    ];
    if (!relationship) {
      return;
    }
    let queryName = this.getSearchQueryNameFromCollection("relationshipToHead", "q.relationshipToHead");

    if (queryName) {
      let lcRelationship = relationship.toLowerCase();
      for (let supRel of supportedRelationships) {
        if (lcRelationship == supRel.toLowerCase()) {
          this.addSearchParameter(queryName, supRel);
          return;
        }
      }
    }
  }

  addFullName(fullName) {
    // used in  full-text search
    if (fullName != undefined && fullName != "") {
      this.addSearchParameter("q.fullName", StringUtils.removeExtendedAsciiCharacters(fullName));
    }
  }

  getUri() {
    return this.uri;
  }
}

export { FsUriBuilder };
