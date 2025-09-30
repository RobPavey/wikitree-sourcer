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

import fs from "fs";
import { writeTestOutputFile, readInputFile } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
// Each object having the keys: "testName", "extractedData" and "generalizedData"
async function runGeneralizeDataTests(siteName, generalizeDataFunction, regressionData, testManager) {
  if (!testEnabled(testManager.parameters, "generalize")) {
    return;
  }

  let testName = siteName + "_generalize_data";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    // read in the input file (which is the reference result of the extractData test)
    let extractedData = readInputFile(siteName, "extracted_data", testData, logger);
    if (!extractedData) {
      continue;
    }

    const result = generalizeDataFunction({
      extractedData: extractedData,
      primaryPersonIndex: testData.primaryPersonIndex,
    });

    testManager.results.totalTestsRun++;

    let resultDir = "generalized_data";

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    compareOrReplaceRefFileWithResult(result, siteName, testManager, resultDir, testData, logger);
  }

  if (logger.numFailedTests > 0) {
    console.log(">>>>>> Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
    return false;
  } else {
    console.log("Test passed (" + testName + ").");
    return true;
  }
}

export { runGeneralizeDataTests };
