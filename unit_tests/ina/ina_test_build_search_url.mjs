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

import { buildSearchUrl } from "../../extension/site/ina/core/ina_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

// The search_inputs are made up
const regressionData = [
  {
    // default: exact phrase with the first forename, birth to death years
    caseName: "woman_married_name_default",
    inputPath: "ina/search_inputs/woman_married_name",
  },
  {
    // near search with all forenames, oldest first
    caseName: "woman_married_name_near_all_forenames",
    inputPath: "ina/search_inputs/woman_married_name",
    userOptions: { search_ina_nameMatch: "near", search_ina_forenames: "all", search_ina_sortOrder: "oldest" },
  },
  {
    // search with parameters: maiden name (Quinn, the first in the list of last names) and both words anywhere
    caseName: "woman_married_name_parameters_maiden_name",
    inputPath: "ina/search_inputs/woman_married_name",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: { lastNameIndex: 0, nameMatch: "all", forenames: "first", sortOrder: "newest" },
  },
  {
    // no death date: the end year is birth + maximum lifespan, limited to the run date's year
    caseName: "man_birth_only",
    inputPath: "ina/search_inputs/man_birth_only",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("ina", buildSearchUrl, regressionData, testManager);
}

export { runTests };
