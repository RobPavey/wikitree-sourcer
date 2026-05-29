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
    // From Australia project example
    caseName: "bdm_birth_1857_tom_lomman_aus",
    inputText: `South Australia Birth Index. (Genealogy SA, https://www.genealogysa.org.au : accessed 11 May 2020), database entry for Lomman, Tom (Birth Date: 23 Dec 1857, Father: Thomas Lomman, Mother: Louisa Bratchell, Birthplace: Shipley), Reference: District Adelaide, Book 11, Page 251.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Potter-2780
    // Has multiple names
    caseName: "bdm_birth_1859_john_potter_wt",
    inputText: `Genealogy SA • Retrieved 04 Jan 2014
Event Birth • Name John POTTER • Birth Date: 04 Sep 1859 • Father's Name: Daniel POTTER • Mother's Name: Margaret MENZIES • Birth Place: Mount Gambier • Registration Place: Grey, South Australia • Page Number: 492 • Volume Number 18 •`,
    function: transformPlainText,
    numPhases: 3,
  },
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
    // From https://www.wikitree.com/wiki/Couzens-45
    caseName: "bdm_birth_1900_vera_couzens_wt",
    inputText: `South Australia Birth Index compiled by Genealogy South Australia; citing Norwood District book#657; p72; for Vera Azalia Jessie Frances Couzens, b: 30 Mar 1900 (father: John Couzens & mother: Annie Rebecca Elliott); res: Hackney, Australia`,
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
  {
    // From https://www.wikitree.com/wiki/Stubberfield-8
    // No name, code is under "page"
    caseName: "bdm_death_1878_walter_stubberfield_wt",
    inputText: `Death: Author: S.A. Genealogical and Heraldry Society. Title: South Australian Deaths - Index of Registrations. Abbreviation: Index of SA Deaths. Publication: South Australian Genealogical and Heraldry Society. Italicized: Y. Paranthetical: Y. Citing: Page: 872/1961 (accessed before 20 March 2011)`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From sourcer - narrative with citation in edit mode (straight from build citation)
    caseName: "bdm_death_1940_rhoda_holness_sourcer_nar",
    inputText: `Rhoda's death in 1940 was registered in the Talunga district.<ref>
'''Death Registration''':
"South Australia - Death Registrations"<br/>
Genealogy SA; Surname: HOLNESS; Given Names: Rhoda Abbey; Year: 1940; District: Talunga; Book/Page: 627/3836<br/>
[https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=353985&coid=death&cid=5 Genealogy SA Record] (accessed 29 May 2026)<br/>
Rhoda Abbey Holness death 1940 registered in the Talunga district.
</ref>`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From sourcer - source citation in edit mode (straight from build citation)
    caseName: "bdm_death_1940_rhoda_holness_sourcer_source",
    inputText: `* '''Death Registration''': "South Australia - Death Registrations"<br/>Genealogy SA; Surname: HOLNESS; Given Names: Rhoda Abbey; Year: 1940; District: Talunga; Book/Page: 627/3836<br/>[https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=353985&coid=death&cid=5 Genealogy SA Record] (accessed 29 May 2026)<br/>Rhoda Abbey Holness death 1940 registered in the Talunga district.`,
    function: transformPlainText,
    numPhases: 3,
  },
  {
    // From https://www.wikitree.com/wiki/Kemp-14752
    // No date
    caseName: "bdm_marriage_1896_abbey_kemp_wt",
    inputText: `↑ KEMP, Rhoda Abbey, South Australian Marriage registrations index, Gilbert 188/1097, accessed 10 May 2026 via Genealogy SA`,
    function: transformPlainText,
    numPhases: 3,
  },
];

async function runTests(testManager) {
  await runContextTests("gensau", regressionData, testManager);
}

export { runTests };
