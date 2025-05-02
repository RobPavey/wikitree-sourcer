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

import { buildSearchUrl } from "../../extension/site/irishg/core/irishg_build_search_url.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "ireland_connors-569_read",
    inputPath: "wikitree/generalized_data/ref/ireland_connors-569_read",
    typeOfSearch: "SpecifiedParameters",
    searchParameters: {
      category: "civil",
      subcategory: "civil_lifetime",
      lastNameIndex: 0,
      spouseIndex: -1,
      father: false,
      mother: false,
    },
    optionVariants: [
      // All lifetime
      // Civil all events
      {
        variantName: "all_lifetime",
        searchParameters: {
          category: "all",
          subcategory: "all_lifetime",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },

      // Civil all events
      {
        variantName: "civil_events",
        searchParameters: {
          category: "civil",
          subcategory: "civil_events",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      {
        variantName: "civil_events_spouse",
        searchParameters: {
          category: "civil",
          subcategory: "civil_events",
          lastNameIndex: 0,
          spouseIndex: 0,
        },
      },
      {
        variantName: "civil_events_exactness",
        searchParameters: {
          category: "civil",
          subcategory: "civil_events",
          lastNameIndex: -1,
          spouseIndex: 0,
        },
        optionOverrides: {
          search_irishg_birthYearExactness: 2,
          search_irishg_marriageYearExactness: 5,
          search_irishg_deathYearExactness: 10,
        },
      },

      // Civil births
      {
        variantName: "civil_births",
        searchParameters: {
          category: "civil",
          subcategory: "civil_births",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      {
        variantName: "civil_births_cln_inclMmn",
        searchParameters: {
          category: "civil",
          subcategory: "civil_births",
          lastNameIndex: 1,
          spouseIndex: -1,
          mmn: "Power",
        },
      },
      {
        variantName: "civil_births_aka1",
        searchParameters: {
          category: "civil",
          subcategory: "civil_births",
          lastNameIndex: 2,
          spouseIndex: -1,
        },
      },
      {
        variantName: "civil_births_aka2",
        searchParameters: {
          category: "civil",
          subcategory: "civil_births",
          lastNameIndex: 3,
          spouseIndex: -1,
        },
      },

      // Civil deaths
      {
        variantName: "civil_deaths",
        searchParameters: {
          category: "civil",
          subcategory: "civil_deaths",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      {
        variantName: "civil_deaths_cln",
        searchParameters: {
          category: "civil",
          subcategory: "civil_deaths",
          lastNameIndex: 1,
          spouseIndex: -1,
        },
      },
      {
        variantName: "civil_deaths_cln_age",
        searchParameters: {
          category: "civil",
          subcategory: "civil_deaths",
          lastNameIndex: 1,
          spouseIndex: -1,
          ageAtDeath: true,
        },
      },

      // Civil marriages
      {
        variantName: "civil_marriages",
        searchParameters: {
          category: "civil",
          subcategory: "civil_marriages",
          lastNameIndex: 0,
          spouseIndex: 0,
        },
      },

      // Church lifetime
      {
        variantName: "church_lifetime",
        searchParameters: {
          category: "church",
          subcategory: "church_lifetime",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      // Church all events
      {
        variantName: "church_events",
        searchParameters: {
          category: "church",
          subcategory: "church_events",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      {
        variantName: "church_events_spouse",
        searchParameters: {
          category: "church",
          subcategory: "church_events",
          lastNameIndex: 0,
          spouseIndex: 0,
        },
      },
      // Church baptisms
      {
        variantName: "church_baptisms",
        searchParameters: {
          category: "church",
          subcategory: "church_baptisms",
          lastNameIndex: 0,
          spouseIndex: -1,
        },
      },
      {
        variantName: "church_baptisms_parents",
        searchParameters: {
          category: "church",
          subcategory: "church_baptisms",
          lastNameIndex: 0,
          spouseIndex: -1,
          father: true,
          mother: true,
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("irishg", buildSearchUrl, regressionData, testManager);
}

export { runTests };
