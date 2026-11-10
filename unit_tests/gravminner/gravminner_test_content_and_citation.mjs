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

import { generalizeData } from "../../extension/site/gravminner/core/gravminner_generalize_data.mjs";
import { buildCitation } from "../../extension/site/gravminner/core/gravminner_build_citation.mjs";
import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "signe_strande",
    url: "https://slektogdata.no/gravminner/grav/259e0d76-270e-4a55-b46d-d36270407cae",
  },
  {
    caseName: "anders_olsen_grov",
    url: "https://slektogdata.no/gravminner/grav/b8ac84e7-ba92-4dcb-8982-522be1be5c5b",
  },
  {
    caseName: "magdalene_johansen",
    url: "https://slektogdata.no/gravminner/grav/ea281e18-402a-4724-b151-4733c7ec0bbd",
  },
  {
    caseName: "partial_dates",
    url: "https://slektogdata.no/gravminner/grav/11111111-1111-1111-1111-111111111111",
  },
  {
    caseName: "no_dates",
    url: "https://slektogdata.no/gravminner/grav/22222222-2222-2222-2222-222222222222",
  },
  {
    caseName: "ceremony_only",
    url: "https://slektogdata.no/gravminner/grav/33333333-3333-3333-3333-333333333333",
  },
  {
    caseName: "www_and_query",
    pageFile: "./unit_tests/gravminner/saved_pages/signe_strande.html",
    url: "http://www.slektogdata.no/gravminner/grav/259e0d76-270e-4a55-b46d-d36270407cae?tracking=1#photo",
  },
];

async function runTests(testManager) {
  for (const data of regressionData) data.runDate = new Date(2026, 10, 9);
  await runExtractDataTests("gravminner", regressionData, testManager);
  await runGeneralizeDataTests("gravminner", generalizeData, regressionData, testManager);
  await runBuildCitationTests("gravminner", { buildCitation }, regressionData, testManager, [
    { variantName: "std", optionOverrides: {} },
    { variantName: "plain", optionOverrides: { citation_general_target: "other" } },
    { variantName: "noAccessDate", optionOverrides: { citation_general_addAccessedDate: "none" } },
  ]);
}
export { runTests };
