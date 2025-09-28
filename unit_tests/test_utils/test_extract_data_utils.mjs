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
import jsdom from "jsdom";
const { JSDOM } = jsdom;

import { writeTestOutputFile, removeStaleOutputFiles } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of testData objects.
// Each testDataobject having the keys:
// caseName - the caseName is used to build the name of the saved page and the output files
// url - The URL of the record
// pageFile - optional override of the saved page file name - can be used to make two testCases use the
//    same saved page file.
async function runExtractDataTests(siteName, extractDataFunction, regressionData, testManager, cleanStaleFiles = true) {
  if (!testEnabled(testManager.parameters, "extract")) {
    return;
  }

  let testName = siteName + "_extract_data";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  let resultDir = "extracted_data";

  // clear out any stale test or ref files so that old test data doesn't hang around after a test is renamed
  // or removed. A file is considered stale if there is no longer a test case that generates it.
  if (cleanStaleFiles) {
    removeStaleOutputFiles(siteName, resultDir, [regressionData], logger);
  }

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    //console.log("=== testData.caseName is : " + testData.caseName + " ===");

    let result = undefined;

    let pageFile = testData.pageFile;
    let fetchType = testData.fetchType;
    if (!fetchType) {
      fetchType = "record";
    }

    if (!pageFile) {
      let testPageFile = "./unit_tests/" + siteName + "/saved_pages/" + testData.caseName + ".html";
      if (fs.existsSync(testPageFile)) {
        pageFile = testPageFile;
      } else {
        testPageFile = "./unit_tests/" + siteName + "/saved_pages/" + testData.caseName + ".htm";
        if (fs.existsSync(testPageFile)) {
          pageFile = testPageFile;
        }
      }
    }

    let fetchObjPath = testData.fetchObjPath;
    if (!fetchObjPath) {
      let testFetchObjPath = "./unit_tests/" + siteName + "/saved_fetch_objects/" + testData.caseName + ".json";
      if (fs.existsSync(testFetchObjPath)) {
        fetchObjPath = testFetchObjPath;
      }
    }

    fs.existsSync();

    if (fetchObjPath && pageFile) {
      let dom = undefined;
      try {
        dom = await JSDOM.fromFile(pageFile);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Failed to read input file");
        continue;
      }
      const doc = dom.window.document;

      // read in the input file (which is the reference result of the extractData test)
      var fetchObj;
      try {
        let fetchObjJson = fs.readFileSync(fetchObjPath, "utf8");
        fetchObj = JSON.parse(fetchObjJson);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Failed to read fetchObj file: " + fetchObj);
        continue;
      }

      let dataObjects = { dataObj: fetchObj };

      try {
        result = extractDataFunction(doc, testData.url, dataObjects, fetchType, "", testManager.options);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    } else if (pageFile) {
      let dom = undefined;
      try {
        dom = await JSDOM.fromFile(pageFile);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Failed to read input file");
        continue;
      }
      const doc = dom.window.document;

      function releaseJsdomMemory() {
        if (dom.window) {
          dom.window.close();
        }
        // This will only be defined if Node is run with the --expose-gc flag
        if (global && global.gc) {
          if (process.memoryUsage().heapUsed > 200000000) {
            // memory use is above 200MB
            global.gc();
          }
        }
      }

      try {
        result = extractDataFunction(doc, testData.url);
        releaseJsdomMemory();
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Exception occurred");
        releaseJsdomMemory();
        continue;
      }
    } else if (fetchObjPath) {
      // read in the input file (which is the reference result of the extractData test)
      var fetchObj;
      try {
        let fetchObjJson = fs.readFileSync(fetchObjPath, "utf8");
        fetchObj = JSON.parse(fetchObjJson);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Failed to read fetchObj file: " + fetchObjPath);
        continue;
      }

      let dataObjects = { dataObj: fetchObj };

      try {
        result = extractDataFunction(undefined, testData.url, dataObjects, fetchType, "", testManager.options);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    } else {
      console.log("Neither pageFile or fetchObjPath available, testData is:");
      console.log(testData);
      continue;
    }

    if (!result) {
      console.log("Result is undefined");
      logger.logError(testData, "Result is undefined");
      continue;
    }

    // add any additional extracted data fields from the testData
    // This is to test stuff that can be extracted in the real world but not from the saved page
    // For example the clickedRowData in vicbdm
    if (testData.extraExtractedDataFields) {
      result = { ...result, ...testData.extraExtractedDataFields };
    }

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    //console.log(result);
    testManager.results.totalTestsRun++;

    compareOrReplaceRefFileWithResult(result, siteName, testManager, resultDir, testData, logger);
  }

  if (logger.numFailedTests > 0) {
    console.log("Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
  } else {
    if (testManager.parameters.forceReplaceRefs) {
      console.log("Ref files replaced for test (" + testName + ").");
    } else {
      console.log("Test passed (" + testName + ").");
    }
  }
}

export { runExtractDataTests };
