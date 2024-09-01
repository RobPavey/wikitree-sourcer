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

import { extractData } from "../../extension/site/vicbdm/core/vicbdm_extract_data.mjs";
import { generalizeData } from "../../extension/site/vicbdm/core/vicbdm_generalize_data.mjs";
import { buildCitation } from "../../extension/site/vicbdm/core/vicbdm_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // Has UNKNOWN as mmn and a birth place in New South Wales
    caseName: "birth_1841_joseph_smith",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c6547cb4aba80ac31d06036?q=efamily&givenName=Joseph%20Thomas&familyName=SMITH",
  },
  {
    // Father first name is "U"
    caseName: "birth_1883_michael_smith",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c6543544aba80ac3177dae1?q=efamily&givenName=Michael%20Hennessy&familyName=SMITH",
  },
  {
    // At sea on board a ship
    caseName: "birth_1861_william_fraser",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c6546bd4aba80ac31806a71?q=efamily&givenName=William%20Holmes%20Alexander&familyName=FRASER",
    optionVariants: [
      {
        variantName: "dataStyle_none",
        optionOverrides: {
          citation_vicbdm_dataStyle: "none",
        },
      },
      {
        variantName: "dataStyle_sentence",
        optionOverrides: {
          citation_vicbdm_dataStyle: "sentence",
        },
      },
      {
        variantName: "dataStyle_listOriginal",
        optionOverrides: {
          citation_vicbdm_dataStyle: "listOriginal",
        },
      },
    ],
  },
  {
    // Many given names: Victoria Claribel Viola P P
    caseName: "birth_1885_victoria_taylor",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c6545f24aba80ac3144087d?q=efamily&givenName=Victoria%20Claribel%20Viola%20P%20P&familyName=TAYLOR",
  },
  {
    // corresponding WikiTree profile: https://www.wikitree.com/wiki/Nicholson-6779
    caseName: "birth_1896_ruby_nicholson",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c653e7e4aba80ac31d82ee4?q=efamily&givenName=Ruby%20Jessie%20Bertha&familyName=NICHOLSON",
    optionVariants: [
      {
        variantName: "ee_style",
        optionOverrides: {
          citation_general_meaningfulNames: "none",
          citation_general_commaInsideQuotes: true,
          citation_general_addEeItemType: true,
          citation_general_addAccessedDate: "parenBeforeLink",
          citation_general_sourceReferenceSeparator: "commaSpace",
          citation_general_dataListSeparator: "commaSpace",
          citation_general_addNewlinesWithinRefs: false,
          citation_general_addNewlinesWithinBody: false,
          citation_general_addBreaksWithinBody: false,
          citation_vicbdm_includeLink: "asLinkToSearchPage",
          citation_vicbdm_sourceTitleFormat: "vsgrbdmv",
        },
      },
      {
        variantName: "bee_style",
        optionOverrides: {
          citation_general_meaningfulNames: "none",
          citation_general_commaInsideQuotes: true,
          citation_general_addAccessedDate: "parenBeforeLink",
          citation_general_sourceReferenceSeparator: "commaSpace",
          citation_general_dataListSeparator: "commaSpace",
          citation_general_addNewlinesWithinRefs: false,
          citation_general_addNewlinesWithinBody: false,
          citation_general_addBreaksWithinBody: false,
          citation_vicbdm_includeLink: "inSourceTitle",
        },
      },
    ],
  },
  {
    // Has male and female person's called "Fran".
    caseName: "birth_1907_regd_taylor",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c656f204aba80ac314e3946?q=efamily&givenName=Regd%20Fran&familyName=TAYLOR",
  },
  {
    // corresponding FMP record: https://www.findmypast.co.uk/transcript?id=ANZ%2FBMD%2FACTBIRT%2F1562899
    // Which has expanded given names
    // Also has VIC in place name (although it does not in search results list)
    caseName: "birth_1908_bernard_callaghan",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c656aec4aba80ac3101e0f3?q=efamily&givenName=Bernard%20Jno&familyName=CALLAGHAN",
  },
  {
    // On board a ship
    caseName: "death_1850_donald_johnston",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/662ed1b068d03925b30fc254/record/5c6547cb4aba80ac31d04156?q=efamily&givenName=Donald&familyName=JOHNSTON",
  },
  {
    // MMN is "U"
    caseName: "death_1862_james_smith",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c6537244aba80ac31c96f5a?q=efamily&givenName=James&familyName=SMITH",
  },
  {
    // has last names of both parents
    caseName: "death_1873_isabella_stewart",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/663d2066c4208225838536a8/record/5c6547bb4aba80ac31cb23d8?q=efamily&givenName=Isabella&familyName=STEWART",
  },
  {
    // has last name of mother only
    caseName: "death_1875_alexander_stewart",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/663d2066c4208225838536a8/record/5c653cbb4aba80ac311d32a6?q=efamily&givenName=Alexander&familyName=STEWART",
    extraExtractedDataFields: {
      clickedRowData: {
        "Family name": "STEWART",
        "Given name(s)": "Alexander",
        Event: "Death",
        "Mother's name / Spouse's name": "<Unknown Family Name>, Margaret",
        "Mother's family name at birth": "WILKINSON",
        "Father's name": "<Unknown Family Name>, John",
        "Place of birth": "CAMP",
        "Place of death": "",
        "Spouse at Death": "MCINNIS, Lilly",
        "Age at Death": "34",
        "Reg. year": "1875",
        "Reg. number": "15520/1875",
        "In cart": "",
      },
    },
    optionVariants: [
      {
        variantName: "sentenceStructure_twoSentences",
        optionOverrides: {
          narrative_deathRegReg_sentenceStructure: "twoSentences",
        },
      },
      {
        variantName: "sentenceStructure_twoSentencesDate",
        optionOverrides: {
          narrative_deathRegReg_sentenceStructure: "twoSentencesDate",
        },
      },
    ],
  },
  {
    caseName: "death_1939_fanny_nicholson",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c6547444aba80ac31a8d8ff?q=efamily&givenName=Fanny&familyName=NICHOLSON",
  },
  {
    caseName: "death_1993_susanne_pavey",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c6540894aba80ac319fdbbb?q=efamily&givenName=Susanne%20Mary&familyName=PAVEY",
  },
  {
    caseName: "death_1993_vera_ing",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/66355a8368d03925b31054d1/record/5c65459e4aba80ac312a46fb?q=efamily&givenName=Vera%20Minnie&familyName=ING",
  },
  {
    // Has place name
    caseName: "marriage_1852_john_brilant",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/662ed1b068d03925b30fc254/record/5c6553c84aba80ac31473b14?q=efamily&givenName=John&familyName=BRILANT",
  },
  {
    // has no place name
    caseName: "marriage_1920_clement_mcdonald",
    url: "https://my.rio.bdm.vic.gov.au/efamily-history/6627e4adc42082258383a0fa/record/5c655e964aba80ac315081f4?q=efamily&givenName=Clement%20Courtney&familyName=MCDONALD",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("vicbdm", extractData, regressionData, testManager);

  await runGeneralizeDataTests("vicbdm", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("vicbdm", functions, regressionData, testManager);
}

export { runTests };
