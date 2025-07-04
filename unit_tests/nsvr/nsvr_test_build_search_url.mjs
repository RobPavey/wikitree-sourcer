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

import { buildSearchUrl } from "../../extension/site/nsvr/core/nsvr_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "mcnamara-5434_wikitree_b",
    inputPath: "wikitree/generalized_data/ref/mcnamara-5434_read",
    typeOfSearch: "Births",
  },
  {
    caseName: "mcnamara-5434_wikitree_m",
    inputPath: "wikitree/generalized_data/ref/mcnamara-5434_read",
    typeOfSearch: "Marriages",
  },
  {
    caseName: "mcnamara-5434_wikitree_d",
    inputPath: "wikitree/generalized_data/ref/mcnamara-5434_read",
    typeOfSearch: "Deaths",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("nsvr", buildSearchUrl, regressionData, testManager);
}

export { runTests };
