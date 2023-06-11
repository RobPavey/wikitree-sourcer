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
import { GD, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

const fgAllowedUsStateNames = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

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
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new FgUriBuilder();

  if (options.search_fg_includeFirstName) {
    let firstName = gd.inferFirstName();
    if (firstName) {
      builder.addFirstName(firstName);
    }
  }

  if (options.search_fg_includeMiddleName) {
    let middleName = gd.inferMiddleName();
    if (middleName) {
      builder.addMiddleName(middleName);
    }
  }

  let lastName = gd.inferLastNameAtDeath();
  if (!lastName) {
    lastName = gd.inferLastName();
  }
  if (lastName) {
    builder.addLastName(lastName);
  }

  if (options.search_fg_includeMaidenName) {
    builder.includeMaidenName();
  }

  if (options.search_fg_birthYearExactness != "none") {
    let birthYear = gd.inferBirthYear();
    let birthDateQualifier = gd.inferBirthDateQualifier();
    let fgBirthDateQualifier = getFgDateQualifier(options.search_fg_birthYearExactness, birthDateQualifier);
    builder.addBirthYear(birthYear, fgBirthDateQualifier);
  }

  if (options.search_fg_deathYearExactness != "none") {
    let deathYear = gd.inferDeathYear();
    let deathDateQualifier = gd.inferDeathDateQualifier();
    let fgDeathDateQualifier = getFgDateQualifier(options.search_fg_deathYearExactness, deathDateQualifier);
    builder.addDeathYear(deathYear, fgDeathDateQualifier);
  }

  if (options.search_fg_includeCemeteryLocation) {
    let deathCountry = gd.inferDeathCountry();
    if (!deathCountry) {
      let countryArray = gd.inferCountries();
      if (countryArray.length == 1) {
        deathCountry = countryArray[0];
      }
    }

    // A search for a country only would include:
    // &location=United+States+of+America&locationId=country_4
    // A search for a state within a country would be like:
    // &location=New+Jersey%2C++United+States+of+America&locationId=

    if (deathCountry) {
      let locationString = "";
      if (deathCountry == "United States") {
        if (deathCountry == gd.inferDeathCountry()) {
          let deathPlace = gd.inferDeathPlace();
          let stateName = GD.inferStateNameFromPlaceString(deathPlace);
          if (stateName) {
            if (fgAllowedUsStateNames.includes(stateName)) {
              locationString = stateName + ", " + deathCountry;
            }
          }
        }
      }

      if (locationString) {
        builder.addLocation(locationString);
      } else {
        builder.addCountry(deathCountry);
      }
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
