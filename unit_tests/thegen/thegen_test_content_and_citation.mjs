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

import { extractData } from "../../extension/site/thegen/core/thegen_extract_data.mjs";
import { generalizeData } from "../../extension/site/thegen/core/thegen_generalize_data.mjs";
import { buildCitation } from "../../extension/site/thegen/core/thegen_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// The URL has to be copied from iframe address for record a search results
const regressionData = [
  {
    caseName: "bmd_birth_1839_charles_pavey_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/births/full/?id=260105357&year=1839",
  },
  {
    caseName: "bmd_marriage_1845_thomas_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/marriages/full/?id=446092223&year=1845",
  },
  {
    caseName: "bmd_nc_burial_1849_henry_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/non-conformist/full/?id=716475002&uid_type=1",
  },
  {
    caseName: "census_1861_sarah_pavey_r",
    url: "https://www.thegenealogist.com/search/advanced/census/main-household/?hlt=219560985&county=243&y=1861&household_id=16268345&a=Search&hh=1&hs=1&cl=1&sscid=243&view_type=fullRecord",
  },
  {
    caseName: "parish_marriage_1851_thomas_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/parish/marriage/full/?id=851071136&s_id=1464&sscid=401",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("thegen", extractData, regressionData, testManager);

  await runGeneralizeDataTests("thegen", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("thegen", functions, regressionData, testManager);
}

export { runTests };
