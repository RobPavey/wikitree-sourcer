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

import { extractData } from "../../extension/site/freereg/core/freereg_extract_data.mjs";
import { generalizeData } from "../../extension/site/freereg/core/freereg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/freereg/core/freereg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  // baptisms
  {
    caseName: "bap_1568_ken_robert_jones",
    url: "https://www.freereg.org.uk/search_records/58185f38e93790ec8b4b6afa/robert-jones-baptism-kent-warehorne-1568-06-13?locale=en",
  },
  {
    caseName: "bap_1582_wry_jacobus_walker",
    url: "https://www.freereg.org.uk/search_records/5817acf3e93790eca3aee203/jacobus-walker-baptism-yorkshire-west-riding-sheffield-1582-07-31?locale=en",
  },
  {
    caseName: "bap_1713_gls_elizabeth_pavey",
    url: "https://www.freereg.org.uk/search_records/581832b7e93790ec8be6619e/elizabeth-pavey-baptism-gloucestershire-dursley-1713-09-28?citation_type=wikitree&locale=en",
  },
  {
    caseName: "bap_1874_jsy_philip_jordan",
    url: "https://www.freereg.org.uk/search_records/5817d04fe93790ec8b31442f/philip-john-marett-jordan-baptism-jersey-st-helier-1874-06-14?locale=en",
  },
  // burials
  {
    caseName: "bur_1755_abd_alexander_taylor",
    url: "https://www.freereg.org.uk/search_records/5817a8c1e93790ec753c2f1c/alexander-taylor-burial-aberdeenshire-strichen-1755-08-30?locale=en",
  },
  // marriages
  {
    caseName: "mar_1700_nfk_james_musset_susan_taylor",
    url: "https://www.freereg.org.uk/search_records/58183154e93790eb7f575f2b/susan-taylor-james-musset-marriage-norfolk-gunthorpe-1700-?locale=en",
  },
  {
    caseName: "mar_1894_ken_francis_smith_julia_loughrey",
    url: "https://www.freereg.org.uk/search_records/5e406233f493fd3d68efb541/julia-loughrey-francis-patrick-smith-marriage-kent-rochester-1894-09-01?locale=en",
  },
];

const optionVariants = [
  {
    variantName: "dataStyle_none",
    optionOverrides: {
      citation_freereg_dataStyle: "none",
    },
  },
  {
    variantName: "dataStyle_string",
    optionOverrides: {
      citation_freereg_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_list",
    optionOverrides: {
      citation_freereg_dataStyle: "list",
    },
  },
  {
    variantName: "dataStyle_table",
    optionOverrides: {
      citation_freereg_dataStyle: "table",
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("freereg", extractData, regressionData, testManager);

  await runGeneralizeDataTests("freereg", generalizeData, regressionData, testManager);

  await runBuildCitationTests("freereg", buildCitation, undefined, regressionData, testManager, optionVariants);
}

export { runTests };
