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

import { extractData } from "../../extension/site/morbihan/core/morbihan_extract_data.mjs";
import { generalizeData } from "../../extension/site/morbihan/core/morbihan_generalize_data.mjs";
import { buildCitation } from "../../extension/site/morbihan/core/morbihan_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "gourin_066_1miec066_r21-0004_-_naissance_mariage_décès_-_1819-1830_img_318",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta54487d875d57e/daogrp/0/318",
  },
  {
    caseName: "guégon_-_recensement_1846_3_es_70_img_1",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/1542519/daogrp/0/1",
  },
  {
    caseName: "guégon_-_recensement_1931_6_m_99_img_37",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/3541873/daogrp/0/37",
  },
  {
    caseName: "langonnet_-_recensement_1901_3_es_100_img_51",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/1542989/daogrp/0/51",
  },
  /*
  {
    caseName: "b_1902_calvert_florence",
    url: "https://www.morbihan.org.uk/cgi/information.pl?r=107280059:7282&d=bmd_1649064119",
  },
  */
];

async function runTests(testManager) {
  await runExtractDataTests("morbihan", extractData, regressionData, testManager);

  await runGeneralizeDataTests("morbihan", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("morbihan", functions, regressionData, testManager);
}

export { runTests };
