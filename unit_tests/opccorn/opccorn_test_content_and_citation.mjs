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
    caseName: "banns_1810_david_jones",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=banns&id=72798",
  },
  {
    caseName: "baptism_1584_john_smith",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=baptisms&id=1797543",
  },
  {
    caseName: "birth_cert_1842_william_rule",
    url: "https://www.cornwall-opc-database.org/search-database/more-info/?t=birth_certificate&id=2358",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("opccorn", extractData, regressionData, testManager);

  await runGeneralizeDataTests("opccorn", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("opccorn", functions, regressionData, testManager);
}

export { runTests };
