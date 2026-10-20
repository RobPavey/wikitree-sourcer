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

import { buildSearchUrl } from "../../extension/site/imdb/core/imdb_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "wikitree_pavey-455_read",
    inputPath: "wikitree/generalized_data/ref/pavey-455_read",
  },
  {
    caseName: "imdb_name_hartnell_william",
    inputPath: "imdb/generalized_data/ref/name_hartnell_william",
  },
  {
    caseName: "imdb_name_hartnell_william_name_variant",
    inputPath: "imdb/generalized_data/ref/name_hartnell_william",
    typeOfSearch: "name:Billy Hartnell",
  },
  {
    caseName: "imdb_name_tennant_david_bio",
    inputPath: "imdb/generalized_data/ref/name_tennant_david_bio",
  },
  {
    caseName: "imdb_name_tennant_david_bio_birth_name",
    inputPath: "imdb/generalized_data/ref/name_tennant_david_bio",
    typeOfSearch: "name:David McDonald",
  },
  {
    caseName: "imdb_name_tennant_david",
    inputPath: "imdb/generalized_data/ref/name_tennant_david",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("imdb", buildSearchUrl, regressionData, testManager);
}

export { runTests };
