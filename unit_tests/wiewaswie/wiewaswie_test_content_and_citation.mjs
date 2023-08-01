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

import { extractData } from "../../extension/site/wiewaswie/core/wiewaswie_extract_data.mjs";
import { generalizeData } from "../../extension/site/wiewaswie/core/wiewaswie_generalize_data.mjs";
import { buildCitation } from "../../extension/site/wiewaswie/core/wiewaswie_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "baptism_1789_gerryt_goudemond_en",
    url: "https://www.wiewaswie.nl/en/detail/54339285",
    optionVariants: [
      {
        variantName: "lang_nl",
        optionOverrides: {
          citation_wiewaswie_languageVersionToCite: "nl",
        },
      },
    ],
  },
  {
    caseName: "baptism_1789_gerryt_goudemond_nl",
    url: "https://www.wiewaswie.nl/nl/detail/54339285",
  },

  {
    caseName: "bidprentjes_2017_jan_zuidhof_en",
    url: "https://www.wiewaswie.nl/en/detail/111067287",
  },
  {
    caseName: "bidprentjes_2017_jan_zuidhof_nl",
    url: "https://www.wiewaswie.nl/nl/detail/111067287",
  },

  {
    caseName: "birth_cert_1811_jan_van_der_wijk_en",
    url: "https://www.wiewaswie.nl/en/detail/15425329",
  },
  {
    caseName: "birth_cert_1811_jan_van_der_wijk_nl",
    url: "https://www.wiewaswie.nl/nl/detail/15425329",
  },
  {
    caseName: "burial_1694_peter_hillebrandts_en",
    url: "https://www.wiewaswie.nl/en/detail/55850616",
  },
  {
    caseName: "burial_1694_peter_hillebrandts_nl",
    url: "https://www.wiewaswie.nl/nl/detail/55850616",
  },
  {
    caseName: "burial_1776_maria_van_den_berg_en",
    url: "https://www.wiewaswie.nl/en/detail/35327513",
  },
  {
    caseName: "burial_1776_maria_van_den_berg_nl",
    url: "https://www.wiewaswie.nl/nl/detail/35327513",
  },
  {
    caseName: "burial_1786_ruud_scheltus_en",
    url: "https://www.wiewaswie.nl/en/detail/55438226",
  },
  {
    caseName: "burial_1786_ruud_scheltus_nl",
    url: "https://www.wiewaswie.nl/nl/detail/55438226",
  },
  {
    caseName: "burial_1797_sarah_ammersfoort_en",
    url: "https://www.wiewaswie.nl/en/detail/36565702",
  },
  {
    caseName: "burial_1797_sarah_ammersfoort_nl",
    url: "https://www.wiewaswie.nl/nl/detail/36565702",
  },

  {
    caseName: "church_member_1825_reinder_van_der_meulen_en",
    url: "https://www.wiewaswie.nl/en/detail/109854388",
  },
  {
    caseName: "church_member_1825_reinder_van_der_meulen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/109854388",
  },

  {
    caseName: "court_1780_erven_pekstok_en",
    url: "https://www.wiewaswie.nl/en/detail/91447572",
  },
  {
    caseName: "court_1780_erven_pekstok_nl",
    url: "https://www.wiewaswie.nl/nl/detail/91447572",
  },

  {
    caseName: "crime_1944_erik_von_altenstadt_en",
    url: "https://www.wiewaswie.nl/en/detail/89726253",
  },
  {
    caseName: "crime_1944_erik_von_altenstadt_nl",
    url: "https://www.wiewaswie.nl/nl/detail/89726253",
  },

  {
    caseName: "death_cert_1815_jan_huisman_en",
    url: "https://www.wiewaswie.nl/en/detail/8941780",
  },
  {
    caseName: "death_cert_1815_jan_huisman_nl",
    url: "https://www.wiewaswie.nl/nl/detail/8941780",
  },

  {
    caseName: "fam_adv_1954_jan_zylker_en",
    url: "https://www.wiewaswie.nl/en/detail/46002199",
  },
  {
    caseName: "fam_adv_1954_jan_zylker_nl",
    url: "https://www.wiewaswie.nl/nl/detail/46002199",
  },

  {
    caseName: "fiscal_1748_fokker_meer_en",
    url: "https://www.wiewaswie.nl/en/detail/90176744",
  },
  {
    caseName: "fiscal_1748_fokker_meer_nl",
    url: "https://www.wiewaswie.nl/nl/detail/90176744",
  },

  {
    caseName: "marriage_1676_jan_peter_janssen_en",
    url: "https://www.wiewaswie.nl/en/detail/10662653",
  },
  {
    caseName: "marriage_1676_jan_peter_janssen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/10662653",
  },
  {
    caseName: "marriage_cert_1818_ringert_jongewaard_en",
    url: "https://www.wiewaswie.nl/en/detail/31877498",
  },
  {
    caseName: "marriage_cert_1818_ringert_jongewaard_nl",
    url: "https://www.wiewaswie.nl/nl/detail/31877498",
  },

  {
    caseName: "memory_1898_helena_van_zwolgen_en",
    url: "https://www.wiewaswie.nl/en/detail/57385038",
  },
  {
    caseName: "memory_1898_helena_van_zwolgen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/57385038",
  },

  {
    caseName: "military_1817_hendk_van_zyl_en",
    url: "https://www.wiewaswie.nl/en/detail/103513211",
  },
  {
    caseName: "military_1817_hendk_van_zyl_nl",
    url: "https://www.wiewaswie.nl/nl/detail/103513211",
  },

  {
    caseName: "notary_1803_van_der_wal_en",
    url: "https://www.wiewaswie.nl/en/detail/107874851",
  },
  {
    caseName: "notary_1803_van_der_wal_nl",
    url: "https://www.wiewaswie.nl/nl/detail/107874851",
  },

  {
    caseName: "pop_reg_1815_jan_sties_en",
    url: "https://www.wiewaswie.nl/en/detail/93944073",
  },
  {
    caseName: "pop_reg_1815_jan_sties_nl",
    url: "https://www.wiewaswie.nl/nl/detail/93944073",
  },
  {
    caseName: "pop_reg_1850_david_van_zwyndregt_en",
    url: "https://www.wiewaswie.nl/en/detail/109473861",
  },
  {
    caseName: "pop_reg_1850_david_van_zwyndregt_en",
    url: "https://www.wiewaswie.nl/en/detail/109473861",
  },
  {
    caseName: "pop_reg_1854_pieter_van_gaard_en",
    url: "https://www.wiewaswie.nl/en/detail/79820963",
  },
  {
    caseName: "pop_reg_1854_pieter_van_gaard_nl",
    url: "https://www.wiewaswie.nl/nl/detail/79820963",
  },

  {
    caseName: "profession_1932_rutger_van_atterloo_en",
    url: "https://www.wiewaswie.nl/en/detail/103397261",
  },
  {
    caseName: "profession_1932_rutger_van_atterloo_nl",
    url: "https://www.wiewaswie.nl/nl/detail/103397261",
  },

  {
    caseName: "real_estate_1649_leonora_walen_en",
    url: "https://www.wiewaswie.nl/en/detail/96299604",
  },
  {
    caseName: "real_estate_1649_leonora_walen_nl",
    url: "https://www.wiewaswie.nl/nl/detail/96299604",
  },

  {
    caseName: "social_1759_gerhard_haesebroek_nl",
    url: "https://www.wiewaswie.nl/en/detail/109836193",
  },
  {
    caseName: "social_1759_gerhard_haesebroek_en",
    url: "https://www.wiewaswie.nl/nl/detail/109836193",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("wiewaswie", extractData, regressionData, testManager);

  await runGeneralizeDataTests("wiewaswie", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("wiewaswie", functions, regressionData, testManager);
}

export { runTests };
