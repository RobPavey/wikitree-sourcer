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

import { GenquebecUriBuilder } from "./genquebec_uri_builder.mjs";

function addEvent(builder, eventType, yearString, place, range) {
  if (yearString) {
    builder.addEventYear(eventType, yearString, range);
  }
  if (place) {
    // The site's location field matches on a single place, such as a parish or town
    builder.addEventLocation(eventType, place.split(",")[0].trim());
  }
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new GenquebecUriBuilder();

  const range = options ? options.search_genquebec_dateExactness : undefined;

  builder.addFirstName(gd.inferForenames());
  builder.addLastName(gd.inferLastName());

  addEvent(builder, "birth", gd.inferBirthYear(), gd.inferBirthPlace(), range);
  addEvent(builder, "death", gd.inferDeathYear(), gd.inferDeathPlace(), range);

  if (gd.spouses && gd.spouses.length > 0) {
    const spouse = gd.spouses[0];
    if (spouse.name) {
      builder.addSpouseName(spouse.name.inferForenames(), spouse.name.inferLastName());
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
