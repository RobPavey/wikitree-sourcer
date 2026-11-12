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

import { generalizeData } from "../../extension/site/agatha/core/agatha_generalize_data.mjs";
import { buildCitation } from "../../extension/site/agatha/core/agatha_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // Has death information for parents and an illegitimate child that is legitimized
    caseName: "m_1909_dauwe_marie_fr",
    url: "https://agatha.arch.be/fr/data/acts/HUVLB_HUBRU_00619335_0",
    primaryPersonIndex: 1,
  },
  {
    // Has death information for parents and an illegitimate child that is legitimized
    caseName: "m_1909_dauwe_marie_nl",
    url: "https://agatha.arch.be/nl/data/acts/HUVLB_HUBRU_00619335_0",
    primaryPersonIndex: 1,
  },
  {
    // Has death information for parents and an illegitimate child that is legitimized
    caseName: "m_1909_dauwe_marie_de",
    url: "https://agatha.arch.be/de/data/acts/HUVLB_HUBRU_00619335_0",
    primaryPersonIndex: 1,
  },
  {
    // Has death information for parents and an illegitimate child that is legitimized
    caseName: "m_1909_dauwe_marie_en",
    url: "https://agatha.arch.be/en/data/acts/HUVLB_HUBRU_00619335_0",
    primaryPersonIndex: 1,
  },
  {
    caseName: "d_1880_vingerhoedt_maria_fr",
    url: "https://agatha.arch.be/fr/data/acts/GSU_004191864_00813_4_00152800",
  },
  {
    caseName: "d_1880_vingerhoedt_maria_nl",
    url: "https://agatha.arch.be/nl/data/acts/GSU_004191864_00813_4_00152800",
  },
  {
    caseName: "d_1880_vingerhoedt_maria_de",
    url: "https://agatha.arch.be/de/data/acts/GSU_004191864_00813_4_00152800",
  },
  {
    caseName: "d_1880_vingerhoedt_maria_en",
    url: "https://agatha.arch.be/en/data/acts/GSU_004191864_00813_4_00152800",
  },
  {
    caseName: "ba_searchlist_1596_coppens_anna_fr",
    url: "https://agatha.arch.be/fr/search/analyses/results/",
  },
  {
    caseName: "ba_searchlist_1596_coppens_anna_nl",
    url: "https://agatha.arch.be/nl/search/analyses/results/",
  },
  {
    caseName: "ba_searchlist_1596_coppens_anna_de",
    url: "https://agatha.arch.be/de/search/analyses/results/",
  },
  {
    caseName: "ba_searchlist_1596_coppens_anna_en",
    url: "https://agatha.arch.be/en/search/analyses/results/",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("agatha", regressionData, testManager);

  await runGeneralizeDataTests("agatha", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("agatha", functions, regressionData, testManager);
}

export { runTests };
