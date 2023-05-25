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

import { extractData } from "../../extension/site/naie/core/naie_extract_data.mjs";
import { generalizeData } from "../../extension/site/naie/core/naie_generalize_data.mjs";
import { buildCitation } from "../../extension/site/naie/core/naie_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "census_1821_fermanagh_ann_keenan",
    url: "http://www.census.nationalarchives.ie/pages/1821/Fermanagh/Derryvolland/Lisnarrick_Village/15/",
  },
  {
    caseName: "census_1821_galway_walter_gleese",
    url: "http://www.census.nationalarchives.ie/pages/1821/Galway/Kilconickney/Rathreddy/3/",
  },
  {
    caseName: "census_1831_londonderry_danl_dimond",
    url: "http://www.census.nationalarchives.ie/pages/1831/Londonderry/Loughinshillin/Kilrea/Kilrea/55/",
  },
  {
    caseName: "census_1841_fermanagh_mathew_dowds",
    url: "http://www.census.nationalarchives.ie/pages/1841/Fermanagh/Coole/Currin/Hermitage/0/",
  },
  {
    caseName: "census_1841_mayo_elenor_mcguire",
    url: "http://www.census.nationalarchives.ie/pages/1841/Mayo/Erris/Kil_Common/Dooyork/21/",
  },
  {
    caseName: "census_1851_dublin_mary_kennedy",
    url: "http://www.census.nationalarchives.ie/pages/1851/Dublin/Balrothery_East/Balrothery/Stephenstown/10/",
  },
  {
    caseName: "census_1901_clare_catherine_loughnane",
    url: "http://www.census.nationalarchives.ie/pages/1901/Clare/Ballynacally/Inishmore_on_Deen_Island/1075611/",
  },
  {
    caseName: "census_1911_waterford_john_long",
    url: "http://www.census.nationalarchives.ie/pages/1911/Waterford/Waterford_No__2_Urban/Spring_Garden_Alley/670431/",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("naie", extractData, regressionData, testManager);

  await runGeneralizeDataTests("naie", generalizeData, regressionData, testManager);

  await runBuildCitationTests("naie", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
