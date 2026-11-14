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

import { generalizeData } from "../../extension/site/ina/core/ina_generalize_data.mjs";
import { buildCitation } from "../../extension/site/ina/core/ina_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // a newspaper page opened from a search result
    caseName: "page_munster_express_1925_10_02_p6",
    url: "https://irishnewsarchive.com/?a=d&d=MEX19251002.1.6&e=-------en-20--1--img-txIN----------1-1-1-1-4-1-private---1900%252D1949----INA-mrp-all-------",
  },
  {
    // a public clipping: the page number comes from the image's page ID, not the "8" shown on the clipping
    caseName: "clipping_munster_express_1925_10_02",
    url: "https://irishnewsarchive.com/?a=clipa&command=ShowClippingEntry&clippingid=75807&e=-------en-20--1--img-txIN----------1-1-1-1-4-1-private---1900%252D1949-----mrp-all-------",
  },
  {
    // the same clipping, linking to both the clipping and the page, without the clipping title
    caseName: "clipping_munster_express_1925_10_02_both_links",
    pageFile: "./unit_tests/ina/saved_pages/clipping_munster_express_1925_10_02.html",
    url: "https://irishnewsarchive.com/?a=clipa&command=ShowClippingEntry&clippingid=75807",
    userOptions: { citation_ina_clippingLink: "both", citation_ina_includeClippingTitle: false },
  },
  {
    // someone else's public (Community) clipping, with a note; page 9, although the clipping shows 10
    caseName: "clipping_public_nationalist_1930_04_12",
    url: "https://irishnewsarchive.com/?a=clipa&command=ShowClippingEntry&clippingid=75420&e=-------en-20--1--img-txIN----------1-1-1-10-1-1-community--------mr-all-------",
  },
  {
    // a private clipping, with a note: the link says a subscription is required
    caseName: "clipping_private_munster_express_1951_05_11",
    url: "https://irishnewsarchive.com/?a=clipa&command=ShowClippingEntry&clippingid=75991&e=-------en-20--1--img-txIN----------1-1-1-1-1-1-private--------mr-all-------",
  },
  {
    // a search results page is not a record, so nothing is extracted
    caseName: "search_results_sample_text",
    url: "https://irishnewsarchive.com/?a=q&hs=1&r=1&results=1&txq=Sample+Text&puq=MEX&cnq=WD&yefq=1950&yetq=1974",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("ina", regressionData, testManager);

  // the search results page has nothing to generalize or cite, so it is only used in the extract test
  const recordData = regressionData.filter((testData) => testData.caseName != "search_results_sample_text");

  await runGeneralizeDataTests("ina", generalizeData, recordData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("ina", functions, recordData, testManager);
}

export { runTests };
