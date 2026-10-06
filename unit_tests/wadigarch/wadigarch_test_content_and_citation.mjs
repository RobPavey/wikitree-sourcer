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

import { generalizeData } from "../../extension/site/wadigarch/core/wadigarch_generalize_data.mjs";
import { buildCitation } from "../../extension/site/wadigarch/core/wadigarch_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "b_1902_lyle_peasley",
    url: "https://digitalarchives.wa.gov/Record/View/B02454FCE9F3FDCA509AFE934DE64318",
  },
  {
    caseName: "bu_1991_firman_robinson",
    url: "https://digitalarchives.wa.gov/Record/View/29E4607DE2B2EEBFF18C3835A2EF0647",
  },
  {
    caseName: "d_2018_naomi_anderson",
    url: "https://digitalarchives.wa.gov/Record/View/A768BE7D261FC99BB94E6FD3B8FB87C7",
  },
  {
    caseName: "dv_2016_naomie_boesel",
    url: "https://digitalarchives.wa.gov/Record/View/8CB57B0E2C798B6939E89382131D5062",
  },
  {
    // spouse B is the primary person
    caseName: "dv_2016_naomie_boesel_p1",
    url: "https://digitalarchives.wa.gov/Record/View/8CB57B0E2C798B6939E89382131D5062",
    pageFile: "./unit_tests/wadigarch/saved_pages/dv_2016_naomie_boesel.html",
    primaryPersonIndex: 1,
  },
  {
    caseName: "m_1953_laurence_anderson",
    url: "https://digitalarchives.wa.gov/Record/View/838CF6AA22783642E42F1992562B930B",
  },
  {
    // Department of Health collection: separate name fields and the bride was married before.
    // The saved page has the PDF link that the page adds once the PDF has been generated.
    caseName: "m_1968_firman_robinson",
    url: "https://digitalarchives.wa.gov/Record/View/2380F76B99658569BB01AC99C19AFA0F",
  },
  {
    caseName: "m_1968_firman_robinson_p1",
    url: "https://digitalarchives.wa.gov/Record/View/2380F76B99658569BB01AC99C19AFA0F",
    pageFile: "./unit_tests/wadigarch/saved_pages/m_1968_firman_robinson.html",
    primaryPersonIndex: 1,
  },
  {
    // the bride is the primary person
    caseName: "m_1953_laurence_anderson_p1",
    url: "https://digitalarchives.wa.gov/Record/View/838CF6AA22783642E42F1992562B930B",
    pageFile: "./unit_tests/wadigarch/saved_pages/m_1953_laurence_anderson.html",
    primaryPersonIndex: 1,
  },
];

async function runTests(testManager) {
  await runExtractDataTests("wadigarch", regressionData, testManager);

  await runGeneralizeDataTests("wadigarch", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("wadigarch", functions, regressionData, testManager);
}

export { runTests };
