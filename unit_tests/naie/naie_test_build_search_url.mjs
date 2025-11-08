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

import { buildSearchUrl } from "../../extension/site/naie/core/naie_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "ireland_census_1901_margaret_kearney",
    inputPath: "ancestry/generalized_data/ref/ireland_census_1901_margaret_kearney",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      collection: "1901",
      lastNameIndex: 0,
    },
    optionVariants: [
      {
        variantName: "county",
        searchParameters: {
          collection: "1901",
          lastNameIndex: 0,
          county: "Waterford",
        },
      },
      {
        variantName: "oldSite",
        searchParameters: {
          collection: "1901",
          lastNameIndex: 0,
        },
        optionOverrides: {
          search_naie_usePre2025Site: true,
        },
      },
      {
        variantName: "oldSiteCounty",
        searchParameters: {
          collection: "1901",
          lastNameIndex: 0,
          county: "Waterford",
        },
        optionOverrides: {
          search_naie_usePre2025Site: true,
        },
      },
    ],
  },
  {
    caseName: "ireland_connors-569_read",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      collection: "1821",
      lastNameIndex: 0,
    },
    optionVariants: [
      {
        variantName: "1901Kearney",
        searchParameters: {
          collection: "1901",
          lastNameIndex: 1,
          county: "Waterford",
        },
      },
      {
        variantName: "1911Long",
        searchParameters: {
          collection: "1911",
          lastNameIndex: 2,
          county: "Waterford",
        },
      },
      {
        variantName: "1831",
        searchParameters: {
          collection: "1831",
          lastNameIndex: 0,
          county: "Antrim",
        },
      },
      {
        variantName: "oldSite1901Kearney",
        searchParameters: {
          collection: "1901",
          lastNameIndex: 1,
          county: "Waterford",
        },
        optionOverrides: {
          search_naie_usePre2025Site: true,
        },
      },
      {
        variantName: "oldSite1911Long",
        searchParameters: {
          collection: "1911",
          lastNameIndex: 2,
          county: "Waterford",
        },
        optionOverrides: {
          search_naie_usePre2025Site: true,
        },
      },
      {
        variantName: "oldSite1831",
        searchParameters: {
          collection: "1831",
          lastNameIndex: 0,
          county: "Antrim",
        },
        optionOverrides: {
          search_naie_usePre2025Site: true,
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("naie", buildSearchUrl, regressionData, testManager);
}

export { runTests };
