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

import { generalizeData } from "../../extension/site/ilsosgov/core/ilsosgov_generalize_data.mjs";
import { buildCitation } from "../../extension/site/ilsosgov/core/ilsosgov_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  // test case naming conventions
  //   lastname_firstname_middlename_[d for death date or cn for certificate number]_[death date/cert number]]
  {
    caseName: "death_1916-1972_imry_lavina_d_1962-04-04",
    url: "https://apps.ilsos.gov/isavital/idphDeathSearch.do",
  },
  {
    caseName: "death_1916-1972_unkefer_marie_susan_d_1968-09-04",
    url: "https://apps.ilsos.gov/isavital/idphDeathSearch.do",
  },
  {
    caseName: "death_1916-1972_unknown_cn_32415",
    url: "https://apps.ilsos.gov/isavital/idphDeathSearch.do",
  },
  {
    caseName: "death_1916-1972_unknown_infant_d_1939-01-08",
    url: "https://apps.ilsos.gov/isavital/idphDeathSearch.do",
  },
  {
    caseName: "death_1916-1972_unknown_white_baby_girl_d_1949-03-07",
    url: "https://apps.ilsos.gov/isavital/idphDeathSearch.do",
  },
  {
    caseName: "death_pre-1916_edwards_simian_w_d_1889-09-02",
    url: "https://apps.ilsos.gov/isavital/deathSearch.do",
  },
  {
    caseName: "death_pre-1916_pullman_george_m_d_1897-10-19",
    url: "https://apps.ilsos.gov/isavital/deathSearch.do",
  },
  {
    caseName: "death_pre-1916_stevenson_adlai_e_d_1914-06-14",
    url: "https://apps.ilsos.gov/isavital/deathSearch.do",
  },
  {
    caseName: "death_pre-1916_voelkel_elsie_mrs_d_1898-02-13",
    url: "https://apps.ilsos.gov/isavital/deathSearch.do",
  },
  {
    caseName: "marriage_1763-1900_gumersheimer_wolff_m_1871-08-28",
    url: "https://apps.ilsos.gov/isavital/marriageSearch.do",
  },
  {
    caseName: "marriage_1763-1900_gummersheimer_willems_m_1866-10-30",
    url: "https://apps.ilsos.gov/isavital/marriageSearch.do",
  },
  {
    caseName: "marriage_1763-1900_unknown_tanner_m_1891-12-02",
    url: "https://apps.ilsos.gov/isavital/marriageSearch.do",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("ilsosgov", regressionData, testManager);

  await runGeneralizeDataTests("ilsosgov", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("ilsosgov", functions, regressionData, testManager);
}

export { runTests };
