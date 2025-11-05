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

import { extractData } from "../../extension/site/mdz/core/mdz_extract_data.mjs";
import { generalizeData } from "../../extension/site/mdz/core/mdz_generalize_data.mjs";
import { buildCitation } from "../../extension/site/mdz/core/mdz_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "bsb10716142_1",
    url: "https://www.digitale-sammlungen.de/de/view/bsb10716142?page=,1",
  },
  {
    caseName: "bsb10716142_20",
    url: "https://www.digitale-sammlungen.de/de/view/bsb10716142?page=20,21",
  },
  {
    caseName: "bsb11873875_20",
    url: "https://www.digitale-sammlungen.de/de/view/bsb11873875?page=20,21",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("mdz", extractData, regressionData, testManager);

  await runGeneralizeDataTests("mdz", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("mdz", functions, regressionData, testManager);
}

export { runTests };
