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

import { OpenarchUriBuilder } from "./openarch_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const searchParameters = buildUrlInput.searchParameters;

  var builder = new OpenarchUriBuilder();

  // typeOfSearch can be:
  // "SameCollection"

  let sourceType = "";
  let eventType = "";
  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      sourceType = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "openarch",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    }

    if (gd.collectionData && gd.collectionData.eventType) {
      eventType = gd.collectionData.eventType;
    }
  }

  // add type to search
  if (sourceType) {
    // if it starts with "other:" then remove that.
    const otherPrefix = "other:";
    if (sourceType.startsWith(otherPrefix)) {
      sourceType = sourceType.substring(otherPrefix.length);
    }
    builder.addSourceType(sourceType);
  }
  if (eventType) {
    builder.addEventType(eventType);
  }

  let namePart = gd.inferFullName();
  if (gd.collectionData && gd.collectionData.nameParts) {
    let nameParts = gd.collectionData.nameParts;
    namePart = "";
    if (nameParts.forenames) {
      namePart = nameParts.forenames;
    }
    if (nameParts.patronym) {
      if (namePart) {
        namePart += " ";
      }
      namePart += nameParts.patronym;
    }
    if (nameParts.lastNamePrefix) {
      if (namePart) {
        namePart += " ";
      }
      namePart += nameParts.lastNamePrefix;
    }
    if (nameParts.lastName) {
      if (namePart) {
        namePart += " ";
      }
      namePart += nameParts.lastName;
    }
    if (!namePart && nameParts.fullName) {
      // should only happen if the name is not broken into parts at all
      namePart = nameParts.fullName;
    }
  }

  if (typeOfSearch == "SameCollection") {
    let year = gd.inferEventYear();
    if (year) {
      namePart += " " + year + "-" + year;
    }
  } else {
    let range = gd.inferPossibleLifeYearRange();
    if (range) {
      if (range.startYear) {
        namePart += " " + range.startYear;
        if (range.endYear) {
          namePart += "-" + range.endYear;
        }
      }
    }
  }

  builder.addName(namePart);

  // Add place for specified parameters
  if (typeOfSearch == "SpecifiedParameters") {
    if (searchParameters) {
      if (searchParameters.place && searchParameters.place != "<none>") {
        builder.addEventPlace(searchParameters.place);
      }
    }
  }

  // Add collection reference gd if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    builder.addEventPlace(gd.collectionData.place);
    builder.addArchiveCode(gd.collectionData.archiveCode);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
