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
    caseName: "guiscriff_081_1miec081_r13-0004_-_naissance_mariage_décès_-_1868-1873_img_152",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta54487e7f49ee3/daogrp/0/152",
  },
  {
    caseName: "langonnet_-_recensement_1901_3_es_100_img_51",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/1542989/daogrp/0/51",
  },
  {
    caseName: "langonnet_100_1miec100_r7_01-0001_-_baptême_mariage_sépulture_-_1700-1762_img_656",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta25b38c313cf21afa/daogrp/0/656",
  },
  {
    caseName: "lanouée_102_1miec102_r6_01-0001_-_baptême_mariage_-_1747-1769_img_175",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta88cd47927f0ddf71/daogrp/0/175",
  },
  {
    caseName: "lorient_121_1miec121_r07-0096_-_baptême_mariage_sépulture_-_1732-1732_img_1",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta7511557eb3a4b76b/daogrp/0/1",
  },
  {
    caseName: "port-louis_ec_181-0098_-_décès_-_1803-1804_img_1",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta5448861531bdd/daogrp/0/1",
  },
  {
    caseName: "roudouallec_4e_199_009-0253_-_naissance_mariage_décès_-_1872-1872_img_6",
    url: "https://rechercher.patrimoines-archives.morbihan.fr/ark:/15049/vta54488725a1b86/daogrp/0/6",
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
