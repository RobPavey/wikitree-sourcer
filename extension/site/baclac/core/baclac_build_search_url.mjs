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

function buildSameOldCensusSearchUrl(buildUrlInput, builder) {
  const gd = buildUrlInput.generalizedData;
  const ed = buildUrlInput.extractedData;

  if (!gd.collectionData) {
    return;
  }

  let collectionId = gd.collectionData.id;

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

    builder.addDistrict(gd.collectionData.district);
    builder.addSubDistrict(gd.collectionData.subDistrict);
    builder.addPageNumber(gd.collectionData.page);
  }
}

function buildSameOldCollectionSearchUrl(buildUrlInput, builder) {
  const gd = buildUrlInput.generalizedData;
  const ed = buildUrlInput.extractedData;

  // We want to build the data source from the URL. A URL liks:
  // https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/Pages/item.aspx?IdNumber=301389
  // Should have a data source on the new site of:
  // Genealogy|Military|PfFww
  // Note: This link helps find these old records:
  // https://library-archives.canada.ca/eng/collection/research-help/military-heritage/first-world-war/pages/first-world-war.aspx
  let url = ed.url;
  const oldUrlToNewData = [
    {
      // Search: https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/Pages/personnel-records.aspx
      // Record: https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/Pages/item.aspx?IdNumber=301389
      urlFragment: "military-heritage/first-world-war/personnel-records",
      dataSource: "Genealogy|Military|PfFww",
      useIdNumber: true,
      useLastName: true,
      useForenames: true,
    },
    {
      // Search: https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/courts-martial/Pages/courts-martial.aspx
      // Record: https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/courts-martial/Pages/item.aspx?IdNumber=8265&
      urlFragment: "military-heritage/first-world-war/courts-martial",
      dataSource: "Genealogy|Military|CouMarWwi",
      useNamesInSearchString: true,
      useDate: true,
    },
    {
      // Search: https://www.bac-lac.gc.ca/eng/discover/military-heritage/second-world-war/second-world-war-dead-1939-1947/Pages/search.aspx
      // The above search now redirects so can't find an example
      urlFragment: "military-heritage/second-world-war/second-world-war-dead-1939-1947",
      dataSource: "Genealogy|Military|Kia",
      useNamesInSearchString: true,
      useDate: true,
    },
    {
      // catch all for second world war
      urlFragment: "military-heritage/second-world-war",
      dataSource: "Genealogy|Military|Kia",
      useNamesInSearchString: true,
      useDate: true,
    },
    {
      // Search: https://www.bac-lac.gc.ca/eng/discover/military-heritage/loyalists/loyalists-ward-chipman/pages/search.aspx
      // Record: https://www.bac-lac.gc.ca/eng/discover/military-heritage/loyalists/loyalists-ward-chipman/pages/item.aspx?IdNumber=106&
      urlFragment: "military-heritage/loyalists/loyalists-ward-chipman",
      dataSource: "Genealogy|Military|PorRos",
      useNamesInSearchString: true,
      useYear: true,
    },
    {
      // Search: https://www.bac-lac.gc.ca/eng/discover/military-heritage/royal-canadian-navy-1910-1941-ledger-sheets/Pages/canadian-navy-ledger-sheets.aspx
      // The above search now redirects so can't find an example
      urlFragment: "military-heritage/royal-canadian-navy-1910-1941-ledger-sheets",
      dataSource: "Genealogy|Military|RoyNavLed",
      useNamesInSearchString: true,
      useServiceNumberInSearch: true,
    },
  ];

  const defaultDataType = { dataSource: "Genealogy" };

  let dataType = defaultDataType;

  for (let entry of oldUrlToNewData) {
    if (url.includes(entry.urlFragment)) {
      dataType = entry;
      break;
    }
  }

  builder.addDataSourceAsString(dataType.dataSource);

  if (dataType.useLastName) {
    builder.addLastName(gd.inferLastName());
  }
  if (dataType.useForenames) {
    builder.addFirstName(gd.inferForenames());
  }

  if (dataType.useBirthYear) {
    builder.addBirthYear(gd.inferBirthYear(), 0);
  }

  let searchString = "";
  if (dataType.useNamesInSearchString) {
    searchString = gd.inferForenames() + " " + gd.inferLastName();
    searchString = searchString.trim();
    if (!searchString) {
      if (ed.recordData) {
        let name = ed.recordData["Name"];
        if (name) {
          searchString += name;
        }
      }
    }
  }
  if (dataType.useServiceNumberInSearch && gd.serviceNumber) {
    if (searchString) {
      searchString += " ";
    }
    searchString += gd.serviceNumber;
  }

  builder.addSearchString(searchString.trim());

  if (ed.recordData) {
    if (dataType.useIdNumber) {
      let itemId = ed.recordData["Item Number"];
      builder.addIdNumber(itemId);
    }
    if (dataType.useDate) {
      builder.addDate(ed.recordData["Date"]);
    } else if (dataType.useYear) {
      builder.addDate(ed.recordData["Year"]);
    }
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
  // "SpecifiedParameters"  // not yet supported fully
  // "SameOldCensus"
  // "SameOldCollection"

  if (typeOfSearch == "Census") {
    builder.addDataSource("Genealogy", "Census");
    builder.addLastName(gd.inferLastName());
    builder.addFirstName(gd.inferForenames());

    builder.addBirthYear(gd.inferBirthYear(), 2);

    // This can fail if there is no birth country specified in the census being searched
    // Could possibly have some data in RC
    //builder.addBirthPlace(gd.inferBirthCountry());
  } else if (typeOfSearch == "SameOldCensus") {
    buildSameOldCensusSearchUrl(buildUrlInput, builder);
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
        builder.addBirthYear(gd.inferBirthYear(), 2);
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
