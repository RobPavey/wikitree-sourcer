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

import { buildSearchUrl } from "../../extension/site/baclac/core/baclac_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "ancestry_canada_census_1901_malcom_cameron",
    inputPath: "ancestry/generalized_data/ref/canada_census_1901_malcom_cameron",
    typeOfSearch: "Census",
  },
  {
    caseName: "baclac_census_1906_robert_macdonald",
    inputPath: "baclac/generalized_data/ref/census_1906_robert_macdonald",
    typeOfSearch: "AllCollections",
  },
  {
    caseName: "baclac_census_1870_john_jas_smith",
    inputPath: "baclac/generalized_data/ref/census_1870_john_jas_smith",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "canada_gazette_1869",
    inputPath: "baclac/generalized_data/ref/canada_gazette_1869",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "Library / Canada Gazette, 1841 to 1997",
      lastNameIndex: 0,
    },
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("baclac", buildSearchUrl, regressionData, testManager);
}

export { runTests };
