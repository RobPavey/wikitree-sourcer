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

import { GensauUriBuilder } from "./gensau_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

const searchTypes = {
  default: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
  },
  SameCollection: {
    params: ["surname"],
    eventYearType: "born",
  },
  SpecifiedParameters: {
    params: ["surname"],
    eventYearType: "born",
  },
  bdmBirths: {
    params: ["surname", "givenNames", "eventYear", "district"],
    eventYearType: "born",
    collectionId: "birth",
  },
  bdmDeaths: {
    params: ["surname", "givenNames", "eventYear", "district"],
    eventYearType: "died",
    collectionId: "death",
  },
  bdmMarriages: {
    params: ["surname", "givenNames", "eventYear", "district"],
    eventYearType: "lived",
    collectionId: "marriage",
  },
  newsBirths: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "born",
    collectionId: "newspaper-birth",
  },
  newsDeaths: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "died",
    collectionId: "newspaper-death",
  },
  newsMarriages: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "newspaper-marriage",
  },
  newsDivorces: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "divorce",
  },
  churchBurials: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "died",
    collectionId: "church-burial",
  },
  churchBaptisms: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "born",
    collectionId: "church-baptism",
  },
  churchMarriages: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "church-marriage",
  },
  churchOther: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "church-others",
  },
};

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  let typeOfSearch = buildUrlInput.typeOfSearch;
  const options = buildUrlInput.options;
  const runDate = buildUrlInput.runDate;
  const parameters = buildUrlInput.searchParameters;

  var builder = new GensauUriBuilder();

  if (!typeOfSearch) {
    typeOfSearch = "default";
  }

  let searchConfig = searchTypes[typeOfSearch];
  if (!searchConfig) {
    return {
      url: "https://www.genealogysa.org.au/resources/online-database-search",
    };
  }

  // call methods on builder here

  let collectionId = "";
  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      collectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "gensau",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    if (parameters.category && parameters.category != "All") {
      searchConfig = searchTypes[parameters.category];
    } else {
      searchConfig = searchTypes["default"];
    }
    collectionId = searchConfig.collectionId;
  } else if (searchConfig.collectionId) {
    collectionId = searchConfig.collectionId;
  }

  if (collectionId) {
    builder.addCollectionId(collectionId);
  }

  if (searchConfig.params.includes("surname")) {
    builder.addSurname(gd.inferLastName());
  }
  if (searchConfig.params.includes("givenNames")) {
    builder.addGivenNames(gd.inferForenames());
  }

  if (searchConfig.params.includes("eventYear")) {
    if (searchConfig.eventYearType == "lived") {
      const maxLifespan = Number(options.search_general_maxLifespan);
      let lifeRange = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
      if (lifeRange.startYear && lifeRange.endYear) {
        let lifeSpan = lifeRange.endYear - lifeRange.startYear;
        let accuracy = Math.trunc((lifeSpan + 1) / 2);
        let midpointYear = lifeRange.startYear + accuracy;
        builder.addEventYear(midpointYear, accuracy);
      }
    } else if (searchConfig.eventYearType == "born") {
      let birthYear = gd.inferBirthYear();
      let accuracy = 5;
      builder.addEventYear(birthYear, accuracy);
    } else if (searchConfig.eventYearType == "died") {
      let birthYear = gd.inferDeathYear();
      let accuracy = 5;
      builder.addEventYear(birthYear, accuracy);
    }
  }

  // father
  if (searchConfig.params.includes("father") || (parameters && parameters.father)) {
    let parentNames = gd.inferParentForenamesAndLastName();
    let fatherName = "";
    if (parentNames) {
      let fatherForenames = parentNames.fatherForenames;
      let fatherLastName = parentNames.fatherLastName;
      if (fatherForenames && fatherLastName) {
        fatherName = fatherForenames + " " + fatherLastName;
      } else if (fatherForenames) {
        fatherName = fatherForenames;
      } else if (fatherLastName) {
        fatherName = fatherLastName;
      }
      builder.addFather(fatherName);
    }
  }

  if (searchConfig.params.includes("district") && gd.registrationDistrict) {
    builder.addDistrict(gd.registrationDistrict);
  }

  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData.registrationNumber) {
      builder.addBookPage(gd.collectionData.registrationNumber);
    } else if (gd.collectionData.volume && gd.collectionData.page) {
      let bookPage = gd.collectionData.volume + "/" + gd.collectionData.page;
      builder.addBookPage(bookPage);
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
