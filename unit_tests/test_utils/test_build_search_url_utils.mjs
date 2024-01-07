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

import {
  writeTestOutputFile,
  readRefFile,
  readInputFile,
  readFile,
  getRefFilePath,
  getTestFilePath,
} from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { deepObjectEquals } from "../test_utils/compare_result_utils.mjs";
import { GeneralizedData } from "../../extension/base/core/generalize_data_utils.mjs";

const testDataWikiTreeProfileCacheSources = [
  "ellacott-59_read",
  "handford-3_read",
  "pavey-443_private",
  "pavey-451_read",
  "pavey-459_edit",
];

function createTestDataCache(testData, logger) {
  let dataCache = {
    wikiTreeProfileCache: {
      items: [],
    },
  };

  for (let source of testDataWikiTreeProfileCacheSources) {
    let extractedDataSubPath = "wikitree/extracted_data/ref/" + source;
    let generalizedDataSubPath = "wikitree/generalized_data/ref/" + source;

    let extractedData = readFile(extractedDataSubPath, testData, logger);
    let generalizedDataObj = readFile(generalizedDataSubPath, testData, logger);
    let generalizedData = GeneralizedData.createFromPlainObject(generalizedDataObj);

    let item = {
      extractedData: extractedData,
      generalizedData: generalizedData,
      timeStamp: 1623190446616,
    };

    dataCache.wikiTreeProfileCache.items.push(item);
  }

  return dataCache;
}

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
// Each object having the keys: "PageFile" and "extractedData"
async function runBuildSearchUrlTests(
  siteName,
  buildSearchUrlFunction,
  regressionData,
  testManager,
  optionVariants = undefined
) {
  if (!testEnabled(testManager.parameters, "search")) {
    return;
  }

  let testName = siteName + "_build_search_url";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  let testDataCache = undefined;

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    if (testData.useDataCache && !testDataCache) {
      testDataCache = createTestDataCache(testData, logger);
    }

    // read in the input file (which is the reference result of the extractData test)
    let inputData = readInputFile(siteName, "generalized_data", testData, logger);
    if (!inputData) {
      continue;
    }
    let generalizedData = GeneralizedData.createFromPlainObject(inputData);

    let userOptions = testManager.options;
    if (testData.userOptions) {
      // use spread operator to merge the default options and the ones from testData
      userOptions = { ...userOptions, ...testData.userOptions };
    }

    // to save setting the run date on every test case
    if (!testData.runDate) {
      testData.runDate = new Date("1 December 2023");
    }

    let typeOfSearch = testData.typeOfSearch;
    const input = {
      typeOfSearch: typeOfSearch,
      searchParameters: testData.searchParameters,
      generalizedData: generalizedData,
      dataCache: testDataCache,
      options: userOptions,
      runDate: testData.runDate,
    };

    let result = {}; // this is an object containing all the types

    let finalOptionVariants = [];
    if (optionVariants) {
      for (let variant of optionVariants) {
        finalOptionVariants.push(variant);
      }
    } else {
      finalOptionVariants.push({ variantName: "std", optionOverrides: {} });
    }
    // add any option variants specific to this test case
    if (testData.optionVariants) {
      for (let variant of testData.optionVariants) {
        finalOptionVariants.push(variant);
      }
    }

    for (let variant of finalOptionVariants) {
      // use spread operator to merge the base options and the ones from the variant
      input.options = { ...userOptions, ...variant.optionOverrides };
      if (variant.typeOfSearch) {
        input.typeOfSearch = variant.typeOfSearch;
      }
      if (variant.searchParameters) {
        input.searchParameters = variant.searchParameters;
      }
      try {
        let name = variant.variantName;
        result[name] = buildSearchUrlFunction(input);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Exception occurred");
        continue;
      }
    }

    let resultDir = "search_url";

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    testManager.results.totalTestsRun++;

    // read in the reference result
    let refObject = readRefFile(result, siteName, resultDir, testData, logger);
    if (!refObject) {
      continue;
    }

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
  } else {
    console.log("Test passed (" + testName + ").");
  }
}

export { runBuildSearchUrlTests };
