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

import { extractData } from "../../extension/site/gbooks/core/gbooks_extract_data.mjs";
import { generalizeData } from "../../extension/site/gbooks/core/gbooks_generalize_data.mjs";
import { buildCitation } from "../../extension/site/gbooks/core/gbooks_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "a_memory_of_honour",
    url: "https://www.google.com/books/edition/A_Memory_of_Honour/exkJswEACAAJ?hl=en",
    optionVariants: [
      {
        variantName: "noSubtitle",
        optionOverrides: { citation_gbooks_titleContent: "title" },
      },
    ],
  },
  {
    caseName: "calendar_of_state_papers_uk",
    url: "https://www.google.co.uk/books/edition/Calendar_of_State_Papers_Domestic_Series/Qw4SAAAAYAAJ?hl=en&gbpv=1&pg=PA504&printsec=frontcover&pli=1",
    optionVariants: [
      {
        variantName: "authorPageAllPubPage",
        optionOverrides: { citation_gbooks_authorNames: "pageAll", citation_gbooks_publisherDetails: "page" },
      },
      {
        variantName: "authorPage3PubChicago",
        optionOverrides: { citation_gbooks_authorNames: "page3", citation_gbooks_publisherDetails: "chicago" },
      },
      {
        variantName: "authorPage3Editors",
        optionOverrides: { citation_gbooks_authorNames: "page3Editors" },
      },
      {
        variantName: "authorChicago",
        optionOverrides: { citation_gbooks_authorNames: "chicago" },
      },
      {
        variantName: "authorApa",
        optionOverrides: { citation_gbooks_authorNames: "apa" },
      },
    ],
  },
  {
    caseName: "great_migration_snippet",
    url: "https://www.google.com/books/edition/The_Great_Migration_Begins/aD4hAQAAMAAJ?hl=en&gbpv=1&bsq=Robert+Charles+Anderson,+The+Great+Migration+Begins:+Immigrants+to+New+England+1620-1633,&dq=Robert+Charles+Anderson,+The+Great+Migration+Begins:+Immigrants+to+New+England+1620-1633,&printsec=frontcover",
  },
  {
    caseName: "harvard_classics_all_51_volumes",
    url: "https://www.google.com/books/edition/Harvard_Classics_All_51_Volumes/wOGcEAAAQBAJ?hl=en&gbpv=0",
    optionVariants: [
      {
        variantName: "authorPageAllPubPage",
        optionOverrides: { citation_gbooks_authorNames: "pageAll", citation_gbooks_publisherDetails: "page" },
      },
      {
        variantName: "authorPage3PubChicago",
        optionOverrides: { citation_gbooks_authorNames: "page3", citation_gbooks_publisherDetails: "chicago" },
      },
      {
        variantName: "authorPage3Editors",
        optionOverrides: { citation_gbooks_authorNames: "page3Editors" },
      },
      {
        variantName: "authorChicago",
        optionOverrides: { citation_gbooks_authorNames: "chicago" },
      },
      {
        variantName: "authorApa",
        optionOverrides: { citation_gbooks_authorNames: "apa" },
      },
    ],
  },
  {
    caseName: "linn_county_iowa_1887",
    url: "https://www.google.com/books/edition/Portrait_and_Biographical_Album_of_Linn/hlA0AQAAMAAJ?q=&gbpv=1&bsq=riddle#f=false",
    optionVariants: [
      {
        variantName: "noSubtitle",
        optionOverrides: { citation_gbooks_titleContent: "title" },
      },
    ],
  },
  {
    caseName: "oldcastle",
    url: "https://www.google.com/books/edition/The_First_Part_of_the_True_and_Honorable/sDbPAAAAMAAJ?hl=en&gbpv=1&dq=Cobham+Lord&printsec=frontcover",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("gbooks", extractData, regressionData, testManager);

  await runGeneralizeDataTests("gbooks", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("gbooks", functions, regressionData, testManager);
}

export { runTests };
