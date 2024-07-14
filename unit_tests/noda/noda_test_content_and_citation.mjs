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

import { extractData } from "../../extension/site/noda/core/noda_extract_data.mjs";
import { generalizeData } from "../../extension/site/noda/core/noda_generalize_data.mjs";
import { buildCitation } from "../../extension/site/noda/core/noda_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "cb_bap_1888_knut",
    url: "https://www.digitalarkivet.no/en/view/255/pd00000017246548",
  },
  {
    caseName: "cb_bur_1840_ingebord_jacobsd",
    url: "https://www.digitalarkivet.no/en/view/267/pg00000000517413",
  },
  {
    caseName: "census_1875_jakob_pedersen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052377002789",
  },
  {
    // language: Bokmal
    caseName: "census_1875_jakob_pedersen_bo",
    url: "https://www.digitalarkivet.no/census/person/pf01052377002789",
  },
  {
    // Language: Nynorsk
    caseName: "census_1875_jakob_pedersen_nn",
    url: "https://www.digitalarkivet.no/nn/census/person/pf01052377002789",
  },
  {
    caseName: "emigrant_1872_ole_anders",
    url: "https://www.digitalarkivet.no/en/view/8/pe00000000917949",
  },

  // images
  {
    caseName: "xx_image_cb_bap_1888_knut",
    url: "https://media.digitalarkivet.no/view/1953/30",
  },
  {
    // this one has no transcription
    caseName: "xx_image_marriage_1792_frans_gutormsen_welsvig",
    url: "https://media.digitalarkivet.no/view/15957/43",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("noda", extractData, regressionData, testManager);

  await runGeneralizeDataTests("noda", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("noda", functions, regressionData, testManager);
}

export { runTests };
