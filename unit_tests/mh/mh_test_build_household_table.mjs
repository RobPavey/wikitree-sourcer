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

import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";
import { buildCitation } from "../../extension/site/mh/core/mh_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";

const regressionData = [
  {
    caseName: "england_census_1841_charles_kimberlin",
    optionVariants: [
      {
        variantName: "citationInCaption",
        optionOverrides: {
          table_general_autoGenerate: "citationInTableCaption",
          table_table_caption: "titlePlace",
        },
      },
    ],
  },
  {
    caseName: "england_census_1851_william_pavey",
  },
  {
    caseName: "france_census_1936_robert_moore",
  },
  {
    caseName: "us_census_1950_robert_moore",
  },
];

async function runTests(testManager) {
  await runBuildHouseholdTableTests("mh", buildHouseholdTable, buildCitation, regressionData, testManager);
}

export { runTests };
