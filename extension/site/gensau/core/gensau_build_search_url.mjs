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
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { SearchHelper } from "../../../base/core/search_helper.mjs";

const searchTypes = {
  all: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
  },
  SameCollection: {
    params: ["surname"],
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
    eventYearType: "adult",
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
    eventYearType: "adult",
    collectionId: "newspaper-marriage",
  },
  newsDivorces: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "adult",
    collectionId: "divorce",
  },
  cemeteries: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "died",
    collectionId: "cemeteries",
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
    eventYearType: "adult",
    collectionId: "church-marriage",
  },
  churchOther: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "church-others",
  },
  admissionsSchool: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "school-admissions",
  },
  admissionsHosp: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "hospital",
  },
  other: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "misc",
  },
  otherBisa: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "bisa",
  },
  otherBisaSupp: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "bisasupp",
  },
  otherCerts: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "adult",
    collectionId: "certificates",
  },
  otherIbsa: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "ibsa",
  },
  otherShipArrivals: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "shipping",
  },
  otherShipDepartures: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "lived",
    collectionId: "shipping-departures",
  },
  otherTrustees: {
    params: ["surname", "givenNames", "eventYear"],
    eventYearType: "adult",
    collectionId: "public-trustees",
  },
};

function addYearAndAccuracyForRange(builder, range) {
  if (range && range.endYear >= range.startYear) {
    let diff = range.endYear - range.startYear;
    let accuracy = Math.trunc((diff + 1) / 2);
    let midpointYear = range.startYear + accuracy;
    builder.addEventYear(midpointYear.toString(), accuracy.toString());
  }
}

function addYearAndAccuracyForLifeRange(builder, helper, startAge) {
  let startExactness = helper.options.search_gensau_birthYearExactness;
  let endExactness = helper.options.search_gensau_deathYearExactness;
  let lifeRange = helper.getYearRangeForAgeToDeath(startAge, startExactness, endExactness);
  if (lifeRange) {
    addYearAndAccuracyForRange(builder, lifeRange);
  }
}

function addYearAndAccuracyForBirth(builder, helper) {
  let exactness = helper.options.search_gensau_birthYearExactness;
  let range = helper.getYearRangeForBirth(exactness);
  if (range) {
    addYearAndAccuracyForRange(builder, range);
  }
}

function addYearAndAccuracyForDeath(builder, helper) {
  let exactness = helper.options.search_gensau_deathYearExactness;
  let range = helper.getYearRangeForDeath(exactness);
  if (range) {
    addYearAndAccuracyForRange(builder, range);
  }
}

function addYearAndAccuracyForEvent(builder, helper, exactness) {
  let range = helper.getYearRangeForEvent(exactness);
  if (range) {
    addYearAndAccuracyForRange(builder, range);
  }
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  let typeOfSearch = buildUrlInput.typeOfSearch;
  const options = buildUrlInput.options;
  const runDate = buildUrlInput.runDate;
  const parameters = buildUrlInput.searchParameters;

  let helper = new SearchHelper(gd, options, runDate);
  let builder = new GensauUriBuilder();

  if (!typeOfSearch) {
    typeOfSearch = "all";
  }

  let searchConfig = searchTypes[typeOfSearch];
  if (!searchConfig) {
    return {
      url: "https://www.genealogysa.org.au/resources/online-database-search",
    };
  }

  // call methods on builder here

  let collectionId = "";
  let collection = undefined;
  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      collectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "gensau",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      collection = RC.findCollection("gensau", collectionId);

      for (const [key, value] of Object.entries(searchTypes)) {
        if (value.collectionId == collectionId) {
          searchConfig = value;
          break;
        }
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    if (parameters.category) {
      searchConfig = searchTypes[parameters.category];
    }
    collectionId = searchConfig.collectionId;
  } else if (searchConfig.collectionId) {
    collectionId = searchConfig.collectionId;
  }

  if (collectionId) {
    builder.addCollectionId(collectionId);
  }

  if (searchConfig.params.includes("surname")) {
    let lastName = gd.inferLastName();
    if (parameters) {
      // parameters can override the lastNameindex
      lastName = gd.inferLastNameGivenParametersAndCollection(parameters, collection);
    } else if (searchConfig.eventYearType == "died") {
      lastName = gd.inferLastNameAtDeath();
    } else {
      lastName = gd.inferLastNameGivenParametersAndCollection(parameters, collection);
    }
    builder.addSurname(lastName);
  }
  if (searchConfig.params.includes("givenNames")) {
    builder.addGivenNames(gd.inferForenames());
  }

  if (searchConfig.params.includes("eventYear")) {
    if (typeOfSearch == "SameCollection") {
      helper.overrideQualifier = dateQualifiers.EXACT;
      addYearAndAccuracyForEvent(builder, helper, "exact");
    } else {
      if (searchConfig.eventYearType == "lived") {
        addYearAndAccuracyForLifeRange(builder, helper, 0);
      } else if (searchConfig.eventYearType == "adult") {
        const minAdultAge = 14;
        addYearAndAccuracyForLifeRange(builder, helper, minAdultAge);
      } else if (searchConfig.eventYearType == "born") {
        addYearAndAccuracyForBirth(builder, helper);
      } else if (searchConfig.eventYearType == "died") {
        addYearAndAccuracyForDeath(builder, helper);
      }
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

  // Only birth registrations support search by Book/Page
  if (typeOfSearch == "SameCollection" && collectionId == "birth") {
    if (gd.collectionData.registrationNumber) {
      builder.addBookPage(gd.collectionData.registrationNumber);
    } else if (gd.collectionData.volume && gd.collectionData.page) {
      let bookPage = gd.collectionData.volume + "/" + gd.collectionData.page;
      builder.addBookPage(bookPage);
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  let result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
