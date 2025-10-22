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

import { extractData } from "../../extension/site/sosmogov/core/sosmogov_extract_data.mjs";
import { generalizeData } from "../../extension/site/sosmogov/core/sosmogov_generalize_data.mjs";
import { buildCitation } from "../../extension/site/sosmogov/core/sosmogov_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "Death_1965_Alice_Peterson",
    url: "https://s1.sos.mo.gov/Records/Archives/ArchivesMvc/DeathCertificates/Results",
  },
  {
    caseName: "Death_1974_Alice_Ursula_Peterson",
    url: "https://s1.sos.mo.gov/Records/Archives/ArchivesMvc/DeathCertificates/Results",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("sosmogov", extractData, regressionData, testManager);

  await runGeneralizeDataTests("sosmogov", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("sosmogov", functions, regressionData, testManager);
}

export { runTests };
