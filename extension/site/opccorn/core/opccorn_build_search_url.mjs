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

import { OpccornUriBuilder } from "./opccorn_uri_builder.mjs";

function addAppropriateSurname(gd, builder) {
  let lastName = gd.lastNameAtBirth;

  if (!lastName) {
    lastName = gd.inferLastName();
  }

  if (lastName) {
    builder.addSurname(lastName);
  }
}

function addAppropriateGivenNames(gd, builder) {
  // there is a limit on the number of given names that the indices contain
  // For now just use first name plus first middle name
  // Oftern they contain the first letter of the third name but of the first 2 are long they might not
  let firstName = gd.inferFirstName();
  let middleName = gd.inferMiddleName();

  let givenNames = firstName;
  if (middleName) {
    givenNames += " " + middleName;
  }
  builder.addGivenNames(givenNames);
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new OpccornUriBuilder();

  // typeOfSearch is not yet used. Always do a "Person Search" for now

  // example search URL:
  // https://www.cornwall-opc-database.org/search-database/person-search/index.php
  //  ?year_from=1800&year_to=1900&parish=&forename1=John&surname1=Smith&t=person&bf=Search

  // compute the start and end dates

  let dateRange = gd.inferPossibleLifeYearRange();

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  addAppropriateSurname(gd, builder);

  addAppropriateGivenNames(gd, builder);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
