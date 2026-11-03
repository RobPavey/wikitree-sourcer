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

import { generalizeData } from "../../extension/site/rootsirl/core/rootsirl_generalize_data.mjs";
import { buildCitation } from "../../extension/site/rootsirl/core/rootsirl_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// Each caseName is a saved page in unit_tests/rootsirl/saved_pages/<caseName>.html (or pageFile if set).
// Names in these pages were changed by the person who saved them.
const regressionData = [
  {
    // Church baptism with dates of birth and baptism, sponsors and the priest in the notes
    caseName: "baptism_1901_kerry",
    url: "https://rootsireland.ie/ifhf/view_detail.php?recordid=471306&type=bch&recordCentre=kerry&page=1&n=1&backLink=quis.php&sc=0",
  },
  {
    // Church baptism viewed on a county site, no date of birth, with the National Library of Ireland microfilm link
    caseName: "baptism_1834_cork_microfilm_link",
    url: "https://rootsireland.ie/corknortheast/view_detail.php?recordid=973516&type=bch&recordCentre=corknortheast&page=1&n=2&backLink=quis.php&sc=0",
  },
  {
    // Civil birth with registration date, district in capitals and the father as informant
    caseName: "birth_civil_1901_galway",
    url: "https://rootsireland.ie/ifhf/view_detail.php?recordid=6389026&type=bcv&recordCentre=galwayeast&page=1&n=3&backLink=quis.php&sc=0",
  },
  {
    // Church marriage with many fields Not Recorded, the bride's age, and the real place in the notes
    caseName: "marriage_church_1915_longford",
    url: "https://rootsireland.ie/ifhf/view_detail.php?recordid=1233592&type=mch&recordCentre=longford&page=2&n=15&backLink=quis.php&sc=0",
  },
  {
    // The same marriage with the wife chosen as the primary person
    caseName: "marriage_church_1915_longford_wife",
    pageFile: "./unit_tests/rootsirl/saved_pages/marriage_church_1915_longford.html",
    url: "https://rootsireland.ie/ifhf/view_detail.php?recordid=1233592&type=mch&recordCentre=longford&page=2&n=15&backLink=quis.php&sc=0",
    primaryPersonIndex: 1,
  },
  {
    // Civil marriage with Full Age, both fathers, witnesses and the church in the notes
    caseName: "marriage_civil_1915_leitrim",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=962555&type=mcv&recordCentre=leitrim&page=1&n=9&backLink=quis.php&sc=0",
  },
  {
    // Church burial with both graveyard and informant sections
    caseName: "burial_1899_dublin_south",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=295429&type=dch&recordCentre=dublinsouth&page=1&n=1&backLink=quis.php&sc=0",
  },
  {
    // Church burial with no date and Not Listed placeholders
    caseName: "burial_no_date_monaghan",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=34166&type=dch&recordCentre=monaghan&page=6&n=54&backLink=quis.php&sc=0",
  },
  {
    // Civil death with the informant in the informant fields
    caseName: "death_civil_1898_meath",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=639672&type=dcv&recordCentre=meath&page=3&n=27&backLink=quis.php&sc=0",
  },
  {
    // Civil death where the centre puts the informant and other details in Label: value notes
    caseName: "death_civil_1896_waterford_informant_in_notes",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=80547&type=dcv&recordCentre=waterford&page=7&n=65&backLink=quis.php&sc=0",
  },
  {
    // The site sometimes shows a reCAPTCHA before the record. Extraction must report it and not extract.
    caseName: "captcha_before_record",
    url: "https://www.rootsireland.ie/ifhf/view_detail.php?recordid=295429&type=dch&recordCentre=dublinsouth",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("rootsirl", regressionData, testManager);

  await runGeneralizeDataTests("rootsirl", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("rootsirl", functions, regressionData, testManager);
}

export { runTests };
