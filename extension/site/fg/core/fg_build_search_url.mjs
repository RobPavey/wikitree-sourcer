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

import { FgUriBuilder } from "./fg_uri_builder.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

function getFgDateQualifierFromWtsQualifier(wtsQualifier) {
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

function getFgDateQualifier(exactnessOption, wtsQualifier) {
  if (exactnessOption == "auto") {
    return getFgDateQualifierFromWtsQualifier(wtsQualifier);
  }

  return exactnessOption;
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new FgUriBuilder();

  if (options.search_fg_includeFirstName) {
    let firstName = data.inferFirstName();
    if (firstName) {
      builder.addFirstName(firstName);
    }
  }

  if (options.search_fg_includeMiddleName) {
    let middleName = data.inferMiddleName();
    if (middleName) {
      builder.addMiddleName(middleName);
    }
  }

  let lastName = data.inferLastNameAtDeath();
  if (!lastName) {
    lastName = data.inferLastName();
  }
  if (lastName) {
    builder.addLastName(lastName);
  }

  if (options.search_fg_includeMaidenName) {
    builder.includeMaidenName();
  }

  if (options.search_fg_birthYearExactness != "none") {
    let birthYear = data.inferBirthYear();
    let birthDateQualifier = data.inferBirthDateQualifier();
    let fgBirthDateQualifier = getFgDateQualifier(options.search_fg_birthYearExactness, birthDateQualifier);
    builder.addBirthYear(birthYear, fgBirthDateQualifier);
  }

  if (options.search_fg_deathYearExactness != "none") {
    let deathYear = data.inferDeathYear();
    let deathDateQualifier = data.inferDeathDateQualifier();
    let fgDeathDateQualifier = getFgDateQualifier(options.search_fg_deathYearExactness, deathDateQualifier);
    builder.addDeathYear(deathYear, fgDeathDateQualifier);
  }

  /*  Adding location seems to cause a lot of search failures.

  For example this search fails even though the person died in US:
  https://www.findagrave.com/memorial/search?firstname=Isaac&middlename=S.&lastname=Rasey&includeMaidenName=true&birthyear=1889&birthyearfilter=3&deathyear=1939&deathyearfilter=3&location=United%20States&locationId=country_4

  It seems that the location has to match the burial/cemetery location 
  
  let countryArray = data.inferCountries();
  if (countryArray.length == 1) {
    builder.addCountry(countryArray[0]);
  }
  */

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
