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

import { transformPlainText } from "../../extension/site/qldbdm/core/qldbdm_context.mjs";
import { runContextTests } from "../test_utils/test_context_utils.mjs";

const regressionData = [
  {
    // From https://www.wikitree.com/wiki/Griffiths-6
    caseName: "birth_1892_vida_greentree_wt",
    inputText: `Queensland Government, Births, Deaths, Marriages. Vida Helen GRIFFITHS. Birth date: 05/05/1892, Mother's name: Elizabeth Jane Gray, Father's name: Richard Griffiths, Registration details: 1892/C/171 Birth index Vida Helen Griffiths`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Ewers-14
    // No space after end of reg num
    caseName: "birth_1909_robert_barrett_wt",
    inputText: `↑ Qld BDM, Robert Edward Barrett Event date: 12/04/1909 Event type: Birth registration Registration details: 1909/C/7656Mother: Helen May Ewers Father/parent: Henry John Barrett`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Greentree-15
    caseName: "death_1961_george_greentree_wt",
    inputText: `Death: "Australia, Death Index, 1787-1985"
Queensland Death Index 1960-1964; Registration Number: 000663; Page number: 1111
Ancestry au Record 1779 #5586335 (accessed 20 September 2025)
George Greentree death 18 Mar 1961, son of William and Mary Ann Timmins, in Queensland.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Waterworth-19
    caseName: "marriage_1903_john_waterworth_wt",
    inputText: `John Newham Waterworth and Edith Alice Hawker. 1903, Queensland. Registration Number: B002859. Australia, Marriage Index, 1788-1950 [database on-line]. Provo, UT, USA: Ancestry.com Operations, Inc., 2010.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Hawker-1
    caseName: "marriage_1903_edith_hawker_wt",
    inputText: `Queensland Government, Family History Research Service: 1829–1991, Births, Deaths, Marriages and Divorces, Marriage registration: Edith Alice Hawker; Date: 05/10/1903; Spouse: John Newham Waterworth; Registration Number: 1903/B/2859`,
    function: transformPlainText,
    numPhases: 3,
  },
];

async function runTests(testManager) {
  await runContextTests("qldbdm", regressionData, testManager);
}

export { runTests };
