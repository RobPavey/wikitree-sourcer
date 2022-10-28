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

import { buildSearchUrl } from "../../extension/site/bg/core/bg_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "agnes_c_loudon_fisher_d_1905",
    inputPath: "bg/generalized_data/ref/agnes_c_loudon_fisher_d_1905",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "c_r_bow_d_1917",
    inputPath:"bg/generalized_data/ref/c_r_bow_d_1917",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "francis_weyland_dunn_d_1874",
    inputPath:"bg/generalized_data/ref/francis_weyland_dunn_d_1874",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "hanna_delaney_fallon_d_1817",
    inputPath:"bg/generalized_data/ref/hanna_delaney_fallon_d_1817",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "isabella_crawford_d_17_dec_1948",
    inputPath:"bg/generalized_data/ref/isabella_crawford_d_17_dec_1948",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "margaret_ann_craney_d_1909",
    inputPath:"bg/generalized_data/ref/margaret_ann_craney_d_1909",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "mary_ellen_adams_d_1967",
    inputPath:"bg/generalized_data/ref/mary_ellen_adams_d_1967",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_new_logged_on",
    inputPath:"bg/generalized_data/ref/mary_ellen-hughes-adams_1879_1974_new_logged_on",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_new_not_logged_on",
    inputPath:"bg/generalized_data/ref/mary_ellen-hughes-adams_1879_1974_new_not_logged_on",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_old_logged_on",
    inputPath:"bg/generalized_data/ref/mary_ellen-hughes-adams_1879_1974_old_logged_on",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "mary_ellen-hughes-adams_1879_1974_old_not_logged_on",
    inputPath:"bg/generalized_data/ref/mary_ellen-hughes-adams_1879_1974_old_not_logged_on",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "roderick_mclennan_d_2013",
    inputPath:"bg/generalized_data/ref/roderick_mclennan_d_2013",
    typeOfSearch: "SameCollection",
  },
  {
    caseName: "thomas_moffat_29_october_new_style",
    inputPath:"bg/generalized_data/ref/thomas_moffat_29_october_new_style",
    typeOfSearch: "SameCollection",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("bg", buildSearchUrl, regressionData, testManager);
}

export { runTests };
