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

import { generalizeData } from "../../extension/site/riksark/core/riksark_generalize_data.mjs";
import { buildCitation } from "../../extension/site/riksark/core/riksark_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "birth_1889_olga_henriette_en",
    url: "https://sok.riksarkivet.se/en/?Sokord=olga+nielsen&EndastDigitaliserat=false&TranskriberadText=false&AvanceradSok=False&page=7&postid=Fodelse_1621999&tab=post#tab",
  },
  {
    caseName: "census_1880_anders_jan_en",
    url: "https://sok.riksarkivet.se/en?postid=Folk_118564728",
  },
  {
    caseName: "census_1880_anders_jan_sv",
    url: "https://sok.riksarkivet.se/?postid=Folk_118564728",
  },
  {
    caseName: "census_1880_anders_johansson_en",
    url: "https://sok.riksarkivet.se/en?EndastDigitaliserat=false&TranskriberadText=false&Namn=Anders+Peter+Johansson&Ort=H%c3%a4llestads%2c+%c3%84lvsborgs+l%c3%a4n&DatumFran=1880&DatumTill=1880&AvanceradSok=true&page=2&postid=Folk_118564745&tab=post#tab",
  },
  {
    caseName: "census_1890_trulsson_bodil_en",
    url: "https://sok.riksarkivet.se/en?Sokord=bodil&EndastDigitaliserat=false&TranskriberadText=false&AvanceradSok=false&page=77&postid=Folk_102052652&tab=post#tab",
  },
  {
    caseName: "census_1930_andersen_anders_en",
    url: "https://sok.riksarkivet.se/en/?Sokord=Anders+andersen&page=1&postid=Folk_129416358&tab=post",
  },
  {
    caseName: "census_1930_leif_en",
    url: "https://sok.riksarkivet.se/en?Sokord=leif+eriksen&EndastDigitaliserat=false&TranskriberadText=false&AvanceradSok=False&page=1&postid=Folk_129505852&tab=post#tab",
  },
  {
    caseName: "death_1890_olga_henriette_en",
    url: "https://sok.riksarkivet.se/en/?Sokord=olga+nielsen&EndastDigitaliserat=false&TranskriberadText=false&AvanceradSok=False&page=6&postid=Doda_1221956&tab=post#tab",
  },
  {
    caseName: "inventory_1736_lars_en",
    url: "https://sok.riksarkivet.se/en?Sokord=lars&EndastDigitaliserat=false&TranskriberadText=false&AvanceradSok=false&page=34&postid=Bouppteckningar_24AB01CD-D91E-487F-909F-AC8C76A59452-0310A21F-B472-4E35-9A47-FAFDA24BF17F&tab=post#tab",
  },
  {
    caseName: "marriage_1844_anders_johansson_en",
    url: "https://sok.riksarkivet.se/en?EndastDigitaliserat=false&TranskriberadText=false&Namn=Anders+Peter+Johansson&DatumFran=1820&DatumTill=1860&AvanceradSok=true&page=45&postid=Vigsel_22716&tab=post#tab",
  },
  {
    caseName: "scb_1869_anga_en",
    url: "https://sok.riksarkivet.se/?Sokord=f%C3%B6rsamlingsutdrag&EndastDigitaliserat=false&TranskriberadText=false&Fritext=f%C3%B6rsamlingsutdrag&DatumFran=1860&DatumTill=1860&AvanceradSok=true&page=4&postid=Scb_827143&tab=post",
  },
  {
    caseName: "shipping_office_1875_andersen_anders_en",
    url: "https://sok.riksarkivet.se/en/?Sokord=Anders+andersen&page=10&postid=Sjoman_liggare_200626&tab=post",
  },
  {
    caseName: "shipping_office_1875_andersen_anders_sv",
    url: "https://sok.riksarkivet.se/?Sokord=Anders+andersen&page=10&postid=Sjoman_liggare_200626&tab=post",
  },
  {
    caseName: "shipping_office_1875_andersen_anders_sv_cten",
    url: "https://sok.riksarkivet.se/?Sokord=Anders+andersen&page=10&postid=Sjoman_liggare_200626&tab=post",
  },

  // image pages
  {
    caseName: "zz_birth_1889_helsingborg_sv",
    url: "https://sok.riksarkivet.se/bildvisning/00124893_00001#?xywh=-23%2C-863%2C3047%2C3856",
  },
  {
    caseName: "zz_census_1880_hallestad_alvsborg_en",
    url: "https://sok.riksarkivet.se/bildvisning/Folk_815089-017#?cv=16&xywh=-986%2C0%2C2771%2C1360",
  },
  {
    caseName: "zz_census_1880_hallestad_alvsborg_sv",
    url: "https://sok.riksarkivet.se/bildvisning/Folk_815089-017#?cv=16&xywh=-986%2C0%2C2771%2C1360",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("riksark", regressionData, testManager);

  await runGeneralizeDataTests("riksark", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("riksark", functions, regressionData, testManager);
}

export { runTests };
