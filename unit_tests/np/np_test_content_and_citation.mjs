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

import { extractData } from "../../extension/site/np/core/np_extract_data.mjs";
import { generalizeData } from "../../extension/site/np/core/np_generalize_data.mjs";
import { buildCitation } from "../../extension/site/np/core/np_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "england_1929_arthur_pavey",
    url: "https://www.newspapers.com/clip/111121391/wedding-of-emmeline-brain-and-arthur/",
  },
  {
    caseName: "england_1929_arthur_pavey_2023_format",
    url: "https://www.newspapers.com/clip/111121391/wedding-of-emmeline-brain-and-arthur/",
  },
  {
    caseName: "us_1880_las_vegas_daily_gazette",
    url: "https://www.newspapers.com/article/daily-gazette/121899396/",
  },
  {
    caseName: "us_1908_fleetwood_guidry",
    url: "https://www.newspapers.com/clip/111420722/fleetwood-shot-his-arm-off/",
  },
  {
    // File saved for me December 2025 when format changed
    caseName: "us_1919_rose_sears_drowning",
    url: "https://www.newspapers.com/article/the-enterprise-and-vermonter-rose-garra/186692258/",
  },
  {
    caseName: "us_1929_macon_missouri",
    url: "https://www.newspapers.com/article/116219279/tom-turners-sons-visit/",
  },
  {
    caseName: "us_1967_pauline_chavez_obit",
    url: "https://www.newspapers.com/article/albuquerque-journal-obituary-for-pauline/121970302/",
  },
  {
    caseName: "us_1972_whittemore_leib_obit",
    url: "https://www.newspapers.com/article/the-day-obituary-for-whittemore-leib/133180369/",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("np", extractData, regressionData, testManager);
  await runGeneralizeDataTests("np", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("np", functions, regressionData, testManager);
}

export { runTests };
