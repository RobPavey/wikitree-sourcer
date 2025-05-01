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

function fixupLocation(location) {
  let result = location.trim();
  result = result.replace(/\,\s*/g, "-");
  result = result.replace(/\s+/g, "+");
  return result;
}

// Example Ancestry search string:
// https://www.ancestry.com/search/
// ?name=Ralph+Edgar_Pavey
// &birth=1891_Kentish+Town-London-England
// &death=1958_Marylebone-London-England
// &child=Heather+Carol_Pavey
// &child2=Darel_Pavey
// &child3=Jack+Vernon_Pavey
// &child4=Ralph+Allan_Pavey
// &child5=Derek_Pavey
// &child6=Peter_Pavey
// &father=Harry+Alfred_Pavey
// &gender=m
// &marriage=1914_lambeth-surrey-england-united+kingdom_85496     << what is number on end?
// &mother=Amelia+Elizabeth_Littlemore
// &residence=_finchley-middlesex-england-united+kingdom_85841
// &residence2=_finchley-middlesex-england-united+kingdom_85841
// &residence3=_Islington-London-England
// &residence4=_St+Pancras-London-England
// &sibling=Henry_Pavey
// &sibling2=George+Bernard_Pavey
// &sibling3=Harold+Gilbert_Pavey
// &sibling4=Charles+Allan+Dew_Pavey
// &sibling5=Harry+Alfred+G_Pavey
// &sibling6=Amelia+Annie_Pavey
// &sibling7=Harry+Alfred_Pavey
// &sibling8=Mary+Elizabeth+Maisie_Pavey
// &sibling9=Arthur+Eli_Pavey
// &spouse=Elsie+Sarah_Chambers
// &spouse2=Clara+Ethel_Risley
// &treePerson=86808578_46552199708
//
// Note: only one marriage? It seems to accept several but the search form doesn't allow them to be added

// https://www.ancestry.com/search/?name=Ralph+Edgar_Pavey&birth=1891_Kentish+Town-London-England
// &death=1958_Marylebone-London-England&child=Ralph+Allan_Pavey&child2=Jack+Vernon_Pavey&child3=Darel_Pavey
// &child4=Peter_Pavey&child5=Derek_Pavey&child6=Heather+Carol_Pavey&father=Harry+Alfred_Pavey
// &gender=m&marriage=1914_lambeth-surrey-england-united+kingdom_85496
// &mother=Amelia+Elizabeth_Littlemore&residence=_finchley-middlesex-england-united+kingdom_85841
// &residence2=_finchley-middlesex-england-united+kingdom_85841
// &residence3=_Islington-London-England&residence4=_St+Pancras-London-England
// &searchType=t
// &sibling=Harry+Alfred+G_Pavey&sibling2=Mary+Elizabeth+Maisie_Pavey&sibling3=George+Bernard_Pavey
// &sibling4=Harry+Alfred_Pavey&sibling5=Amelia+Annie_Pavey&sibling6=Charles+Allan+Dew_Pavey
// &sibling7=Arthur+Eli_Pavey&sibling8=Harold+Gilbert_Pavey&sibling9=Henry_Pavey
// &spouse=Clara+Ethel_Risley
// &spouse2=Elsie+Sarah_Chambers&treePerson=86808578_46552199708

import { RC } from "../../../base/core/record_collections.mjs";

class AncestryUriBuilder {
  constructor(collectionId, category, subcategory, options) {
    if (collectionId) {
      this.collection = RC.findCollection("ancestry", collectionId);
    }

    let domain = options.search_ancestry_domain;
    if (domain == "none" || !domain) {
      domain = "ancestry.com";
    }

    let uriBase = "https://www." + domain + "/search/";

    if (collectionId) {
      this.uri = uriBase + "collections/" + collectionId + "/";
    } else if (subcategory && subcategory != "all") {
      this.uri = uriBase + "categories/" + subcategory + "/";
    } else if (category && category != "all") {
      this.uri = uriBase + "categories/" + category + "/";
    } else {
      this.uri = uriBase;
    }
    this.searchTermAdded = false;
    this.titleMap = new Map();
  }

  getSearchQueryNameFromCollection(field, defaultName) {
    if (this.collection && this.collection.sites.ancestry.searchQueryFields) {
      let name = this.collection.sites.ancestry.searchQueryFields[field];
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

  addSearchParameter(parameter, value, exact = false) {
    if (parameter == undefined || parameter == "" || value == undefined || value == "") {
      return;
    }

    // Note that we do not use encodeURIComponent since that would turn "+" into %2B
    // which would result in the name shown in the search box looking something like:
    // Harry+Alfred+George
    const encodedValue = encodeURI(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }

    if (exact) {
      this.uri = this.uri.concat("&", parameter, "_x=1");
    }
  }

  makeUniqueTitle(title) {
    let uniqueTitle = title;
    if (this.titleMap.has(title)) {
      let count = this.titleMap.get(title);
      count++;
      uniqueTitle = title + count;
      this.titleMap.set(title, count);
    } else {
      this.titleMap.set(title, 1);
    }

    return uniqueTitle;
  }

  addEvent(title, year, location) {
    var uniqueTitle = this.makeUniqueTitle(title);
    var string = "";
    if (year != undefined && year != "") {
      string += year;
    }
    if (location != undefined && location != "") {
      string += "_";
      string += fixupLocation(location);
    }
    if (string != "") {
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(string));
    }
  }

  addPersonName(title, forenames, lastName) {
    var uniqueTitle = this.makeUniqueTitle(title);
    var name = "";
    if (forenames != undefined && forenames != "") {
      name += forenames.trim().replace(/\s+/g, "+");
    }
    if (lastName != undefined && lastName != "") {
      name += "_";
      name += lastName.trim().replace(/\s+/g, "+");
    }
    if (name != "") {
      this.addSearchParameter(uniqueTitle, StringUtils.removeExtendedAsciiCharacters(name));
    }
  }

  addName(forenames, lastName) {
    this.addPersonName("name", forenames, lastName);
  }

  addBirth(year, location) {
    this.addEvent("birth", year, location);
  }

  addDeath(year, location) {
    this.addEvent("death", year, location);
  }

  addMarriage(year, location) {
    this.addEvent("marriage", year, location);
  }

  addResidence(location) {
    this.addEvent("residence", "", location);
  }

  addFather(forenames, lastName) {
    this.addPersonName("father", forenames, lastName);
  }

  addMother(forenames, lastName) {
    this.addPersonName("mother", forenames, lastName);
  }

  addSpouse(forenames, lastName) {
    this.addPersonName("spouse", forenames, lastName);
  }

  addGenderMale() {
    this.addSearchTerm("gender=m");
  }

  addGenderFemale() {
    this.addSearchTerm("gender=f");
  }

  addPriority(priority) {
    this.addSearchParameter("priority", priority);
  }

  addVolume(volume) {
    let queryName = this.getSearchQueryNameFromCollection("volume", "f-SourceVolumeNumber");
    this.addSearchParameter(queryName, volume);
  }

  addPage(page) {
    let queryName = this.getSearchQueryNameFromCollection("page", "f-SourcePageNumber");
    this.addSearchParameter(queryName, page);
  }

  addFolio(folio) {
    let queryName = this.getSearchQueryNameFromCollection("folio", "f-SourceFolioNumber");
    this.addSearchParameter(queryName, folio, true);
  }

  addPiece(piece) {
    let queryName = this.getSearchQueryNameFromCollection("piece", "f-SourcePieceNumber");
    this.addSearchParameter(queryName, piece, true);
  }

  addSchedule(schedule) {
    let queryName = this.getSearchQueryNameFromCollection("schedule", "f-Famnum");
    this.addSearchParameter(queryName, schedule);
  }

  addRegistrationNumber(registrationNumber) {
    if (registrationNumber) {
      let queryName = this.getSearchQueryNameFromCollection("registrationNumber", "");
      if (queryName) {
        this.addSearchParameter(queryName, registrationNumber);
        this.addSearchParameter(queryName + "_x", "1"); // set as exact
      }
    }
  }

  addEnumerationDistrict(enumDistrict) {
    if (enumDistrict) {
      let queryName = this.getSearchQueryNameFromCollection("enumDistrict", "");
      if (queryName) {
        this.addSearchParameter(queryName, enumDistrict);
        // don't set as exact as sometimes the Ancestry record has a name and somtimes a number
      }
    }
  }

  addDistrict(district) {
    let defaultName = "f-Self-Residence-RegistrationDistrict";
    if (this.collection) {
      if (this.collection.isBirth || this.collection.isDeath) {
        defaultName = "f-Notes";
      }
    }
    let queryName = this.getSearchQueryNameFromCollection("district", defaultName);
    this.addSearchParameter(queryName, district);
  }

  addMaritalStatus(maritalStatus) {
    this.addSearchParameter("f-Self-MaritalStatus", maritalStatus);
  }

  addRelationship(relationship) {
    this.addSearchParameter("f-Self-RelationToHead", relationship);
  }

  addRestrictToRecords(includeTrees, includeStories, includePhotos) {
    if (includeTrees && includeStories && includePhotos) {
      return;
    }

    let typesString = "r";
    if (includeTrees) {
      typesString += "t";
    }
    if (includeStories) {
      typesString += "s";
    }
    if (includePhotos) {
      typesString += "p";
    }
    this.addSearchParameter("types", typesString);
  }

  getUri() {
    return this.uri;
  }
}

export { AncestryUriBuilder };
