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
    optionVariants: [
      {
        variantName: "linksWithPermanentId",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_linkFormat: "withPermanentId",
        },
      },
      {
        variantName: "visibleLinks",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_linkFormat: "visible",
        },
      },
      {
        variantName: "noImageLink",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_includeImageLink: false,
        },
      },
    ],
  },
  {
    caseName: "cb_bur_1840_ingebord_jacobsd",
    url: "https://www.digitalarkivet.no/en/view/267/pg00000000517413",
  },
  {
    caseName: "cb_child_bap_ludvig_fremmerlid",
    url: "https://www.digitalarkivet.no/en/view/255/pd00000033830720",
  },
  {
    caseName: "cb_child_bap_ludvig_fremmerlid_table",
    url: "https://www.digitalarkivet.no/en/view/255/pd00000033830720",
  },
  {
    caseName: "census_1815_ole_anders",
    url: "https://www.digitalarkivet.no/en/census/person/pf01051099000750",
    optionVariants: [
      {
        variantName: "describeHousehold",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_householdPartFormat: "withFamily",
        },
      },
    ],
  },
  {
    caseName: "census_1815_ole_anders_table",
    url: "https://www.digitalarkivet.no/en/census/person/pf01051099000750",
  },
  {
    caseName: "census_1825_abigael_hansdatter",
    url: "https://www.digitalarkivet.no/en/census/person/pf01051200001576",
  },
  {
    caseName: "census_1865_carl_motzfeldt",
    url: "https://www.digitalarkivet.no/en/census/person/pf01038310006925",
    optionVariants: [
      {
        variantName: "describeHousehold",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_householdPartFormat: "withFamily",
        },
      },
    ],
  },
  {
    caseName: "census_1875_jakob_pedersen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052377002789",
  },
  {
    // language: Bokmål
    caseName: "census_1875_jakob_pedersen_bo",
    url: "https://www.digitalarkivet.no/census/person/pf01052377002789",
  },
  {
    // Language: Nynorsk
    caseName: "census_1875_jakob_pedersen_nn",
    url: "https://www.digitalarkivet.no/nn/census/person/pf01052377002789",
  },
  {
    // Son of 3rd Husfader in list
    caseName: "census_1875_jorgen_olsen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052316000238",
  },
  {
    // was not getting event date because of a case difference:
    // "1875 Census for 1438P Bremanger" rather than "1875 census for 1660P Strinda"
    caseName: "census_1875_lars_valdemarsen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052316000226",
  },
  {
    caseName: "census_1875_nils_stenersen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052251002682",
  },
  {
    caseName: "census_1891_jakob_pedersen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01052903004507",
  },
  {
    caseName: "census_1900_ole_anders",
    url: "https://www.digitalarkivet.no/en/census/person/pf01037045214297",
  },
  {
    caseName: "census_1910_anna_nikolaidatter",
    url: "https://www.digitalarkivet.no/en/census/person/pf01036754000004",
  },
  {
    caseName: "census_1912_alfhild_jamne",
    url: "https://www.digitalarkivet.no/en/census/person/pf01105551064459",
  },
  {
    caseName: "census_1914_peder_hansen",
    url: "https://www.digitalarkivet.no/en/census/person/pf01049501000001",
  },
  {
    caseName: "confirmation_1825_carl_motzfeldt",
    url: "https://www.digitalarkivet.no/en/view/279/pk00000002723491",
  },
  {
    caseName: "death_1951_kare_tonne",
    url: "https://www.digitalarkivet.no/en/view/387/pc00000001290505",
  },
  {
    caseName: "emigrant_1872_ole_anders",
    url: "https://www.digitalarkivet.no/en/view/8/pe00000000917949",
  },
  {
    caseName: "marriage_1814_ole_ingmundsen",
    url: "https://www.digitalarkivet.no/en/view/327/pv00000001749450",
  },
  {
    caseName: "military_1813_ingeborg_nilsdatter",
    url: "https://www.digitalarkivet.no/en/view/44/pp00000000222888",
  },
  {
    caseName: "patient_record_1863_ingeborg_aasbo",
    url: "https://www.digitalarkivet.no/en/view/20/pc00000000192712",
  },
  {
    caseName: "probate_1879_kari_nilsdtr",
    url: "https://www.digitalarkivet.no/en/view/27/pa00000000013016",
  },

  // images
  {
    caseName: "xx_image_cb_bap_1888_knut",
    url: "https://media.digitalarkivet.no/view/1953/30",
    optionVariants: [
      {
        variantName: "linksWithPermanentId",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_linkFormat: "withPermanentId",
        },
      },
      {
        variantName: "visibleLinks",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_linkFormat: "visible",
        },
      },
      {
        variantName: "noImageLink",
        thisTypeOnly: "inline",
        optionOverrides: {
          citation_noda_includeImageLink: false,
        },
      },
    ],
  },
  {
    // this one has no transcription
    caseName: "xx_image_marriage_1792_frans_gutormsen_welsvig",
    url: "https://media.digitalarkivet.no/view/15957/43",
  },

  // residence pages - should not create citation but should not crash
  {
    // this one has no transcription
    caseName: "zz_census_1910_rr_yksnøy",
    url: "https://www.digitalarkivet.no/en/census/rural-residence/bf01036754000002",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("noda", extractData, regressionData, testManager);

  await runGeneralizeDataTests("noda", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("noda", functions, regressionData, testManager);
}

export { runTests };
