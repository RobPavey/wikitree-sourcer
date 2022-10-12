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

import { buildSearchData } from "../../extension/site/freecen/core/freecen_build_search_data.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "dickens-1530_private",
    inputPath: "wikitree/generalized_data/ref/dickens-1530_private",
    optionVariants: [
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "EnglandAndWalesCensus1921",
        },
      },
    ],
  },
  {
    caseName: "ellacott-59_read",
    inputPath: "wikitree/generalized_data/ref/ellacott-59_read",
  },
  {
    caseName: "handford-3_read",
    inputPath: "wikitree/generalized_data/ref/handford-3_read",
  },
  {
    caseName: "littlemore-13_read",
    inputPath: "wikitree/generalized_data/ref/littlemore-13_read",
  },
  {
    caseName: "pavey-451_read",
    inputPath: "wikitree/generalized_data/ref/pavey-451_read",
  },
  {
    caseName: "pavey-507_private",
    inputPath: "wikitree/generalized_data/ref/pavey-507_private",
    optionVariants: [
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "EnglandWalesAndScotlandCensus1851", // exact date is close to a marriage date
        },
      },
    ],
  },
  {
    caseName: "england_census_1881_searle-38",
    inputPath: "ancestry/generalized_data/ref/england_census_1881_searle-38",
    optionVariants: [
      {
        variantName: "same_collection",
        typeOfSearch: "SameCollection",
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("freecen", buildSearchData, regressionData, testManager);
}

export { runTests };
