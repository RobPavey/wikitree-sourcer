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

import { extractData } from "../../extension/site/psuk/core/psuk_extract_data.mjs";
import { generalizeData, regeneralizeData } from "../../extension/site/psuk/core/psuk_generalize_data.mjs";
import { buildCitation } from "../../extension/site/psuk/core/psuk_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const janeChamberlinFullNewData = {
  lastName: "Chamberlin",
  forenames: "Jane Ada",
  gender: "female",
  residence: "18 Hill-crescent, Totteridge, Hertfordshire",
  status: "widow",
  deathDate: "4 August 1950",
  deathPlace: "Danesborough, Durliegh, Bridgewater, Somersetshire",
  entryType: "Probate",
  probateRegistry: "London",
  probateDate: "31 August 1950",
  grantedTo: "Ada Riddell widow",
  effects: "480.",
  page: "127",
};

const ralphPaveyFullNewData = {
  lastName: "Pavey",
  forenames: "Ralph Edgar",
  gender: "male",
  residence: "14 New Oak Road, Finchley, London, N.2",
  status: "",
  deathDate: "8 Sep 1958",
  deathPlace: "Middlesex Hospital, London, W.1",
  entryType: "Administration",
  probateRegistry: "London",
  probateDate: "13 October 1958",
  grantedTo: "Elsie Sarah Pavey widow",
  effects: "477 7s. 4d.",
  page: "410",
};

const reginaldPaveyFullNewData = {
  lastName: "Pavey",
  forenames: "Reginald John",
  gender: "male",
  residence: "Manor Farm, Shorncote, Cirencester, Glos",
  status: "",
  deathDate: "2 March 1990",
  entryType: "Probate",
  probateRegistry: "Oxford",
  probateDate: "17 May 1990",
  effects: "Not exceeding 115000",
  reference: "9052204586H",
  page: "410",
};

const regressionData = [
  {
    // 1 Digital Result
    caseName: "probate_digital_2011_arthur_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
  {
    // 17 Digital Results
    caseName: "probate_digital_2011_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
  {
    caseName: "probate_image_1950_jane_chamberlin",
    url: "https://probatesearch.service.gov.uk/search-results",
    optionVariants: [
      {
        variantName: "regeneralizeFull",
        newData: janeChamberlinFullNewData,
      },
      {
        variantName: "regeneralizeFullString",
        newData: janeChamberlinFullNewData,
        optionOverrides: {
          citation_psuk_dataStyle: "string",
        },
      },
    ],
  },
  {
    caseName: "probate_image_1958_ralph_pavey_full",
    url: "https://probatesearch.service.gov.uk/search-results",
    optionVariants: [
      {
        variantName: "regeneralizeFull",
        newData: ralphPaveyFullNewData,
      },
      {
        variantName: "regeneralizeFullString",
        newData: ralphPaveyFullNewData,
        optionOverrides: {
          citation_psuk_dataStyle: "string",
        },
      },
    ],
  },
  {
    caseName: "probate_image_1958_ralph_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
  {
    caseName: "probate_image_1990_reginald_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
    optionVariants: [
      {
        variantName: "regeneralizeFull",
        newData: reginaldPaveyFullNewData,
      },
      {
        variantName: "regeneralizeFullString",
        newData: reginaldPaveyFullNewData,
        optionOverrides: {
          citation_psuk_dataStyle: "string",
        },
      },
    ],
  },
  {
    caseName: "search_results_1958_ralph_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
  {
    // 2 Digital Results of Soldier's wills
    caseName: "soldier_1918_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
  {
    // 2 Digital Results of Soldier's wills - then click on image
    // In this example the image has the wrong records
    caseName: "soldier_image_1918_pavey",
    url: "https://probatesearch.service.gov.uk/search-results",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("psuk", extractData, regressionData, testManager);

  await runGeneralizeDataTests("psuk", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation, regeneralizeData: regeneralizeData };
  await runBuildCitationTests("psuk", functions, regressionData, testManager);
}

export { runTests };
