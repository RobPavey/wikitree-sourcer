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

import { extractData } from "../../extension/site/ameranc/core/ameranc_extract_data.mjs";
import { generalizeData } from "../../extension/site/ameranc/core/ameranc_generalize_data.mjs";
import { buildCitation } from "../../extension/site/ameranc/core/ameranc_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// Abbreviations used:
// _r = page type record
// _t = page type transcript
// _i = page type image
// _na = no access
const regressionData = [
  {
    caseName: "gsocw_birth_1712_thomas_willmarth_r",
    url: "https://www.americanancestors.org/databases/general-society-of-colonial-wars-membership-applications-1893-1949/RecordDisplay?volumeId=63371&pageName=2025_0_2&rId=10008493440",
  },
  {
    caseName: "mayflower_baptism_1746_shubael_willmarth_r",
    url: "https://www.americanancestors.org/databases/mayflower-families-fifth-generation-descendants-1700-1880/RecordDisplay?volumeId=48521&pageName=273&rId=1415632989",
  },
  {
    caseName: "mayflower_marriage_1790_hannah_willmarth_r",
    url: "https://www.americanancestors.org/databases/mayflower-families-fifth-generation-descendants-1700-1880/RecordDisplay?volumeId=48521&pageName=274&rId=1415633021",
  },
  {
    // saved using guest membership that has no access
    caseName: "us_ca_birth_index_1993_terrance_jones_r_na",
    url: "https://www.americanancestors.org/databases/california-birth-index-1905-1995/RecordDisplay?pageName=&rId=1069879214",
  },
  {
    caseName: "us_ca_birth_index_1993_terrance_jones_r",
    url: "https://www.americanancestors.org/databases/california-birth-index-1905-1995/RecordDisplay?pageName=&rId=1069879214",
  },
  {
    caseName: "us_census_1810_george_jefferson_r",
    url: "https://www.americanancestors.org/databases/united-states-1810-census/RecordDisplay?volumeId=22111&pageName=779&rId=439190122",
  },
  {
    caseName: "us_census_1820_michael_taylor_r",
    url: "https://www.americanancestors.org/databases/united-states-1820-census/RecordDisplay?volumeId=22356&pageName=337&rId=441427764",
  },
  {
    caseName: "us_census_1830_jean_mchenry_r",
    url: "https://www.americanancestors.org/databases/united-states-1830-census/RecordDisplay?volumeId=21640&pageName=28&rId=434925549",
  },
  {
    caseName: "us_census_1850_archibald_wilson_r",
    url: "https://www.americanancestors.org/databases/united-states-1850-federal-census/RecordDisplay?volumeId=39349&pageName=78&rId=1017367707",
  },
  {
    caseName: "us_census_1870_david_smith_r",
    url: "https://www.americanancestors.org/databases/united-states-1870-census/RecordDisplay?volumeId=27637&pageName=22&rId=555183710",
  },
  {
    caseName: "us_census_1880_andrew_jackson_r",
    url: "https://www.americanancestors.org/databases/united-states-1880-census/RecordDisplay?volumeId=29614&pageName=19&rId=651601642",
  },
  {
    caseName: "us_census_1900_john_hall_r",
    url: "https://www.americanancestors.org/databases/united-states-1900-census/RecordDisplay?volumeId=31156&pageName=594&rId=774305254",
  },
  {
    caseName: "us_census_1910_james_gardiner_r",
    url: "https://www.americanancestors.org/databases/united-states-1900-census/RecordDisplay?volumeId=31750&pageName=751&rId=781933320",
  },
  {
    caseName: "us_census_1920_walter_mcdonald_r",
    url: "https://www.americanancestors.org/databases/united-states-1920-federal-census/RecordDisplay?volumeId=44353&pageName=395&rId=1258574809",
  },
  {
    caseName: "us_census_1930_charles_pavey_r",
    url: "https://www.americanancestors.org/databases/united-states-1930-federal-census/RecordDisplay?volumeId=42296&pageName=319&rId=1192327076",
  },
  {
    caseName: "us_dar_poc_1712_1888_smith_coburn_r",
    url: "https://www.americanancestors.org/databases/daughters-of-the-american-revolution-patriots-of-color-1712-1888/RecordDisplay?pageName=&rId=10010522530",
  },
  {
    caseName: "us_ma_probate_1872_samuel_baker_i",
    url: "https://www.americanancestors.org/databases/bristol-county-ma-probate-file-papers-1686-1880/image?volumeId=48299&pageName=1396:3&rId=68078058",
  },
  {
    caseName: "us_ma_probate_1872_samuel_baker_r",
    url: "https://www.americanancestors.org/databases/bristol-county-ma-probate-file-papers-1686-1880/RecordDisplay?volumeId=48299&pageName=1396:3&rId=68078058",
  },
  {
    caseName: "us_ma_probate_1872_samuel_baker_t",
    url: "https://www.americanancestors.org/databases/bristol-county-ma-probate-file-papers-1686-1880/transcript?volumeId=48299&pageName=1396:3&rId=68078058",
  },
  {
    caseName: "us_ma_tax_1798_samuel_baker_i",
    url: "https://www.americanancestors.org/databases/massachusetts-and-maine-direct-tax-1798/image?rId=235227325&volumeId=13142&pageName=206&filterQuery=",
  },
  {
    caseName: "us_ma_tax_1798_samuel_baker_r",
    url: "https://www.americanancestors.org/databases/massachusetts-and-maine-direct-tax-1798/RecordDisplay?volumeId=13142&pageName=206&rId=235227325",
  },
  {
    caseName: "us_ma_tax_1798_samuel_baker_t",
    url: "https://www.americanancestors.org/databases/massachusetts-and-maine-direct-tax-1798/transcript?volumeId=13142&pageName=206&rId=235227325",
  },
  {
    caseName: "us_ma_vital_1620_1850_samuel_baker_r",
    url: "https://www.americanancestors.org/databases/massachusetts-vital-records-1620-1850/RecordDisplay?volumeId=14010&pageName=925&rId=253509394",
  },
  {
    caseName: "us_ma_vital_birth_1732_nehemiah_willmarth_r",
    url: "https://www.americanancestors.org/databases/massachusetts-vital-records-1620-1850/RecordDisplay?volumeId=14010&pageName=781&rId=253503206",
  },
  {
    caseName: "us_ri_census_1885_nichols_willmark_r",
    url: "https://www.americanancestors.org/databases/rhode-island-census-collection-1865-1935/RecordDisplay?volumeId=13815&pageName=4017&rId=246867425",
  },
  {
    caseName: "us_ri_census_1885_nichols_willmark_t_primaryOnly",
    url: "https://www.americanancestors.org/databases/rhode-island-census-collection-1865-1935/transcript?volumeId=13815&pageName=4017&rId=246867425",
  },
  {
    caseName: "us_ri_census_1885_nichols_willmark_t",
    url: "https://www.americanancestors.org/databases/rhode-island-census-collection-1865-1935/transcript?volumeId=13815&pageName=4017&rId=246867425",
  },
  {
    caseName: "us_ss_death_index_1974_walter_mcdonald_r",
    url: "https://www.americanancestors.org/databases/united-states-social-security-death-index-1935-2012/RecordDisplay?pageName=&rId=219059715",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("ameranc", extractData, regressionData, testManager);

  await runGeneralizeDataTests("ameranc", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("ameranc", functions, regressionData, testManager);
}

export { runTests };
