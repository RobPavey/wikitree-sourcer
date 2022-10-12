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
import { buildCitation } from "../../extension/site/freecen/core/freecen_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";

const regressionData = [
  {
    caseName: "1841_dev_zachariah_pavey",
  },
  {
    caseName: "1851_som_eliza_pavey",
  },
  {
    caseName: "1861_dev_william_pavey",
  },
  {
    caseName: "1871_ery_louisa_barker",
  },
  {
    caseName: "1881_cai_john_williamson",
  },
  {
    caseName: "1891_dev_louisa_hockridge",
  },
  {
    caseName: "1891_lnd_felix_mills",
  },
  {
    caseName: "1901_con_elizabeth_jonas",
  },
  {
    caseName: "1911_som_beatrice_jones",
  },
];

async function runTests(testManager) {
  await runBuildHouseholdTableTests("freecen", buildHouseholdTable, buildCitation, regressionData, testManager);
}

export { runTests };
