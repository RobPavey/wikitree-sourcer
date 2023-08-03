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
import { DateUtils } from "../../../base/core/date_utils.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new OpenarchUriBuilder();

  // typeOfSearch can be:
  // "SameCollection"

  let sourceType = "";
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
  }

  // add type to search
  if (sourceType) {
    builder.addSourceType(sourceType);
  }

  builder.addName(gd.inferFullName());

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
