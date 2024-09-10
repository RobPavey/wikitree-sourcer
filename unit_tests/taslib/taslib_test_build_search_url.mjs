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

import { buildSearchUrl } from "../../extension/site/taslib/core/taslib_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "wikitree_whish-wilson-24_read",
    inputPath: "wikitree/generalized_data/ref/whish-wilson-24_read",
    typeOfSearch: "",
    optionVariants: [
      {
        variantName: "births",
        typeOfSearch: "Births",
      },
      {
        variantName: "deaths",
        typeOfSearch: "Deaths",
      },
      {
        variantName: "marriages",
        typeOfSearch: "Marriages",
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("taslib", buildSearchUrl, regressionData, testManager);
}

export { runTests };
