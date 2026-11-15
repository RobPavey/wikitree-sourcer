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

import { InaUriBuilder } from "./ina_uri_builder.mjs";

// The archive starts in the 1700s; the end year is limited to the current year
const archiveStartYear = 1700;

function getLastName(gd, parameters) {
  if (parameters && parameters.lastNameIndex !== undefined) {
    let lastNamesArray = gd.inferPersonLastNamesArray(gd);
    let index = Number(parameters.lastNameIndex);
    if (lastNamesArray && index >= 0 && index < lastNamesArray.length) {
      return lastNamesArray[index];
    }
  }
  return gd.inferLastName();
}

// Quotes, brackets and the words OR and NOT have a meaning in the search text, so take them out of names
function cleanName(name) {
  if (!name) {
    return "";
  }
  return name
    .replace(/["()~*?]/g, " ")
    .replace(/\b(OR|NOT|AND)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchText(forenames, lastName, nameMatch) {
  let name = (forenames + " " + lastName).trim();
  if (!forenames || !lastName) {
    // only one name: search for it on its own
    return name;
  }
  if (nameMatch == "all") {
    return name;
  }
  if (nameMatch == "near") {
    return '"' + name + '"~2';
  }
  return '"' + name + '"';
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;
  const parameters = buildUrlInput.searchParameters;

  let nameMatch = options.search_ina_nameMatch;
  let forenamesOption = options.search_ina_forenames;
  let sortOrder = options.search_ina_sortOrder;
  if (buildUrlInput.typeOfSearch == "SpecifiedParameters" && parameters) {
    if (parameters.nameMatch) {
      nameMatch = parameters.nameMatch;
    }
    if (parameters.forenames) {
      forenamesOption = parameters.forenames;
    }
    if (parameters.sortOrder) {
      sortOrder = parameters.sortOrder;
    }
  }

  let forenames = forenamesOption == "all" ? gd.inferForenames() : gd.inferFirstName();
  let lastName = getLastName(gd, parameters);

  var builder = new InaUriBuilder();

  builder.addSearchText(buildSearchText(cleanName(forenames), cleanName(lastName), nameMatch));

  let maxLifespan = Number(options.search_general_maxLifespan);
  let dateRange = gd.inferPossibleLifeYearRange(maxLifespan, buildUrlInput.runDate);
  if (dateRange.startYear || dateRange.endYear) {
    let runDate = buildUrlInput.runDate ? new Date(buildUrlInput.runDate) : new Date();
    let currentYear = runDate.getFullYear();
    let startYear = dateRange.startYear ? Math.max(dateRange.startYear, archiveStartYear) : archiveStartYear;
    let endYear = dateRange.endYear ? Math.min(dateRange.endYear, currentYear) : currentYear;
    if (startYear <= endYear) {
      builder.addStartYear(startYear);
      builder.addEndYear(endYear);
    }
  }

  builder.addSortOrder(sortOrder);

  const url = builder.getUri();

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
