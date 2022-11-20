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

import { extractData } from "../../extension/site/geneteka/core/geneteka_extract_data.mjs";
import { generalizeData } from "../../extension/site/geneteka/core/geneteka_generalize_data.mjs";
import { buildCitation } from "../../extension/site/geneteka/core/geneteka_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "births_wiech",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=B&w=07mz&rid=B&search_lastname=wi%C4%99ch&search_name=Pawe%C5%82&search_lastname2=&search_name2=&from_date=1876&to_date=&exac=1",
  },
  {
    caseName: "births_mazur",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=B&w=13sk&rid=B&search_lastname=mazur&search_name=&search_lastname2=&search_name2=&from_date=1911&to_date=&exac=1&parents=1",
  },
  {
    caseName: "births_ozimek",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=B&w=07mz&rid=B&search_lastname=ozimek&search_name=j%C3%B3zef&search_lastname2=&search_name2=&from_date=1706&to_date=&exac=1",
  },
  {
    caseName: "deaths_nowakowska",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=D&w=07mz&rid=D&search_lastname=nowakowska&search_name=aleksandra&search_lastname2=&search_name2=&from_date=&to_date=&exac=1&parents=1",
  },
  {
    caseName: "deaths_wojtacha",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=D&w=13sk&rid=D&search_lastname=wojtacha&search_name=jan&search_lastname2=&search_name2=&from_date=1896&to_date=&exac=1&parents=1",
  },
  {
    caseName: "marriages_janczuk",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=S&w=07mz&rid=S&search_lastname=janczuk&search_name=&search_lastname2=&search_name2=&from_date=1811&to_date=",
  },
  {
    caseName: "marriages_stasiuk",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=S&w=07mz&rid=S&search_lastname=stasiuk&search_name=&search_lastname2=&search_name2=&from_date=1829&to_date=",
  },
  {
    caseName: "marriages_stolarczyk",
    url: "https://geneteka.genealodzy.pl/index.php?op=gt&lang=pol&bdm=S&w=07mz&rid=S&search_lastname=stolarczyk&search_name=katarzyna&search_lastname2=wi%C4%99ch&search_name2=&from_date=1922&to_date=1922&rpp1=&ordertable=",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("geneteka", extractData, regressionData, testManager);

  await runGeneralizeDataTests("geneteka", generalizeData, regressionData, testManager);

  await runBuildCitationTests("geneteka", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
