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

import { transformPlainText } from "../../extension/site/gensau/core/gensau_context.mjs";
import { runContextTests } from "../test_utils/test_context_utils.mjs";

const regressionData = [
  {
    // Sourcer citation
    caseName: "bdm_birth_1874_abbey_kemp_sourcer",
    inputText: `Birth Registration: "South Australia - Birth Registrations"
Genealogy SA; Surname: KEMP; Book/Page: 143/400
Genealogy SA (accessed 26 May 2026)
Abbey Kemp birth 1 Nov 1874 registered in the Daly district, daughter of Richard Kemp & Sarah Doyle, residence Moonta Mines.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // https://www.wikitree.com/wiki/Kemp-14752
    caseName: "bdm_birth_1874_abbey_kemp_wt",
    inputText: `KEMP, Abbey, South Australian Birth registrations index, Daly 143/400, accessed 10 May 2026 via Genealogy SA`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Hancock-883
    caseName: "bdm_birth_1905_clarence_hancock",
    inputText: `Event Birth • Name: Clarence Roy Hancock • Birth Date: 5 Mar 1905 • Birth Place: Wallaroo Mines • Registration Place: Daly, South Australia, Australia • Father: Thomas Hancock • Mother: Gertrude Helena Penhall • Page Number: 331 • Volume Number: 744`,
    function: transformPlainText,
    numPhases: 3,
  },
];

async function runTests(testManager) {
  await runContextTests("gensau", regressionData, testManager);
}

export { runTests };
