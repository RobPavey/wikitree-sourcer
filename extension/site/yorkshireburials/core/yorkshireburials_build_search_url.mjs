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

import { YorkshireburialsUriBuilder } from "./yorkshireburials_uri_builder.mjs";
import { SearchHelper } from "../../../base/core/search_helper.mjs";

// The site search form only accepts these values for the year ranges
const allowedYearRanges = [0, 1, 2, 5, 10];

// Convert a start/end year range into the single year plus "+/-" range that the site uses.
// The site range is widened if needed so that the whole of the requested range is covered.
function yearRangeToSiteYearAndRange(range) {
  if (!range || !range.startYear || !range.endYear) {
    return undefined;
  }

  const startYear = Number(range.startYear);
  const endYear = Number(range.endYear);
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || startYear > endYear) {
    return undefined;
  }

  const centerYear = Math.round((startYear + endYear) / 2);
  const halfWidth = Math.max(centerYear - startYear, endYear - centerYear);

  let siteRange = allowedYearRanges[allowedYearRanges.length - 1];
  for (let allowedRange of allowedYearRanges) {
    if (allowedRange >= halfWidth) {
      siteRange = allowedRange;
      break;
    }
  }

  return { year: centerYear, range: siteRange };
}

function getForenames(gd, options) {
  const forenamesOption = options.search_yorkshireburials_forenames;
  if (forenamesOption == "none") {
    return "";
  }
  if (forenamesOption == "all") {
    return gd.inferForenames();
  }
  return gd.inferFirstName();
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;
  const helper = new SearchHelper(gd, options, buildUrlInput.runDate);

  var builder = new YorkshireburialsUriBuilder();

  let surname = gd.inferLastNameAtDeath(options);
  if (!surname) {
    surname = gd.inferLastName();
  }
  if (surname) {
    builder.addSurname(surname, options.search_yorkshireburials_surnameMatch);
  }

  const forenames = getForenames(gd, options);
  if (forenames) {
    builder.addForenames(forenames);
  }

  let usedEventYear = false;
  const burialExactness = options.search_yorkshireburials_burialYearExactness;
  if (burialExactness != "none") {
    const siteYear = yearRangeToSiteYearAndRange(helper.getYearRangeForDeath(burialExactness));
    if (siteYear) {
      builder.addEventYear(siteYear.year, siteYear.range);
      usedEventYear = true;
    }
  }

  const birthExactness = options.search_yorkshireburials_birthYearExactness;
  if (!usedEventYear && birthExactness != "none") {
    const siteYear = yearRangeToSiteYearAndRange(helper.getYearRangeForBirth(birthExactness));
    if (siteYear) {
      builder.addBirthYear(siteYear.year, siteYear.range);
    }
  }

  const url = builder.getUri();

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
