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

import { DoewUriBuilder } from "./doew_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new DoewUriBuilder();
  builder.addSearchParameter("gestapo", "on");
  builder.addSearchParameter("shoah", "on");
  builder.addSearchParameter("politisch", "on");
  builder.addSearchParameter("spiegelgrund", "on");
  builder.addSearchParameter("findall", "");
  builder.addSearchParameter("lang", "en");
  builder.addSearchParameter("newsearch", "10");
  builder.addSearchParameter("iSortCol_0", "1");
  builder.addSearchParameter("sSortDir_0", "asc");
  builder.addSearchParameter("suchen", "Suchen");

  const lastName = gd.inferLastName();
  if (lastName) {
    builder.addSurname(lastName);
  }

  const givenNames = gd.inferForenames();
  if (givenNames) {
    builder.addGivenNames(givenNames);
  }

  const birthYear = gd.inferBirthYear();
  if (birthYear) {
    builder.addYearOfBirth(birthYear);
  }

  const birthPlace = gd.inferBirthPlace();
  if (birthPlace) {
    builder.addPlaceOfBirth(birthPlace);
  }

  // call methods on builder here

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
