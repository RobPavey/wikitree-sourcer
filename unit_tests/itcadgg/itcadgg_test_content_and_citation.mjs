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

import { generalizeData } from "../../extension/site/itcadgg/core/itcadgg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/itcadgg/core/itcadgg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // https://www.wikitree.com/wiki/Abate-148 on WikiTree
    caseName: "abate_leonardo_di_domenico_1917",
    url: "https://www.cadutigrandeguerra.it/DettagliNominativi.aspx?id=SQ%2bRzkCbzdmuTr%2buc7TPaw%3d%3d",
  },
  {
    caseName: "di_francesco_gabriele_donato_di_angelo_antonio_1916",
    url: "https://www.cadutigrandeguerra.it/DettagliNominativi.aspx?id=iA8bcDG9Nw0JoD1jYId0aA%3d%3d",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("itcadgg", regressionData, testManager);

  await runGeneralizeDataTests("itcadgg", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("itcadgg", functions, regressionData, testManager);
}

export { runTests };
