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

import { extractData } from "../../extension/site/baclac/core/baclac_extract_data.mjs";
import { generalizeData } from "../../extension/site/baclac/core/baclac_generalize_data.mjs";
import { buildCitation } from "../../extension/site/baclac/core/baclac_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Canada Gazette
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "canada_gazette_1869",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=cangaz&IdNumber=1888&q=John%20Smith",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Census records
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "census_1851_francois_montminy",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=23447983",
  },
  {
    caseName: "census_1861_jd_keys",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=44445788",
  },
  {
    caseName: "census_1861_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=44376755",
  },
  {
    caseName: "census_1871_docithe_grenier",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=40070185",
  },
  {
    caseName: "census_1871_pierre_kaheroton",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=38937965",
  },
  {
    caseName: "census_1881_jean_lgermain",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=21511208",
  },
  {
    caseName: "census_1881_mary_fenton",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=20567235",
  },
  {
    caseName: "census_1881_may_mckenzie",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=20538834",
  },
  {
    caseName: "census_1891_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=26261677",
  },
  {
    caseName: "census_1906_robert_macdonald",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=849292",
  },
  {
    caseName: "census_1911_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=17167476",
  },
  {
    caseName: "census_1911_marxoy_mcwattier",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=15446480",
  },
  {
    caseName: "census_1916_gertrude_folsom",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=42564419",
  },
  {
    caseName: "census_1916_star_sayura",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=42454309",
  },
  {
    caseName: "census_1921_john_smith",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=66233187",
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Military
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "military_ww1_francois_montminy",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=pffww&IdNumber=174866&q=Francois%20Montminy",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("baclac", extractData, regressionData, testManager);

  await runGeneralizeDataTests("baclac", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("baclac", functions, regressionData, testManager);
}

export { runTests };
