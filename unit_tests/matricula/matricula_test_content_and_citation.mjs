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

import { extractData } from "../../extension/site/matricula/core/matricula_extract_data.mjs";
import { generalizeData } from "../../extension/site/matricula/core/matricula_generalize_data.mjs";
import { buildCitation } from "../../extension/site/matricula/core/matricula_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  /*
  {
    caseName: "b_1902_calvert_florence",
    url: "https://www.matricula.org.uk/cgi/information.pl?r=107280059:7282&d=bmd_1649064119",
  },
  */
  {
    caseName: "aachen_hlkreuz_kb530_12",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-hl-kreuz/KB+530_2/?pg=12",
  },
  {
    caseName: "wien_01_st_peter_01-01_19",
    url: "https://data.matricula-online.eu/de/oesterreich/wien/01-st-peter/01-01/?pg=19",
  },
  {
    caseName: "aachen_st_nikolaus_kb036_1",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+036/?pg=1",
  },
  {
    caseName: "aachen_st_nikolaus_kb483_6",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+483/?pg=6",
  },
  {
    caseName: "aachen_st_nikolaus_kb485_7",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+485/?pg=7",
  },
  {
    caseName: "aachen_st_nikolaus_kb037_2",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+037_5/?pg=2",
  },
  {
    caseName: "aachen_st_peter_kb582_7",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-peter/KB+582_6/?pg=7",
  },
  {
    caseName: "aachen_st_nikolaus_kb037_8",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+037_9/?pg=8",
  },
  {
    caseName: "aachen_st_nikolaus_kb475_7",
    url: "https://data.matricula-online.eu/de/deutschland/aachen/aachen-st-nikolaus/KB+475_7/?pg=7",
  },
  {
    caseName: "luxemburg_asselborn_kb12_13",
    url: "https://data.matricula-online.eu/de/LU/luxemburg/asselborn/KB-12/?pg=13",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("matricula", extractData, regressionData, testManager);

  await runGeneralizeDataTests("matricula", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("matricula", functions, regressionData, testManager);
}

export { runTests };
