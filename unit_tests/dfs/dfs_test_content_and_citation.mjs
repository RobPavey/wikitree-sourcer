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

import { generalizeData } from "../../extension/site/dfs/core/dfs_generalize_data.mjs";
import { buildCitation } from "../../extension/site/dfs/core/dfs_build_citation.mjs";
import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";
import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const baseUrl = "https://www.danishfamilysearch.dk";
const regressionData = [
  { caseName: "census_1845_hans", url: baseUrl + "/cid5500978" },
  { caseName: "census_1845_hans_head", url: baseUrl + "/cid5500973" },
  { caseName: "church_1840_hans", url: baseUrl + "/kbid953766" },
  {
    caseName: "church_image_1840",
    url: baseUrl + "/churchbook/sogn701/churchlisting143098/opslag15978995",
    imageOnly: true,
  },
  { caseName: "church_image_1840_selected", url: baseUrl + "/churchbook/sogn701/churchlisting143098/opslag15978995" },
  { caseName: "school_1811_hans", url: baseUrl + "/sogn804/skole66/source152527/opslag17728149", imageOnly: true },
  { caseName: "school_1811_hans_selected", url: baseUrl + "/sogn804/skole66/source152527/opslag17728149" },
  {
    caseName: "levy_1791_hans",
    url: baseUrl + "/kilder/laegdsruller/kreds2/bsid17267/opslag12157806",
    imageOnly: true,
  },
  { caseName: "levy_1791_hans_selected", url: baseUrl + "/kilder/laegdsruller/kreds2/bsid17267/opslag12157806" },
];

// Failure pages get extraction references but cannot supply person data or citations.
const extractionOnlyData = [
  { caseName: "logged_out", url: baseUrl + "/cid5500978" },
  {
    caseName: "unsupported_page",
    pageFile: "./unit_tests/dfs/saved_pages/census_1845_hans.html",
    url: baseUrl + "/forum/",
  },
  {
    caseName: "stale_census",
    pageFile: "./unit_tests/dfs/saved_pages/census_1845_hans.html",
    url: baseUrl + "/cid5500974",
  },
];

async function runTests(testManager) {
  for (const data of regressionData) {
    data.runDate = new Date(2026, 10, 12);
    data.userOptions = { table_general_autoGenerate: "none" };
    const thisTypeOnly = data.imageOnly ? ["inline", "source"] : undefined;
    data.optionVariants = [
      { variantName: "std", optionOverrides: {}, thisTypeOnly },
      { variantName: "plain", optionOverrides: { citation_general_target: "other" }, thisTypeOnly },
      { variantName: "noAccessDate", optionOverrides: { citation_general_addAccessedDate: "none" }, thisTypeOnly },
    ];
    if (data.caseName.startsWith("census_")) {
      data.optionVariants.push({
        variantName: "withTable",
        optionOverrides: { table_general_autoGenerate: "withinRefOrSource" },
      });
    }
  }
  await runExtractDataTests("dfs", [...regressionData, ...extractionOnlyData], testManager);
  await runGeneralizeDataTests("dfs", generalizeData, regressionData, testManager);
  // Each case supplies its variants, so image-only pages test just the citation actions shown in the UI.
  await runBuildCitationTests(
    "dfs",
    { buildCitation, buildTable: buildHouseholdTable },
    regressionData,
    testManager,
    []
  );
}
export { runTests };
