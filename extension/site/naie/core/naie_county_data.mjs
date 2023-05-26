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

import { WTS_String } from "../../../base/core/wts_string.mjs";

// http://www.census.nationalarchives.ie/search/results.jsp
// ?census_year=1911&surname=John&firstname=Long
// &county19011911=&county1821=&county1831=&county1841=&county1851=
// &parish=&ward=&barony=&townland=&houseNumber=&ded=
// &age=10&sex=M&search=Search

// http://www.census.nationalarchives.ie/search/results.jsp?searchMoreVisible=&census_year=1901&surname=Connors&firstname=Margaret&county19011911=&county1821=&county1831=&county1841=&county1851=&parish=&ward=&barony=&townland=&houseNumber=&ded=&age=31&sex=F&search=Search&ageInMonths=&relationToHead=&religion=&education=&occupation=&marriageStatus=&yearsMarried=&birthplace=&nativeCountry=&language=&deafdumb=&causeOfDeath=&yearOfDeath=&familiesNumber=&malesNumber=&femalesNumber=&maleServNumber=&femaleServNumber=&estChurchNumber=&romanCatNumber=&presbNumber=&protNumber=&marriageYears=&childrenBorn=&childrenLiving=
// http://www.census.nationalarchives.ie/search/results.jsp?census_year=1901&surname=Connors&firstname=Margaret&county19011911=&county1821=&county1831=&county1841=&county1851=&parish=&ward=&barony=&townland=&houseNumber=&ded=&age=31&sex=F&search=Search

// 1821
const counties1821 = [
  "Antrim",
  "Carlow",
  "Cavan",
  "Dublin",
  "Fermanagh",
  "Galway",
  "Kilkenny",
  "King's",
  "Limerick",
  "Mayo",
  "Meath",
];

// 1831
const counties1831 = ["Antrim", "Londonderry"];

// 1841
const counties1841 = [
  "Antrim",
  "Carlow",
  "Cavan",
  "Cork",
  "Dublin",
  "Fermanagh",
  "Limerick",
  "Longford",
  "Mayo",
  "Monaghan",
  "Queen's",
  "Tyrone",
  "Westmeath",
  "Wicklow",
];

// 1851
const counties1851 = [
  "Antrim",
  "Armagh",
  "Cavan",
  "Clare",
  "Donegal",
  "Down",
  "Dublin",
  "Fermanagh",
  "Kerry",
  "Kildare",
  "Leitrim",
  "Limerick",
  "Londonderry",
  "Longford",
  "Mayo",
  "Meath",
  "Monaghan",
  "Queen's",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Tyrone",
  "Waterford",
  "Wexford",
  "Wicklow",
];

// 1901/1911
const counties1901_1911 = [
  "Antrim",
  "Armagh",
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Donegal",
  "Down",
  "Dublin",
  "Fermanagh",
  "Galway",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "King's Co.",
  "Leitrim",
  "Limerick",
  "Londonderry",
  "Longford",
  "Louth",
  "Mayo",
  "Meath",
  "Monaghan",
  "Queen's Co.",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Tyrone",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
];

const countiesForYear = {
  1821: counties1821,
  1831: counties1831,
  1841: counties1841,
  1851: counties1851,
  1901: counties1901_1911,
  1911: counties1901_1911,
};

function getMatchingCensusCounty(censusYear, countyName) {
  if (!censusYear || !countyName) {
    return "";
  }

  const counties = countiesForYear[censusYear];
  if (!counties) {
    return "";
  }

  const lcCountyName = countyName.toLowerCase();

  for (let county of counties) {
    if (lcCountyName == county.toLowerCase()) {
      return county;
    }
  }

  return "";
}

function getMatchingCensusCountyFromList(censusYear, countyNames) {
  // only return a county if all place names use that county (or no identified county)

  let result = "";

  if (!censusYear || !countyNames || countyNames.length < 1) {
    return "";
  }

  const counties = countiesForYear[censusYear];
  if (!counties) {
    return "";
  }

  for (let countyName of countyNames) {
    const lcCountyName = countyName.toLowerCase();

    for (let county of counties) {
      if (lcCountyName == county.toLowerCase()) {
        if (!result) {
          result = county;
        } else {
          return "";
        }
      }
    }
  }
  return result;
}

function getCountiesForCensusYear(censusYear) {
  return countiesForYear[censusYear];
}

export { getMatchingCensusCounty, getMatchingCensusCountyFromList, getCountiesForCensusYear };
