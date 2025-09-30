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

import { buildSearchData } from "../../extension/site/eggsabdm/core/eggsabdm_build_search_data.mjs";
import { runBuildSearchUrlTests } from "../test_utils/test_build_search_url_utils.mjs";

const regressionData = [
  {
    caseName: "search_baptism_from_baptism_hilletje_aletta_1800",
    inputPath: "eggsabdm/generalized_data/ref/baptism_hilletje_aletta_1800",
    typeOfSearch: "Baptisms",
  },
  {
    caseName: "search_burials_from_baptism_hilletje_aletta_1800",
    inputPath: "eggsabdm/generalized_data/ref/baptism_hilletje_aletta_1800",
    typeOfSearch: "Burials",
  },
  {
    caseName: "search_marriages_from_baptism_hilletje_aletta_1800",
    inputPath: "eggsabdm/generalized_data/ref/baptism_hilletje_aletta_1800",
    typeOfSearch: "Marriages",
  },
  {
    caseName: "search_marriages_from_baptism_jan_johannes_de_smiedt_1890_05-mother",
    inputPath: "eggsabdm/generalized_data/ref/baptism_jan_johannes_de_smiedt_1890_05-mother",
    typeOfSearch: "Marriages",
    optionVariants: [
      {
        variantName: "fullFirst",
        optionOverrides: {
          search_eggsabdm_fullFirstName: true,
          search_eggsabdm_firstNameMode: "4",
        },
      },
    ],
  },
];

async function runTests(testManager) {
  await runBuildSearchUrlTests("eggsabdm", buildSearchData, regressionData, testManager);
}

export { runTests };
