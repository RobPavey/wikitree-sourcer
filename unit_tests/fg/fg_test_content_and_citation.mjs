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

import { extractData } from "../../extension/site/fg/core/fg_extract_data.mjs";
import { generalizeData } from "../../extension/site/fg/core/fg_generalize_data.mjs";
import { buildCitation } from "../../extension/site/fg/core/fg_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // has extensded ASCII characters
    caseName: "ales_hrdlicka_d_1943",
    url: "https://www.findagrave.com/memorial/202957947/ale%C5%A1-hrdli%C4%8Dka",
  },
  {
    // hyphens in first, middle and last names
    caseName: "ani_tsanegili_d_1891",
    url: "view-source:https://www.findagrave.com/memorial/86027509/a-ni-wo-nv-gi-tsa-he-gi-li",
  },
  {
    caseName: "archibald_teal_d_1906",
    url: "https://www.findagrave.com/memorial/142850482/archibald-w_a-teal",
  },
  {
    caseName: "daiana_d_2022",
    url: "https://www.findagrave.com/memorial/241543775/daiana------",
  },
  {
    caseName: "elizabeth_singleton_bates_d_1876",
    url: "https://www.findagrave.com/memorial/45398821/elizabeth-bates",
    optionVariants: [
      {
        variantName: "accessedDate_none",
        optionOverrides: { citation_general_addAccessedDate: "none" },
      },
      {
        variantName: "accessedDate_parenAfterLink",
        optionOverrides: { citation_general_addAccessedDate: "parenAfterLink" },
      },
      {
        variantName: "accessedDate_parenBeforeLink",
        optionOverrides: { citation_general_addAccessedDate: "parenBeforeLink" },
      },
    ],
  },
  {
    caseName: "ezekiel_bentley_d_1833",
    url: "https://www.findagrave.com/memorial/39114638/ezekiel-bentley",
  },
  {
    // has birth date of "unknown"
    caseName: "francis_rich_d_1957",
    url: "https://www.findagrave.com/memorial/181842312/francis-leslie-rich",
  },
  {
    // Has hyphenated last name and prefixes
    caseName: "frederick_dalrymple-hamilton_d_1974",
    url: "https://www.findagrave.com/memorial/140044048/frederick-hew_george-dalrymple-hamilton",
  },
  {
    caseName: "george_reed_d_1887",
    url: "https://www.findagrave.com/memorial/221989091/george-german-reed",
  },
  {
    caseName: "harry_bleeker_d_2004",
    url: "https://www.findagrave.com/memorial/60724641/harry-bleeker",
  },
  {
    // has only one name
    caseName: "john_d_1978",
    url: "https://www.findagrave.com/memorial/62103674/john",
  },
  {
    // has nickname or preferred name
    caseName: "john_jack_smith_d_1938",
    url: "https://www.findagrave.com/memorial/81147520/john-smith",
  },
  {
    // has multiple prefixes and nickname
    caseName: "john_reardon_smith_d_1943",
    url: "https://www.findagrave.com/memorial/15373519/capt_john-henry_reardon-smith",
  },
  {
    // has long inscription
    caseName: "john_sinclair_d_1906",
    url: "https://www.findagrave.com/memorial/148814973/john-thomas-sinclair",
  },
  {
    // has lots of hyphens in name
    caseName: "k_lu_sw",
    url: "https://www.findagrave.com/memorial/55174407/k-----lu----sw---",
  },
  {
    // has parens and hyphens
    caseName: "margaret_cody-carter-large-day_d_1923",
    url: "view-source:https://www.findagrave.com/memorial/20605336/margaret-ca-kit-sie-cody-carter-large-day",
  },
  {
    // has multiple prefixes
    caseName: "master_capt_john_smith_d_1941",
    url: "https://www.findagrave.com/memorial/15373507/capt_john-smith",
  },
  {
    // cremation. Still has a "BURIAL" field.
    caseName: "shirley_adam_d_2015",
    url: "https://www.findagrave.com/memorial/158706349/shirley-beveridge-adam",
  },
  {
    caseName: "stephen_taylor_d_1875",
    url: "https://www.findagrave.com/memorial/133987073/stephen-taylor",
  },
  {
    caseName: "thomas_reed_d_1871",
    url: "https://www.findagrave.com/memorial/195078570/thomas-reed",
  },
  {
    caseName: "william_pavey_d_1961",
    url: "https://www.findagrave.com/memorial/115176143/william-henry-pavey",
  },
  {
    caseName: "william_shakespeare_d_1616",
    url: "https://www.findagrave.com/memorial/87136641/william-shakespeare",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("fg", extractData, regressionData, testManager);

  await runGeneralizeDataTests("fg", generalizeData, regressionData, testManager);

  await runBuildCitationTests("fg", buildCitation, undefined, regressionData, testManager);
}

export { runTests };
