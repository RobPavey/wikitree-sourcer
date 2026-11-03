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

import { buildSearchData } from "../../extension/site/rootsirl/core/rootsirl_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

// Margaret Connors is a real WikiTree test profile (two spouses, parents known). The search_inputs are made up.
const regressionData = [
  {
    // default search for a profile: the baptism/birth form
    caseName: "connors_default",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
  },
  {
    // birth search with the parents option on, and with an exact year
    caseName: "connors_births_with_parents",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "Births",
    userOptions: { search_rootsirl_includeParents: true, search_rootsirl_yearRange: "0" },
  },
  {
    // death search uses the surname at death (Long) and the death year
    caseName: "connors_deaths",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "Deaths",
  },
  {
    // two spouses, so no spouse name and no marriage year; maiden name used
    caseName: "connors_marriages_two_spouses",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "Marriages",
  },
  {
    // one spouse: the marriage year and the spouse's first forename and surname are used
    caseName: "man_one_spouse_marriages",
    inputPath: "rootsirl/search_inputs/man_one_spouse",
    typeOfSearch: "Marriages",
  },
  {
    // the same, with the spouse option turned off
    caseName: "man_one_spouse_marriages_no_spouse_option",
    inputPath: "rootsirl/search_inputs/man_one_spouse",
    typeOfSearch: "Marriages",
    userOptions: { search_rootsirl_includeSpouse: false },
  },
  {
    // a woman's marriage search uses her maiden name
    caseName: "woman_one_spouse_marriages",
    inputPath: "rootsirl/search_inputs/woman_one_spouse_maiden_name",
    typeOfSearch: "Marriages",
  },
  {
    // an "about" birth year is still used
    caseName: "woman_one_spouse_births_about_year",
    inputPath: "rootsirl/search_inputs/woman_one_spouse_maiden_name",
    typeOfSearch: "Births",
  },
  {
    // no dates: no year, and the year range left blank
    caseName: "no_dates_births",
    inputPath: "rootsirl/search_inputs/no_dates",
    typeOfSearch: "Births",
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("rootsirl", buildSearchData, regressionData, testManager);
}

export { runTests };
