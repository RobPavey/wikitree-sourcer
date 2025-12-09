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

import { getUnitTestOptions } from "../extension/base/core/options/options_database.mjs";

// Register all test modules, this is the order that they will be run in
const siteNames = [
  "ameranc",
  "ancestry",
  "archion",
  "archive",
  "baclac",
  "bg",
  "cwgc",
  "eggsabdm",
  "eggsagrvs",
  "fg",
  "fmp",
  "freebmd",
  "freecen",
  "freereg",
  "fs",
  "gbooks",
  "geneteka",
  "gro",
  "hathi",
  "irishg",
  "jstor",
  "matricula",
  "mh",
  "naie",
  "nswbdm",
  "nli",
  "noda",
  "np",
  "npa",
  "nsvr",
  "nzash",
  "nzbdm",
  "opccorn",
  "openarch",
  "ppnz",
  "psuk",
  "scotp",
  "taslib",
  "thegen",
  "trove",
  "vicbdm",
  "wiewaswie",
  "wikipedia",
  "wikitree",
  "mdz",
  "dfgviewer",
  "basrhin",
  "arolsenarchives",
  "sosmogov",
  "doew",
  "yadvashem",
  "ushmm",
  "morbihan",
];

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

  let args = process.argv.slice(2);
  let argFlags = [];
  let argValues = [];
  for (let arg of args) {
    if (arg[0] == "-") {
      argFlags.push(arg);
    } else {
      argValues.push(arg);
    }
  }

  if (argValues.length > 0) {
    parameters.testSuiteName = argValues[0];
    if (argValues.length > 1) {
      parameters.testName = argValues[1];
      if (argValues.length > 2) {
        parameters.testCaseName = argValues[2];
      }
    }
  }

  for (let argFlag of argFlags) {
    if ((argFlag = "-force")) {
      parameters.forceReplaceRefs = true;
    }
  }

  if (parameters.testSuiteName && !siteNames.includes(parameters.testSuiteName)) {
    console.log("Error: site name '" + parameters.testSuiteName + "' is not recognized.");
    return;
  }

  let options = await getUnitTestOptions();
  let testManager = {
    parameters: parameters,
    options: options,
    results: results,
  };

  for (let siteName of siteNames) {
    if (testSuiteEnabled(parameters, siteName)) {
      let testFileName = "../unit_tests/" + siteName + "/" + siteName + "_test.mjs";
      let testModule = await import(testFileName);
      if (testModule) {
        await testModule.runTests(testManager);
      }
    }
  }

  if (results.totalTestsRun == 0) {
    console.log("Error: those parameters resulted in no tests being run.");
    return;
  }

  // Report the test results
  if (results.numFailedTests == 0) {
    if (parameters.forceReplaceRefs) {
      console.log("++++ Ref files were force replaced ++++");
    } else {
      console.log("++++ All tests passed ++++");
    }
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
