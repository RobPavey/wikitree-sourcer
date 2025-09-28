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

import { writeTestOutputFile, readInputFile, removeStaleOutputFiles } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";

import { GeneralizedData } from "../../extension/base/core/generalize_data_utils.mjs";

const citationTypes = ["inline", "narrative", "source"];

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
// Each object having the keys: "PageFile" and "extractedData"
async function runBuildCitationTests(
  siteName,
  functions,
  regressionData,
  testManager,
  optionVariants = undefined,
  cleanStaleFiles = true
) {
  if (!testEnabled(testManager.parameters, "citation")) {
    return;
  }

  const regeneralizeDataFunction = functions.regeneralizeData;
  const buildCitationFunction = functions.buildCitation;
  const buildTableFunction = functions.buildTable;

  let testName = siteName + "_build_citation";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);
  let resultDir = "citations";

  // clear out any stale test or ref files so that old test data doesn't hang around after a test is renamed
  // or removed. A file is considered stale if there is no longer a test case that generates it.
  if (cleanStaleFiles) {
    removeStaleOutputFiles(siteName, resultDir, [regressionData], logger);
  }

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    // read in the extracted data input file (which is the reference result of the extractData test)
    let extractedData = readInputFile(siteName, "extracted_data", testData, logger);
    if (!extractedData) {
      continue;
    }

    // read in the generalized data input file (which is the reference result of the generalizeData test)
    let generalizedDataObj = readInputFile(siteName, "generalized_data", testData, logger);
    if (!generalizedDataObj) {
      continue;
    }
    let generalizedData = GeneralizedData.createFromPlainObject(generalizedDataObj);

    let testDataHasHousehold = false;
    {
      let fieldNames = generalizedData.householdArrayFields;
      let objectArray = generalizedData.householdArray;
      if (fieldNames && objectArray) {
        testDataHasHousehold = true;
      }
    }

    let userOptions = testManager.options;
    if (testData.userOptions) {
      // use spread operator to merge the default options and the ones from testData
      userOptions = { ...userOptions, ...testData.userOptions };
    }

    // to save setting the run date on every test case
    if (!testData.runDate) {
      testData.runDate = new Date("6 May 2021");
    }

    const input = {
      extractedData: extractedData,
      generalizedData: generalizedData,
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
      let baseName = variant.variantName + "_";
      // use spread operator to merge the base options and the ones from the variant
      input.options = { ...userOptions, ...variant.optionOverrides };

      if (regeneralizeDataFunction && variant.newData) {
        let regeneralizeInput = {
          extractedData: extractedData,
          generalizedData: generalizedData,
          newData: variant.newData,
        };
        regeneralizeDataFunction(regeneralizeInput);
      }

      const onlyTypes = Array.isArray(variant.thisTypeOnly)
        ? variant.thisTypeOnly
        : variant.thisTypeOnly != null
        ? [variant.thisTypeOnly]
        : null;

      for (let citationType of citationTypes) {
        if (onlyTypes && !onlyTypes.includes(citationType)) {
          continue;
        }
        try {
          // If this record has a household and an option is set that needs the table then generate it
          if (testDataHasHousehold) {
            let autoTableOpt = input.options.table_general_autoGenerate;
            if (autoTableOpt != "none" && autoTableOpt != "citationInTableCaption") {
              let optionsWantCitation = true;
              if (citationType == "source") {
                if (autoTableOpt != "withinRefOrSource") {
                  optionsWantCitation = false;
                }
              }

              if (optionsWantCitation) {
                const tableObject = buildTableFunction(input);
                input.householdTableString = tableObject.tableString;
              }
            }
          }

          let name = baseName + citationType;
          input.type = citationType;
          let citationObject = await buildCitationFunction(input);

          // for legacy reasons and because we don't want to save generalized data twice we
          // remove some stuff from the citation object
          delete citationObject.generalizedData;
          delete citationObject.sourceReference;
          delete citationObject.sourceTitle;
          delete citationObject.url;
          delete citationObject.sourceNameWithinRepository;
          delete citationObject.standardDataString;
          delete citationObject.referenceWithinRepository;

          result[name] = citationObject;
        } catch (e) {
          console.log("Error:", e.stack);
          logger.logError(testData, "Exception occurred");
          continue;
        }
      }
    }

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    testManager.results.totalTestsRun++;

    compareOrReplaceRefFileWithResult(result, siteName, testManager, resultDir, testData, logger);
  }

  if (logger.numFailedTests > 0) {
    console.log("Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
  } else {
    console.log("Test passed (" + testName + ").");
  }
}

export { runBuildCitationTests };
