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
import { buildCitation } from "../../extension/site/ancestry/core/ancestry_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";

const regressionData = [
  {
    // has closed entries
    caseName: "england_1939_register_john_smith",
  },
  {
    caseName: "england_1939_register_pavey-452",
  },
  {
    caseName: "england_census_1871_grosvenor_hood",
  },
  {
    caseName: "england_census_1911_more-785",
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
    caseName: "us_federal_census_1850_jas_willson",
  },
  {
    caseName: "us_federal_census_1860_charles_pavey",
  },
  {
    caseName: "us_federal_census_1870_paul_potter",
  },
  {
    caseName: "us_federal_census_1880_isabelle_potter",
  },
  {
    caseName: "us_federal_census_1950_william_pavey",
  },
  {
    caseName: "us_ks_census_1885_james_goggin",
  },
  {
    caseName: "us_ks_census_1885_m_a_jones",
  },
];

async function runTests(testManager) {
  await runBuildHouseholdTableTests("ancestry", buildHouseholdTable, buildCitation, regressionData, testManager);
}

export { runTests };
