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

import { buildScotlandsPeopleContextSearchData } from "../../extension/site/scotp/core/scotp_context_menu.mjs";

import {
  writeTestOutputFile,
  readRefFile,
  readFile,
  getRefFilePath,
  getTestFilePath,
} from "../test_utils/ref_file_utils.mjs";
import { deepObjectEquals } from "../test_utils/compare_result_utils.mjs";

import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { reportStringDiff } from "../test_utils/compare_result_utils.mjs";

// Note the text is what comes through from the context selection text - it has newlines removed already.

// in same order as scotpRecordTypes
const regressionData = [
  ////////////////////////////////////////////////////////////////////////////////
  // opr_birth
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_opr_birth_default",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms" National Records of Scotland, Parish Number: 382/ ; Ref: 20 9 ScotlandsPeople Search (accessed 23 June 2022) Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland.`,
  },
  {
    caseName: "sourcer_opr_birth_ee_edit",
    text: `<ref>"Church of Scotland: Old Parish Registers - Births and Baptisms", database, National Records of Scotland, ([https://www.scotlandspeople.gov.uk/ ScotlandsPeople] : accessed 23 June 2022), Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland; citing Parish Number 382/ , Ref 20 9.</ref>`,
  },
  {
    caseName: "sourcer_opr_birth_default_scc_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname: CONNAN; Forename: PETER; Parents/Other details: JAMES CONNAN/MARY MCGREGOR; Gender: M; Birth Date: 01/06/1823; Parish: Monzie.`,
  },
  {
    caseName: "sourcer_opr_birth_default_cc_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname: CONNAN, Forename: PETER, Parents/Other details: JAMES CONNAN/MARY MCGREGOR, Gender: M, Birth Date: 01/06/1823, Parish: Monzie.`,
  },
  {
    caseName: "sourcer_opr_birth_default_c_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname CONNAN, Forename PETER, Parents/Other details JAMES CONNAN/MARY MCGREGOR, Gender M, Birth Date 01/06/1823, Parish Monzie.`,
  },
  {
    caseName: "scotproj_opr_birth",
    text: `Govan Parish, Church of Scotland, "Old Parish Registers Births and Baptisms" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024), William Walker birth or baptism 23 Jan 1808, son of Hugh Walker and Ann Young, citing Ref 20 / 211.`,
  },
  {
    caseName: "scotproj_opr_birth_edit",
    text: `<ref name="OPR William 1">Govan Parish, Church of Scotland, "Old Parish Registers Births and Baptisms" database, National Records of Scotland, ([https://www.scotlandspeople.gov.uk ScotlandsPeople] : accessed 29 May 2024), William Walker birth or baptism 23 Jan 1808, son of Hugh Walker and Ann Young,  citing Ref 20 / 211.</ref>`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // census
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_census_default",
    text: `In the 1851 census, Donald (age 11) was in Portnahaven, Argyll, Scotland.<ref>'''1851 Census''': "Scotland Census, 1851", National Records of Scotland, Ref: 547/ 1/ 35, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople] (accessed 13 September 2024), Surname MCKAY, Forename DONALD, Year 1851, Gender M, Age at Census 11, RD Name Portnahaven, County / City Argyll.</ref>`,
  },
  {
    // edit mode
    caseName: "sourcer_census_database_no_accessed",
    text: `In the 1851 census, Donald (age 13) was in Lairg, Sutherland, Scotland.<ref>'''1851 Census''': "Scotland Census, 1851", database, National Records of Scotland, Ref: 053/ 1/ 6, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople], Donald McKay (13) in Lairg registration district in Sutherland, Scotland.</ref>`,
  },
  {
    caseName: "sourcer_census_database_citing",
    text: `1851 Census: "Scotland Census, 1851", database, National Records of Scotland, ScotlandsPeople, Donald McKay (13) in Lairg registration district in Sutherland, Scotland; citing Ref: 053/ 1/ 6.`,
  },
  {
    caseName: "scotproj_census",
    text: `"Scottish Census Returns - 1911" database, National Records of Scotland, ScotlandsPeople (accessed 29 May 2024), Ella W. McMillan, female, age at census 2, Greenock West, Renfrew; citing Reference Number: 564/2 25/ 7.`,
  },
];

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
async function runContextTests(siteName, regressionData, testManager, optionVariants = undefined) {
  if (!testEnabled(testManager.parameters, "context")) {
    return;
  }

  let testName = siteName + "_context";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    /*
    // read in the saved data file
    let inputSubPath = "ancestry/saved_get_all_citations/" + testData.caseName;

    let savedData = readFile(inputSubPath, testData, logger);
    if (!savedData) {
      continue;
    }
    */

    let inputText = testData.text;
    if (!inputText) {
      continue;
    }

    let lcText = inputText.toLowerCase();

    let result = "";

    try {
      result = buildScotlandsPeopleContextSearchData(lcText);
    } catch (e) {
      console.log("Error:", e.stack);
      logger.logError(testData, "Exception occurred");
    }

    if (!result) {
      result = { success: false };
    }

    let resultDir = "context";

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
  } else {
    console.log("Test passed (" + testName + ").");
  }
}

async function runTests(testManager) {
  await runContextTests("scotp", regressionData, testManager);
}

export { runTests };
