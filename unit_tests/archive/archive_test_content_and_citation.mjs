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

import { extractData } from "../../extension/site/archive/core/archive_extract_data.mjs";
import { generalizeData } from "../../extension/site/archive/core/archive_generalize_data.mjs";
import { buildCitation } from "../../extension/site/archive/core/archive_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "dugdale_visitation_yorks_1899",
    url: "https://archive.org/details/dugdalesvisitati03dugd/page/89/mode/1up?view=theater",
  },
  {
    caseName: "linn_county_iowa_1887",
    url: "https://archive.org/details/portraitbiolinn00chap",
  },
  {
    caseName: "new_links_with_shakespeare_1930",
    url: "https://archive.org/details/in.ernet.dli.2015.182244/page/n155/mode/2up",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("archive", extractData, regressionData, testManager);

  await runGeneralizeDataTests("archive", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("archive", functions, regressionData, testManager);
}

export { runTests };
