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

import { extractDataFromFetch } from "../../extension/site/openarch/core/openarch_extract_data.mjs";
import { generalizeData } from "../../extension/site/openarch/core/openarch_generalize_data.mjs";
import { buildCitation } from "../../extension/site/openarch/core/openarch_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "aanbevelingsbrief_1767_jan_hardewel",
    url: "https://www.openarchieven.nl/sgv:4ef2a544-e9c5-666c-6387-5ce14af05bea",
  },
  {
    caseName: "baptism_1789_gerryt_goudemond",
    url: "https://www.openarchieven.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf",
    optionVariants: [
      {
        variantName: "sourceRefPageWithLinks",
        optionOverrides: {
          citation_openarch_sourceRefType: "pageWithLinks",
        },
      },
      {
        variantName: "sourceRefPage",
        optionOverrides: {
          citation_openarch_sourceRefType: "page",
        },
      },
    ],
  },
  {
    caseName: "baptism_1789_gerryt_goudemond_nov_2024",
    url: "https://www.openarchieven.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf",
  },
  {
    // has source type of "other:", have to use event type
    caseName: "birth_1865_clara_los",
    url: "https://www.openarchieven.nl/elo:fcece40a-7b94-be44-6749-70f6068011cf",
  },
  {
    caseName: "birth_cert_1811_jan_van_der_wijk",
    url: "https://www.openarchieven.nl/frl:920ffe70-6378-e93b-71a0-58a1e1237e3f",
  },
  {
    caseName: "burial_1776_maria_van_den_berg",
    url: "https://www.openarchieven.nl/brd:b05a07ca-8205-c036-8713-a68738acc33c",
  },
  {
    caseName: "church_member_1825_reinder_van_der_meulen",
    url: "https://www.openarchieven.nl/frl:b319628e-3082-485a-aa5b-7a711898d92a",
  },
  {
    caseName: "death_1965_alphonsus_van_hiel",
    url: "https://www.openarchieven.nl/zar:9035582F-0BCC-4640-8BC2-95DA8D148A9B",
  },
  {
    caseName: "death_cert_1815_jan_huisman",
    url: "https://www.openarchieven.nl/frl:034e7de7-24cc-6d54-d435-98c38c0b44c7",
  },
  {
    // has example of a2a:Place with province
    caseName: "draw_1922_jan_bel",
    url: "https://www.openarchieven.nl/nha:99634afa-4797-4f8d-945c-ac6396063a97",
  },
  {
    caseName: "marriage_1676_jan_peter_janssen",
    url: "https://www.openarchieven.nl/bhi:b576f38c-4cb2-490b-0029-d64ae7477873",
  },
  {
    caseName: "marriage_cert_1818_ringert_jongewaard",
    url: "https://www.openarchieven.nl/nha:f46f13cf-4f53-4a37-9421-91c0e2a458e0",
  },
  {
    caseName: "militia_1922_george_van_der_beek",
    url: "https://www.openarchieven.nl/nha:6ABC1CEF-5725-7FEA-E053-CA00A8C0CBDA",
  },
  {
    caseName: "pop_reg_1815_jan_sties",
    url: "https://www.openarchieven.nl/vev:408970a5-600a-58a4-f456-138a8e37cdaf",
  },
  {
    caseName: "pop_reg_1850_david_van_zwyndregt",
    url: "https://www.openarchieven.nl/zar:A1278296-E9C6-4A75-9A15-05DFC1244C95",
  },
  {
    caseName: "pop_reg_1854_pieter_van_gaard",
    url: "https://www.openarchieven.nl/saa:63a0d46f-94b3-4a93-a886-cf9980fdb4ff",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("openarch", extractDataFromFetch, regressionData, testManager);

  await runGeneralizeDataTests("openarch", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("openarch", functions, regressionData, testManager);
}

export { runTests };
