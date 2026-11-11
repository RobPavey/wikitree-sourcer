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

import { buildSearchData } from "../../extension/site/gravminner/core/gravminner_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  { caseName: "findagrave_william_pavey", inputPath: "fg/generalized_data/ref/william_pavey_d_1961" },
  { caseName: "wikitree_handford", inputPath: "wikitree/generalized_data/ref/handford-3_read" },
  { caseName: "gravminner_signe", inputPath: "gravminner/generalized_data/ref/signe_strande" },
  { caseName: "gravminner_norwegian_letters", inputPath: "gravminner/generalized_data/ref/partial_dates" },
  { caseName: "gravminner_no_dates", inputPath: "gravminner/generalized_data/ref/no_dates" },
];
async function runTests(testManager) {
  for (const data of regressionData)
    data.optionVariants = [
      { variantName: "noBirth", optionOverrides: { search_gravminner_includeBirthYear: false } },
      { variantName: "noDeath", optionOverrides: { search_gravminner_includeDeathYear: false } },
      {
        variantName: "namesOnly",
        optionOverrides: { search_gravminner_includeBirthYear: false, search_gravminner_includeDeathYear: false },
      },
    ];
  await runBuildSearchDataTests("gravminner", buildSearchData, regressionData, testManager);
}
export { runTests };
