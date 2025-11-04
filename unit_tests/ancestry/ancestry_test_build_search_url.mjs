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

import { buildSearchUrl } from "../../extension/site/ancestry/core/ancestry_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "pavey-451_read",
    inputPath: "wikitree/generalized_data/ref/pavey-451_read",
  },
  {
    caseName: "ellacott-59_read",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
  },
  {
    caseName: "handford-3_read",
    inputPath: "wikitree/generalized_data/ref/handford-3_read",
  },
  {
    caseName: "devon_baptisms_pavey-342",
    inputPath: "fmp/generalized_data/ref/devon_baptisms_pavey-342",
  },
  {
    // test a death reg that is after 1916
    caseName: "death_reg_morgan-695",
    inputPath: "gro/generalized_data/ref/d_morgan-695",
    typeOfSearch: "SameCollection",
  },
  {
    // test a death reg that is after 1916
    caseName: "death_reg_isaac_ellaway_1939",
    inputPath: "fmp/generalized_data/ref/death_reg_isaac_ellaway_1939",
    typeOfSearch: "SameCollection",
  },
  {
    // test a census with folio, piece etc
    caseName: "england_census_1871_mary_forster",
    inputPath: "fmp/generalized_data/ref/england_census_1871_mary_forster",
    typeOfSearch: "SameCollection",
  },
  {
    // test a FMP UK census that should map to Ancestry Wales census with folio, piece etc
    caseName: "wales_census_1851_catherine_flaningan",
    inputPath: "fmp/generalized_data/ref/wales_census_1851_catherine_flaningan",
    typeOfSearch: "SameCollection",
  },
  {
    // test an FS marriage with no spouse name
    caseName: "us_nc_marriage_1783_sarah_hanes",
    inputPath: "fs/generalized_data/ref/us_nc_marriage_1783_sarah_hanes",
  },
  {
    // test searching from a scotp 1841 census
    caseName: "scotp_census_1841_christian_fraser",
    inputPath: "scotp/generalized_data/ref/census_1841_christian_fraser",
    typeOfSearch: "SameCollection",
  },
  {
    // test searching from a scotp 1861 census
    caseName: "scotp_census_1861_james_fraser",
    inputPath: "scotp/generalized_data/ref/census_1861_james_fraser",
    typeOfSearch: "SameCollection",
  },
  {
    // To test no marriage location when user is manager
    caseName: "saulnier-848_manager_no_marriage_location_2025",
    inputPath: "wikitree/generalized_data/ref/saulnier-848_manager_no_marriage_location_2025",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("ancestry", buildSearchUrl, regressionData, testManager);
}

export { runTests };
