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

import { generalizeData } from "../../extension/site/msa/core/msa_generalize_data.mjs";
import { buildCitation } from "../../extension/site/msa/core/msa_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "msa_leonard_calvert_bio",
    url: "https://msa.maryland.gov/megafile/msa/speccol/sc3500/sc3520/000100/000198/html/198bio.html",
  },
  {
    caseName: "msa_vol_16_pg_356",
    url: "https://msa.maryland.gov/megafile/msa/speccol/sc2900/sc2908/000001/000016/html/am16--356.html",
  },
  {
    caseName: "msa_will_john_english",
    url: "https://pve.msa.maryland.gov/pages/viewer.aspx?2R8PyaO%2fMGlVGRYhxaoNJBs5mtUkMi7uFZEC3T2b2NUu2tKQDEKlWRXDAwkImRKeGZqbDDYPfgHRIFYzDoRWqA=%3d",
  },
  {
    caseName: "msa_will_john_adams",
    url: "https://pve.msa.maryland.gov/pages/viewer.aspx?JA05XmF7tMvU+l8taFfVV%2fSUQGStsXK96qAUM%2fFPL61qCZ+t3h45DtVnODpJzWmJcdGrunTWvHJpXbEQZn0dvA=%3d",
  },
  {
    caseName: "msa_m_isabelle_dcert",
    url: "https://pve.msa.maryland.gov/pages/viewer.aspx?L9X3RQuDc4NfJ150bhvuQx%2fWvHanONX9Z4z6F2xu6BxqcqvO9UWtNenRwRuX4j3Zb1WeOV%2fc1G3rDfHgLQAXjQ=%3d",
  },

];

async function runTests(testManager) {
  await runExtractDataTests("msa", regressionData, testManager);

  //await runGeneralizeDataTests("msa", generalizeData, regressionData, testManager);

  //const functions = { buildCitation: buildCitation };
  //await runBuildCitationTests("msa", functions, regressionData, testManager);
}

export { runTests };
