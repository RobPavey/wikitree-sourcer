/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { generalizeData, regeneralizeData } from "../../extension/site/youtube/core/youtube_generalize_data.mjs";
import { buildCitation } from "../../extension/site/youtube/core/youtube_build_citation.mjs";
import { buildYoutubeTemplate, parseStartTime } from "../../extension/site/youtube/core/youtube_build_template.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";
import { readInputFile, writeTestOutputFile, removeStaleOutputFiles } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";

const regressionData = [
  {
    // The playlist is one of the ones known to the WikiTree YouTube template
    caseName: "hacktoberfest_2026",
    url: "https://www.youtube.com/watch?v=fyYpCuoJEWw&list=PLEqK4ICkQWXRBBVI7xaL0AIIPck_x0TcC",
  },
  {
    // A playlist that the template doesn't know about and a start time in the URL
    caseName: "unknown_playlist_start_time",
    pageFile: "./unit_tests/youtube/saved_pages/hacktoberfest_2026.html",
    url: "https://www.youtube.com/watch?v=fyYpCuoJEWw&list=PLunknownplaylist&t=1m37s",
  },
  {
    // No playlist and a title containing characters that are special in a template
    caseName: "title_with_template_characters",
    url: "https://www.youtube.com/watch?v=1lgIQmGPAd4",
  },
  {
    // The citation is built from the channel, upload date and duration. The channel is in a template.
    caseName: "usc_shoah_franz_wohlfahrt",
    url: "https://www.youtube.com/watch?v=9WEDlSvW1KY",
    optionVariants: [
      {
        // The user enters the person in the video and asks for the start of the description
        variantName: "person",
        newData: { personName: "Franz Wohlfahrt", personAction: "interviewed", includeDescription: "yes" },
      },
    ],
  },
  {
    // No title, so the template has no link text unless it is needed to hold the place of the start time
    caseName: "no_title_with_playlist",
    url: "https://www.youtube.com/watch?v=fyYpCuoJEWw&list=PLEqK4ICkQWXRBBVI7xaL0AIIPck_x0TcC",
  },
  {
    // The head of the page is left over from a different video so its details must not be used
    caseName: "stale_page_details",
    url: "https://www.youtube.com/watch?v=fyYpCuoJEWw",
  },
];

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// Builds the template text for each test case, both without and with the start time entered by the user
async function runBuildTemplateTests(testManager) {
  if (!testEnabled(testManager.parameters, "template")) {
    return;
  }

  const siteName = "youtube";
  const testName = siteName + "_build_template";
  const resultDir = "templates";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);
  removeStaleOutputFiles(siteName, resultDir, [regressionData], logger);

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    let extractedData = readInputFile(siteName, "extracted_data", testData, logger);
    if (!extractedData) {
      continue;
    }

    let result = {
      std: buildYoutubeTemplate(extractedData),
      userStartTime: buildYoutubeTemplate(extractedData, parseStartTime("2:05")),
    };

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

async function runTests(testManager) {
  await runExtractDataTests("youtube", regressionData, testManager);

  await runGeneralizeDataTests("youtube", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation, regeneralizeData: regeneralizeData };
  await runBuildCitationTests("youtube", functions, regressionData, testManager);

  await runBuildTemplateTests(testManager);
}

export { runTests };
