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

import { generalizeData } from "../../extension/site/qldbdm/core/qldbdm_generalize_data.mjs";
import { buildCitation } from "../../extension/site/qldbdm/core/qldbdm_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "birth_1875_david_goodwin",
    url: "https://www.familyhistory.bdm.qld.gov.au/details/e843f279987a200c81d6abf6f171a98d923deb5d30516e586021d2e877ebf2c4",
  },
  {
    caseName: "marriage_1911_david_goodwin",
    url: "https://www.familyhistory.bdm.qld.gov.au/details/dca99bfee4e642d2a9f04ee11b0104bb611ca7aa3b53e6d01ed1994b80d1e9ea",
  },
  {
    caseName: "death_1932_david_goodwin",
    url: "https://www.familyhistory.bdm.qld.gov.au/details/0da2d05cc67cc4663ee8b7b19d98b9bb5947624669463ad727636041604b397e",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("qldbdm", regressionData, testManager);

  await runGeneralizeDataTests("qldbdm", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("qldbdm", functions, regressionData, testManager);
}

export { runTests };
