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

import { extractData } from "../../extension/site/bg/core/bg_extract_data.mjs";
import { generalizeData } from "../../extension/site/bg/core/bg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/bg/core/bg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "agnes_c_loudon_fisher_d_1905",
    url: "https://billiongraves.com/grave/Agnes-C-Loudon-Fisher/39500252",
  },
  {
    caseName: "c_r_bow_d_1917",
    url: "https://billiongraves.com/grave/C-R-Bow/42252559",
  },
  {
    caseName: "francis_weyland_dunn_d_1874",
    url: "https://billiongraves.com/grave/Francis-Wayland-Dunn/7557769",
  },
  {
    caseName: "hanna_delaney_fallon_d_1817",
    url: "https://billiongraves.com/grave/Hanna-Delaney-Fallon/20263950",
  },
  {
    caseName: "isabella_crawford_d_17_dec_1948",
    url: "https://billiongraves.com/grave/Isabella-Crawford/38296403",
  },
  {
    caseName: "margaret_ann_craney_d_1909",
    url: "https://billiongraves.com/grave/Margaret-Ann-Craney/27550409",
  },
  {
    caseName: "mary_ellen_adams_d_1967",
    url: "https://billiongraves.com/supporting-record/Mary-Ellen-Adams/102675092",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_new_logged_on",
    url: "https://billiongraves.com/grave/Mary-Ellen-Adams-Hughes/2569833",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_new_not_logged_on",
    url: "https://billiongraves.com/grave/Mary-Ellen-Adams-Hughes/2569833",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_old_logged_on",
    url: "https://billiongraves.com/grave/Mary-Ellen-Adams-Hughes/2569833",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_old_not_logged_on",
    url: "https://billiongraves.com/grave/Mary-Ellen-Adams-Hughes/2569833",
  },
  {
    caseName: "roderick_mclennan_d_2013",
    url: "https://billiongraves.com/supporting-record/Roderick-McLennan/104134264",
  },
  {
    caseName: "thomas_moffat_29_october_new_style",
    url: "https://billiongraves.com/grave/Thomas-Moffat/22067921",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("bg", extractData, regressionData, testManager);

  await runGeneralizeDataTests("bg", generalizeData, regressionData, testManager);

  await runBuildCitationTests("bg", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
