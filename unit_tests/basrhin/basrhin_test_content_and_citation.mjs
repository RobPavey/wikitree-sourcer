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

import { extractData } from "../../extension/site/basrhin/core/basrhin_extract_data.mjs";
import { generalizeData } from "../../extension/site/basrhin/core/basrhin_generalize_data.mjs";
import { buildCitation } from "../../extension/site/basrhin/core/basrhin_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "croettwiller_mariages_1793-an_IV_img_8",
    url: "https://archives67.alsace.eu/ark:/78665/1877641/dao/0/1/idsearch:RECH_dce6b9d50fb712e8756c98b87bbd3fa2?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1877641%2Fcanvas%2F0%2F8",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "hatten_-_publications_de_mariages_-_1818_img_4",
    url: "https://archives67.alsace.eu/ark:/78665/1928043/dao/0/1/idsearch:RECH_848ddb366ad8fb18f59e88b418d091c2?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1928043%2Fcanvas%2F0%2F4",
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
    url: "https://archives67.alsace.eu/ark:/78665/1927865/dao/0/1?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1927865%2Fcanvas%2F0%2F1",
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
    url: "https://archives67.alsace.eu/ark:/78665/1927867/dao/0/1/idsearch:RECH_6b436cd4ce5bb979b6374fe22b03fa7a?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1927867%2Fcanvas%2F0%2F150",
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
    url: "https://archives67.alsace.eu/ark:/78665/1950629/dao/0/1?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1950629%2Fcanvas%2F0%2F31",
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
    url: "https://archives67.alsace.eu/ark:/78665/2004462/dao/0/1/idsearch:RECH_d43f9e326af2c2aafdabf5ae9698ab85?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2004462%2Fcanvas%2F0%2F171",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "roeschwoog_mariages_1688-1732_3_e_405_5_img_34",
    url: "https://archives67.alsace.eu/ark:/78665/2035165/dao/0/1/idsearch:RECH_4ac1fcc01bfe5e1a56e1c5a02a0993e0?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2035165%2Fcanvas%2F0%2F34",
    optionVariants: [
      {
        variantName: "sourceReferenceSeparator_commaSpace",
        optionOverrides: { citation_general_sourceReferenceSeparator: "commaSpace" },
      },
    ],
  },
  {
    caseName: "schweighouse_sur_moder_publication_de_mariages_1873_img_6",
    url: "https://archives67.alsace.eu/ark:/78665/2059877/dao/0/1/idsearch:RECH_e1a9c4eb4a0e075a0af3a6841b3fd1be?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F2059877%2Fcanvas%2F0%2F6",
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
    url: "https://archives67.alsace.eu/ark:/78665/1186916.1196658/dao/0/1/idsearch:RECH_b9e48e86e4223c0d0593f601ffed8483?id=https%3A%2F%2Farchives67.alsace.eu%2Fark%3A%2F78665%2F1186916.1196658%2Fcanvas%2F0%2F5",
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
    caseName: "tables_des_successions_et_absences_volume_45_3_q_26781_strasbourg_img_55",
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
  await runExtractDataTests("basrhin", extractData, regressionData, testManager);

  await runGeneralizeDataTests("basrhin", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("basrhin", functions, regressionData, testManager);
}

export { runTests };
