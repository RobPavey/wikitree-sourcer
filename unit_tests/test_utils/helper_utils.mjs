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

import { readRefFile, createRefFile, getRefFilePath, getTestFilePath } from "./ref_file_utils.mjs";
import { deepObjectEquals } from "./compare_result_utils.mjs";

function compareOrReplaceRefFileWithResult(result, siteName, testManager, resultDir, testData, logger) {
  if (testManager.parameters.forceReplaceRefs) {
    let refPath = getRefFilePath(siteName, resultDir, testData);
    console.log("Force replacing ref file: " + refPath);
    createRefFile(result, siteName, resultDir, testData, logger);
  } else {
    // read in the reference result
    let refObject = readRefFile(result, siteName, resultDir, testData, logger);
    if (!refObject) {
      // ref file didn't exist it will have been created now
      return;
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
}

export { compareOrReplaceRefFileWithResult };
