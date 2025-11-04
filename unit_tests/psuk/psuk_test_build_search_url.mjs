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

import { buildSearchData } from "../../extension/site/psuk/core/psuk_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "ancestry_england_probate_1962_william_mclaren",
    inputPath: "ancestry/generalized_data/ref/england_probate_1962_william_mclaren",
  },
  {
    caseName: "ancestry_england_probate_1994_minnie_flatters",
    inputPath: "ancestry/generalized_data/ref/england_probate_1994_minnie_flatters",
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("psuk", buildSearchData, regressionData, testManager);
}

export { runTests };
