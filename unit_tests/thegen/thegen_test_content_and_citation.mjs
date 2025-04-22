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

import { extractData } from "../../extension/site/thegen/core/thegen_extract_data.mjs";
import { generalizeData } from "../../extension/site/thegen/core/thegen_generalize_data.mjs";
import { buildCitation } from "../../extension/site/thegen/core/thegen_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// The URL has to be copied from iframe address for record a search results
const regressionData = [
  {
    caseName: "aus_trans_1831_francis_jones_r",
    url: "https://www.thegenealogist.com/search/advanced/overseas/australian-transportation/full/?id=18517737",
  },
  {
    caseName: "bmd_birth_1839_charles_pavey_i",
    url: "https://www.thegenealogist.com/image_viewer_beta/?imagego=ZGVmNTAyMDBkZjFiNWQ0NTZhM2RlNmI2MjRhZWNjMmJlYzc0MmFhZWY0MTkwZTdlMTE5NTQ4YTZlN2E2NjNlNDE3MWEwOWM4OTNjN2EwNjJlMjQ5MTU2MDgwMmEyOWEwNGE4MTgyN2ViOWYwODUwN2EzMTdiNzVlYjg5MTNkM2U3MzFlZGM3MmZjZWRhZGFjODBjZGNhYzJlZGFkNjZiNjM3MjVjYTg4Mjk1YjYwZjkzYjYwZDM0ZTk4YjgwNDc4ZWU4ZTA1YjAxYTg0MWQwNWJhMzUxZDgyNjFkOWExODU5YjFkNzg1NDU5ZTQ0ZWQ1MzA0ODJmNmUwNTNhMDU1ZTVjOWRhMTg0NDY0YjgzMzQxMTIyYTgxNGRmMzNlODNl",
  },
  {
    caseName: "bmd_birth_1839_charles_pavey_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/births/full/?id=260105357&year=1839",
  },
  {
    caseName: "bmd_death_1899_michael_hall_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/deaths/full/?id=399734943&year=1899",
  },
  {
    caseName: "bmd_marriage_1845_thomas_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/marriages/full/?id=446092223&year=1845",
  },
  {
    caseName: "bmd_marriage_1885_james_wilson_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/marriages/full/?id=460269538&year=1885",
  },
  {
    caseName: "bmd_nc_baptism_1833_robert_hall_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/non-conformist/full/?id=715878515&uid_type=2",
  },
  {
    caseName: "bmd_nc_burial_1849_henry_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/bmd/non-conformist/full/?id=716475002&uid_type=1",
  },
  {
    // Tested in Apr 2025 and no longer worked
    caseName: "census_1861_charles_pavey_r_2025",
    url: "https://www.thegenealogist.com/search/advanced/census/main-household/?hlt=219560985&county=243&y=1861&household_id=16268345&a=Search&hh=1&hs=1&cl=1&sscid=243&view_type=fullRecord#sign-in",
  },
  {
    caseName: "census_1861_charles_pavey_r",
    url: "https://www.thegenealogist.com/search/advanced/census/main-household/?hlt=219560985&county=243&y=1861&household_id=16268345&a=Search&hh=1&hs=1&cl=1&sscid=243&view_type=fullRecord",
  },
  {
    caseName: "headstone_1904_mary_pavey_r",
    url: "https://www.thegenealogist.com/search/advanced/deaths-burials/headstone/full/?id=964862973",
  },
  {
    caseName: "insolv_1891_george_wilson_i",
    url: "https://www.thegenealogist.com/image_viewer_beta/?imagego=ZGVmNTAyMDBlZDliMjY4NGM2NDgwNjczNzU1OWEwZjZjZDhlMTY5NDFjNGE0ZTIyNTA3MTkyODIyNjc1YzhjM2I4MTkyMDFhYTZmNjMwNzU1MDUzZDg4YTgzMjc2ZDRkYjdkOTJlNDc5OGRlMzVlMzZmYTg4NDUwOWI5ZDIxNTJhNmNkOTIwYWYzZTBhNzI4OTNjZWQ5MGY2NzJhMjUxN2U1MTBjYzI4MzQwMzc2YjZiYzVkZjg2M2M1NzBiMjU3ZmU0ZWRlYTY0ZGRiNGI2NmJkNTlmYWY4ZmViZmQwZGI5NTVmNDNmMjNmOGM0ZmU3NDMwYjM5Y2I1MDU3Yjk4Mjk3OTg5MjU3MjMxNmZjMzMzMDIzYzg4MjU5YjYwODg4ZTIyZTFjNjdiNWQyODJmNTNiZTRhOGRhOWE4ZThkNTZiMTk1ZDIwMDliZjg4MGY3NWRiZTBiNDlmOTYxM2E4Nzc4MzMzZTU3NTk0Y2Q5NWI2ZWMxZjRlNTAyNGM1ZTMyMDgxYzI2ZGI0NDA0ZjYxZjIxNTk2ZDk5ZmFjZjFmY2I4NTc1M2JkNjM2MzEwOWY3YzVjZmVmYTBmMmUyNjY2ZTI1YWJkMjdlNTg4MTY4YzU1OWM1MTU5NjI5MzcwMjVlMWQwMDg1ZTA1ODVkODExZWY5YzQ1YTgyODg2ODBiNmRkODMxN2RiNGRlZGY1ODk4NjI2Yzg5Zjc4NGQxZjdmMWYzNzNhYjFhOTEyMzAxNTFlMzhhYjNlM2JmNGQxODYzNjQ5MGU5MWQzMmZlYjQ0NjMxMDIwMTIwMjlkOWJlMWRlNTM4NWQ4YTYwYjdhYmM4N2U5MjljYzk0MDg2YzdmNjc0YjdiZWQyYTBkZTVmN2ZlM2VhNTFjNDdjYTNiZjJiNWEzNGNiY2ExZGE3MGFlZWFmOWFjMTc0Zjg2MDZhNGI5ZGIzZmI0N2EwZjlhYTY3MWUxZjNjY2FlMzg2NmE2NTEyZGYxYmY2MDAxMGI4OWY3ZDY3MzQxM2ZiMWNhMGMxM2I1NmM4MGMyOTQwZjc4Y2ZmMjYwYzRhMTUwNDI0NDY0OGQyMzZlOGEwZDU5MDkzN2JmNWMzMDVlNmJhODcyOTMzMTE0NDBhNDdkODc4MmUyMDE1NTliY2VmMGJhMmEyNjAwNTYzNDAzMGU1Mjk1N2I2",
  },
  {
    caseName: "parish_baptism_1833_michael_hall_r",
    url: "https://www.thegenealogist.com/search/advanced/parish/baptism/full/?id=971368692&s_id=1920&sscid=334",
  },
  {
    caseName: "parish_burial_1834_michael_hall_r",
    url: "https://www.thegenealogist.com/search/advanced/parish/burial/full/?id=848838868&s_id=1219&sscid=335",
  },
  {
    caseName: "parish_marriage_1851_thomas_smith_r",
    url: "https://www.thegenealogist.com/search/advanced/parish/marriage/full/?id=851071136&s_id=1464&sscid=401",
  },
  {
    caseName: "pass_list_1849_francis_jones_r",
    url: "https://www.thegenealogist.com/search/advanced/overseas/passenger-lists/full/?id=730397542",
  },
  {
    caseName: "register_1939_james_wilson_r",
    url: "https://www.thegenealogist.com/search/advanced/register/1939/full/?id=900074529&data_set=Durham",
  },
  {
    caseName: "tithe_1839_john_smith_i",
    url: "https://www.thegenealogist.co.uk/image_viewer_beta/?imagego=ZGVmNTAyMDBjZTc5YWU0ZDllZTkxYWYzZmJiODcyOTY2MTJiYWQ5YWI2ODY1MDIxNGMwNzRjYWMxMmEwZjM1NWY3YzNkNGY5MjNlNGE4YzRkZTI5ZTY3MjFkYjI3ZjBiZWJmZmYyZWRiNGQwY2VlZWZkYjI1ZDdiZjkyYjE4NjUyMDI5NTBmYWM2MTQ1N2M2NzQwM2VmZmUyZTg2ZTJiZGNlZTdkYWU1MTMwM2Q1OTc0MjFiMTc4ZDY3NjE3OWU5OTk3ZjFkNzc0ZmJhMWQ1MjQ0ZjBjNzcxMTViOTFkODg2N2E3ZjYzNjBmYmQ5YjdjM2U1MWM2MGQ0MTg5MGUyZGRiZDMxNDFiYTQ2NjcyZmU3MTNiYWFiOTM0OTUwNDE0OTA4OGZi",
  },
  {
    caseName: "tithe_1839_john_smith_r",
    url: "https://www.thegenealogist.co.uk/search/advanced/landowner/tithe-records/full/?id=53453535",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("thegen", extractData, regressionData, testManager);

  await runGeneralizeDataTests("thegen", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("thegen", functions, regressionData, testManager);
}

export { runTests };
