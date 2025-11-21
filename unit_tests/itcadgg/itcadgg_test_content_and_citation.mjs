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

import { extractData } from "../../extension/site/itcadgg/core/itcadgg_extract_data.mjs";
import { generalizeData } from "../../extension/site/itcadgg/core/itcadgg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/itcadgg/core/itcadgg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "name_basic_abate_leonardo",
    url: "https://www.cadutigrandeguerra.it/DettagliNominativi.aspx?id=SQ%2bRzkCbzdmuTr%2buc7TPaw%3d%3d",
  },

  {
    // Test for complicated name
    caseName: "name_advanced_di_francesco_gabriele_donato",
    url: "https://www.cadutigrandeguerra.it/DettagliNominativi.aspx?id=iA8bcDG9Nw0JoD1jYId0aA%3d%3d",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_itcadgg_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_listCurated",
        optionOverrides: {
          citation_itcadgg_dataStyle: "listCurated",
        },
      },
      {
        variantName: "dataStyle_sentence",
        optionOverrides: {
          citation_itcadgg_dataStyle: "sentence",
        },
      },
      {
        variantName: "dataStyle_datastring",
        optionOverrides: {
          citation_itcadgg_dataStyle: "datastring",
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runExtractDataTests("itcadgg", extractData, regressionData, testManager);

  await runGeneralizeDataTests("itcadgg", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("itcadgg", functions, regressionData, testManager);
}

export { runTests };
