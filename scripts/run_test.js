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

import { testRegistry } from "../unit_tests/test_utils/test_registry.mjs";
import { getUnitTestOptions } from "../extension/base/core/options/options_database.mjs";

// Register all test modules, this is the order that they will be run in
import "../unit_tests/ancestry/ancestry_test.mjs";
import "../unit_tests/baclac/baclac_test.mjs";
import "../unit_tests/bg/bg_test.mjs";
import "../unit_tests/cwgc/cwgc_test.mjs";
import "../unit_tests/fg/fg_test.mjs";
import "../unit_tests/fmp/fmp_test.mjs";
import "../unit_tests/freebmd/freebmd_test.mjs";
import "../unit_tests/freecen/freecen_test.mjs";
import "../unit_tests/freereg/freereg_test.mjs";
import "../unit_tests/fs/fs_test.mjs";
import "../unit_tests/geneteka/geneteka_test.mjs";
import "../unit_tests/gro/gro_test.mjs";
import "../unit_tests/irishg/irishg_test.mjs";
import "../unit_tests/naie/naie_test.mjs";
import "../unit_tests/nli/nli_test.mjs";
import "../unit_tests/np/np_test.mjs";
import "../unit_tests/ppnz/ppnz_test.mjs";
import "../unit_tests/psuk/psuk_test.mjs";
import "../unit_tests/scotp/scotp_test.mjs";
import "../unit_tests/trove/trove_test.mjs";
import "../unit_tests/wikitree/wikitree_test.mjs";
import "../unit_tests/opccorn/opccorn_test.mjs";
import "../unit_tests/wiewaswie/wiewaswie_test.mjs";
import "../unit_tests/openarch/openarch_test.mjs";
import "../unit_tests/wikipedia/wikipedia_test.mjs";

function testSuiteEnabled(parameters, testSuiteName) {
  return parameters.testSuiteName == "" || parameters.testSuiteName == testSuiteName;
}

async function runTests() {
  // results is an object that builds up the test results
  // it contains an array of objects (allTests), each has a test name and whether it passed
  let results = {
    totalTestsRun: 0,
    numFailedTests: 0,
    allTests: [],
  };

  let parameters = {
    testSuiteName: "",
    testName: "",
    testCaseName: "",
  };

  if (process.argv.length > 2) {
    parameters.testSuiteName = process.argv[2];
    if (process.argv.length > 3) {
      parameters.testName = process.argv[3];
      if (process.argv.length > 4) {
        parameters.testCaseName = process.argv[4];
      }
    }
  }

  let options = getUnitTestOptions();
  let testManager = {
    parameters: parameters,
    options: options,
    results: results,
  };

  // go through all the registered tests and run the tests if enabled
  for (let siteTest of testRegistry) {
    if (testSuiteEnabled(parameters, siteTest.siteName)) {
      await siteTest.testFunction(testManager);
    }
  }

  // Report the test results
  if (results.numFailedTests == 0) {
    console.log("++++ All tests passed ++++");
  } else {
    console.log("#### TESTS FAILED ####");
    for (let result of results.allTests) {
      if (!result.succeeded) {
        let message = "FAILED: " + result.testSuite + " in test: " + result.test;
        message += " (" + result.cause + ")";
        console.log(message);
        if (result.refFile && result.testFile) {
          console.log("  ref file: " + result.refFile);
          console.log("  test file: " + result.testFile);
        }
      }
    }
  }
}

runTests();
