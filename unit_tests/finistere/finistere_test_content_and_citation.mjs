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

import { generalizeData } from "../../extension/site/finistere/core/finistere_generalize_data.mjs";
import { buildCitation } from "../../extension/site/finistere/core/finistere_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "carhaix_1024_e_depot_27_-_1878-1892_mariage_img_167",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1464985/daoloc/0/167",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "le_faou_3_e_68_19_8_-_1830_mariage_img_3",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1287468/daogrp/0/3",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "motreff_3_e_189_5_-_1813-1832_naissances_img_17",
    url: "https://recherche.archives.finistere.fr/ark:/72506/645577.1478933/daoloc/0/17",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "ploudaniel_1328_e_depot_27_-_1840-1849_naissance_img_341",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1474211/daoloc/0/341",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "recensement_de_population_brest_6_m_129_-_1er_canton_de_la_justice_de_paix_1836_img_123",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1041090.1139987/daogrp/0/123",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "recensement_de_population_kernével_10_l_168_3_-_kernével_1790-an_IV_img_6",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1157858/daogrp/0/6",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "recensement_de_population_pouldreuzic_6_m_688_1_-_1836_1836_img_7",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1144674/daogrp/0/7",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "saint-hernin_1237_e-dépôt_1_-_baptêmes_mariages_sépultures_1675-1752_img_1",
    url: "https://recherche.archives.finistere.fr/ark:/72506/645576.1478932/daoloc/0/1",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "saint-hernin_1237_e-depot_2_-_baptêmes_mariages_1753-1787_img_69",
    url: "https://recherche.archives.finistere.fr/ark:/72506/645577.1478933/daoloc/0/69",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "saint-hernin_1237_e-dépôt_3_-_sépultures_1753-1787_img_11",
    url: "https://recherche.archives.finistere.fr/ark:/72506/645578.1478934/daoloc/0/11",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName:
      "saint-hernin_3_e_309_1_-_9_avril-15_septembre_1694_6_novembre-décembre_1702_1704-1720_1724-1726_1728-1734_baptême_mariage_sépulture_img_255",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1040255.1634650/daoloc/0/255",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "saint-hernin_3_e_309_4_-_1771-1792_baptême_mariage_img_114",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1040258.1634654/daoloc/0/114",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "spézet_1267_e_depot_1_1_-_1564-1592_baptêmes_img_133",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1480476/daoloc/0/133",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "spézet_3_e_348_15_8_-_1830_naissances_img_4",
    url: "https://recherche.archives.finistere.fr/ark:/72506/1373195/daogrp/0/4",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
];

async function runTests(testManager) {
  await runExtractDataTests("finistere", regressionData, testManager);

  await runGeneralizeDataTests("finistere", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("finistere", functions, regressionData, testManager);
}

export { runTests };
