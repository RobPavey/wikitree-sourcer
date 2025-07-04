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

import { buildSearchData } from "../../extension/site/wikitree/core/wikitree_build_search_data.mjs";
import { buildSearchUrl } from "../../extension/site/wikitree/core/wikitree_plus_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionDataWikitreeData = [
  {
    caseName: "wikitree_craft-31_read",
    inputPath: "wikitree/generalized_data/ref/craft-31_read",
  },
  {
    caseName: "scotland_birth_1842_christian_mcleod",
    inputPath: "ancestry/generalized_data/ref/scotland_birth_1842_christian_mcleod",
  },
];

const regressionDataWikitreePlusUrl = [
  {
    caseName: "plus_scotland_birth_1842_christian_mcleod",
    inputPath: "ancestry/generalized_data/ref/scotland_birth_1842_christian_mcleod",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("wikitree", buildSearchUrl, regressionDataWikitreePlusUrl, testManager);
  await runBuildSearchUrlTests("wikitree", buildSearchData, regressionDataWikitreeData, testManager);
}

export { runTests };
