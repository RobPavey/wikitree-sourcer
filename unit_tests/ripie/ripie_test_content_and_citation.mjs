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

import { generalizeData } from "../../extension/site/ripie/core/ripie_generalize_data.mjs";
import { buildCitation } from "../../extension/site/ripie/core/ripie_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// Each caseName is the name of a saved page in unit_tests/ripie/saved_pages/<caseName>.html
// The case names describe what each page exercises. They deliberately do not contain a person's name.
// Each caseName is the name of a saved page in unit_tests/ripie/saved_pages/<caseName>.html
// The case names describe what each page exercises. They do not contain a person's name.
const regressionData = [
  {
    // One of the very first notices (July 2006). No town, only a county. No maiden name.
    caseName: "notice_2006_early_notice",
    url: "https://rip.ie/death-notice/iris-atkinson-dublin-281",
  },
  {
    // July 2006. Maiden name, and a nickname with an accented letter. County only.
    caseName: "notice_2006_maiden_name_and_nickname",
    url: "https://rip.ie/death-notice/bridget-brid-collins-clare-236",
  },
  {
    // 2009. Older page layout. Surname in capitals, maiden name and a nickname. No funeral director.
    caseName: "notice_2009_old_layout_nee",
    url: "https://rip.ie/death-notice/maura-mary-cosgrave-dublin-dalkey-83992",
  },
  {
    // 2010. No funeral director. Surname in capitals.
    caseName: "notice_2010_no_funeral_director",
    url: "https://rip.ie/death-notice/michael-halligan-carlow-107898",
  },
  {
    // 2010. The same death has two separate notices (different ids), this one is under Kildare with a town.
    caseName: "notice_2010_two_counties_1",
    url: "https://rip.ie/death-notice/ann-flynn-kildare-leixlip-107926",
  },
  {
    // 2010. The other notice for the same death. Under Galway with no town, and a long address text.
    caseName: "notice_2010_two_counties_2",
    url: "https://rip.ie/death-notice/ann-flynn-galway-107927",
  },
  {
    // 2019. One notice (one id) listed under two towns in the same county. This is the Harmonstown URL.
    caseName: "notice_2019_two_counties_1",
    url: "https://rip.ie/death-notice/maureen-jenkins-dublin-harmonstown-384735",
  },
  {
    // 2019. The same notice via its Clonshaugh URL. The extracted data should match the case above.
    caseName: "notice_2019_two_counties_2",
    url: "https://rip.ie/death-notice/maureen-jenkins-dublin-clonshaugh-384735",
  },

  // These two notices are from 2026 and name living relatives of recently deceased people, so they are left
  // out of the repository. They add coverage of:
  //  - a first name with a stray comma and a bracketed nickname ("Patrick John, (Pa John)")
  //  - a "Date of Death" field that is a day later than the date in the notice text
  /*
  {
    caseName: "notice_2026_nickname_stray_comma",
    url: "https://rip.ie/death-notice/patrick-john-pa-john-smith-monaghan-scotshouse-641219",
  },
  {
    caseName: "notice_2026_nee_nickname",
    url: "https://rip.ie/death-notice/elizabeth-betty-boyce-wicklow-wicklow-town-645709",
  },
  */
];

async function runTests(testManager) {
  await runExtractDataTests("ripie", regressionData, testManager);

  await runGeneralizeDataTests("ripie", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("ripie", functions, regressionData, testManager);
}

export { runTests };
