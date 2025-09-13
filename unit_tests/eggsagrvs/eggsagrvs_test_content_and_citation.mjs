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

import { extractData } from "../../extension/site/eggsagrvs/core/eggsagrvs_extract_data.mjs";
import { generalizeData } from "../../extension/site/eggsagrvs/core/eggsagrvs_generalize_data.mjs";
import { buildCitation } from "../../extension/site/eggsagrvs/core/eggsagrvs_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // & separator, 2nd surname is multi-word
    caseName: "conradie_jan_and_johanna_van_veyeren",
    url: "https://www.graves.eggsa.org/easterncape/Aberdeen-urban/Aberdeen%20main/C%20-%20Surnames%20__%20Vanne%20-%20C/CONRADIE%20Jan/ABRD+0100a.JPG",
  },
  {
    // & separator, 2nd name without surname
    caseName: "dillon_garret_and_emma",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/SCOTT/DSCF0166.JPG",
  },
  {
    // :: separator, both names multi-word
    caseName: "eeden_bessie_van",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/E%20-%20Surnames%20__%20Vanne%20-%20E/DSCF3257.JPG",
  },
  {
    // Kenya, & separator, 2nd name no last name, no dates
    caseName: "engelbrecht_koos_en_hannie",
    url: "https://www.graves.eggsa.org/world/Kenya/Eldoret/0717036%20Eldoret%20Kenya_%20Elize%20Church%20FB/0005.jpg",
  },
  {
    // Namibia, shortened multi-name
    caseName: "erckert_friedrich_v",
    url: "https://www.graves.eggsa.org/world/Namibia/nam%2014%20Apr_016/0817023%20Gochas%20histories/IMG_0724.jpeg",
  },
  {
    // neé Janse van Rensburg
    caseName: "frittelli_nee_janse_van_rensburg",
    url: "https://www.graves.eggsa.org/westerncape/Riversdale_Urban/Riversdal-ou-begraafplaas/ou-NGK-begraafplaas/Block-B/WC-Riversale-TdV-0283.JPG",
  },
  {
    // Namibia, single name, no birth year
    caseName: "herman_1905",
    url: "https://www.graves.eggsa.org/world/Namibia/nam%2014%20Apr_016/0817023%20Gochas%20histories/IMG_0732.jpeg",
  },
  {
    // Janse van Rensburg (:: separator, 1st and 2nd person)
    caseName: "janse_van_rensburg",
    url: "https://www.graves.eggsa.org/westerncape/Riversdale_Urban/NuweBP/R%20-%20Vanne%20__%20Surnames%20-%20R/WC-Riversdale-nuweBP-ALouw-0026.JPG",
  },
  {
    // & separator, 2nd person with single word last name
    caseName: "meet_jan_van_der_and_huddlestone",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/M%20-%20Surnames%20__%20Vanne%20-%20M/Van+der+Meet_+Jan+J+en+Huddelstone_+FJJ.jpg",
  },
  {
    // Mixture of & and :: and multi-name surnames
    caseName: "merwe_wilhelmus_and_debore_and_bettie",
    url: "https://www.graves.eggsa.org/westerncape/CERES-Urban/abc/Ceres%20Owenstraat%20Oos%20Ljh_012/SA101359.JPG",
  },
  {
    // multi-word surname and nee
    caseName: "merwe_rachel_van_der",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/M%20-%20Surnames%20__%20Vanne%20-%20M/DSCF3557.JPG",
  },
  {
    // :: separator, 3 names, 2nd and 3rd with nee
    caseName: "purdon_kenneth_sylvia_dorothy",
    url: "https://www.graves.eggsa.org/easterncape/BATHURST-Urban/Bathurst-Weslyan/PURDON/IMG_1241.JPG",
  },
  {
    // & separator, 4 people, only first with last name, pick 2nd person
    caseName: "sleath_and_family",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/IMGP5541.JPG",
    primaryPersonIndex: 1,
  },
  {
    caseName: "uknown_lastnames",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/Skinn/LDH00476.jpg",
  },
  /*   
  {
    caseName: "eeden",
    url: "",
  },
  */
];
const optionVariants = [
  {
    variantName: "linkIn_imgTitle",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_imgTitle_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
  {
    variantName: "linkIn_srcTitle",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_srcTitle_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
  {
    variantName: "linkIn_ref",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_ref_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
  {
    variantName: "linkIn_imgTitle_refAtEnd",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_imgTitle_refAtEnd_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
  {
    variantName: "linkIn_srcTitle_refAtEnd",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_srcTitle_refAtEnd_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
  {
    variantName: "linkIn_ref_refAtEnd",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
    },
  },
  {
    variantName: "linkIn_ref_refAtEnd_withImgPos",
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("eggsagrvs", extractData, regressionData, testManager);

  await runGeneralizeDataTests("eggsagrvs", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("eggsagrvs", functions, regressionData, testManager, optionVariants);
}

export { runTests };
