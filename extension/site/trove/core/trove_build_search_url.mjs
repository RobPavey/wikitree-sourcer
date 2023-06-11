/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

import { TroveUriBuilder } from "./trove_uri_builder.mjs";
import { CD } from "../../../base/core/country_data.mjs";
import { buildQueryString, setDefaultTextQueryParameters } from "../../../base/core/text_query.mjs";

const minTroveYear = 1803;
const maxTroveYear = 2100;

function constrainYear(yearNum) {
  if (yearNum < minTroveYear) {
    yearNum = minTroveYear;
  } else if (yearNum > maxTroveYear) {
    yearNum = maxTroveYear;
  }
  return yearNum;
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function addPlaces(gd, builder, options) {
  if (!options.search_trove_includeStateQuery) {
    return;
  }

  const states = [
    {
      queryName: "ACT",
      matches: ["australian capital territory", "act", "capital territory"],
    },
    {
      queryName: "New South Wales",
      matches: ["new south wales", "nsw"],
    },
    {
      queryName: "Northern Territory",
      matches: ["northern territory", "nt"],
    },
    {
      queryName: "Queensland",
      matches: ["queensland", "qld.", "qld"],
    },
    {
      queryName: "South Australia",
      matches: ["south australia", "sa"],
    },
    {
      queryName: "Tasmania",
      matches: ["tasmania", "tas.", "tas"],
    },
    {
      queryName: "Victoria",
      matches: ["victoria", "vic.", "vic"],
    },
    {
      queryName: "Western Australia",
      matches: ["western australia", "wa"],
    },
  ];

  const placeNames = gd.inferPlaceNames();

  let placesToAdd = [];
  for (let placeName of placeNames) {
    let placeNameMinusCountry = "";

    let country = CD.matchCountryFromPlaceName(placeName);
    if (country && country.stdName == "Australia") {
      let countryExtract = CD.extractCountryFromPlaceName(placeName);
      if (countryExtract) {
        placeNameMinusCountry = countryExtract.remainder;
      }
    } else if (!country) {
      // the country could be missing - e.g.: "Sydney, New South Wales"
      placeNameMinusCountry = placeName;
    } else {
      // This rules out newspapers in Australia. Not really useful when we are searching Trove
      // for someone who lived in Australia but was not born, married or died there.
      //if (!placesToAdd.includes("International")) {
      //  placesToAdd.push("International");
      //}
    }

    if (placeNameMinusCountry) {
      // see if placeName ends with a known state name
      const lcName = placeNameMinusCountry.toLowerCase();
      let stateName = "";
      for (let state of states) {
        for (let match of state.matches) {
          if (lcName.endsWith(", " + match) || lcName == match) {
            stateName = state.queryName;
            break;
          }
        }
        if (stateName) {
          break;
        }
      }

      if (stateName && !placesToAdd.includes(stateName)) {
        placesToAdd.push(stateName);
      }
    }
  }

  for (let placeToAdd of placesToAdd) {
    builder.addState(placeToAdd);
  }
}

function buildSearchUrl(buildUrlInput) {
  // Currently we only search the "Newspapers & Gazettes" section of Trove which is:
  // https://trove.nla.gov.au/search/advanced/category/newspapers
  //
  // These are the parameters set by the advanced search page:
  //
  // https://trove.nla.gov.au/search/advanced/category/newspapers
  //  ?keyword=one%20two%20three
  //  &keyword.any=apple%20cat%20dog
  //  &keyword.phrase=this%20is%20the%20phrase
  //  &keyword.not=foo%20bar
  //  &l-advArtType=newspapers
  //  &l-advcategory=Article
  //  &l-advIllustrationType=Photo            (Illustration type_)
  //  &l-advtitle=1572                        (Title/place of newspaper/gazette)
  //  &date.from=1803-01-04
  //  &date.to=2021-11-09
  //  &l-advWord=100%20-%201000%20Words       (Word count)
  //
  // There are additional ones set from the filters within search results:
  //
  //  &l-state=Victoria
  //
  // These are the ones that we can use from generalized data:
  //  keyword - first and last name
  //

  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;
  let parameters = buildUrlInput.searchParameters;

  if (!parameters) {
    parameters = {};
    setDefaultTextQueryParameters(parameters, gd, options);
  }

  var builder = new TroveUriBuilder();

  const dateRange = gd.inferPossibleLifeYearRange();
  if (options.search_trove_addToDateRange != "none") {
    // although the values are ints in options sometimes they come through as strings in browser
    let offsetToRange = Number(options.search_trove_addToDateRange);
    if (!isNaN(offsetToRange)) {
      if (dateRange.startYear) {
        dateRange.startYear -= offsetToRange;
      }
      if (dateRange.endYear) {
        dateRange.endYear += offsetToRange;
      }
    }
  }

  // constrain years to the range covered by Trove
  constrainYears(dateRange);

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  let queryString = buildQueryString("trove", gd, parameters, options);
  builder.addKeywordsAll(queryString);

  addPlaces(gd, builder, options);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
