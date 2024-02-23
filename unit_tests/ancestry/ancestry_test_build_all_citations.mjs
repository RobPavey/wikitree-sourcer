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

import jsdom from "jsdom";
const { JSDOM } = jsdom;

import {
  readFile,
  getRefTextFilePath,
  getTestTextFilePath,
  writeTestOutputTextFile,
  readRefTextFile,
} from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { reportStringDiff } from "../test_utils/compare_result_utils.mjs";

import {
  generalizeData,
  regeneralizeDataWithLinkedRecords,
} from "../../extension/site/ancestry/core/ancestry_generalize_data.mjs";
import { extractData } from "../../extension/site/ancestry/core/ancestry_extract_data.mjs";

import {
  buildSourcerCitation,
  buildSourcerCitations,
} from "../../extension/site/ancestry/core/ancestry_build_all_citations.mjs";

function testLinkedHouseholdRecords(source, savedData) {
  let linkedRecords = [];
  let headings = source.extractedData.household.headings;
  for (let member of source.extractedData.household.members) {
    if (member.recordId && member.link && source.extractedData.recordId != member.recordId) {
      if (!member.isClosed) {
        // waste of time fetching closed record pages
        let name = member["Household Members"];
        if (!name) {
          name = member["Household Member(s)"];
        }
        if (!name) {
          name = member["Name"];
        }
        if (!name && headings.length > 0) {
          let nameHeading = headings[0];
          if (nameHeading) {
            name = member[nameHeading];
          }
        }
        if (!name) {
          name = "Unknown name";
        }
        linkedRecords.push({ link: member.link, name: name });
      }
    }
  }

  if (linkedRecords.length > 0) {
    for (let linkedRecord of linkedRecords) {
      let htmlText = savedData.recordHtml[linkedRecord.link];
      if (htmlText) {
        linkedRecord.extractedData = extractDataFromHtml(htmlText, linkedRecord.link);
      }
    }
    source.linkedRecords = linkedRecords;
  }
}

function testFetchedLinkData(source, savedData) {
  let linkData = source.extractedData.linkData;

  let role = source.generalizedData.role;

  let linkedRecords = [];

  if (linkData && role) {
    // there is a role so this is not the primary person.
    if (role == "Parent") {
      let childLink = linkData["Child"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Child",
        });
      }
    } else if (role == "Child") {
      let fatherLink = linkData["Father"];
      if (fatherLink) {
        linkedRecords.push({
          link: fatherLink,
          name: "Father",
        });
      }
      let motherLink = linkData["Mother"];
      if (motherLink) {
        linkedRecords.push({
          link: motherLink,
          name: "Mother",
        });
      }
    } else if (role == "Sibling") {
      let childLink = linkData["Siblings"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Siblings",
        });
      }
    } else if (role == "Spouse") {
      let childLink = linkData["Spouse"];
      if (childLink) {
        linkedRecords.push({
          link: childLink,
          name: "Spouse",
        });
      }
    }
  } else if (source.extractedData.household && role) {
    if (source.extractedData.household.members.length > 1) {
      let primaryMember = source.extractedData.household.members[0];
      if (primaryMember.link) {
        linkedRecords.push({
          link: primaryMember.link,
          name: "Primary person",
        });
      }
    }
  }

  if (linkedRecords.length > 0) {
    for (let linkedRecord of linkedRecords) {
      let htmlText = savedData.recordHtml[linkedRecord.link];
      if (htmlText) {
        source.extractedData = extractDataFromHtml(htmlText, linkedRecord.link);
      }
    }
    source.linkedRecords = linkedRecords;
  }
}

function extractDataFromHtml(htmlText, url) {
  let dom = undefined;

  try {
    dom = new JSDOM(htmlText);
  } catch (e) {
    console.log("Error:", e.stack);
    logger.logError(testData, "Failed to read input file");
    return undefined;
  }
  const doc = dom.window.document;

  let result = undefined;
  try {
    result = extractData(doc, url);
  } catch (e) {
    console.log("Error:", e.stack);
    logger.logError(testData, "Exception occurred");
    return undefined;
  }
  return result;
}

async function testGetSourcerCitation(runDate, savedData, source, type, options) {
  let uri = source.recordUrl;

  source.htmlText = savedData.recordHtml[uri];
  source.sharingDataObj = savedData.recordSharingObj[uri];

  source.extractedData = extractDataFromHtml(source.htmlText, uri);
  if (!source.extractedData) {
    return;
  }
  source.generalizedData = generalizeData({ extractedData: source.extractedData });

  if (source.extractedData.household) {
    testLinkedHouseholdRecords(source, savedData);
  }
  testFetchedLinkData(source, savedData);

  if (source.linkedRecords) {
    regeneralizeDataWithLinkedRecords(source);
  }

  buildSourcerCitation(runDate, source, type, options);
}

async function testGetSourcerCitations(runDate, savedData, result, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    return;
  }

  for (let source of result.sources) {
    await testGetSourcerCitation(runDate, savedData, source, type, options);
  }

  buildSourcerCitations(result, type, options);
}

async function ancestryTestGetAllCitations(input) {
  let savedData = input.savedData;
  let options = input.options;
  let runDate = input.runDate;
  let url = input.url;

  let result = { success: false };

  if (savedData.extractedData) {
    let ed = savedData.extractedData;
    let sourceIds = ed.sources;
    if (!sourceIds || sourceIds.length == 0) {
      result.errorMessage = "No sources for person";
      return result;
    }

    let urlStart = url.replace(/^(https?\:\/\/[^\.\.]+\.ancestry\.[^\/]+)\/.*$/, "$1");
    if (!urlStart || urlStart == url) {
      result.errorMessage = "Could not parse url: " + personUrl;
      return result;
    }

    result.sources = [];

    for (let sourceId of sourceIds) {
      let recordUrl = urlStart + "/discoveryui-content/view/" + sourceId.recordId + ":" + sourceId.dbId;
      let source = {
        recordUrl: recordUrl,
        title: sourceId.title,
      };
      result.sources.push(source);
    }

    let citationType = options.buildAll_ancestry_citationType;

    switch (citationType) {
      case "narrative":
      case "inline":
      case "source":
        await testGetSourcerCitations(runDate, savedData, result, citationType, options);
        break;
    }
  }
  return result;
}

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
// Each object having the keys: "PageFile" and "extractedData"
async function runBuildAllCitationsTests(siteName, regressionData, testManager, optionVariants = undefined) {
  if (!testEnabled(testManager.parameters, "build_all_citations")) {
    return;
  }

  let testName = siteName + "_build_all_citations";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    // read in the saved data file
    let inputSubPath = "ancestry/saved_get_all_citations/" + testData.caseName;

    let savedData = readFile(inputSubPath, testData, logger);
    if (!savedData) {
      continue;
    }

    let userOptions = testManager.options;
    if (testData.userOptions) {
      // use spread operator to merge the default options and the ones from testData
      userOptions = { ...userOptions, ...testData.userOptions };
    }

    // to save setting the run date on every test case
    if (!testData.runDate) {
      testData.runDate = new Date("20 July 2023");
    }

    const input = {
      savedData: savedData,
      runDate: testData.runDate,
      url: testData.url,
    };

    let result = "";

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
      let variantName = variant.variantName;
      // use spread operator to merge the base options and the ones from the variant
      input.options = { ...userOptions, ...variant.optionOverrides };

      try {
        result = await ancestryTestGetAllCitations(input);
      } catch (e) {
        console.log("Error:", e.stack);
        logger.logError(testData, "Exception occurred");
      }

      let resultDir = "build_all_citations";

      // write out result file.
      if (!writeTestOutputTextFile(result.citationsString, siteName, resultDir, testData, variantName, logger)) {
        continue;
      }

      testManager.results.totalTestsRun++;

      // read in the reference result
      let refText = readRefTextFile(result.citationsString, siteName, resultDir, testData, variantName, logger);
      if (!refText) {
        continue;
      }

      if (refText != result.citationsString) {
        reportStringDiff(refText, result.citationsString);
        console.log("Result differs from reference. Result is:");
        console.log(result);
        let refFile = getRefTextFilePath(siteName, resultDir, testData, variantName);
        let testFile = getTestTextFilePath(siteName, resultDir, testData, variantName);
        logger.logError(testData, "Result differs from reference", refFile, testFile);
      }
    }
  }

  if (logger.numFailedTests > 0) {
    console.log("Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
  } else {
    console.log("Test passed (" + testName + ").");
  }
}

const regressionData = [
  {
    // was causing a bug in mergeParents because one set of parents had father and mother and
    // another had only mother
    caseName: "william_whiting_1864_1940",
    url: "https://www.ancestry.com/family-tree/person/tree/86808578/person/262551329535/facts",
    userOptions: {
      citation_ancestry_dataStyle: "string",
      table_general_autoGenerate: "afterRef",
      table_table_fullWidth: true,
    },
  },
];

const optionVariants = [
  {
    variantName: "narrative",
    optionOverrides: {
      buildAll_ancestry_citationType: "narrative",
    },
  },
  {
    variantName: "inline",
    optionOverrides: {
      buildAll_ancestry_citationType: "inline",
    },
  },
  {
    variantName: "source",
    optionOverrides: {
      buildAll_ancestry_citationType: "source",
    },
  },
];

async function runTests(testManager) {
  await runBuildAllCitationsTests("ancestry", regressionData, testManager, optionVariants);
}

export { runTests };