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

import { buildSearchData } from "../../extension/site/scotp/core/scotp_build_search_data.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "scotland_birth_1842_christian_mcleod",
    inputPath: "ancestry/generalized_data/ref/scotland_birth_1842_christian_mcleod",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "church",
      subcategory: "opr_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "noFather",
        searchParameters: {
          category: "church",
          subcategory: "opr_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: true,
        },
      },
      {
        variantName: "noMother",
        searchParameters: {
          category: "church",
          subcategory: "opr_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: false,
        },
      },
      {
        variantName: "noParents",
        searchParameters: {
          category: "church",
          subcategory: "opr_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
      {
        variantName: "birthRange10",
        searchParameters: {
          category: "church",
          subcategory: "opr_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
        optionOverrides: { search_scotp_birthYearExactness: 10 },
      },
      {
        variantName: "searchDeath",
        searchParameters: {
          category: "church",
          subcategory: "opr_deaths",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
    ],
  },
  {
    caseName: "ancestry_scotland_census_1861_james_fraser",
    inputPath: "ancestry/generalized_data/ref/scotland_census_1861_james_fraser",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "census",
      subcategory: "census",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: false,
      mother: false,
    },
    optionVariants: [
      {
        variantName: "oprBirth",
        searchParameters: {
          category: "church",
          subcategory: "opr_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
    ],
  },
  {
    caseName: "scotland_wikitree_profile_winifred_gow",
    inputPath: "wikitree/generalized_data/ref/gow-822_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "statutory",
      subcategory: "stat_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "rc_baptism",
        searchParameters: {
          category: "church",
          subcategory: "cr_baptisms",
          lastNameIndex: 0,
          spouseIndex: 0,
          father: false,
          mother: true,
        },
      },
      {
        variantName: "stat_death",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_deaths",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: true,
        },
      },
      {
        variantName: "stat_marriage",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_marriages",
          lastNameIndex: 0,
          spouseIndex: 0,
          father: false,
          mother: true,
        },
      },
      {
        // search with no spouse - should have a date range starting age 15
        variantName: "stat_marriage_no_spouse",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_marriages",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
      {
        variantName: "valuation",
        searchParameters: {
          category: "valuation",
          subcategory: "valuation_rolls",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: true,
        },
      },
      {
        variantName: "prison",
        searchParameters: {
          category: "prison",
          subcategory: "prison_records",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: true,
        },
      },
    ],
  },
  {
    caseName: "scotland_wikitree_profile_christian_peffers",
    inputPath: "wikitree/generalized_data/ref/peffers-331_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "statutory",
      subcategory: "stat_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "stat_marriage", // Note Forfar has to be changed to Angus
        searchParameters: {
          category: "statutory",
          subcategory: "stat_marriages",
          lastNameIndex: 0,
          spouseIndex: 0,
          father: false,
          mother: true,
        },
      },
      {
        variantName: "wills_testaments",
        searchParameters: {
          category: "legal",
          subcategory: "wills_testaments",
          lastNameIndex: 1,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
    ],
  },
  {
    caseName: "wikitree_louisa_black",
    inputPath: "wikitree/generalized_data/ref/black-16695_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "statutory",
      subcategory: "stat_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "exactDate",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
        optionOverrides: {
          search_scotp_birthYearExactness: 0,
        },
      },
    ],
  },
  {
    caseName: "fs_scotland_baptism_1854_david_hunter",
    inputPath: "fs/generalized_data/ref/scotland_baptism_1854_david_hunter",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "statutory",
      subcategory: "stat_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "exactDate",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
        optionOverrides: {
          search_scotp_birthYearExactness: 0,
        },
      },
    ],
  },
  {
    caseName: "fs_scotland_birth_1881_alexander_hardie",
    inputPath: "fs/generalized_data/ref/scotland_birth_1881_alexander_hardie",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "statutory",
      subcategory: "stat_births",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
    optionVariants: [
      {
        variantName: "exactDate",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "statutory",
          subcategory: "stat_births",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
        optionOverrides: {
          search_scotp_birthYearExactness: 0,
        },
      },
      {
        variantName: "census1891",
        typeOfSearch: "SpecifiedParameters",
        searchParameters: {
          category: "census",
          subcategory: "census",
          collection: "1891",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: false,
          mother: false,
        },
      },
    ],
  },
  {
    caseName: "scotp_census_lds_1881_adam_fraser",
    inputPath: "scotp/generalized_data/ref/census_lds_1881_adam_fraser",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "census",
      subcategory: "census_lds",
      collection: "1881",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: true,
      mother: true,
    },
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("scotp", buildSearchData, regressionData, testManager);
}

export { runTests };
