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

import { extractData } from "../../extension/site/baclac/core/baclac_extract_data.mjs";
import { generalizeData } from "../../extension/site/baclac/core/baclac_generalize_data.mjs";
import { buildCitation } from "../../extension/site/baclac/core/baclac_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Canada Gazette
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "canada_gazette_1869",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=cangaz&IdNumber=1888&q=John%20Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Census records
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "census_1851_francois_montminy",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=23447983",
  },
  {
    caseName: "census_1861_jd_keys",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=44445788",
  },
  {
    caseName: "census_1861_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=44376755",
  },
  {
    caseName: "census_1870_john_jas_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=47181882",
  },
  {
    caseName: "census_1871_docithe_grenier",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=40070185",
  },
  {
    caseName: "census_1871_pierre_kaheroton",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=38937965",
  },
  {
    caseName: "census_1881_jean_lgermain",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=21511208",
  },
  {
    caseName: "census_1881_mary_fenton",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=20567235",
  },
  {
    caseName: "census_1881_may_mckenzie",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=20538834",
  },
  {
    caseName: "census_1891_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=26261677",
  },
  {
    caseName: "census_1906_robert_macdonald",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=849292",
  },
  {
    caseName: "census_1911_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=17167476",
  },
  {
    caseName: "census_1911_marxoy_mcwattier",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=15446480",
  },
  {
    caseName: "census_1916_gertrude_folsom",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=42564419",
  },
  {
    caseName: "census_1916_star_sayura",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=42454309",
  },
  {
    caseName: "census_1921_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=66233187",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Canadian Post Office Publications
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "canposoffpub_1886_july",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=canposoffpub&IdNumber=8933&q=Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Government Documents
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "cabcon_1974_hazen_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=cabcon&IdNumber=39205&q=Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Diaries of William Lyon Mackenzie King
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "diawlmking_1904_nov_12",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=diawlmking&IdNumber=3064&q=Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Immigration
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "immfrochi_1949_ng_suey_jun",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=immfrochi&IdNumber=96809&q=Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Indian Affairs Annual Reports, 1864 to 1990
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "indaffannrep_1912_mar_31",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=indaffannrep&IdNumber=24798&q=Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // LandGrant
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "lanboauppcan_1790_bethsheba_soper",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=lanboauppcan&IdNumber=14220&q=Wilson",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // LandPetition
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "lanpetlowcan_1792_abijah_taylor",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=lanpetlowcan&IdNumber=84657&q=taylor",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // MetisScrip
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "fonandcol_1864_ann_belcourt",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?idnumber=1497251&app=fonandcol",
  },
  {
    caseName: "fonandcol_1877_leandre_stgermain",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=fonandcol&IdNumber=1503773&q=Scrip%20affidavit%20for%20St.%20Germain,%20Leandre",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Military
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "coumarwwi_1918_rob_roy_mcgregor",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=coumarwwi&IdNumber=8046&q=Macgregor",
  },
  {
    caseName: "military_ww1_francois_montminy",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=pffww&IdNumber=174866&q=Francois%20Montminy",
  },
  {
    caseName: "nwmp_john_mcvicar",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=nwmp&IdNumber=46734&q=duncan",
  },
  {
    caseName: "porros_1784_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=porros&IdNumber=1270&q=Smith",
  },
  {
    caseName: "roynavled_jean_beaucage",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=roynavled&IdNumber=5273&q=jean-pierre",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Orders-in-Council
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "ordincou_1905_mcdonald",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=ordincou&IdNumber=125814&q=Scrip",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Old format census records
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "old_census_1901_malcom_cameron",
    url: "https://www.bac-lac.gc.ca/eng/census/1901/Pages/item.aspx?itemid=31526",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Old format other records
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "old_military_1784_peter_smith",
    url: "https://www.bac-lac.gc.ca/eng/discover/military-heritage/loyalists/loyalists-ward-chipman/pages/item.aspx?IdNumber=106&",
  },
  {
    caseName: "old_military_1916_john_watkins",
    url: "https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/Pages/item.aspx?IdNumber=301389",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("baclac", extractData, regressionData, testManager);

  await runGeneralizeDataTests("baclac", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("baclac", functions, regressionData, testManager);
}

export { runTests };
