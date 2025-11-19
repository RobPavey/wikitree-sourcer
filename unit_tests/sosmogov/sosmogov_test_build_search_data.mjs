/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { buildSearchData } from "../../extension/site/sosmogov/core/sosmogov_build_search_data.mjs";
import { runBuildSearchDataTests } from "../test_utils/test_build_search_utils.mjs";

const regressionData = [
  {
    caseName: "death_1937_infant_46754",
    inputPath: "sosmogov/generalized_data/ref/death_1937_infant_46754",
  },
  {
    caseName: "fg_laura_e_buchert_d_1957",
    inputPath: "fg/generalized_data/ref/laura_e_buchert_d_1957",
  },
  {
    caseName: "wikitree_gibson-24132_read",
    inputPath: "wikitree/generalized_data/ref/gibson-24132_read",
  },
  {
    caseName: "wikitree_haff-272_edit",
    inputPath: "wikitree/generalized_data/ref/haff-272_edit",
  },
  {
    caseName: "wikitree_haff-272_read",
    inputPath: "wikitree/generalized_data/ref/haff-272_read",
  },
  {
    caseName: "wikitree_hall-4352_read",
    inputPath: "wikitree/generalized_data/ref/hall-4352_read",
  },
  {
    caseName: "wikitree_hooten-280_read",
    inputPath: "wikitree/generalized_data/ref/hooten-280_read",
  },
  {
    caseName: "wikitree_orth-997_read",
    inputPath: "wikitree/generalized_data/ref/orth-997_read",
  },
  {
    caseName: "wikitree_raymond-3037_edit",
    inputPath: "wikitree/generalized_data/ref/raymond-3037_edit",
  },
];

async function runTests(testManager) {
  await runBuildSearchDataTests("sosmogov", buildSearchData, regressionData, testManager);
}

export { runTests };
