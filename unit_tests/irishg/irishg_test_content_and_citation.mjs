/*
MIT License

Copyright (c) 2023 Robert M Pavey

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

import { extractData } from "../../extension/site/irishg/core/irishg_extract_data.mjs";
import { generalizeData } from "../../extension/site/irishg/core/irishg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/irishg/core/irishg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "baptism_1773_john_oconnor",
    url: "https://churchrecords.irishgenealogy.ie/churchrecords/details/59a05e0443275?b=https%3A%2F%2Fchurchrecords.irishgenealogy.ie%2Fchurchrecords%2Fsearch.jsp%3Fnamefm%3DJohn%26namel%3DO%2527Connor%26location%3D%26yyfrom%3D%26yyto%3D%26submit%3DSearch",
  },
  {
    // missing sex and MMN
    caseName: "birth_1898_mark_donnelly",
    url: "https://civilrecords.irishgenealogy.ie/churchrecords/details-civil/1c3e5511946689?b=https%3A%2F%2Fcivilrecords.irishgenealogy.ie%2Fchurchrecords%2Fcivil-perform-search.jsp%3Fnamefm%3DMark%26namel%3D%26exact%3D%26name2fm%3D%26name2l%3D%26location%3D%26yyfrom%3D%26yyto%3D%26century%3D%26decade%3D%26sort%3D%26pageSize%3D100%26ddBfrom%3D%26mmBfrom%3D%26yyBfrom%3D%26ddMfrom%3D%26mmMfrom%3D%26yyMfrom%3D%26ddDfrom%3D%26mmDfrom%3D%26yyDfrom%3D%26ddPfrom%3D%26mmPfrom%3D%26yyPfrom%3D%26ddBto%3D%26mmBto%3D%26yyBto%3D%26ddMto%3D%26mmMto%3D%26yyMto%3D%26ddDto%3D%26mmDto%3D%26yyDto%3D%26ddPto%3D%26mmPto%3D%26yyPto%3D%26locationB%3D%26locationM%3D%26locationD%3D%26locationP%3D%26keywordb%3D%26keywordm%3D%26keywordd%3D%26keywordp%3D%26event%3DB%26district%3DBelfast%26submit%3DSearch",
  },
  {
    // has sex and MMN
    caseName: "birth_1921_david_taylor",
    url: "https://civilrecords.irishgenealogy.ie/churchrecords/details-civil/d79f291424208?b=https%3A%2F%2Fcivilrecords.irishgenealogy.ie%2Fchurchrecords%2Fcivil-perform-search.jsp%3Fnamefm%3DDavid%26namel%3DTaylor%26location%3D%26yyfrom%3D%26yyto%3D%26type%3DB%26submit%3DSearch",
  },
  {
    caseName: "burial_1763_siobhan_martin",
    url: "https://churchrecords.irishgenealogy.ie/churchrecords/details/062ad80320870?b=https%3A%2F%2Fchurchrecords.irishgenealogy.ie%2Fchurchrecords%2Fsearch.jsp%3Fnamefm%3Dsiobhan%26namel%3D%26location%3D%26yyfrom%3D%26yyto%3D%26submit%3DSearch",
  },
  {
    caseName: "civil_marriage_1854_mary_henry_john_smith",
    url: "https://civilrecords.irishgenealogy.ie/churchrecords/details-civil/5ff15e3242437?b=https%3A%2F%2Fcivilrecords.irishgenealogy.ie%2Fchurchrecords%2Fcivil-perform-search.jsp%3Fnamefm%3DJohn%26namel%3DSmith%26location%3D%26type%3DB%26ddBfrom%3D%26mmBfrom%3D%26yyBfrom%3D%26ddBto%3D%26mmBto%3D%26yyBto%3D%26type%3DM%26ddMfrom%3D%26mmMfrom%3D%26yyMfrom%3D%26ddMto%3D%26mmMto%3D%26yyMto%3D%26type%3DD%26ddDfrom%3D%26mmDfrom%3D%26yyDfrom%3D%26ddDto%3D%26mmDto%3D%26yyDto%3D%26submit%3DSearch",
  },
  {
    // has space after MC in name
    caseName: "death_1890_isabella_mcdonald",
    url: "https://civilrecords.irishgenealogy.ie/churchrecords/details-civil/a6b2ff6137628?b=https%3A%2F%2Fcivilrecords.irishgenealogy.ie%2Fchurchrecords%2Fcivil-perform-search.jsp%3Fnamefm%3D%26namel%3D%26location%3D%26yyfrom%3D1860%26yyto%3D1890%26type%3DD%26submit%3DSearch",
  },
  {
    caseName: "death_1960_michael_doyle",
    url: "https://civilrecords.irishgenealogy.ie/churchrecords/details-civil/204ae21899412?b=https%3A%2F%2Fcivilrecords.irishgenealogy.ie%2Fchurchrecords%2Fcivil-perform-search.jsp%3Fnamefm%3DMichael%26namel%3DDoyle%26location%3D%26yyfrom%3D%26yyto%3D%26type%3DD%26submit%3DSearch",
  },
  {
    caseName: "marriage_1770_bartle_fagan_mary_malone",
    url: "https://churchrecords.irishgenealogy.ie/churchrecords/details/7da64d0073868?b=https%3A%2F%2Fchurchrecords.irishgenealogy.ie%2Fchurchrecords%2Fsearch.jsp%3Fnamefm%3Dmary%26namel%3Dmalone%26location%3D%26yyfrom%3D%26yyto%3D%26submit%3DSearch",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("irishg", extractData, regressionData, testManager);

  await runGeneralizeDataTests("irishg", generalizeData, regressionData, testManager);

  await runBuildCitationTests("irishg", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
