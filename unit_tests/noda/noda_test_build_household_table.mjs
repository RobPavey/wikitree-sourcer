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
import { buildCitation } from "../../extension/site/noda/core/noda_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generalizeData } from "../../extension/site/noda/core/noda_generalize_data.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

const regressionData = [
  {
    caseName: "census_1835_ole_jonassen",
    optionVariants: [{ variantName: "plainText", optionOverrides: { citation_general_target: "plain" } }],
  },
  {
    caseName: "census_1835_fractional_ages_synthetic",
    userOptions: { table_general_maxLimit: 100 },
    optionVariants: [{ variantName: "plainText", optionOverrides: { citation_general_target: "plain" } }],
  },
  {
    caseName: "census_1815_ole_anders",
  },
  {
    caseName: "census_1865_carl_motzfeldt",
  },
  {
    caseName: "census_1875_jakob_pedersen",
  },
  {
    caseName: "census_1875_jakob_pedersen_bo",
  },
  {
    caseName: "census_1875_lars_valdemarsen",
  },
  {
    caseName: "census_1891_jakob_pedersen",
  },
  {
    caseName: "census_1900_ole_anders",
  },
];

async function runTests(testManager) {
  await runBuildHouseholdTableTests("noda", buildHouseholdTable, buildCitation, regressionData, testManager);

  const caseName = "fractional_age_whitespace";
  const parameters = testManager.parameters;
  if (parameters.testName && parameters.testName != "table") return;
  if (parameters.testCaseName && parameters.testCaseName != caseName) return;

  // Page extraction collapses whitespace. Exercise the reader directly to check
  // that recognition trims its input without changing the stored age string.
  const logger = new LocalErrorLogger(testManager.results, "noda_build_household_table");
  testManager.results.totalTestsRun++;
  try {
    const fixture = new URL("./extracted_data/ref/census_1835_ole_jonassen.json", import.meta.url);
    for (const age of [" \t20 1/2 \t", "2\u00a0¼", "4  3/4"]) {
      const extractedData = JSON.parse(readFileSync(fixture, "utf8"));
      extractedData.panelGroups.find((panel) => panel.people).people[6]["Age/born"].textString = age;
      const generalizedData = generalizeData({ extractedData });
      assert.equal(generalizedData.householdArray[6].age, age);
      assert.equal(generalizedData.householdArray[6].birthDate, undefined);
      const result = buildHouseholdTable({ extractedData, generalizedData, options: testManager.options });
      assert.ok(result.tableString.includes(age));
    }
  } catch (error) {
    logger.logError({ caseName }, error.stack);
  }
}

export { runTests };
