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

import { buildSearchData } from "../../extension/site/qldbdm/core/qldbdm_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "birth_1875_david_goodwin",
    inputPath: "qldbdm/generalized_data/ref/birth_1875_david_goodwin",
    typeOfSearch: "births",
    optionVariants: [
      {
        variantName: "paramDeath",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "deaths",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
        optionOverrides: {
          search_qldbdm_birthYearExactness: 5,
        },
      },
    ],
  },
  {
    caseName: "death_1932_david_goodwin",
    inputPath: "qldbdm/generalized_data/ref/death_1932_david_goodwin",
    typeOfSearch: "deaths",
    optionVariants: [
      {
        variantName: "paramDeath",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
        optionOverrides: {
          search_qldbdm_birthYearExactness: 5,
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("qldbdm", buildSearchData, regressionData, testManager);
}

export { runTests };
