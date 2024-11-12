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

import { bgUriBuilder } from "./bg_uri_builder.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { getBgCountry } from "./bg_country.mjs";

function getBgDateQualifierFromWtsQualifier(wtsQualifier) {
  switch (wtsQualifier) {
    case dateQualifiers.NONE:
      return "3";
    case dateQualifiers.EXACT:
      return "exact";
    case dateQualifiers.ABOUT:
      return "10";
    case dateQualifiers.BEFORE:
      return "before";
    case dateQualifiers.AFTER:
      return "after";
  }

  return "10"; // should never get here
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new bgUriBuilder();

  builder.addPreamble();

  let firstNames = "";
  if (options.search_bg_includeFirstName) {
    let firstName = gd.inferFirstName();
    if (firstName) {
      firstNames = firstName;
    }
  }

  if (options.search_bg_includeMiddleName) {
    let middleName = gd.inferMiddleName();
    if (middleName) {
      firstNames += " " + middleName;
    }
  }

  builder.addGivenNames(firstNames);

  let lastName = gd.inferLastNameAtDeath(options);
  if (!lastName) {
    lastName = gd.inferLastName();
  }
  if (lastName) {
    builder.addSurname(lastName);
  }

  if (options.search_bg_includeBirthYear) {
    let birthYear = gd.inferBirthYear();
    builder.addBirthYear(birthYear);
  }

  let deathYear = gd.inferDeathYear();
  builder.addDeathYear(deathYear);

  let yearRange = options.search_bg_yearExactness;
  builder.addYearRange(yearRange);

  const bgCountry = getBgCountry(gd);
  if (bgCountry) {
    builder.addCemeteryCountry(bgCountry);
  }

  if (options.search_bg_filterByExact) {
    builder.addExact();
  }

  if (options.search_bg_filterByPhonetic) {
    builder.addPhonetic();
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
