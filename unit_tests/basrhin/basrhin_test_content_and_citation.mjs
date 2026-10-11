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

import { generalizeData } from "../../extension/site/basrhin/core/basrhin_generalize_data.mjs";
import { buildCitation } from "../../extension/site/basrhin/core/basrhin_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "croettwiller_mariages_1793-an_IV_img_8",
    url: "https://archives67.alsace.eu/ark:/78665/1904672/dao/0/1/idsearch:RECH_414328ae3e9d6ad522e44b232ca75cd5?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1904672%2Fcanvas%2F0%2F8",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "hatten_-_publications_de_mariages_-_1818_img_4",
    url: "https://archives67.alsace.eu/ark:/78665/1955074/dao/0/1/idsearch:RECH_d4fc1b6c2f85246dbf47e310ff253aa1?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1955074%2Fcanvas%2F0%2F4",
    optionVariants: [
      {
        variantName: "meaningfulNames_normal",
        optionOverrides: {
          citation_general_meaningfulNames: "normal",
          citation_general_sourceReferenceSeparator: "commaSpace",
        },
      },
    ],
  },
  {
    caseName: "hatten_3_e_183_1_-_baptêmes_mariages_sépultures_-_1707-1730_img_1",
    url: "https://archives67.alsace.eu/ark:/78665/1954896/dao/0/1/idsearch:RECH_2764466a7220fee059c8e782a89d079f?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1954896%2Fcanvas%2F0%2F1",
    optionVariants: [
      {
        variantName: "meaningfulNames_italics",
        optionOverrides: {
          citation_general_meaningfulNames: "italics",
          citation_general_sourceReferenceSeparator: "commaSpace",
        },
      },
    ],
  },
  {
    caseName: "hatten_3_e_183_3_-_baptêmes_-_1736-1767_img_150",
    url: "https://archives67.alsace.eu/ark:/78665/1954898/dao/0/1/idsearch:RECH_9b96ef675332313a257a7a5d11edbe09?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1954898%2Fcanvas%2F0%2F150",
    optionVariants: [
      {
        variantName: "meaningfulNames_bold",
        optionOverrides: {
          citation_general_meaningfulNames: "bold",
          citation_general_sourceReferenceSeparator: "commaSpace",
        },
      },
    ],
  },
  {
    caseName: "keffenach_baptêmes_1775-1787_3_e_231_2_img_31",
    url: "https://archives67.alsace.eu/ark:/78665/1977660/dao/0/1/idsearch:RECH_6a26a0ab633eb36889ff0ef9e305fa16?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1977660%2Fcanvas%2F0%2F31",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "niederbetschdorf_-_recensement_de_1836_-_7_m_554_img_13",
    url: "https://archives67.alsace.eu/ark:/78665/599462.950591/dao/0/1/idsearch:RECH_c47e02501f19b3cddae8c8a73e722f53?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F599462.950591%2Fcanvas%2F0%2F13",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "niederbetschdorf_décès_1810_img_8_pl",
    url: "https://archives67.alsace.eu/ark:/78665/2023531/dao/0/1/idsearch:RECH_681385c0faede6e70c22cfeacc8cffc0?id=https%253A%252F%252Farchives67.alsace.eu%252Fark%253A%252F78665%252F2023531%252Fcanvas%252F0%252F8",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "niederbetschdorf_décès_1810_img_8",
    url: "https://archives67.alsace.eu/ark:/78665/2023531/dao/0/1/idsearch:RECH_681385c0faede6e70c22cfeacc8cffc0?id=https%253A%252F%252Farchives67.alsace.eu%252Fark%253A%252F78665%252F2023531%252Fcanvas%252F0%252F8",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "oberbetschdorf_-_recensement_de_1836_-_7_m_571_img_8",
    url: "https://archives67.alsace.eu/ark:/78665/599436.950767/dao/0/1?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F599436.950767%2Fcanvas%2F0%2F8",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "oberbetschdorf_-_recensement_de_1885_294_D_B_339_img_116",
    url: "https://archives67.alsace.eu/ark:/78665/950775/dao/0/116?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F950775%2Fcanvas%2F0%2F116",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "oberbetschdorf_sépultures_1736-1774_3_e_339_15_img_171",
    url: "https://archives67.alsace.eu/ark:/78665/2031493/dao/0/1/idsearch:RECH_5de6face857feb831259babf8caff9e0?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2031493%2Fcanvas%2F0%2F171",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "recensement_de_population_kutzenhausen_7_m_486_-_1866_img_17",
    url: "https://archives67.alsace.eu/ark:/78665/595172.949830/img:FRAD067_0099NUM25400080_17",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "roeschwoog_mariages_1688-1732_3_e_405_5_img_34",
    url: "https://archives67.alsace.eu/ark:/78665/2062196/dao/0/1/idsearch:RECH_440e40a6c1c93c77b5275b12570fc3df?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2062196%2Fcanvas%2F0%2F34",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "schweighouse_sur_moder_publication_de_mariages_1873_img_6",
    url: "https://archives67.alsace.eu/ark:/78665/2149660/dao/0/1/idsearch:RECH_cf951f647cd4527692b5a7dda6ecb325?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2149660%2Fcanvas%2F0%2F6",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "tables_des_successions_et_absences_3_q_27763_strasbourg_img_169",
    url: "https://archives67.alsace.eu/ark:/78665/1133457.1209595/dao/0/1/idsearch:RECH_408ad068ee8bcfc27f5f03d3606926c5?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1133457.1209595%2Fcanvas%2F0%2F169",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "tables_des_successions_et_absences_volume_7_-_3_q_26781_soultz-sous-forêts_img_5",
    url: "https://archives67.alsace.eu/ark:/78665/1186916.1196658/dao/0/5?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1186916.1196658%2Fcanvas%2F0%2F5&vx=3528.5&vy=-2702&vr=0&vz=1.93158",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "tables_des_successions_et_absences_volume_27_-_3_q_38237_illkirch-graffenstaden_img_72",
    url: "https://archives67.alsace.eu/ark:/78665/1111715.1151817/dao/0/1/idsearch:RECH_d87f8a2a420e78088e461d32492830b3?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1111715.1151817%2Fcanvas%2F0%2F72",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "tables_des_successions_et_absences_volume_45_3_q_27764_strasbourg_img_55",
    url: "https://archives67.alsace.eu/ark:/78665/1133458.1209596/dao/0/1/idsearch:RECH_408ad068ee8bcfc27f5f03d3606926c5?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1133458.1209596%2Fcanvas%2F0%2F55&vx=3619.5&vy=-2777.5&vr=0&vz=1.92514",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  // old (pre Nov 2025 site redesign) unit test cases:
  /*   {
    caseName: "Hatten_Registre_de_baptêmes_1736-1767_-_3_E_183_3_img_150",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C183-P2-R121884#visio/page:ETAT-CIVIL-C183-P2-R121884-644791",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Hatten_Registre_de_baptêmes_mariages_sépultures_1707-1730_-_3_E_183_1_img_1",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C183-P2-R121882#visio/page:ETAT-CIVIL-C183-P2-R121882-644390",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Hatten_Registre_de_publication_de_mariages_1818_-_4_E_183_11_img_4",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C183-P1-R122052#visio/page:ETAT-CIVIL-C183-P1-R122052-647035",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaColon",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaColon" },
      },
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Oberbetschdorf_Registre_de_sépultures_1736-1774_3_E_339_15_img_171",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C587-P2-R167746#visio/page:ETAT-CIVIL-C587-P2-R167746-2293545",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Schweighouse_sur_Moder_Registre_de_publication_de_mariages_1873_-_4_E_458_3_img_6",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C454-P1-R247147#visio/page:ETAT-CIVIL-C454-P1-R247147-1363341",
    optionVariants: [
      {
        variantName: "accessedDate_none",
        optionOverrides: { citation_general_addAccessedDate: "none" },
      },
      {
        variantName: "accessedDate_parenBeforeLink",
        optionOverrides: { citation_general_addAccessedDate: "parenBeforeLink" },
      },
    ],
  },
  {
    caseName: "Croettwiller_Registre_de_mariages_1793_An_IV_-_4_E_78_3_img_8",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C79-P1-R57093#visio/page:ETAT-CIVIL-C79-P1-R57093-339112",
    optionVariants: [
      {
        variantName: "accessedDate_none",
        optionOverrides: { citation_general_addAccessedDate: "none" },
      },
      {
        variantName: "accessedDate_parenBeforeLink",
        optionOverrides: { citation_general_addAccessedDate: "parenBeforeLink" },
      },
    ],
  },
  {
    caseName: "Roeschwoog_Registre_de_mariages_1688-1732_-_3_E_405_5_img_34",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C401-P3-R170181#visio/page:ETAT-CIVIL-C401-P3-R170181-2497692",
    optionVariants: [
      {
        variantName: "accessedDate_none",
        optionOverrides: { citation_general_addAccessedDate: "none" },
      },
      {
        variantName: "accessedDate_parenBeforeLink",
        optionOverrides: { citation_general_addAccessedDate: "parenBeforeLink" },
      },
    ],
  },
  {
    caseName: "Niederlauterbach_Registre_de_baptêmes_1683-1765_3_E_327_1_img_41",
    url: "https://archives.bas-rhin.fr/detail-document/ETAT-CIVIL-C324-P3-R44977#visio/page:ETAT-CIVIL-C324-P3-R44977-2155357",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaColon",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaColon" },
      },
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "NIEDERBETSCHDORF_-_Recensement_de_1836_-_7_M_554_img_13",
    url: "https://archives.bas-rhin.fr/detail-document/REC-POP-C593-R4787#visio/page:REC-POP-C593-R4787-58548",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "OBERBETSCHDORF_-_Recensement_de_1885_-_294_D_B_339_img_116",
    url: "https://archives.bas-rhin.fr/detail-document/REC-POP-C587-R5280#visio/page:REC-POP-C587-R5280-349733",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Tables_des_successions_et_absences_volume_7_-_3_Q_26781_Soultz-sous-Forêts_img_5",
    url: "https://archives.bas-rhin.fr/detail-document/LIGEO-1196658#visio/page:LIGEO-1196658-196103",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Tables_des_successions_et_absences_Volume_27_-_3_Q_38237_d_Illkirch-Graffenstaden_img_72",
    url: "https://archives.bas-rhin.fr/detail-document/LIGEO-1151817#visio/page:LIGEO-1151817-149498",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "Tables_des_successions_et_absences_3_Q_27763_de_Strasbourg_img_169",
    url: "https://archives.bas-rhin.fr/detail-document/LIGEO-1209595#visio/page:LIGEO-1209595-151126",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
 */
];

async function runTests(testManager) {
  await runExtractDataTests("basrhin", regressionData, testManager);

  await runGeneralizeDataTests("basrhin", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("basrhin", functions, regressionData, testManager);
}

export { runTests };
