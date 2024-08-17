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
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

function JSONstringifySorted(object, space) {
  var allKeys = [];
  var seen = {};
  JSON.stringify(object, function (key, value) {
    if (!(key in seen)) {
      allKeys.push(key);
      seen[key] = null;
    }
    return value;
  });
  allKeys.sort();
  return JSON.stringify(object, allKeys, space);
}

function createFolderPathIfNeeded(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function createFolderIfNeeded(type, siteName, dataDir) {
  let folderName = "./unit_tests/" + siteName;
  createFolderPathIfNeeded(folderName);

  folderName += "/" + dataDir;
  createFolderPathIfNeeded(folderName);

  folderName += "/" + type;
  createFolderPathIfNeeded(folderName);
}

function getRefOrTestFilePath(type, siteName, dataDir, testData) {
  let fileName = testData.caseName;
  return "./unit_tests/" + siteName + "/" + dataDir + "/" + type + "/" + fileName + ".json";
}

function getRefFilePath(siteName, dataDir, testData) {
  return getRefOrTestFilePath("ref", siteName, dataDir, testData);
}

function getTestFilePath(siteName, dataDir, testData) {
  return getRefOrTestFilePath("test", siteName, dataDir, testData);
}

function getRefOrTestTextFilePath(type, siteName, dataDir, testData, variantName = "") {
  let fileName = testData.caseName;
  if (variantName) {
    fileName += "_" + variantName;
  }
  return "./unit_tests/" + siteName + "/" + dataDir + "/" + type + "/" + fileName + ".txt";
}

function getRefTextFilePath(siteName, dataDir, testData, variantName = "") {
  return getRefOrTestTextFilePath("ref", siteName, dataDir, testData, variantName);
}

function getTestTextFilePath(siteName, dataDir, testData, variantName = "") {
  return getRefOrTestTextFilePath("test", siteName, dataDir, testData, variantName);
}

function writeTestOutputFile(testResultObject, siteName, dataDir, testData, logger) {
  createFolderIfNeeded("test", siteName, dataDir);

  // write out result file.
  let resultPath = getTestFilePath(siteName, dataDir, testData);
  // We do not sort this because the order of some arrays (like recordData in Ancestry extractedData) affects citations
  let resultJsonString = JSON.stringify(testResultObject, null, 2);
  try {
    fs.writeFileSync(resultPath, resultJsonString, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    logger.logError(testData, "Failed to write output test file: " + resultPath);
    return false;
  }

  return true;
}

function writeTestOutputTextFile(testResultText, siteName, dataDir, testData, variantName, logger) {
  createFolderIfNeeded("test", siteName, dataDir);

  // write out result file.
  let resultPath = getTestTextFilePath(siteName, dataDir, testData, variantName);
  try {
    fs.writeFileSync(resultPath, testResultText, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    logger.logError(testData, "Failed to write output test file: " + resultPath);
    return false;
  }

  return true;
}

function createRefFile(testResultObject, siteName, dataDir, testData, logger) {
  createFolderIfNeeded("ref", siteName, dataDir);

  // write out result file.
  let resultPath = getRefFilePath(siteName, dataDir, testData);
  // We do not sort this because the order of some arrays (like recordData in Ancestry extractedData) affects citations
  let resultJsonString = JSON.stringify(testResultObject, null, 2);
  try {
    fs.writeFileSync(resultPath, resultJsonString, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    logger.logError(testData, "Failed to create ref file: " + resultPath);
    return false;
  }

  return true;
}

function createRefTextFile(testResultText, siteName, dataDir, testData, variantName = "", logger) {
  createFolderIfNeeded("ref", siteName, dataDir);

  // write out result file.
  let resultPath = getRefTextFilePath(siteName, dataDir, testData, variantName);
  try {
    fs.writeFileSync(resultPath, testResultText, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    logger.logError(testData, "Failed to create ref file: " + resultPath);
    return false;
  }

  return true;
}

function readFile(inputSubPath, testData, logger) {
  // read in the input result
  let inputPath = "./unit_tests/" + inputSubPath + ".json";
  var inputText;
  try {
    inputText = fs.readFileSync(inputPath, "utf8");
  } catch (e) {
    //console.log('Error:', e.stack);
    logger.logError(testData, "Failed to read input file: " + inputPath);
    return undefined;
  }
  let inputObject = JSON.parse(inputText);
  return inputObject;
}

function readRefFile(initData, siteName, dataDir, testData, logger) {
  // read in the reference result
  let refPath = getRefFilePath(siteName, dataDir, testData);
  var refText;
  try {
    refText = fs.readFileSync(refPath, "utf8");
  } catch (e) {
    //console.log('Error:', e.stack);
    console.log("Creating ref file: " + refPath);
    createRefFile(initData, siteName, dataDir, testData, logger);
    return undefined;
  }
  let refObject = JSON.parse(refText);
  return refObject;
}

function readRefTextFile(initText, siteName, dataDir, testData, variantName, logger) {
  // read in the reference result
  let refPath = getRefTextFilePath(siteName, dataDir, testData, variantName);
  var refText;
  try {
    refText = fs.readFileSync(refPath, "utf8");
    // attempt to fix issues with \r\n line endings in Windows
    refText = refText.replace(/\r\n/g, "\n");
    refText = refText.replace(/\r/g, "\n");
  } catch (e) {
    //console.log('Error:', e.stack);
    console.log("Creating ref file: " + refPath);
    createRefTextFile(initText, siteName, dataDir, testData, variantName, logger);
    return undefined;
  }
  return refText;
}

function readInputFile(siteName, dataDir, testData, logger) {
  let inputSubPath = siteName + "/" + dataDir + "/ref/" + testData.caseName;
  if (testData.inputPath) {
    inputSubPath = testData.inputPath;
  }

  return readFile(inputSubPath, testData, logger);
}

export {
  writeTestOutputFile,
  readRefFile,
  readInputFile,
  readFile,
  getRefFilePath,
  getTestFilePath,
  getRefTextFilePath,
  getTestTextFilePath,
  writeTestOutputTextFile,
  readRefTextFile,
};
