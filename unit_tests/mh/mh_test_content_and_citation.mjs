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

import { extractData } from "../../extension/site/mh/core/mh_extract_data.mjs";
import { generalizeData } from "../../extension/site/mh/core/mh_generalize_data.mjs";
import { buildCitation } from "../../extension/site/mh/core/mh_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "aus_nsw_marriage_1851_chamberlain_potter",
    url: "https://www.myheritage.com/research/record-10915-31089/charles-chamberlain-and-elizabeth-potter-in-australia-new-south-wales-marriage-index",
  },
  {
    caseName: "australia_business_register_2010_barbara_jones",
    url: "https://www.myheritage.com/research/record-20422-391107/barbara-jones-in-australia-business-register",
  },
  {
    caseName: "canada_marriage_1890_ronald_macdonald",
    url: "https://www.myheritage.com/research/record-20440-604/ronald-macdonald-and-annie-alberta-macdonald-in-canada-prince-edward-island-marriages",
  },
  {
    caseName: "denmark_death_burial_1807_james_johnsen",
    url: "https://www.myheritage.com/research/record-10455-20399043/james-johnsen-in-denmark-church-records",
  },
  {
    caseName: "canada_ns_birth_1913_mark_wilson",
    url: "https://www.myheritage.com/research/record-10904-217005/mark-wilson-in-canada-nova-scotia-birth-index",
  },
  {
    caseName: "england_birth_gro_1954_david_jones",
    url: "https://www.myheritage.com/research/record-10092-120140340/david-jones-in-england-wales-births-gro-indexes",
  },
  {
    caseName: "england_birth_reg_1842_david_jones",
    url: "https://www.myheritage.com/research/record-10442-110136566/david-jones-in-england-wales-birth-index",
  },
  {
    caseName: "england_births_1826_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-30042-49707075/charles-kimberlin-in-england-births-christenings",
  },
  {
    caseName: "england_census_1841_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-10150-12380625/charles-kimberlin-in-1841-england-wales-census",
  },
  {
    caseName: "england_census_1851_william_pavey",
    url: "https://www.myheritage.com/research/record-10151-40011245/william-henry-pavey-in-1851-england-wales-census",
  },
  {
    caseName: "england_death_gro_1970_peter_wilson",
    url: "https://www.myheritage.com/research/record-10093-95546275/peter-wilson-in-england-wales-deaths-gro-indexes",
  },
  {
    caseName: "england_marriage_1898_james_johnson",
    url: "https://www.myheritage.com/research/record-30012-50353/james-johnson-in-england-norfolk-parish-registers",
  },
  {
    caseName: "england_marriage_reg_1902_chamberlin_abigail",
    url: "https://www.myheritage.com/research/record-10443-15542228/henry-charles-chamberlin-in-england-wales-marriage-index",
  },
  {
    caseName: "england_marriage_reg_1914_joseph_oconnor",
    url: "https://www.myheritage.com/research/record-10443-22304592/joseph-oconnor-in-england-wales-marriage-index",
  },
  {
    caseName: "england_probate_1898_henry_taylor",
    url: "https://www.myheritage.com/research/record-10691-1584846/henry-taylor-in-england-wales-index-of-wills-probates",
  },
  {
    caseName: "france_burial_1788_henry_tillier",
    url: "https://www.myheritage.com/research/record-10911-1793347/henry-joseph-tillier-in-france-compilation-of-vital-records",
  },
  {
    caseName: "france_census_1936_robert_moore",
    url: "https://www.myheritage.com/research/record-20397-2372852/robert-moore-in-france-paris-census",
  },
  {
    caseName: "jamaica_church_1867_james_johnson",
    url: "https://www.myheritage.com/research/record-30261-278584/james-johnson-in-jamaica-church-of-england-parish-register-transcripts",
  },
  {
    caseName: "norway_baptism_1906_hans_wilson",
    url: "https://www.myheritage.com/research/record-10926-5577902/hans-peter-lund-wilson-in-norway-church-records",
  },
  {
    caseName: "scotland_marriage_reg_1800_peter_wilson",
    url: "https://www.myheritage.com/research/record-71507-619/register-of-marriages-for-the-parish-of-edinburgh-1751-1800-in-register-of-marriages-for-the-parish-of-edinburgh?snippet=c7d438a361a656ad2af09fdc4b9a83ee",
  },
  {
    caseName: "uk_convict_transport_1832_henry_taylor",
    url: "https://www.myheritage.com/research/record-20146-62040/henry-taylor-in-united-kingdom-convict-transportation-registers",
  },
  {
    caseName: "uk_military_medal_1914_robert_moore",
    url: "https://www.myheritage.com/research/record-10872-1271724/robert-moore-in-united-kingdom-service-medal-award-rolls-index",
  },
  {
    caseName: "us_census_1950_robert_moore",
    url: "https://www.myheritage.com/research/record-11006-106128020/robert-moore-in-1950-united-states-federal-census",
  },
  {
    caseName: "us_nc_birth_1961_mark_wilson",
    url: "https://www.myheritage.com/research/record-10779-191744/mark-edward-wilson-in-north-carolina-mecklenburg-county-birth-index",
  },
  {
    caseName: "us_oh_marriage_1921_gemperline",
    url: "https://www.myheritage.com/research/record-20618-3185920-F/frank-c-gemperline-and-edna-schwamberger-in-ohio-marriages",
  },
  {
    caseName: "us_pa_immigration_1882_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-10017-3144396/charles-kimberlin-in-passenger-immigration-lists",
  },
  {
    caseName: "us_rev_war_pension_robert_moore",
    url: "https://www.myheritage.com/research/record-10021-49744/robert-moore-in-revolutionary-war-pension-records",
  },
  {
    caseName: "us_ssdi_2008_peter_wilson",
    url: "https://www.myheritage.com/research/record-10002-58770563/peter-wilson-in-us-social-security-death-index-ssdi",
  },
  {
    caseName: "us_tx_divorce_1969_ronnie_smith",
    url: "https://www.myheritage.com/research/record-10069-35470791/ronnie-l-smith-and-linda-smith-in-texas-marriages-divorces",
  },
  {
    caseName: "wales_baptism_1723_elizabeth_jones",
    url: "https://www.myheritage.com/research/record-10929-1352539-F/david-jones-in-wales-parish-births-baptisms",
  },

  // Family Tree person pages
  {
    // person in my MH tree
    caseName: "xx_person_charles_kimberlin_1825_1860_info",
    url: "https://www.myheritage.com/person-1508888_451433851_451433851/charles-kimberlin#!info",
  },
  {
    caseName: "xx_person_charles_kimberlin",
    url: "https://www.myheritage.com/research/record-1-451433851-1-508888/charles-kimberlin-in-myheritage-family-trees",
  },
  {
    caseName: "xx_person_geni_sarah_walker",
    url: "https://www.myheritage.com/research/record-40000-246802060/sarah-ann-walker-born-west-in-geni-world-family-tree",
  },
  {
    caseName: "xx_person_mary_cowling_1883_1962_events",
    url: "https://www.myheritage.com/site-family-tree-437577731/burgess-keast?familyTreeID=13#!profile-13020554-events",
  },
  {
    caseName: "xx_person_mary_cowling_1883_1962_info",
    url: "https://www.myheritage.com/site-family-tree-437577731/burgess-keast?familyTreeID=13#!profile-13020554-info",
  },
  {
    caseName: "xx_person_william_cowling_1858_1912_events",
    url: "https://www.myheritage.com/site-family-tree-437577731/burgess-keast?familyTreeID=13#!profile-13020635-events",
  },
  {
    caseName: "xx_person_william_cowling_1858_1912_info",
    url: "https://www.myheritage.com/site-family-tree-437577731/burgess-keast?familyTreeID=13#!profile-13020635-info",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("mh", extractData, regressionData, testManager);

  await runGeneralizeDataTests("mh", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("mh", functions, regressionData, testManager);
}

export { runTests };
