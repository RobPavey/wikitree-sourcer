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

import { buildSearchUrl } from "../../extension/site/noda/core/noda_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "wikitree_norway_jørgensen-5113",
    inputPath: "wikitree/generalized_data/ref/jørgensen-5113_read",
    typeOfSearch: "",
    optionVariants: [
      {
        variantName: "exactBirthDate",
        optionOverrides: {
          search_noda_birthYearExactness: "exact",
        },
      },
      {
        variantName: "exactSourcePeriod",
        optionOverrides: {
          search_noda_includeSourcePeriod: "always",
          search_noda_sourcePeriodExactness: "exact",
        },
      },
    ],
  },
  {
    caseName: "ancestry_norway_baptism_1889_knud",
    inputPath: "ancestry/generalized_data/ref/norway_baptism_1889_knud",
    typeOfSearch: "",
    optionVariants: [
      {
        variantName: "sameCollection",
        typeOfSearch: "SameCollection",
      },
      {
        variantName: "specifiedParametersCategory",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "kb",
        },
      },
      {
        variantName: "specifiedParametersRegion",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          region: "3",
        },
      },
      {
        variantName: "specifiedParametersPlace",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          place: "0124",
        },
      },
    ],
  },
  {
    caseName: "ancestry_norway_census_1875_helene_larssen",
    inputPath: "ancestry/generalized_data/ref/norway_census_1875_helene_larssen",
    typeOfSearch: "",
    optionVariants: [
      {
        variantName: "sameCollection",
        typeOfSearch: "SameCollection",
      },
    ],
  },
  {
    caseName: "noda_confirmation_1865_mathias_skrede",
    inputPath: "noda/generalized_data/ref/confirmation_1865_mathias_skrede",
    typeOfSearch: "",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("noda", buildSearchUrl, regressionData, testManager);
}

export { runTests };
