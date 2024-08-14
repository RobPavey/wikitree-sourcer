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

import { NpaUriBuilder } from "./npa_uri_builder.mjs";
import { CD } from "../../../base/core/country_data.mjs";

const stdCountryNameToIndex = {
  Algeria: "28",
  Argentina: "1",
  Australia: "41",
  Austria: "59",
  Azerbaijan: "43",
  Bahamas: "50",
  Belgium: "37",
  Brazil: "39",
  Canada: "2",
  China: "31",
  Croatia: "64",
  Czechia: "63",
  Denmark: "12",
  Egypt: "36",
  Finland: "72",
  France: "30",
  Germany: "25",
  Greenland: "70",
  Iceland: "69",
  Indonesia: "60",
  Ireland: "3",
  Italy: "34",
  Jamaica: "4",
  Japan: "24",
  Kazakhstan: "44",
  Kyrgyzstan: "45",
  Latvia: "52",
  Mexico: "5",
  Morocco: "33",
  Netherlands: "54",
  "New Zealand": "26",
  "Northern Ireland": "35",
  Norway: "55",
  Portugal: "61",
  Romania: "68",
  Serbia: "65",
  "South Africa": "18",
  Spain: "58",
  Suriname: "67",
  Tajikistan: "46",
  Tunisia: "29",
  Turkmenistan: "47",
  Ukraine: "73",
  "United Kingdom": "6",
  "United States": "7",
  Uzbekistan: "48",
};

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new NpaUriBuilder();

  // call methods on builder here

  let countries = gd.inferCountries();
  for (let country of countries) {
    let countryIndex = stdCountryNameToIndex[country];
    if (countryIndex) {
      builder.addCountryIndex(countryIndex);
    } else {
      let containingCountries = CD.getContainingCountries(country);
      for (let containingCountry of containingCountries) {
        let countryIndex = stdCountryNameToIndex[containingCountry];
        if (countryIndex) {
          builder.addCountryIndex(countryIndex);
        }
      }
    }
  }

  let dateRange = gd.inferPossibleLifeYearRange();
  builder.addStartYear(dateRange.startYear);
  builder.addEndYear(dateRange.endYear);

  builder.addForenames(gd.inferForenames());
  builder.addLastName(gd.inferLastName());

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
