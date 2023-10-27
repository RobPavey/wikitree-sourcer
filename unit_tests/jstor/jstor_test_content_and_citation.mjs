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

import { extractData } from "../../extension/site/jstor/core/jstor_extract_data.mjs";
import { generalizeData } from "../../extension/site/jstor/core/jstor_generalize_data.mjs";
import { buildCitation } from "../../extension/site/jstor/core/jstor_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "american_historical_review_preview",
    url: "https://www.jstor.org/stable/1843569",
  },
  {
    caseName: "book_chap_preserving_nations_zeal",
    url: "https://www.jstor.org/stable/10.1163/j.ctvbqs5nk.31?searchText=Dugdale%27&searchUri=%2Faction%2FdoBasicSearch%3FQuery%3DDugdale%2527&ab_segments=0%2Fbasic_search_gsv2%2Fcontrol&refreqid=fastly-default%3Ab209ad1a9e68bba2d6181fe7370af661",
  },
  {
    caseName: "furniture_history_journal",
    url: "https://www.jstor.org/stable/23409273",
  },
  {
    caseName: "kellys_directory_yorkshire_1893",
    url: "https://www.jstor.org/stable/community.30136203?searchText=Dugdale%27s+Visitation+of+Yorkshire%2C+with+additions&searchUri=%2Faction%2FdoBasicSearch%3FQuery%3DDugdale%2527s%2BVisitation%2Bof%2BYorkshire%252C%2Bwith%2Badditions&ab_segments=0%2Fbasic_search_gsv2%2Fcontrol&refreqid=fastly-default%3Ae7fc12ee1cafad3114b485e839f2d576&seq=7",
  },
  {
    caseName: "remarks_shakespeare_1818_book",
    url: "https://www.jstor.org/stable/community.35012730?searchText=Oldcastle&searchUri=%2Faction%2FdoBasicSearch%3FQuery%3DOldcastle%26acc%3Don%26efqs%3DeyJjdHkiOlsiWTI5dWRISnBZblYwWldSZlltOXZhM009Il19&ab_segments=0%2Fbasic_search_gsv2%2Fcontrol&refreqid=fastly-default%3Ab40378ffe324c40203df7e267d4c6298",
  },
  {
    // has no seq number in URL but can scroll through pages - see page count at top
    caseName: "virginia_history_journal_1915",
    url: "https://www.jstor.org/stable/4243451",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("jstor", extractData, regressionData, testManager);

  await runGeneralizeDataTests("jstor", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("jstor", functions, regressionData, testManager);
}

export { runTests };
