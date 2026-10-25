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

import { buildSearchUrl } from "../../extension/site/wol/core/wol_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    // the name is searched for as an exact phrase
    caseName: "wikitree_pavey-455_read",
    inputPath: "wikitree/generalized_data/ref/pavey-455_read",
  },
  {
    // Ellacott at birth and Pavey at death
    caseName: "wikitree_ellacott-59_read",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
    optionVariants: [
      {
        variantName: "no_birth_name",
        optionOverrides: { search_wol_includeBirthName: false },
      },
      {
        variantName: "german_library",
        optionOverrides: { search_wol_language: "de" },
      },
      {
        variantName: "name_variant",
        typeOfSearch: "name:Mary Ellacott",
      },
    ],
  },
  {
    // searching from a Watchtower life story gives the same search as the example in the library
    caseName: "wol_article_w78_deliverance_max_liebster",
    inputPath: "wol/generalized_data/ref/article_w78_deliverance_max_liebster",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("wol", buildSearchUrl, regressionData, testManager);
}

export { runTests };
