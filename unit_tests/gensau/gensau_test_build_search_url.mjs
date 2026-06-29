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

import { buildSearchUrl } from "../../extension/site/gensau/core/gensau_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "bdm_marriage_1854_roberta_macdonald_member",
    inputPath: "gensau/generalized_data/ref/bdm_marriage_1854_roberta_macdonald_member",
    typeOfSearch: "SameCollection",
  },
  {
    // has pref name
    caseName: "wikitree_stanway-252_read",
    inputPath: "wikitree/generalized_data/ref/stanway-252_read",
    typeOfSearch: "bdmBirths",
    optionVariants: [
      {
        variantName: "birthsExactness1",
        typeOfSearch: "bdmBirths",
        optionOverrides: { search_gensau_birthYearExactness: "1" },
      },
      {
        variantName: "deathsExactnessExact",
        typeOfSearch: "bdmDeaths",
        optionOverrides: { search_gensau_deathYearExactness: "exact" },
      },
      {
        variantName: "parametersDeathLastName1",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "bdmDeaths",
          lastNameIndex: 1,
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("gensau", buildSearchUrl, regressionData, testManager);
}

export { runTests };
