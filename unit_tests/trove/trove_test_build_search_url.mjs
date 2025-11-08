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

import { buildSearchUrl } from "../../extension/site/trove/core/trove_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "australia_baptism_1849_benjamin_barker",
    inputPath: "ancestry/generalized_data/ref/australia_baptism_1849_benjamin_barker",
    optionVariants: [
      {
        variantName: "noStates",
        optionOverrides: { search_trove_includeStateQuery: false },
      },
      {
        variantName: "noAddRange",
        optionOverrides: { search_trove_addToDateRange: "none" },
      },
    ],
  },
  {
    caseName: "australia_birth_reg_1885_alice_lloyd",
    inputPath: "ancestry/generalized_data/ref/australia_birth_reg_1885_alice_lloyd",
  },
  {
    caseName: "australia_child_birth_1897_saml_peck",
    inputPath: "ancestry/generalized_data/ref/australia_child_birth_1897_saml_peck",
  },
  {
    caseName: "australia_death_1970_alice_armstrong",
    inputPath: "ancestry/generalized_data/ref/australia_death_1970_alice_armstrong",
  },
  {
    caseName: "australia_electoral_roll_1936_george_stemm",
    inputPath: "ancestry/generalized_data/ref/australia_electoral_roll_1936_george_stemm",
  },
  {
    caseName: "australia_naturalization_1886_abraham_smith",
    inputPath: "ancestry/generalized_data/ref/australia_naturalization_1886_abraham_smith",
  },
  {
    caseName: "australia_pardon_1831_james_toomer",
    inputPath: "ancestry/generalized_data/ref/australia_pardon_1831_james_toomer",
  },
  {
    caseName: "australia_probate_1974_violet_mcconchie",
    inputPath: "ancestry/generalized_data/ref/australia_probate_1974_violet_mcconchie",
  },
  {
    caseName: "us_federal_census_1870_paul_potter",
    inputPath: "ancestry/generalized_data/ref/us_federal_census_1870_paul_potter",
  },
  {
    caseName: "us_federal_census_1950_william_pavey",
    inputPath: "ancestry/generalized_data/ref/us_federal_census_1950_william_pavey",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("trove", buildSearchUrl, regressionData, testManager);
}

export { runTests };
