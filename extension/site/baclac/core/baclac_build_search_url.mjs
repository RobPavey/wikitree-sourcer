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

import { BaclacUriBuilder } from "./baclac_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function buildSameOldCollectionSearchUrl(buildUrlInput, builder) {
  const gd = buildUrlInput.generalizedData;
  const ed = buildUrlInput.extractedData;

  // We want to build the data source from the URL. A URL liks:
  // https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/Pages/item.aspx?IdNumber=301389
  // Should have a data source on the new site of:
  // Genealogy|Military|PfFww
  let url = ed.url;
  const discoverPrefix = "https://www.bac-lac.gc.ca/eng/discover/";
  if (url && url.startsWith(discoverPrefix)) {
    let remainder = url.substring(discoverPrefix.length);
    let string = "";
    let parts = remainder.split("/");
    const partToNew = {
      "military-heritage": "Genealogy|Military",
      "personnel-records": "PfFww",
    };
    for (let part of parts) {
      if (part == "Pages" || part.startsWith("item")) {
        break;
      }
      let level = partToNew[part];
      if (level) {
        if (string) {
          string += "|";
        }
        string += level;
      }
    }

    builder.addDataSourceAsString(string);
  } else {
    builder.addDataSource("Genealogy");
  }
  builder.addLastName(gd.inferLastName());
  builder.addFirstName(gd.inferForenames());

  builder.addBirthYear(gd.inferBirthYear(), 2);

  let searchString = gd.inferForenames() + " " + gd.inferLastName();
  searchString = searchString.trim();
  if (!searchString) {
    if (ed.recordData) {
      let name = ed.recordData["Name"];
      if (name) {
        searchString += name;
      }
    }
  }
  builder.addSearchString(searchString.trim());

  if (ed.recordData) {
    let itemId = ed.recordData["Item Number"];
    builder.addIdNumber(itemId);
  }
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new BaclacUriBuilder();

  // typeOfSearch can be:
  // "SameCollection"
  // "SpecifiedCollection"
  // "Census"
  // "All Collections"
  // "SpecifiedParameters"

  if (typeOfSearch == "Census") {
    builder.addDataSource("Genealogy", "Census");
    builder.addLastName(gd.inferLastName());
    builder.addFirstName(gd.inferForenames());

    builder.addBirthYear(gd.inferBirthYear(), 2);

    // This can fail if there is no birth country specified in the census being searched
    // Could possibly have some data in RC
    //builder.addBirthPlace(gd.inferBirthCountry());
  } else if (typeOfSearch == "SameOldCensus") {
    builder.addDataSource("Genealogy", "Census");
    builder.addLastName(gd.inferLastName());
    builder.addFirstName(gd.inferForenames());

    builder.addBirthYear(gd.inferBirthYear(), 2);

    // This can fail if there is no birth country specified in the census being searched
    // Could possibly have some data in RC
    //builder.addBirthPlace(gd.inferBirthCountry());
  } else if (typeOfSearch == "SameOldCollection") {
    buildSameOldCollectionSearchUrl(buildUrlInput, builder);
  } else if (typeOfSearch == "SameCollection") {
    let collectionId = "";
    if (gd.collectionData && gd.collectionData.id) {
      collectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "baclac",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    } else {
      // should never happen
    }

    if (collectionId) {
      let collection = RC.findCollection("baclac", collectionId);

      function includeField(fieldName) {
        return RC.doesCollectionSupportSearchField(collection, "baclac", fieldName);
      }

      // Assume it will be a census for now
      builder.addDataSource("Genealogy", "Census");
      builder.addCensusApplicationCode(collectionId);

      builder.addLastName(gd.inferLastName());
      builder.addFirstName(gd.inferForenames());

      if (includeField("age")) {
        builder.addAge(gd.ageAtEvent, 0);
      }
      if (includeField("maritalStatus")) {
        builder.addMaritalStatus(gd.maritalStatus);
      }
      if (includeField("gender")) {
        builder.addGender(gd.personGender);
      }
      if (includeField("birthCountry")) {
        builder.addBirthPlace(gd.inferBirthCountry());
      }

      // Add collection reference gd if this is SameCollection
      builder.addDistrict(gd.collectionData.district);
      builder.addSubDistrict(gd.collectionData.subDistrict);
      builder.addPageNumber(gd.collectionData.page);
    }
  } else if (typeOfSearch == "AllCollections") {
    let searchString = gd.inferForenames() + " " + gd.inferLastName();
    builder.addSearchStringExact(searchString);

    let dateRange = gd.inferPossibleLifeYearRange();
    if (dateRange && dateRange.startYear && dateRange.endYear) {
      builder.addDateRange(dateRange.startYear.toString(), dateRange.endYear.toString());
    }
  } else if (typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      let collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection && collection.sites["baclac"]) {
        let baclacCollectionId = collection.sites["baclac"].id;
        builder.addCensusApplicationCode(baclacCollectionId);

        builder.addDataSource("Genealogy", "Census");

        builder.addLastName(gd.inferLastNameGivenParametersAndCollection(undefined, collection, true));
        builder.addFirstName(gd.inferForenames());
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    let parameters = buildUrlInput.searchParameters;
    let lastName = gd.inferLastName();
    let lastNames = gd.inferLastNameGivenParametersAndCollection(parameters, undefined, true);
    if (lastNames) {
      lastName = lastNames;
    }

    let searchString = gd.inferForenames() + " " + lastName;
    searchString = searchString.replace(/\s+/g, " ");
    searchString = searchString.trim();
    builder.addSearchStringExact(searchString);

    let dateRange = gd.inferPossibleLifeYearRange();
    if (dateRange && dateRange.startYear && dateRange.endYear) {
      builder.addDateRange(dateRange.startYear.toString(), dateRange.endYear.toString());
    }

    let category = parameters.category;
    if (category != "all") {
      if (category && category.includes("|")) {
        let levels = category.split("|");
        if (levels.length > 1) {
          builder.addDataSource(levels[0], levels[1]);
        }
      }
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
