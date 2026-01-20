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

import { extractData } from "../../extension/site/panb/core/panb_extract_data.mjs";
import { generalizeData } from "../../extension/site/panb/core/panb_generalize_data.mjs";
import { buildCitation } from "../../extension/site/panb/core/panb_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [

  {
    caseName: "a1b_john_wallace",
    url: "https://archives2.gnb.ca/Search/VISSE/141A1b.aspx?culture=en-CA&guid=436A96E4-9228-44F6-AE61-5051B00E8613",
  },

  {
    // has extended ASCII characters
    caseName: "b7_m_carr_and_wallace",
    url: "https://archives2.gnb.ca/Search/VISSE/141B7.aspx?culture=en-CA&guid=599B423B-6369-42C3-A475-537726F8A403",
  },

  {
    // has extended ASCII characters
    caseName: "walter_earl_dunfield_b_1902",
    url: "https://archives2.gnb.ca/Search/VISSE/141A1b.aspx?culture=en-CA&guid=D740BC74-0DEC-47C4-85E9-D5122DC81D96",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("panb", extractData, regressionData, testManager);

  await runGeneralizeDataTests("panb", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("panb", functions, regressionData, testManager);
}

export { runTests };
