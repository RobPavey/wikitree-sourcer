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

import { record } from "./nb_test_fixtures.mjs";
import { noticeTypes } from "../../extension/site/nb/core/nb_notice_types.mjs";
import { generalizeData, passageInput } from "../../extension/site/nb/core/nb_generalize_data.mjs";
import { buildCitation } from "../../extension/site/nb/core/nb_build_citation.mjs";
import { writeTestOutputFile } from "../test_utils/ref_file_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const cases = [
  ...noticeTypes.map((type) => ({
    caseName: "notice_" + type.key.toLowerCase(),
    kind: "newspaper",
    state: {
      category: type.key,
      personName: "Åse Østby",
      secondPerson: type.couple ? "Ole Åsen" : "",
      eventDate: type.event ? "before 3 May 1920" : "",
      eventPlace: type.event ? "Bergen" : "",
      passageHeading: "Synthetic " + type.label,
      printedPages: "2",
    },
  })),
  { caseName: "newspaper_no_person", kind: "newspaper", state: {} },
  {
    caseName: "book_person",
    kind: "book",
    state: { personName: "Anna Hansen", passageHeading: "Synthetic passage", printedPages: "iv–v" },
  },
  { caseName: "book_no_person", kind: "book", state: {} },
  { caseName: "urn_newspaper", kind: "urn_newspaper", state: { category: "mention", personName: "Synthetic Person" } },
  { caseName: "urn_book", kind: "urn_book", state: { personName: "Synthetic Person" } },
];
async function runTests(testManager) {
  for (const phase of ["extract", "generalize"]) {
    if (testManager.parameters.testName && testManager.parameters.testName !== phase) continue;
    const logger = new LocalErrorLogger(testManager.results, "nb_" + phase);
    console.log("=== Starting test : nb_" + phase + " ===");
    for (const data of cases) {
      if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== data.caseName) continue;
      testManager.results.totalTestsRun++;
      const ed = record(data.kind);
      const result =
        phase === "extract" ? ed : generalizeData({ extractedData: ed, passage: passageInput(ed, data.state) });
      const dir = phase === "extract" ? "extracted_data" : "generalized_data";
      if (writeTestOutputFile(result, "nb", dir, data, logger))
        compareOrReplaceRefFileWithResult(result, "nb", testManager, dir, data, logger);
    }
    console.log((logger.numFailedTests ? "Test failed" : "Test passed") + " (nb_" + phase + ").");
  }
  await runBuildCitationTests(
    "nb",
    { buildCitation },
    cases.map((data) => ({ ...data, runDate: new Date(2026, 10, 10) })),
    testManager,
    [
      { variantName: "std", optionOverrides: {} },
      { variantName: "plain", optionOverrides: { citation_general_target: "plain" } },
      { variantName: "noAccessDate", optionOverrides: { citation_general_addAccessedDate: "none" } },
    ]
  );
}
export { runTests };
