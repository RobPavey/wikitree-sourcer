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

import { buildSearchUrl } from "../../extension/site/fs/core/fs_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "craft-31_read",
    inputPath: "wikitree/generalized_data/ref/craft-31_read",
  },
  {
    caseName: "pavey-451_wikitree",
    inputPath: "wikitree/generalized_data/ref/pavey-451_read",
    optionVariants: [
      {
        variantName: "specified_parameters",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          father: true,
        },
      },
    ],
  },
  {
    caseName: "pavey-342_wikitree",
    inputPath: "wikitree/generalized_data/ref/pavey-342_edit",
    optionVariants: [
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "EnglandAndWalesCensus1871",
        },
      },
    ],
  },
  {
    // This one has an entry in the testDataCache
    caseName: "handford-3_ancestry",
    inputPath: "ancestry/generalized_data/ref/england_death_reg_handford-3",
    useDataCache: true,
    optionVariants: [
      {
        variantName: "same_collection",
        typeOfSearch: "SameCollection",
      },
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "EnglandAndWalesDeathReg",
        },
      },
    ],
  },
  {
    caseName: "davey-2737_private_wikitree",
    inputPath: "wikitree/generalized_data/ref/davey-2737_private",
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
  {
    caseName: "pavey-507_wikitree",
    inputPath: "wikitree/generalized_data/ref/pavey-507_private",
    optionVariants: [
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "UsCensus1870",
        },
      },
    ],
  },
  {
    caseName: "us_federal_census_1860_charles_pavey_ancestry",
    inputPath: "ancestry/generalized_data/ref/us_federal_census_1860_charles_pavey",
    optionVariants: [
      {
        variantName: "specified_collection",
        typeOfSearch: "SpecifiedCollection",
        searchParameters: {
          collectionWtsId: "UsCensus1860",
        },
      },
    ],
  },
  {
    // To test no marriage location when user is manager
    caseName: "saulnier-848_manager_no_marriage_location_2025",
    inputPath: "wikitree/generalized_data/ref/saulnier-848_manager_no_marriage_location_2025",
  },
  {
    // To test treeref parameter added for fs profiles
    caseName: "xx_profile_alice_pavey_1860_1939",
    inputPath: "fs/generalized_data/ref/xx_profile_alice_pavey_1860_1939",
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("fs", buildSearchUrl, regressionData, testManager);
}

export { runTests };
