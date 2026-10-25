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

import { generalizeData } from "../../extension/site/wol/core/wol_generalize_data.mjs";
import { buildCitation } from "../../extension/site/wol/core/wol_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // a life story ("As told by") in The Watchtower
    caseName: "article_w78_deliverance_max_liebster",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/1978726",
  },
  {
    // the same kind of article in the German library
    caseName: "article_de_w78_befreit_max_liebster",
    url: "https://wol.jw.org/de/wol/d/r10/lp-x/1978726",
  },
  {
    // an article in Awake!
    caseName: "article_g93_oh_jehovah_keep_my_young_girl_faithful",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/101993684",
  },
  {
    caseName: "article_w85_my_familys_love_for_god",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/1985644",
  },
  {
    // a part of a yearbook
    caseName: "book_yb74_part_2_germany",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/301974005",
  },
  {
    // a chapter of a book
    caseName: "book_jv_chap22_part_3",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/1101993029",
  },
  {
    // an entry in an index
    caseName: "index_germany_nazi",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/1200272375",
  },
  {
    // an article on a page that is not in a magazine or book
    caseName: "article_mrt_kusserow_family_archive",
    url: "https://wol.jw.org/en/wol/d/r1/lp-e/504000020",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("wol", regressionData, testManager);

  await runGeneralizeDataTests("wol", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("wol", functions, regressionData, testManager);
}

export { runTests };
