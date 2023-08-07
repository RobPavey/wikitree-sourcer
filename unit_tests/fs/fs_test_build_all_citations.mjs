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
  readFile,
  getRefTextFilePath,
  getTestTextFilePath,
  writeTestOutputTextFile,
  readRefTextFile,
} from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { reportStringDiff } from "../test_utils/compare_result_utils.mjs";

import {
  filterAndEnhanceFsSourcesIntoSources,
  buildSourcerCitation,
  buildSourcerCitations,
  buildFsPlainCitations,
} from "../../extension/site/fs/core/fs_build_all_citations.mjs";

async function testGetSourcerCitation(runDate, savedData, source, type, options) {
  let uri = source.uri;

  let sourceDataObjects = savedData.sourceData[uri];

  buildSourcerCitation(runDate, sourceDataObjects, source, type, options);
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

async function fsTestGetAllCitations(input) {
  let savedData = input.savedData;
  let options = input.options;
  let runDate = input.runDate;

  let result = { success: false };

  if (savedData.fsSources) {
    result.fsSources = savedData.fsSources;

    filterAndEnhanceFsSourcesIntoSources(result, options);

    let citationType = options.addMerge_fsAllCitations_citationType;

    switch (citationType) {
      case "fsPlainInline":
        buildFsPlainCitations(result, "inline", options);
        break;
      case "fsPlainSource":
        buildFsPlainCitations(result, "source", options);
        break;
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
    let inputSubPath = "fs/saved_get_all_citations/" + testData.caseName;

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
        result = await fsTestGetAllCitations(input);
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
    caseName: "g7mj_y7w_susanna_sands",
    url: "https://www.familysearch.org/tree/person/details/G7MJ-Y7W",
    optionVariants: [
      {
        variantName: "no_include_notes",
        optionOverrides: {
          addMerge_fsAllCitations_citationType: "fsPlainSource",
          addMerge_fsAllCitations_includeNotes: false,
        },
      },
    ],
  },
  {
    // found a bug in mergeDates, has marriage sources with no date
    caseName: "k2b7_nsv_vinnie_shubert",
    url: "https://www.familysearch.org/tree/person/details/K2B7-NSV",
  },
  {
    caseName: "k2hc_86c_jeanne_lajuenesse",
    url: "https://www.familysearch.org/tree/person/details/K2HC-86C",
    optionVariants: [
      {
        variantName: "exclude_other_role_sources",
        optionOverrides: {
          addMerge_fsAllCitations_excludeOtherRoleSources: true,
        },
      },
      {
        variantName: "include_tables",
        optionOverrides: {
          table_general_autoGenerate: "afterRef",
        },
      },
    ],
  },
  {
    caseName: "kc6x_wrj_mary_hardman",
    url: "https://www.familysearch.org/tree/person/sources/KC6X-WRJ",
    optionVariants: [
      {
        variantName: "not_grouped",
        optionOverrides: {
          addMerge_fsAllCitations_groupCitations: false,
        },
      },
      {
        variantName: "no_exclude_retired_sources",
        optionOverrides: {
          addMerge_fsAllCitations_excludeRetiredSources: "never",
        },
      },
    ],
  },
  {
    caseName: "l231_r8m_harry_pavey",
    url: "https://www.familysearch.org/tree/person/details/L231-R8M",
    optionVariants: [
      {
        variantName: "not_grouped",
        optionOverrides: {
          addMerge_fsAllCitations_groupCitations: false,
        },
      },
    ],
  },
  {
    caseName: "l2q9_ylc_mary_pavey",
    url: "https://www.familysearch.org/tree/person/details/L2Q9-YLC",
    optionVariants: [
      {
        variantName: "no_external",
        optionOverrides: {
          addMerge_fsAllCitations_excludeNonFsSources: true,
        },
      },
      {
        variantName: "not_grouped",
        optionOverrides: {
          addMerge_fsAllCitations_groupCitations: false,
        },
      },
    ],
  },
  {
    caseName: "l7lt_dg1_jean_prince",
    url: "https://www.familysearch.org/tree/person/sources/L7LT-DG1",
    optionVariants: [
      {
        variantName: "no_external",
        optionOverrides: {
          addMerge_fsAllCitations_excludeNonFsSources: true,
        },
      },
    ],
  },
  {
    caseName: "ljjh_f8b_casimirus_sobczak",
    url: "https://www.familysearch.org/tree/person/details/LJJH-F8B",
    optionVariants: [
      {
        variantName: "exclude_other_role_sources",
        optionOverrides: {
          addMerge_fsAllCitations_excludeOtherRoleSources: true,
        },
      },
    ],
  },
];

const optionVariants = [
  {
    variantName: "narrative",
    optionOverrides: {
      addMerge_fsAllCitations_citationType: "narrative",
    },
  },
  {
    variantName: "inline",
    optionOverrides: {
      addMerge_fsAllCitations_citationType: "inline",
    },
  },
  {
    variantName: "source",
    optionOverrides: {
      addMerge_fsAllCitations_citationType: "source",
    },
  },
  {
    variantName: "fs_plain_inline",
    optionOverrides: {
      addMerge_fsAllCitations_citationType: "fsPlainInline",
    },
  },
  {
    variantName: "fs_plain_source",
    optionOverrides: {
      addMerge_fsAllCitations_citationType: "fsPlainSource",
    },
  },
];

async function runTests(testManager) {
  await runBuildAllCitationsTests("fs", regressionData, testManager, optionVariants);
}

export { runTests };