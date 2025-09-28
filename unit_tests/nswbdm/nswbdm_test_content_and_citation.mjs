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

import { extractData } from "../../extension/site/nswbdm/core/nswbdm_extract_data.mjs";
import { generalizeData } from "../../extension/site/nswbdm/core/nswbdm_generalize_data.mjs";
import { buildCitation } from "../../extension/site/nswbdm/core/nswbdm_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "birth_1852_charles_nicholson",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?3",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_nswbdm_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_listCurated",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listCurated",
        },
      },
      {
        variantName: "dataStyle_listOriginal",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listOriginal",
        },
      },
      {
        variantName: "dataStyle_listCurated_includeLink_inSourceTitle",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listCurated",
          citation_nswbdm_includeLink: "inSourceTitle",
        },
      },
    ],
  },
  {
    caseName: "birth_1911_frederick_smith",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?4",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_nswbdm_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_listCurated",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listCurated",
        },
      },
      {
        variantName: "dataStyle_listOriginal",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listOriginal",
        },
      },
    ],
  },
  {
    // has a death place different to district
    caseName: "death_1880_john_smith",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?6",
  },
  {
    caseName: "death_1888_francis_nicholson",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?24",
  },
  {
    // has a post-1974 district number
    // has hyphen in last name
    caseName: "death_1981_ian_mclaurin_smith",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?62",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_nswbdm_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_listCurated",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listCurated",
        },
      },
      {
        variantName: "dataStyle_listOriginal",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listOriginal",
        },
      },
    ],
  },
  {
    caseName: "marriage_1873_stephen_mccready",
    url: "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/result?32",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_nswbdm_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_listCurated",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listCurated",
        },
      },
      {
        variantName: "dataStyle_listOriginal",
        optionOverrides: {
          citation_nswbdm_dataStyle: "listOriginal",
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runExtractDataTests("nswbdm", extractData, regressionData, testManager);

  await runGeneralizeDataTests("nswbdm", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("nswbdm", functions, regressionData, testManager);
}

export { runTests };
