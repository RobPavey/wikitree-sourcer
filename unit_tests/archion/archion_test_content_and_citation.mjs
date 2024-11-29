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

import { extractData } from "../../extension/site/archion/core/archion_extract_data.mjs";
import { generalizeData } from "../../extension/site/archion/core/archion_generalize_data.mjs";
import { buildCitation } from "../../extension/site/archion/core/archion_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "bayern_aschaffenburg_amorbach_bestattungen_1862_1964_20",
    url: "https://www.archion.de/de/viewer/churchRegister/290910?cHash=7425117a1f08bec109082a024138bc12",
    extraExtractedDataFields: { permalink: "https://www.archion.de/p/d9576172e0/" },
  },
  {
    caseName: "bayern_nuernberg_st_georg_abendmahl_1805_1829_62",
    url: "https://www.archion.de/de/viewer/churchRegister/206087?cHash=aff50530463bc8410b40548c54f17aff",
    extraExtractedDataFields: { permalink: "https://www.archion.de/p/86eed83835/" },
  },
  {
    caseName: "bayern_nuernberg_st_georg_konfirmationen_1925_1951_8",
    url: "https://www.archion.de/de/viewer/churchRegister/366328?cHash=990aef2a0aab4cd5211f5013bf1721c6",
    extraExtractedDataFields: { permalink: "https://www.archion.de/p/0252a09d0d/" },
  },
  {
    caseName: "baden_wuerttemberg_sulz_am_neckar_aistaig_trauungen_1798_1831_44",
    url: "https://www.archion.de/en/viewer/?type=churchRegister&uid=113568&pageId=31765493",
    extraExtractedDataFields: { permalink: "https://www.archion.de/p/1aa1b9ba8e/" },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("archion", extractData, regressionData, testManager);

  await runGeneralizeDataTests("archion", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("archion", functions, regressionData, testManager);
}

export { runTests };
