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
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { CD } from "../../../base/core/country_data.mjs";

const minTroveYear = 1803;
const maxTroveYear = 3000;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minTroveYear) {
      yearNum = minTroveYear;
    } else if (yearNum > maxTroveYear) {
      yearNum = maxTroveYear;
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function addPlaces(data, builder, options) {
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

  const placeNames = data.inferPlaceNames();

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
      if (!placesToAdd.includes("International")) {
        placesToAdd.push("International");
      }
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

  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new TroveUriBuilder();

  const dateRange = data.inferPossibleLifeYearRange();

  // constrain years to the range covered by Trove
  constrainYears(dateRange);

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  let keywordsAll = "";
  let keywordsAny = "";

  const lnab = data.inferLastNameAtBirth();
  const cln = data.inferLastNameAtDeath();

  if (lnab && cln && lnab != cln) {
    keywordsAny = lnab + " " + cln;
  } else {
    if (lnab) {
      keywordsAll = lnab;
    } else if (cln) {
      keywordsAll = cln;
    }
  }

  let givenNames = data.inferForenames();
  if (givenNames) {
    keywordsAny += " " + givenNames;
    keywordsAny = keywordsAny.trim();
  }

  builder.addKeywordsAll(keywordsAll);
  builder.addKeywordsAny(keywordsAny);

  addPlaces(data, builder, options);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
