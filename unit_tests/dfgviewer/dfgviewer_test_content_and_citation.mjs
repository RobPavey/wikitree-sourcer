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

import { extractData } from "../../extension/site/dfgviewer/core/dfgviewer_extract_data.mjs";
import { parseMetadata } from "../../extension/site/dfgviewer/core/dfgviewer_metadata_parser.mjs";
import { generalizeData } from "../../extension/site/dfgviewer/core/dfgviewer_generalize_data.mjs";
import { buildCitation } from "../../extension/site/dfgviewer/core/dfgviewer_build_citation.mjs";

import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

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
    let metadataFile = testData.metadataFile;
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

    // node:internal/modules/esm/resolve:274 throw new ERR_MODULE_NOT_FOUND( ^ Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\base\browser\popup\popup_simple_base.mjs' imported from C:\Projects\History\wikitree-sourcer\extension\site\dfgviewer\browser\dfgviewer_popup.mjs at finalizeResolution (node:internal/modules/esm/resolve:274:11) at moduleResolve (node:internal/modules/esm/resolve:864:10) at defaultResolve (node:internal/modules/esm/resolve:990:11) at #cachedDefaultResolve (node:internal/modules/esm/loader:768:20) at ModuleLoader.resolve (node:internal/modules/esm/loader:745:38) at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:318:38) at #link (node:internal/modules/esm/module_job:208:49) { code: 'ERR_MODULE_NOT_FOUND', url: 'file:///C:/base/browser/popup/popup_simple_base.mjs' } Node.js v24.8.0

    if (!metadataFile) {
      metadataFile = "./unit_tests/" + siteName + "/saved_metadata/" + testData.caseName + ".xml";
    }

    let fetchObjPath = testData.fetchObjPath;
    if (!fetchObjPath) {
      let testFetchObjPath = "./unit_tests/" + siteName + "/saved_fetch_objects/" + testData.caseName + ".json";
      if (fs.existsSync(testFetchObjPath)) {
        fetchObjPath = testFetchObjPath;
      }
    }

    fs.existsSync();

    let metadata = undefined;
    try {
      metadata = fs.readFileSync(metadataFile, "utf-8");
    } catch (e) {
      console.log("Error:", e.stack);
      logger.logError(testData, "Failed to read fetchObj file: " + fetchObj);
      continue;
    }

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
        result.metadata_url = testData.metadata_url;
        result.metadata = metadata;
        await parseMetadata(result);
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
        result.metadata_url = testData.metadata_url;
        result.metadata = metadata;
        await parseMetadata(result);
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
        result.metadata_url = testData.metadata_url;
        result.metadata = metadata;
        await parseMetadata(result);
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

const regressionData = [
  {
    caseName: "arcinsys_hessen_HStAD_Q_4_8_155-2_16",
    url: "https://dfg-viewer.de/show/?set[mets]=https://arcinsys.hessen.de/arcinsys/mets?detailid=v2843934",
    metadata_url: "https://arcinsys.hessen.de/arcinsys/mets?detailid=v2843934",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("dfgviewer", extractData, regressionData, testManager);

  await runGeneralizeDataTests("dfgviewer", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("dfgviewer", functions, regressionData, testManager);
}

export { runTests };
