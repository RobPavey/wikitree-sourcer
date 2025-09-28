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
  // CONRADIE Jan Hendrik 1883-1946 & Johanna Elizabeth VAN VEYEREN 1887-1953
  // & separator, 2nd surname is multi-word
  {
    caseName: "conradie_jan_and_johanna_van_veyeren",
    url: "https://www.graves.eggsa.org/easterncape/Aberdeen-urban/Aberdeen%20main/C%20-%20Surnames%20__%20Vanne%20-%20C/CONRADIE%20Jan/ABRD+0100a.JPG",
  },
  // DILLON Garrett Maurice 1884-1954 & Emma Valentine Eva 1898-1971
  // & separator, 2nd name without surname
  {
    caseName: "dillon_garret_and_emma_p0",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/SCOTT/DSCF0166.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/dillon_garret_and_emma.html",
  },
  {
    caseName: "dillon_garret_and_emma_p1",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/SCOTT/DSCF0166.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/dillon_garret_and_emma.html",
    primaryPersonIndex: 1,
  },
  // EEDEN Bessie, van 1895-1918 :: VAN EEDEN Baby 1897-1971
  // :: separator, both names multi-word
  {
    caseName: "eeden_bessie_van_p0",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/E%20-%20Surnames%20__%20Vanne%20-%20E/DSCF3257.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/eeden_bessie_van.html",
  },
  {
    caseName: "eeden_bessie_van_p1",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/E%20-%20Surnames%20__%20Vanne%20-%20E/DSCF3257.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/eeden_bessie_van.html",
    primaryPersonIndex: 1,
  },
  // ENGELBRECHT Koos & Hannie
  // Kenya, & separator, 2nd name no last name, no dates
  {
    caseName: "engelbrecht_koos_en_hannie",
    url: "https://www.graves.eggsa.org/world/Kenya/Eldoret/0717036%20Eldoret%20Kenya_%20Elize%20Church%20FB/0005.jpg",
  },
  // ERCKERT Friedrich, v. -1908 :: EBINGER Oskar -1908
  // Namibia, shortened multi-name
  {
    caseName: "erckert_friedrich_v",
    url: "https://www.graves.eggsa.org/world/Namibia/nam%2014%20Apr_016/0817023%20Gochas%20histories/IMG_0724.jpeg",
  },
  // FRITTELLI Lena neé JANSE VAN RENSBURG -1945
  // neé Janse van Rensburg
  {
    caseName: "frittelli_nee_janse_van_rensburg",
    url: "https://www.graves.eggsa.org/westerncape/Riversdale_Urban/Riversdal-ou-begraafplaas/ou-NGK-begraafplaas/Block-B/WC-Riversale-TdV-0283.JPG",
  },
  // HELBERG Helena Maria geb. SMITH 1911-1944
  // geb. in stead of nee
  {
    caseName: "helberg_helena_geb_smith",
    url: "https://www.graves.eggsa.org/limpopo/MODJADJISKLOOF-DUIWELSKLOOF-Urban/Duiwelskloof%202/H%20-%20Vanne%20__%20Surnames%20-%20H/P1010148.JPG",
  },
  // HERMANN -1905
  // Namibia, single name, no birth year
  {
    caseName: "herman_1905",
    url: "https://www.graves.eggsa.org/world/Namibia/nam%2014%20Apr_016/0817023%20Gochas%20histories/IMG_0732.jpeg",
  },
  // RENSBURG Gil, Janse van 1908-1995 :: JANSE VAN RENSBURG Susie 1925-1996
  // Janse van Rensburg (:: separator, 1st and 2nd person)
  {
    caseName: "janse_van_rensburg",
    url: "https://www.graves.eggsa.org/westerncape/Riversdale_Urban/NuweBP/R%20-%20Vanne%20__%20Surnames%20-%20R/WC-Riversdale-nuweBP-ALouw-0026.JPG",
  },
  // LANDSBERG E.S.A., formerly COETSEE, formerly HUMAN nee RAUTENBACH 1908-1993
  // multiple formerly and nee
  {
    caseName: "landsberg_esa_formerly_formerly",
    url: "https://www.graves.eggsa.org/limpopo/MODJADJISKLOOF-DUIWELSKLOOF-Urban/Duiwelskloof%202/L%20-%20Vanne%20__%20Surnames%20-%20L/IMG-20150204-WA0005.jpg",
  },
  // LITH Martha Louisa, van der formerly OLIVIER nee JOUBERT 1899-1980
  // formerly and nee, multi-word surname prefix
  {
    caseName: "lith_martha_van_der_formerly_olivier",
    url: "https://www.graves.eggsa.org/limpopo/MODJADJISKLOOF-DUIWELSKLOOF-Urban/Duiwelskloof%202/L%20-%20Vanne%20__%20Surnames%20-%20L/P1010076.JPG",
  },
  // MEET Jan J., van der 1861 1940 & F.J.J. HUDDLESTONE 1867-1942
  // & separator, 2nd person with single word last name
  {
    caseName: "meet_jan_van_der_and_huddlestone",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/M%20-%20Surnames%20__%20Vanne%20-%20M/Van+der+Meet_+Jan+J+en+Huddelstone_+FJJ.jpg",
  },

  // Mixture of & and :: and multi-name surnames
  // MERWE Izak Wilhelmus, van der 1869-1942 & Debora Petronella Jacoba van der MERWE 1873-1951 :: van der MERWE Bettie 1909-2000
  {
    caseName: "merwe_wilhelmus_and_debore_and_bettie_p0",
    url: "https://www.graves.eggsa.org/westerncape/CERES-Urban/abc/Ceres%20Owenstraat%20Oos%20Ljh_012/SA101359.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/merwe_wilhelmus_and_debore_and_bettie.html",
  },
  {
    caseName: "merwe_wilhelmus_and_debore_and_bettie_p1",
    url: "https://www.graves.eggsa.org/westerncape/CERES-Urban/abc/Ceres%20Owenstraat%20Oos%20Ljh_012/SA101359.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/merwe_wilhelmus_and_debore_and_bettie.html",
    primaryPersonIndex: 1,
  },
  {
    caseName: "merwe_wilhelmus_and_debore_and_bettie_p2",
    url: "https://www.graves.eggsa.org/westerncape/CERES-Urban/abc/Ceres%20Owenstraat%20Oos%20Ljh_012/SA101359.JPG",
    pageFile: "./unit_tests/eggsagrvs/saved_pages/merwe_wilhelmus_and_debore_and_bettie.html",
    primaryPersonIndex: 2,
  },

  // MERWE Rachel Jacoba Elizabeth, van der nee LE ROUX 1885-1972
  // multi-word surname and nee
  {
    caseName: "merwe_rachel_van_der",
    url: "https://www.graves.eggsa.org/westerncape/Bredasdorp_Urban/Bredasdorp-nuwe-BP/M%20-%20Surnames%20__%20Vanne%20-%20M/DSCF3557.JPG",
  },
  // NEL Lena, VAN ROOYEN 1929-2014
  // multi-word surname as surname prefix (probably an error on the site)
  {
    caseName: "nel_lena_van_rooyen",
    url: "https://www.graves.eggsa.org/limpopo/MOKOPANE-POTGIETERSRUS-Rural/Houtbosrivier_1/IMG-20160629-WA0000.jpg",
  },
  // PLESSIS Gert Johannes, du 1886-19?9, DU PLESSIS Andries Gerhardus
  // (but for now I have changed the separator to a ::)
  {
    caseName: "plessis_gert_du",
    url: "https://www.graves.eggsa.org/limpopo/MODJADJISKLOOF-DUIWELSKLOOF-Urban/Duiwelskloof%202/P%20-%20Vanne%20__%20Surnames%20-%20P/IM000022.JPG",
  },
  // PURDON Kenneth Trevelyn 1919-2007 :: PURDON Sylvia Anne nee NOVELLA 1939-2014 :: WIGGIN Dorothy Merle nee PURDON 1922-2012
  // :: separator, 3 names, 2nd and 3rd with nee
  {
    caseName: "purdon_kenneth_sylvia_dorothy",
    url: "https://www.graves.eggsa.org/easterncape/BATHURST-Urban/Bathurst-Weslyan/PURDON/IMG_1241.JPG",
  },
  // SLEATH Walter 1870-1947 & Lizzie Florence 1864-1909 & Eleanor 1872-1925 & Elizabeth 1870-1941
  // & separator, 4 people, only first with last name, pick 2nd person
  {
    caseName: "sleath_and_family",
    url: "https://www.graves.eggsa.org/gauteng/Johannesburg-urban/Braamfontein/Braamfontein-Main-cem/S%20-%20Surnames%20__%20Vanne%20-%20S/IMGP5541.JPG",
    primaryPersonIndex: 1,
  },
  // ? Dad :: ? Mother -1913 :: Walter -1907 :: ? Stella :: ? Lallie :: ? Scott
  {
    caseName: "unknown_lastnames",
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
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_imgTitle_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_srcTitle",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: false,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_srcTitle_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_ref",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: false,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_ref_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "afterSourceTitle",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_imgTitle_refAtEnd",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_imgTitle_refAtEnd_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inImageTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_srcTitle_refAtEnd",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_srcTitle_refAtEnd_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inSourceTitle",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_ref_refAtEnd",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: false,
      citation_general_dataStringInItalics: true,
    },
  },
  {
    variantName: "linkIn_ref_refAtEnd_withImgPos",
    thisTypeOnly: ["source", "inline"],
    optionOverrides: {
      citation_eggsagrvs_includeLink: "inRef",
      citation_general_referencePosition: "atEnd",
      citation_eggsagrvs_includeImgPos: true,
      citation_general_dataStringInItalics: true,
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
