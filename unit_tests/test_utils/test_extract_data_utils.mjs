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

import fs from 'fs'
import jsdom from "jsdom";
const { JSDOM } = jsdom;

import { deepObjectEquals } from "../test_utils/compare_result_utils.mjs";
import { writeTestOutputFile, readRefFile, readFile, getRefFilePath, getTestFilePath } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

function testEnabled(parameters, testName) {
  return (parameters.testName == "" || parameters.testName == testName);
}

// The regressionData passed in must be an array of objects.
// Each object having the keys: "PageFile" and "extractedData"
async function runExtractDataTests(siteName, extractDataFunction, regressionData, testManager) {

  if (!testEnabled(testManager.parameters, "extract")) {
    return;
  }

  let testName = siteName + "_extract_data";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  for (var testData of regressionData) {

    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

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
      }
    }

    let fetchObjPath = testData.fetchObjPath;
    if (!fetchObjPath) {
      let testFetchObjPath = "./unit_tests/" + siteName + "/saved_fetch_objects/" + testData.caseName + ".json";
      if (fs.existsSync(testFetchObjPath)) {
        fetchObjPath = testFetchObjPath;
      }
    }

    fs.existsSync()

    if (fetchObjPath && pageFile) {
      let dom = undefined;
      try {
        dom = await JSDOM.fromFile(pageFile);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Failed to read input file");
        continue;
      }
      const doc = dom.window.document;

      // read in the input file (which is the reference result of the extractData test)
      var fetchObj;
      try {
        let fetchObjJson = fs.readFileSync(fetchObjPath, 'utf8');
        fetchObj= JSON.parse(fetchObjJson);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Failed to read fetchObj file: " + fetchObj);
        continue;
      }

      try {
        result = extractDataFunction(undefined, fetchObj, fetchType, testManager.options);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    }
    else if (pageFile) {
      let dom = undefined;
      try {
        dom = await JSDOM.fromFile(pageFile);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Failed to read input file");
        continue;
      }
      const doc = dom.window.document;

      try {
        result = extractDataFunction(doc, testData.url);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    }
    else if (fetchObjPath) {
      // read in the input file (which is the reference result of the extractData test)
      var fetchObj;
      try {
        let fetchObjJson = fs.readFileSync(fetchObjPath, 'utf8');
        fetchObj= JSON.parse(fetchObjJson);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Failed to read fetchObj file: " + fetchObjPath);
        continue;
      }

      try {
        result = extractDataFunction(undefined, fetchObj, fetchType, testManager.options);
      } catch (e) {
        console.log('Error:', e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    }
    else {
      console.log("Neither pageFile or fetchObjPath available, testData is:");
      console.log(testData);
      continue;
    }

    if (!result) {
      console.log("Result is undefined");
      logger.logError(testData, "Result is undefined");
      continue;
    }

    let resultDir = "extracted_data";

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    //console.log(result);
    testManager.results.totalTestsRun++;

    // read in the reference result
    let refObject = readRefFile(result, siteName, resultDir, testData, logger);
    if (!refObject) {
      // ref file didn't exist it will have been created now
      continue;
    }

    // do compare
    let equal = deepObjectEquals(result, refObject);
    if (!equal) {
      console.log("Result differs from reference. Result is:");
      console.log(result);
      let refFile = getRefFilePath(siteName, resultDir, testData);
      let testFile = getTestFilePath(siteName, resultDir, testData);
      logger.logError(testData, "Result differs from reference", refFile, testFile);
    }
  }

  if (logger.numFailedTests > 0) {
    console.log("Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
  }
  else {
    console.log("Test passed (" + testName + ").");
  }
}

export { runExtractDataTests };