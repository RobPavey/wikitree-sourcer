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

import { extractData } from "../../extension/site/nzbdm/core/nzbdm_extract_data.mjs";
import { generalizeData } from "../../extension/site/nzbdm/core/nzbdm_generalize_data.mjs";
import { buildCitation } from "../../extension/site/nzbdm/core/nzbdm_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "birth_1880_george_nicholson",
    url: "https://www.bdmhistoricalrecords.dia.govt.nz/Search/Search?Path=querySubmit.m%3fReportName%3dBirthSearch%26recordsPP%3d30#SearchResults",
  },
  {
    caseName: "birth_1936_trevor_nicholson_page2",
    url: "https://www.bdmhistoricalrecords.dia.govt.nz/Search/Search?Path=%2FbirthSelect.m%3Fpage%3D2#matches",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("nzbdm", extractData, regressionData, testManager);

  await runGeneralizeDataTests("nzbdm", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("nzbdm", functions, regressionData, testManager);
}

export { runTests };
