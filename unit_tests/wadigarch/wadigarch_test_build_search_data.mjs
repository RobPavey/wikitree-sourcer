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

import { buildSearchData } from "../../extension/site/wadigarch/core/wadigarch_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "wikitree_ellacott-59_births",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
    typeOfSearch: "births",
  },
  {
    caseName: "wikitree_ellacott-59_deaths",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
    typeOfSearch: "deaths",
  },
  {
    caseName: "wikitree_ellacott-59_marriages",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
    typeOfSearch: "marriages",
  },
  {
    caseName: "wikitree_ellacott-59_divorces",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
    typeOfSearch: "divorces",
  },
  {
    // two spouses, the first is chosen
    caseName: "wikitree_pavey-459_marriages_spouse_0",
    inputPath: "wikitree/generalized_data/ref/pavey-459_read_2025",
    typeOfSearch: "marriages",
    searchParameters: { spouseIndex: 0 },
  },
  {
    // two spouses, the second is chosen
    caseName: "wikitree_pavey-459_marriages_spouse_1",
    inputPath: "wikitree/generalized_data/ref/pavey-459_read_2025",
    typeOfSearch: "marriages",
    searchParameters: { spouseIndex: 1 },
  },
  {
    // two spouses and none chosen so no marriage year
    caseName: "wikitree_pavey-459_marriages_no_spouse",
    inputPath: "wikitree/generalized_data/ref/pavey-459_read_2025",
    typeOfSearch: "marriages",
  },
  {
    // woman with two spouses. This is her first marriage so her maiden name is used
    caseName: "wikitree_ireland_connors-569_marriages_spouse_0",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "marriages",
    searchParameters: { spouseIndex: 0 },
  },
  {
    // woman with two spouses. This is her second marriage so the bride's last name is left blank
    caseName: "wikitree_ireland_connors-569_marriages_spouse_1",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "marriages",
    searchParameters: { spouseIndex: 1 },
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("wadigarch", buildSearchData, regressionData, testManager);
}

export { runTests };
