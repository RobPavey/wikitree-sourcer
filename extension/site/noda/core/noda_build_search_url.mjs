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

import { NodaUriBuilder } from "./noda_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new NodaUriBuilder();

  // call methods on builder here

  let dateRange = gd.inferPossibleLifeYearRange();
  builder.addStartYear(dateRange.startYear);
  builder.addEndYear(dateRange.endYear);

  let forenames = gd.inferForenames();
  builder.addFirstName(forenames);

  let lastName = gd.inferLastNames();
  if (lastName) {
    let lastNameParts = lastName.split(" ");
    if (lastNameParts.length > 0) {
      let lastNames = lastNameParts[0];
      for (let index = 1; index < lastNameParts.length; index++) {
        lastNames += " | " + lastNameParts[index];
      }
      builder.addLastName(lastNames);
    }
  }

  let gender = gd.personGender;
  builder.addGender(gender);

  let birthYear = gd.inferBirthYear();
  builder.addBirthDate(birthYear);

  /*
  Don't add birth place by default
  let birthPlace = gd.inferBirthPlace();
  builder.addBirthPlace(birthPlace);
  */

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
