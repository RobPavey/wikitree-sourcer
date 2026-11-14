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

import { buildSearchData } from "../../extension/site/dfs/core/dfs_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  { caseName: "wikitree_handford", inputPath: "wikitree/generalized_data/ref/handford-3_read" },
  { caseName: "findagrave_william_pavey", inputPath: "fg/generalized_data/ref/william_pavey_d_1961" },
  { caseName: "gravminner_no_dates", inputPath: "gravminner/generalized_data/ref/no_dates" },
  { caseName: "dfs_church_hans", inputPath: "dfs/generalized_data/ref/church_1840_hans" },
  { caseName: "dfs_census_hans", inputPath: "dfs/generalized_data/ref/census_1845_hans" },
];
async function runTests(testManager) {
  for (const data of regressionData) {
    data.optionVariants = [
      { variantName: "namesOnly", optionOverrides: { search_dfs_includeBirthYear: false } },
      { variantName: "review", optionOverrides: { search_dfs_autoSubmit: false } },
      ...["census", "churchbook", "skoleprotokol", "laegsruller"].map((typeOfSearch) => ({
        variantName: typeOfSearch,
        typeOfSearch,
        optionOverrides: {},
      })),
      {
        variantName: "specifiedParameters",
        optionOverrides: {},
        searchParameters: {
          recordGroup: "skoleprotokol",
          sourceyearfrom: "1850",
          sourceyearto: "1860",
          bornyearfrom: "1838",
          bornyearto: "1842",
          bornplacename: "Åbenrå",
          placename: "Dreslette",
        },
      },
    ];
  }
  await runBuildSearchDataTests("dfs", buildSearchData, regressionData, testManager);
}
export { runTests };
