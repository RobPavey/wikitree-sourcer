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

import { extractData } from "../../extension/site/nli/core/nli_extract_data.mjs";
import { generalizeData } from "../../extension/site/nli/core/nli_generalize_data.mjs";
import { buildCitation } from "../../extension/site/nli/core/nli_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "register_vtis000632250_p150",
    url: "https://registers.nli.ie/registers/vtls000632250#page/150/mode/1up",
  },
  {
    caseName: "register_vtls000632197_p22",
    url: "https://registers.nli.ie/registers/vtls000632197#page/22/mode/1up",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("nli", extractData, regressionData, testManager);

  await runGeneralizeDataTests("nli", generalizeData, regressionData, testManager);

  await runBuildCitationTests("nli", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
