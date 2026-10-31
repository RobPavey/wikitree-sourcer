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

import { generalizeData } from "../../extension/site/cemmap/core/cemmap_generalize_data.mjs";
import { buildCitation } from "../../extension/site/cemmap/core/cemmap_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// The saved pages are the details panel as the app's own detail.js builds it, in the page shell of the app
// The first and third saved pages are the real panels from the app. The Smith ones are made up: a stone with two people on it, and
// a name with the name at birth in brackets, which the real cemetery has no example of yet.
const regressionData = [
  {
    // Opened by WikiTree ID from a category link: profile, death place, plot, headstone photo, GPS and Find a Grave chip
    caseName: "lucy_amanda_jones",
    url: "https://apps.wikitree.com/apps/robinson27225/cemetery-map/index.html?category=Claquato_Cemetery%2C_Chehalis%2C_Washington&wt=Jones-67676",
  },
  {
    // No WikiTree profile: opened by Find a Grave ID, "No WikiTree profile yet" instead of an ID, section and lot for the plot, no photo
    caseName: "andrew_d_miller",
    url: "https://apps.wikitree.com/apps/robinson27225/cemetery-map/index.html?category=Claquato_Cemetery%2C_Chehalis%2C_Washington&fag=186934145",
  },
  {
    // Two people share the stone: opened by Find a Grave ID because there is no WikiTree profile. The cemetery was
    // opened by its ready-made map ID so there is no category
    caseName: "john_smith_no_profile",
    url: "https://apps.wikitree.com/apps/robinson27225/cemetery-map/index.html?cemetery=fairview-raton-nm&fag=98765432",
  },
  {
    // The other person on that stone, with the name at birth in brackets ("Mary (Jones) Smith") and a Space page link on the cemetery's title
    caseName: "mary_jones_smith",
    url: "https://apps.wikitree.com/apps/robinson27225/cemetery-map/index.html?cemetery=fairview-raton-nm&wt=Smith-1234",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("cemmap", regressionData, testManager);

  await runGeneralizeDataTests("cemmap", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("cemmap", functions, regressionData, testManager);
}

export { runTests };
