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

import { buildSearchData } from "../../extension/site/ilsosgov/core/ilsosgov_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "death_1916-1972_imry_lavina_d_1962-04-04",
    inputPath: "ilsosgov/generalized_data/ref/death_1916-1972_imry_lavina_d_1962-04-04",
    typeOfSearch: "deathsPost1915",
  },
  {
    caseName: "death_1916-1972_fg_lavina_imry_d_1962",
    inputPath: "fg/generalized_data/ref/lavina_imry_d_1962",
    typeOfSearch: "deathsPost1915",
  },
  {
    caseName: "death_1916-1972_unkefer_marie_susan_d_1968-09-04",
    inputPath: "ilsosgov/generalized_data/ref/death_1916-1972_unkefer_marie_susan_d_1968-09-04",
    typeOfSearch: "deathsPost1915",
  },
  {
    caseName: "death_1916-1972_wikitree_conrad-4600_edit",
    inputPath: "wikitree/generalized_data/ref/conrad-4600_edit",
    typeOfSearch: "deathsPost1915",
  },
  {
    caseName: "death_pre-1916_fg_joseph_franz_wolf_d_1891",
    inputPath: "fg/generalized_data/ref/joseph_franz_wolf_d_1891",
    typeOfSearch: "deathsPre1916",
  },
  {
    caseName: "death_pre-1916_wikitree_stevenson-1184_edit",
    inputPath: "wikitree/generalized_data/ref/stevenson-1184_edit",
    typeOfSearch: "deathsPre1916",
  },
  {
    caseName: "marriage_1763-1900_by_bride_fg_paulina_gummersheimer_d_1870",
    inputPath: "fg/generalized_data/ref/paulina_gummersheimer_d_1870",
    typeOfSearch: "marriagesByBride",
  },
  {
    caseName: "marriage_1763-1900_by_bride_wikitree_willems-1190_edit",
    inputPath: "wikitree/generalized_data/ref/willems-1190_edit",
    typeOfSearch: "marriagesByBride",
  },
  {
    caseName: "marriage_1763-1900_by_groom_fg_henry_gummersheimer_d_1873",
    inputPath: "fg/generalized_data/ref/henry_gummersheimer_d_1873",
    typeOfSearch: "marriagesByGroom",
  },
  {
    caseName: "marriage_1763-1900_by_groom_wikitree_gummersheimer-5_edit",
    inputPath: "wikitree/generalized_data/ref/gummersheimer-5_edit",
    typeOfSearch: "marriagesByGroom",
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("ilsosgov", buildSearchData, regressionData, testManager);
}

export { runTests };
