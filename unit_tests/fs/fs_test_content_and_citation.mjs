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

import { extractDataFromFetch, extractData } from "../../extension/site/fs/core/fs_extract_data.mjs";
import { generalizeData } from "../../extension/site/fs/core/fs_generalize_data.mjs";
import { buildCitation } from "../../extension/site/fs/core/fs_build_citation.mjs";
import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "arthur_cowling_marriage_reg_1937",
    url: "https://www.familysearch.org/ark:/61903/1:1:QV8X-7L1V",
  },
  {
    caseName: "canada_census_1901_james_mcdonald",
    url: "https://www.familysearch.org/ark:/61903/1:1:KHGF-SX6?from=lynx1UIV8&treeref=KFPX-STB",
  },
  {
    caseName: "canada_child_marriage_1874_donald_cameron",
    url: "https://www.familysearch.org/ark:/61903/1:1:FMN3-4Z6",
  },
  {
    caseName: "charles_pavey_child_death_1937",
    url: "https://www.familysearch.org/ark:/61903/1:1:XZDY-NH9",
  },
  {
    caseName: "charles_pavy_us_civil_war_1861",
    url: "https://www.familysearch.org/ark:/61903/1:1:FSR5-DJ4",
  },
  {
    // This has multiple related people and was causing issues
    caseName: "charles_peavy_child_death_1938",
    url: "https://www.familysearch.org/ark:/61903/1:1:FPWZ-8BN",
  },
  {
    caseName: "elizabeth_cullington_burial_1849",
    url: "https://www.familysearch.org/ark:/61903/1:1:27CB-J49",
  },
  {
    caseName: "england_baptism_1810_john_abberley",
    url: "https://www.familysearch.org/ark:/61903/1:1:QL3G-Z9Z6",
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:QPRD-KN2W
    caseName: "england_baptism_1825_emily_ashworth",
    url: "",
  },
  {
    caseName: "england_baptism_1838_ann_wyatt",
    url: "https://www.familysearch.org/ark:/61903/1:1:F3VH-9VV",
  },
  {
    caseName: "england_baptism_1902_ella_giles",
    url: "https://www.familysearch.org/ark:/61903/1:1:QGNK-BKRW",
  },
  {
    caseName: "england_burial_1865_joseph_golden",
    url: "https://www.familysearch.org/ark:/61903/1:1:QLYW-5F4G",
  },
  {
    caseName: "england_census_1841_william_pavey",
    url: "https://www.familysearch.org/ark:/61903/1:1:MQTV-YYP",
  },
  {
    caseName: "england_census_1851_elizabeth_martin",
    url: "https://www.familysearch.org/ark:/61903/1:1:SG5F-42W",
  },
  {
    caseName: "england_census_1881_esther_pavey",
    url: "https://www.familysearch.org/ark:/61903/1:1:Q277-QXTG",
  },
  {
    caseName: "england_census_1911_eliza_pother",
    url: "https://www.familysearch.org/ark:/61903/1:1:X75L-1V8?id=LZXF-QCZ",
    optionVariants: [
      {
        variantName: "narrative_1", // Steve Whitfield preferred
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_includeAge: "no",
          narrative_census_includeOccupation: "inSeparateSentenceHead",
          narrative_census_sentenceStructure: "comma",
          narrative_census_wasPartFormat: "wasEnumerated",
          narrative_census_householdPartFormat: "withFamily",
        },
      },
    ],
  },
  {
    caseName: "england_census_1911_elizabeth_taylor",
    url: "https://www.familysearch.org/ark:/61903/1:1:X7RW-H55",
  },
  {
    caseName: "england_census_1911_peter_delamotte",
    url: "https://www.familysearch.org/ark:/61903/1:1:XWW2-PF1",
  },
  {
    caseName: "england_census_1939_ellen_day",
    url: "https://www.familysearch.org/ark:/61903/1:1:728V-TTT2",
  },
  {
    caseName: "england_marriage_1799_ann_brian",
    url: "https://www.familysearch.org/ark:/61903/1:1:QGLH-FW1Z",
  },
  {
    caseName: "england_marriage_1839_richard_greenwood",
    url: "https://www.familysearch.org/ark:/61903/1:1:2DCB-21Q",
  },
  {
    caseName: "england_child_baptism_1882_charlotte",
    url: "https://www.familysearch.org/ark:/61903/1:1:N1N6-6JS?from=lynx1UIV8&treeref=MMVG-Z3H",
  },
  {
    caseName: "handford-3_death_reg",
    url: "https://www.familysearch.org/ark:/61903/1:1:2N1J-673",
  },
  {
    caseName: "harry_easey_census_1861",
    url: "https://www.familysearch.org/ark:/61903/1:1:M7RK-6J2",
  },
  {
    caseName: "harry_pavey_census_1911",
    url: "https://www.familysearch.org/ark:/61903/1:1:XWLP-S75",
  },
  {
    caseName: "ireland_census_1911_joseph_moore",
    url: "https://www.familysearch.org/ark:/61903/1:1:QYCX-NXN2",
  },
  {
    caseName: "james_ridout_child_marriage_1852",
    url: "https://www.familysearch.org/ark:/61903/1:1:QJDC-577Y",
  },
  {
    caseName: "john_steven_nicholson_census_1871",
    url: "https://www.familysearch.org/ark:/61903/1:1:VBN2-36Z",
  },
  {
    caseName: "john_swinton_census_1851",
    url: "https://www.familysearch.org/ark:/61903/1:1:SG2X-CJX",
  },
  {
    caseName: "margaret_rowlinson_england_christening",
    url: "https://www.familysearch.org/ark:/61903/1:1:J33C-SH7",
  },
  {
    caseName: "margaret_rowlinson_england_marriages",
    url: "https://www.familysearch.org/ark:/61903/1:1:NN5C-1XR",
  },
  {
    caseName: "nz_child_birth_1888_miles_gaffney",
    url: "https://www.familysearch.org/ark:/61903/1:1:Q24K-ZSB8?from=lynx1UIV8&treeref=LRT4-PHC",
  },
  {
    caseName: "puerto_rico_marriage_1928_leonida_vega",
    url: "https://www.familysearch.org/ark:/61903/1:1:QVJ8-SFH9?from=lynx1UIV8&treeref=L8PL-J4M",
  },
  {
    caseName: "scotland_baptism_1854_david_hunter",
    url: "https://www.familysearch.org/ark:/61903/1:1:XBQC-X9Q",
  },
  {
    caseName: "scotland_birth_1881_alexander_hardie",
    url: "https://www.familysearch.org/ark:/61903/1:1:XTXN-PTY",
  },
  {
    caseName: "scotland_census_1871_alexander_auld",
    url: "https://www.familysearch.org/ark:/61903/1:1:VBPV-BM1?from=lynx1UIV8&treeref=MSGJ-7PP",
  },
  {
    caseName: "scotland_marriage_1764_archbald_saunders",
    url: "https://www.familysearch.org/ark:/61903/1:1:XTLR-ZX5?count=20&f.recordType=1&q.givenName=archibald&q.recordCountry=Scotland&q.recordSubcountry=Scotland%2CDumfriesshire&q.surname=saunders",
  },
  {
    caseName: "teresa_fitchie_death_2002",
    url: "https://www.familysearch.org/ark:/61903/1:1:CGGS-5YZM",
  },
  {
    caseName: "us_ca_death_1974_charles_barker",
    url: "https://www.familysearch.org/ark:/61903/1:1:VPN6-4J4",
  },
  {
    caseName: "us_boston_tax_record_john_smith",
    url: "https://www.familysearch.org/ark:/61903/1:1:DDX3-TT6Z",
  },
  {
    caseName: "us_census_1880_alice_miller",
    url: "https://www.familysearch.org/ark:/61903/1:1:MHSV-QLY",
  },
  {
    caseName: "us_census_1910_martha_wallace",
    url: "https://www.familysearch.org/ark:/61903/1:1:MKW4-58H",
  },
  {
    caseName: "us_census_1930_ray_abbot",
    url: "https://www.familysearch.org/ark:/61903/1:1:XMFP-N32",
  },
  {
    caseName: "us_census_1940_addie_bullock",
    url: "https://www.familysearch.org/ark:/61903/1:1:VB3M-FG7",
  },
  {
    caseName: "us_census_1940_arleita_elliott",
    url: "https://www.familysearch.org/ark:/61903/1:1:VTMY-N3T?from=lynx1UIV8&treeref=GF66-ZS5",
  },
  {
    caseName: "us_census_1940_linnea_schei",
    url: "https://www.familysearch.org/ark:/61903/1:1:K42T-S68",
  },
  {
    caseName: "us_census_1940_william_huffstetler",
    url: "https://www.familysearch.org/ark:/61903/1:1:K438-8WS",
  },
  {
    caseName: "us_census_1950_robert_stanton",
    url: "https://www.familysearch.org/ark:/61903/1:1:6XVR-FRK3",
  },
  {
    caseName: "us_census_church_1950_stephen_taylor",
    url: "https://www.familysearch.org/ark:/61903/1:1:ZY42-D8N2",
  },
  {
    caseName: "us_ct_birth_1768_unknown_cornish",
    url: "https://www.familysearch.org/ark:/61903/1:1:QP7Z-TGYP",
  },
  {
    caseName: "us_death_fg_1898_mary_volentine",
    url: "https://www.familysearch.org/ark:/61903/1:1:QVV5-53JY",
  },
  {
    caseName: "us_il_child_birth_1918_alice_cain",
    url: "https://www.familysearch.org/ark:/61903/1:1:N7S6-GJ7",
  },
  {
    caseName: "us_in_child_marriage_1937_sally_knight",
    url: "https://www.familysearch.org/ark:/61903/1:1:27K9-9K9",
  },
  {
    caseName: "us_ma_birth_1773_james_curtis",
    url: "https://www.familysearch.org/ark:/61903/1:1:F46D-1HS",
  },
  {
    caseName: "us_ma_death_1713_sarah_knight",
    url: "https://www.familysearch.org/ark:/61903/1:1:FH24-9QT",
  },
  {
    caseName: "us_mi_birth_1885_gertrude_orchard",
    url: "https://www.familysearch.org/ark:/61903/1:1:F4P5-QX7",
  },
  {
    caseName: "us_mi_birth_1897_pearl_agar",
    url: "https://www.familysearch.org/ark:/61903/1:1:NQXX-QLZ",
  },
  {
    caseName: "us_mi_death_1978_lula_mickens",
    url: "https://www.familysearch.org/ark:/61903/1:1:VZ14-WHX?from=lynx1UIV8&treeref=GDTJ-XKT",
  },
  {
    caseName: "us_mn_census_1895_david_palm",
    url: "https://www.familysearch.org/ark:/61903/1:1:MQ6G-CR3",
  },
  {
    caseName: "us_mn_census_1895_wm_waldren",
    url: "https://www.familysearch.org/ark:/61903/1:1:MQ67-PZS",
  },
  {
    caseName: "us_mn_spouse_death_1955_jennie_eneboe",
    url: "https://www.familysearch.org/ark:/61903/1:1:HX2Y-P1PZ?treeref=9ZF5-1VJ",
  },
  {
    caseName: "us_nc_marriage_1783_sarah_hanes",
    url: "https://www.familysearch.org/ark:/61903/1:1:Q2R1-ZVMS",
  },
  {
    caseName: "us_ny_census_1915_philo_lee",
    url: "https://www.familysearch.org/ark:/61903/1:1:K9V2-YCS",
  },
  {
    caseName: "us_ny_marrriage_1907_katherine_quattlander",
    url: "https://www.familysearch.org/ark:/61903/1:1:Q2C2-Y95H",
  },
  {
    caseName: "us_obit_2009_florida_moore",
    url: "https://www.familysearch.org/ark:/61903/1:1:QKLP-Y42H",
  },
  {
    caseName: "us_oh_death_1948_jacob_swartz",
    url: "https://www.familysearch.org/ark:/61903/1:1:X6KQ-53B",
  },
  {
    caseName: "us_passport_1914_edward_baltzell",
    url: "https://www.familysearch.org/ark:/61903/1:1:QVJP-4T6V",
  },
  {
    caseName: "us_ss_death_index_2002_john_smith",
    url: "https://www.familysearch.org/ark:/61903/1:1:J17L-RJH",
  },
  {
    caseName: "us_ss_death_index_2004_catherine_pavey",
    url: "https://www.familysearch.org/ark:/61903/1:1:VMSB-3WR",
  },
  {
    caseName: "us_tx_divorce_1976_sarah_pate",
    url: "https://www.familysearch.org/ark:/61903/1:1:VYX9-KBH",
  },
  {
    // was not getting parents
    caseName: "us_ut_death_1959_virginia_vigus",
    url: "https://www.familysearch.org/ark:/61903/1:1:QKDV-CZRZ",
  },
  {
    // has date in form 3/4/1873
    caseName: "us_ut_marriage_1873_parker_childs",
    url: "https://www.familysearch.org/ark:/61903/1:1:XZJC-SH7?treeref=KWJZ-858",
  },
  {
    // was not getting any narrative
    caseName: "us_ut_immigration_1863_john_jenkins",
    url: "https://www.familysearch.org/ark:/61903/1:1:Q234-5Z3C?from=lynx1UIV8&treeref=KWCG-DRL",
  },
  {
    caseName: "us_va_death_1921_henry_mullins",
    url: "https://www.familysearch.org/ark:/61903/1:1:QVR7-FDWT",
  },
  {
    caseName: "us_ww1_draft_1917_john_smith",
    url: "https://www.familysearch.org/ark:/61903/1:1:K6Z6-RVT",
  },
];

const imageRegressionData = [
  // images

  {
    // Note: I had to edit the saved .html file for many errors.
    caseName: "image_canada_church_1866_sarnia_lambton",
    url: "https://www.familysearch.org/ark:/61903/3:1:33SQ-GYWJ-TMS?i=44",
  },
  {
    // Note: I had to edit the saved .html file for many errors. vscode highlighted them and they prevented
    // jsdom from parsing it.
    caseName: "image_england_marriage_bonds_1754_richard_fawssett",
    url: "https://www.familysearch.org/ark:/61903/3:1:S3HT-DR17-4Y9?i=5&wc=M8VJ-GZ9%3A160750101%2C160953901%2C161035601&cc=1824690",
  },
  {
    // Note: I had to edit the saved .html file for many errors.
    caseName: "image_us_al_land_deed",
    url: "https://www.familysearch.org/search/catalog/549079?availability=Family%20History%20Library",
  },
  {
    // Note: I had to edit the saved .html file for many errors.
    caseName: "image_us_ky_marriage_1821",
    url: "https://www.familysearch.org/ark:/61903/3:1:3QS7-89SS-998T?i=31&cc=1804888",
  },
  {
    // Note: I had to edit the saved .html file for many errors.
    caseName: "image_us_ky_tax_books_1822",
    url: "https://www.familysearch.org/ark:/61903/3:1:3Q9M-CS3J-D77F-1?cat=157396",
  },
  {
    // Note: I had to edit the saved .html file for many errors.
    caseName: "image_us_ny_land_records_1855",
    url: "https://www.familysearch.org/ark:/61903/3:1:3QS7-89WL-VKSC?i=379&wc=M7CD-S6D%3A358132901%2C360400601&cc=2078654",
  },
];

const personRegressionData = [
  {
    caseName: "xx_profile_pinkney_lyles_1886_1916",
    url: "https://www.familysearch.org/tree/person/details/G6DP-4WD",
    fetchType: "person",
  },
  {
    caseName: "xx_profile_sarah_moats_1854_1946",
    url: "https://www.familysearch.org/tree/person/details/MQWP-4VQ",
    fetchType: "person",
  },
  {
    caseName: "xx_profile_william_lyles_1856_1931",
    url: "https://www.familysearch.org/tree/person/details/G8S8-5FJ",
    fetchType: "person",
  },
];

const optionVariants = [
  {
    variantName: "dataStyle_fsShort_fsCitation",
    optionOverrides: {
      citation_fs_sourceRef: "fsCitationShort",
      citation_fs_dataStyle: "fsCitation",
    },
  },
  {
    variantName: "dataStyle_record_string",
    optionOverrides: {
      citation_fs_sourceRef: "record",
      citation_fs_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_record_list",
    optionOverrides: {
      citation_fs_sourceRef: "record",
      citation_fs_dataStyle: "list",
    },
  },
  {
    variantName: "dataStyle_record_table",
    optionOverrides: {
      citation_fs_sourceRef: "record",
      citation_fs_dataStyle: "table",
    },
  },
  {
    variantName: "dataStyle_record_fsCitation",
    optionOverrides: {
      citation_fs_sourceRef: "record",
      citation_fs_dataStyle: "fsCitation",
    },
  },
  {
    variantName: "dataStyle_record_none",
    optionOverrides: {
      citation_fs_sourceRef: "record",
      citation_fs_dataStyle: "none",
    },
  },
  {
    variantName: "dataStyle_fsShort_string",
    optionOverrides: {
      citation_fs_sourceRef: "fsCitationShort",
      citation_fs_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_fsLong_fsCitation",
    optionOverrides: {
      citation_fs_sourceRef: "fsCitationLong",
      citation_fs_dataStyle: "fsCitation",
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("fs", extractDataFromFetch, regressionData, testManager);
  await runGeneralizeDataTests("fs", generalizeData, regressionData, testManager);
  await runBuildCitationTests("fs", buildCitation, buildHouseholdTable, regressionData, testManager, optionVariants);

  await runExtractDataTests("fs", extractData, imageRegressionData, testManager);
  await runGeneralizeDataTests("fs", generalizeData, imageRegressionData, testManager);
  await runBuildCitationTests(
    "fs",
    buildCitation,
    buildHouseholdTable,
    imageRegressionData,
    testManager,
    optionVariants
  );

  await runExtractDataTests("fs", extractDataFromFetch, personRegressionData, testManager);
  await runGeneralizeDataTests("fs", generalizeData, personRegressionData, testManager);
}

export { runTests };
