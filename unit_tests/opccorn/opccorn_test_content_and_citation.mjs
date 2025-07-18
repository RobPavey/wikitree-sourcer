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

import { extractData } from "../../extension/site/opccorn/core/opccorn_extract_data.mjs";
import { generalizeData } from "../../extension/site/opccorn/core/opccorn_generalize_data.mjs";
import { buildCitation } from "../../extension/site/opccorn/core/opccorn_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "asylum_inmate_1867_margaret_grose",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=institution_inmates&id=183742",
  },
  {
    caseName: "banns_1810_david_jones",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=banns&id=72798",
    optionVariants: [
      {
        variantName: "recordLink",
        optionOverrides: {
          citation_opccorn_linkStyle: "record",
        },
      },
    ],
  },
  {
    caseName: "baptism_1584_john_smith",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=baptisms&id=1797543",
  },
  {
    caseName: "birth_cert_1842_william_rule",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=birth_certificate&id=2358",
  },
  {
    caseName: "birth_cert_1919_francis_smith",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=birth_certificate&id=2297",
  },
  {
    caseName: "burial_1860_john_pavey",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=burials&id=4827393",
  },
  {
    caseName: "burial_1906_jane_owens",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=burials&id=2622494",
  },
  {
    caseName: "death_cert_1900_milvina_smith",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=death_certificate&id=309",
  },
  {
    caseName: "marriage_1801_david_davis",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=marriages&id=586772",
  },
  {
    caseName: "marriage_1946_david_scott",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=marriages&id=1667588",
  },
  {
    caseName: "marriage_alleg_1861_robert_wilson",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=marriage_allegations&id=17004",
  },
  {
    caseName: "marriage_cert_1877_charles_read",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=marriage_certificate&id=2070",
  },
  {
    caseName: "will_john_michell_1844",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=wills_transcriptions&id=7344",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("opccorn", extractData, regressionData, testManager);

  await runGeneralizeDataTests("opccorn", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("opccorn", functions, regressionData, testManager);
}

export { runTests };
