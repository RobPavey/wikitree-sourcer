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

const regressionData = [
  {
    caseName: "us_census_1810_george_jefferson",
    url: "https://www.americanancestors.org/databases/united-states-1810-census/RecordDisplay?volumeId=22111&pageName=779&rId=439190122",
  },
  {
    caseName: "us_census_1820_michael_taylor",
    url: "https://www.americanancestors.org/databases/united-states-1820-census/RecordDisplay?volumeId=22356&pageName=337&rId=441427764",
  },
  {
    caseName: "us_census_1830_jean_mchenry",
    url: "https://www.americanancestors.org/databases/united-states-1830-census/RecordDisplay?volumeId=21640&pageName=28&rId=434925549",
  },
  {
    caseName: "us_census_1850_archibald_wilson",
    url: "https://www.americanancestors.org/databases/united-states-1850-federal-census/RecordDisplay?volumeId=39349&pageName=78&rId=1017367707",
  },
  {
    caseName: "us_census_1870_david_smith",
    url: "https://www.americanancestors.org/databases/united-states-1870-census/RecordDisplay?volumeId=27637&pageName=22&rId=555183710",
  },
  {
    caseName: "us_census_1880_andrew_jackson",
    url: "https://www.americanancestors.org/databases/united-states-1880-census/RecordDisplay?volumeId=29614&pageName=19&rId=651601642",
  },
  {
    caseName: "us_census_1900_john_hall",
    url: "https://www.americanancestors.org/databases/united-states-1900-census/RecordDisplay?volumeId=31156&pageName=594&rId=774305254",
  },
  {
    caseName: "us_census_1910_james_gardiner",
    url: "https://www.americanancestors.org/databases/united-states-1900-census/RecordDisplay?volumeId=31750&pageName=751&rId=781933320",
  },
  {
    caseName: "us_census_1920_walter_mcdonald",
    url: "https://www.americanancestors.org/databases/united-states-1920-federal-census/RecordDisplay?volumeId=44353&pageName=395&rId=1258574809",
  },
  {
    caseName: "us_census_1930_charles_pavey",
    url: "https://www.americanancestors.org/databases/united-states-1930-federal-census/RecordDisplay?volumeId=42296&pageName=319&rId=1192327076",
  },
  {
    caseName: "us_ss_death_index_1974_walter_mcdonald",
    url: "https://www.americanancestors.org/databases/united-states-social-security-death-index-1935-2012/RecordDisplay?pageName=&rId=219059715",
  },
  // records where the membership doesn't allow access
  {
    caseName: "zz_us_ca_birth_index_terrance_jones",
    url: "https://www.americanancestors.org/databases/california-birth-index-1905-1995/RecordDisplay?pageName=&rId=1069879214",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("ameranc", extractData, regressionData, testManager);

  await runGeneralizeDataTests("ameranc", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("ameranc", functions, regressionData, testManager);
}

export { runTests };
