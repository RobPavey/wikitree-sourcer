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

import { extractData } from "../../extension/site/gro/core/gro_extract_data.mjs";
import { generalizeData } from "../../extension/site/gro/core/gro_generalize_data.mjs";
import { buildCitation } from "../../extension/site/gro/core/gro_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  /////////// Births /////////////////////
  {
    caseName: "b_alfred_watkins_1862",
  },
  {
    caseName: "b_ann_beecroft_1845",
  },
  {
    caseName: "b_edwin_buckland_1876",
  },
  {
    caseName: "b_ethel_daisy_bayford",
    optionVariants: [
      {
        variantName: "no_district_url", 
        optionOverrides: { citation_gro_useDistrictUrl: false, },
      },
    ],
  },
  {
    caseName: "b_frances_rhodes_1851",
  },
  {
    caseName: "b_frank_pollard_1908",
  },
  {
    caseName: "b_handford-3",
  },
  {
    caseName: "b_horace_matthews_1896",
  },
  {
    caseName: "b_leonard_king_1914",
  },
  {
    caseName: "b_mary_smith_narey",
  },
  {
    caseName: "b_maria_eccles_1840",
  },
  {
    // Note, the saved page doesn't save which entry is checked so it picks the first one
    // It is a good test though because there was a bug with having many entries listed
    caseName: "b_morgan-695",
  },
  {
    caseName: "b_partington-281",
  },
  {
    caseName: "b_pavey-451",
    optionVariants: [
      {
        variantName: "no_brs_or_nls", 
        optionOverrides: {
          citation_general_addNewlinesWithinRefs: false,
          citation_general_addNewlinesWithinBody: false,
          citation_general_addBreaksWithinBody: false,
        },
      },
      {
        variantName: "no_brs",
        optionOverrides: {
          citation_general_addBreaksWithinBody: false,
        },
      },
      {
        variantName: "no_nls",
        optionOverrides: {
          citation_general_addNewlinesWithinRefs: false,
          citation_general_addNewlinesWithinBody: false,
        },
      },
      {
        variantName: "no_ref_nls",
        optionOverrides: {
          citation_general_addNewlinesWithinRefs: false,
        },   
      },
      {
        variantName: "no_body_nls",
        optionOverrides: {
          citation_general_addNewlinesWithinBody: false,
        },
      },
    ],
  },
  {
    caseName: "b_pavey-452",
  },
  {
    caseName: "b_robert_slade_1853",
  },
  {
    caseName: "b_st_george_tick_1901",
  },
  {
    caseName: "b_william_cox_1867",
  },
  /////////// Deaths /////////////////////
  {
    caseName: "d_edward_pickup_1845",
  },
  {
    caseName: "d_eira_harkus_2004",
  },
  {
    caseName: "d_elizabeth_antell_1850",
  },
  {
    caseName: "d_frances_vickers_1842",
  },
  {
    caseName: "d_hannah_edwards_1855",
  },
  {
    caseName: "d_harry_littlemore_1884",
  },
  {
    caseName: "d_helen_lay_2016",
  },
  {
    caseName: "d_morgan-695",
  },
  {
    caseName: "d_pavey-342",
  },
  {
    caseName: "d_pavey-452",
  },
  {
    caseName: "d_pavey-697",
  },
  {
    caseName: "d_pavey-701",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("gro", extractData, regressionData, testManager);

  await runGeneralizeDataTests("gro", generalizeData, regressionData, testManager);

  await runBuildCitationTests("gro", buildCitation, undefined, regressionData, testManager);
}

export { runTests };