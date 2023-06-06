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

import { NaieUriBuilder } from "./naie_uri_builder.mjs";
import { GeneralizedData } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function buildSearchUrl(buildUrlInput) {
  // typeOfSearch is current allways specifiedParameters
  const data = buildUrlInput.generalizedData;
  const parameters = buildUrlInput.searchParameters;

  var builder = new NaieUriBuilder();

  builder.addYear(parameters.collection);

  let lastNamesArray = data.inferPersonLastNamesArray(data);
  if (lastNamesArray.length > 0) {
    let lastNameIndex = parameters.lastNameIndex;
    if (lastNameIndex < 0 || lastNameIndex > lastNamesArray.length - 1) {
      lastNameIndex = 0;
    }
    let lastName = lastNamesArray[lastNameIndex];
    builder.addSurname(lastName);
  }

  builder.addGivenNames(data.inferForenames());
  builder.addGender(data.personGender);

  if (data.sourceType == "record" && data.recordType == RT.Census) {
    builder.addAge(data.inferAgeAtEvent());
  } else {
    // work out age in census year
    let censusYearString = parameters.collection;
    let birthDateString = data.inferBirthDate();
    if (birthDateString && censusYearString) {
      let age = GeneralizedData.getAgeAtDate(birthDateString, censusYearString);
      builder.addAge(age);
    }
  }

  if (parameters.county && parameters.county != "all") {
    builder.addCounty(parameters.collection, parameters.county);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
