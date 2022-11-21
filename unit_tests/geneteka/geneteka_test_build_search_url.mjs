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

import { buildSearchUrl } from "../../extension/site/geneteka/core/geneteka_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "geneteka_births_mazur",
    inputPath: "geneteka/generalized_data/ref/births_mazur",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      province: "07mz",
      recordType: "B",
    },
    optionVariants: [
      {
        variantName: "deaths",
        searchParameters: {
          province: "07mz",
          recordType: "D",
        },
      },
      {
        variantName: "marriages",
        searchParameters: {
          province: "07mz",
          recordType: "S",
        },
      },
    ],
  },
  {
    caseName: "geneteka_deaths_wojtacha",
    inputPath: "geneteka/generalized_data/ref/deaths_wojtacha",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      province: "01ds",
      recordType: "B",
    },
    optionVariants: [
      {
        variantName: "deaths",
        searchParameters: {
          province: "01ds",
          recordType: "D",
        },
      },
      {
        variantName: "marriages",
        searchParameters: {
          province: "01ds",
          recordType: "S",
        },
      },
    ],
  },
  {
    caseName: "geneteka_marriages_stolarczyk",
    inputPath: "geneteka/generalized_data/ref/marriages_stolarczyk",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      province: "02kp",
      recordType: "B",
    },
    optionVariants: [
      {
        variantName: "deaths",
        searchParameters: {
          province: "02kp",
          recordType: "D",
        },
      },
      {
        variantName: "marriages",
        searchParameters: {
          province: "02kp",
          recordType: "S",
        },
      },
    ],
  },
  {
    caseName: "wikitree_littlemore-13_read",
    inputPath: "wikitree/generalized_data/ref/littlemore-13_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      province: "03lb",
      recordType: "B",
    },
    optionVariants: [
      {
        variantName: "deaths",
        searchParameters: {
          province: "03lb",
          recordType: "D",
        },
      },
      {
        variantName: "marriages",
        searchParameters: {
          province: "03lb",
          recordType: "S",
        },
      },
    ],
  },
  {
    caseName: "ancestry_australia_electoral_roll_1936_george_stemm",
    inputPath: "ancestry/generalized_data/ref/australia_electoral_roll_1936_george_stemm",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      province: "04ls",
      recordType: "B",
    },
    optionVariants: [
      {
        variantName: "deaths",
        searchParameters: {
          province: "04ls",
          recordType: "D",
        },
      },
      {
        variantName: "marriages",
        searchParameters: {
          province: "04ls",
          recordType: "S",
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("geneteka", buildSearchUrl, regressionData, testManager);
}

export { runTests };
