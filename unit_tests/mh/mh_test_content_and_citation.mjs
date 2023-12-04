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

import { extractData } from "../../extension/site/mh/core/mh_extract_data.mjs";
import { generalizeData } from "../../extension/site/mh/core/mh_generalize_data.mjs";
import { buildCitation } from "../../extension/site/mh/core/mh_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "australia_business_register_2010_barbara_jones",
    url: "https://www.myheritage.com/research/record-20422-391107/barbara-jones-in-australia-business-register",
  },
  {
    caseName: "canada_marriage_1890_ronald_macdonald",
    url: "https://www.myheritage.com/research/record-20440-604/ronald-macdonald-and-annie-alberta-macdonald-in-canada-prince-edward-island-marriages",
  },
  {
    caseName: "england_births_1826_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-30042-49707075/charles-kimberlin-in-england-births-christenings",
  },
  {
    caseName: "england_census_1841_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-10150-12380625/charles-kimberlin-in-1841-england-wales-census",
  },
  {
    caseName: "england_census_1851_william_pavey",
    url: "https://www.myheritage.com/research/record-10151-40011245/william-henry-pavey-in-1851-england-wales-census",
  },
  {
    caseName: "england_marriage_reg_1914_joseph_oconnor",
    url: "https://www.myheritage.com/research/record-10443-22304592/joseph-oconnor-in-england-wales-marriage-index",
  },
  {
    caseName: "us_pa_immigration_1882_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-10017-3144396/charles-kimberlin-in-passenger-immigration-lists",
  },

  // Family Tree person pages
  {
    caseName: "xx_person_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-1-451433851-1-508888/charles-kimberlin-in-myheritage-family-trees",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("mh", extractData, regressionData, testManager);

  await runGeneralizeDataTests("mh", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("mh", functions, regressionData, testManager);
}

export { runTests };
