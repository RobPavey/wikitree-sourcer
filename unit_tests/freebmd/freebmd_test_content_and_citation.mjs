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

import { extractData } from "../../extension/site/freebmd/core/freebmd_extract_data.mjs";
import { generalizeData } from "../../extension/site/freebmd/core/freebmd_generalize_data.mjs";
import { buildCitation } from "../../extension/site/freebmd/core/freebmd_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "b_1902_calvert_florence_ora",
    url: "https://www.freebmd.org.uk/cgi/information.pl?r=107280059:7282&d=bmd_1649064119",
  },
  {
    caseName: "b_1902_calvert_florence_v2025",
    url: "https://www.freebmd2.org.uk/68fbb6e58655740ff9b81bd9/entry-information/107336072/florence-calvert-birth-co-durham-easington-v10a-p479?locale=en&search_entry=107336072",
  },
  {
    caseName: "b_1902_calvert_florence",
    url: "https://www.freebmd.org.uk/cgi/information.pl?r=107280059:7282&d=bmd_1649064119",
  },
  {
    caseName: "d_1980_dawson_ann",
    url: "https://www.freebmd.org.uk/cgi/information.pl?cite=BPWMD5euQCbaHxoApSv%2FbQ&scan=1",
  },
  {
    caseName: "d_1985_greenfield_mary_v2025",
    url: "https://www.freebmd2.org.uk/68fbb670865574100fb8196b/entry-information/275933132/mary-greenfield-death-greater-london-from-jun1965-islington-v13-p1308?locale=en&search_entry=275933132",
  },
  {
    caseName: "d_1985_greenfield_mary",
    url: "https://www.freebmd.org.uk/cgi/information.pl?cite=aGzrr%2B%2BC02OpOvuJRw7OVw&scan=1",
  },
  {
    caseName: "d_1938_pavey_amelia_v2025",
    url: "https://www.freebmd2.org.uk/68fec1248655743e63b9b5cb/entry-information/176457341/amelia-e-pavey-death-staffordshire-leek-v6b-p327?locale=en&search_entry=176457341",
  },
  {
    caseName: "d_1938_pavey_amelia",
    url: "https://www.freebmd.org.uk/cgi/information.pl?r=176279640:9239&d=bmd_1630353886",
  },
  {
    caseName: "m_1870_pavey_henry_alfred_v2025",
    url: "https://www.freebmd2.org.uk/68fbb74b8655740ff9b81be5/entry-information/48070378/henry-alfred-pavey-marriage-london-to-mar1965-pancras-v1b-p263?locale=en&search_entry=48070378",
  },
  {
    caseName: "m_1870_pavey_henry_alfred",
    url: "https://www.freebmd.org.uk/cgi/information.pl?r=48088197:8889&d=bmd_1627336144",
  },
  {
    caseName: "m_1906_kerridge_frederick_v2026",
    url: "https://dev.freebmd2.org.uk/695da40fbd30f24b671c1bf0/entry-information/116242858/frederick-charles-kerridge-marriage-lancashire-prestwich-v8d-p803?locale=en&search_entry=116242858",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("freebmd", extractData, regressionData, testManager);

  await runGeneralizeDataTests("freebmd", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("freebmd", functions, regressionData, testManager);
}

export { runTests };
