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

import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";
import { buildCitation } from "../../extension/site/dfs/core/dfs_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";

const regressionData = [{ caseName: "census_1845_hans" }, { caseName: "census_1845_hans_head" }];
async function runTests(testManager) {
  for (const data of regressionData) {
    data.runDate = new Date(2026, 10, 12);
    data.optionVariants = [
      {
        variantName: "citationInCaption",
        optionOverrides: { table_general_autoGenerate: "citationInTableCaption", table_table_caption: "datePlace" },
      },
    ];
  }
  await runBuildHouseholdTableTests("dfs", buildHouseholdTable, buildCitation, regressionData, testManager);
}
export { runTests };
