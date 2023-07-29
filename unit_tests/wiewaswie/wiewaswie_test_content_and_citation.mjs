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

import { extractData } from "../../extension/site/wiewaswie/core/wiewaswie_extract_data.mjs";
import { generalizeData } from "../../extension/site/wiewaswie/core/wiewaswie_generalize_data.mjs";
import { buildCitation } from "../../extension/site/wiewaswie/core/wiewaswie_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "baptism_1789_gerryt_goudemond_en",
    url: "https://www.wiewaswie.nl/en/detail/54339285",
  },
  {
    caseName: "baptism_1789_gerryt_goudemond_nl",
    url: "https://www.wiewaswie.nl/nl/detail/54339285",
  },
  {
    caseName: "birth_cert_1811_jan_van_der_wijk_en",
    url: "https://www.wiewaswie.nl/en/detail/15425329",
  },
  {
    caseName: "birth_cert_1811_jan_van_der_wijk_nl",
    url: "https://www.wiewaswie.nl/nl/detail/15425329",
  },
  {
    caseName: "burial_1694_peter_hillebrandts_en",
    url: "https://www.wiewaswie.nl/en/detail/55850616",
  },
  {
    caseName: "burial_1694_peter_hillebrandts_nl",
    url: "https://www.wiewaswie.nl/nl/detail/55850616",
  },
  {
    caseName: "burial_1776_maria_van_den_berg_en",
    url: "https://www.wiewaswie.nl/en/detail/35327513",
  },
  {
    caseName: "burial_1776_maria_van_den_berg_nl",
    url: "https://www.wiewaswie.nl/nl/detail/35327513",
  },
  {
    caseName: "burial_1786_ruud_scheltus_en",
    url: "https://www.wiewaswie.nl/en/detail/55438226",
  },
  {
    caseName: "burial_1786_ruud_scheltus_nl",
    url: "https://www.wiewaswie.nl/nl/detail/55438226",
  },
  {
    caseName: "burial_1797_sarah_ammersfoort_en",
    url: "https://www.wiewaswie.nl/en/detail/36565702",
  },
  {
    caseName: "burial_1797_sarah_ammersfoort_nl",
    url: "https://www.wiewaswie.nl/nl/detail/36565702",
  },
  {
    caseName: "church_member_1825_reinder_van_der_meulen_en",
    url: "https://www.wiewaswie.nl/en/detail/109854388",
  },
  {
    caseName: "church_member_1825_reinder_van_der_meulen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/109854388",
  },
  {
    caseName: "death_cert_1815_jan_huisman_en",
    url: "https://www.wiewaswie.nl/en/detail/8941780",
  },
  {
    caseName: "death_cert_1815_jan_huisman_nl",
    url: "https://www.wiewaswie.nl/nl/detail/8941780",
  },
  {
    caseName: "marriage_1676_jan_peter_janssen_en",
    url: "https://www.wiewaswie.nl/en/detail/10662653",
  },
  {
    caseName: "marriage_1676_jan_peter_janssen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/10662653",
  },
  {
    caseName: "marriage_cert_1818_ringert_jongewaard_en",
    url: "https://www.wiewaswie.nl/en/detail/31877498",
  },
  {
    caseName: "marriage_cert_1818_ringert_jongewaard_nl",
    url: "https://www.wiewaswie.nl/nl/detail/31877498",
  },
  {
    caseName: "profession_1932_rutger_van_atterloo_en",
    url: "https://www.wiewaswie.nl/en/detail/103397261",
  },
  {
    caseName: "profession_1932_rutger_van_atterloo_nl",
    url: "https://www.wiewaswie.nl/nl/detail/103397261",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("wiewaswie", extractData, regressionData, testManager);

  await runGeneralizeDataTests("wiewaswie", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("wiewaswie", functions, regressionData, testManager);
}

export { runTests };
