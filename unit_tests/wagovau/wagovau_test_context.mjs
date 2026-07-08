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

import { transformPlainText } from "../../extension/site/wagovau/core/wagovau_context.mjs";
import { runContextTests } from "../test_utils/test_context_utils.mjs";

const regressionData = [
  {
    // From https://www.wikitree.com/wiki/Space:Sources_and_Citations_-_Western_Australia#Civil_Registration_.28Birth.2C_Death.2C_Marriage.29
    caseName: "birth_1847_john_forrest_au",
    inputText: `Western Australian Online Index (Government of Western Australia; Department of Justice; Registry of Births, Deaths and Marriages), Birth index entry for John Forrest, Registration (district: -; year: 1847; number: 989), Details (father: William FORREST; mother: Margaret FORREST; birth place: Bunbury; year of birth: 1847), Accessed 10 September 2024, WABMD-birth-1847/989.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Space:WikiTree_Sourcer_Western_Australia_BDM_Examples
    caseName: "birth_1913_william_wilson_so",
    inputText: `↑ Birth Registration: "Western Australian Online Index"
Government of Western Australia; Department of Justice; Registry of Births, Deaths and Marriages; Registration Number: 1800308
Western Australia Online Search (accessed 7 July 2026)
Surname: Wilson; Given Names: William Edward; Sex: M; Father: William Henry WILSON; Mother: Agnes MCKENNA; Place of Birth: Kalgoorlie; Year of Birth: 1913; Registration District: East Coolgardie; Registration Year: 1913.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Space:Sources_and_Citations_-_Western_Australia#Civil_Registration_.28Birth.2C_Death.2C_Marriage.29
    caseName: "death_1876_john_row_au_ref",
    inputText: `<ref name="WABMD-death-1876/4071"> [https://www.wa.gov.au/organisation/department-of-justice/online-index-search-tool Western Australian Online Index] (Government of Western Australia; Department of Justice; Registry of Births, Deaths and Marriages), Death index entry for ''John Septimus Roe'', Registration (district: -; year: 1878; number: 9783), Details (place of death: Perth; year of death: 1878), Accessed 10 September 2024, WABMD-death-1878/9783.</ref>`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Wilson-43986
    caseName: "death_1948_john_wilson_wt",
    inputText: `Death: WA BDM Death Reg: #995/1948`,
    function: transformPlainText,
    numPhases: 3,
  },
];

async function runTests(testManager) {
  await runContextTests("wagovau", regressionData, testManager);
}

export { runTests };
