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

import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";
import { buildCitation } from "../../extension/site/fs/core/fs_build_citation.mjs";
import { runBuildHouseholdTableTests } from "../test_utils/test_build_household_table_utils.mjs";

const regressionData = [
  {
    // https://www.familysearch.org/ark:/61903/1:1:SG5F-42W
    caseName: "england_census_1851_elizabeth_martin",
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:Q277-QXTG
    caseName: "england_census_1881_esther_pavey",
    optionVariants: [
      {
        variantName: "heading_none",
        optionOverrides: { table_table_heading: "none" },
      },
      {
        variantName: "heading_plain",
        optionOverrides: { table_table_heading: "plain" },
      },
      {
        variantName: "heading_bgGreen",
        optionOverrides: { table_table_heading: "bgGreen" },
      },
      {
        variantName: "heading_boldCentered",
        optionOverrides: { table_table_heading: "boldCentered" },
      },
      {
        variantName: "heading_bgGreenBoldCentered",
        optionOverrides: { table_table_heading: "bgGreenBoldCentered" },
      },
      {
        variantName: "selected_plain",
        optionOverrides: { table_table_selectedPerson: "plain" },
      },
      {
        variantName: "selected_bgYellowRow",
        optionOverrides: { table_table_selectedPerson: "bgYellowRow" },
      },
      {
        variantName: "selected_boldRow",
        optionOverrides: { table_table_selectedPerson: "boldRow" },
      },
      {
        variantName: "selected_boldCenteredRow",
        optionOverrides: { table_table_selectedPerson: "boldCenteredRow" },
      },
      {
        variantName: "selected_boldName",
        optionOverrides: { table_table_selectedPerson: "boldName" },
      },
      {
        variantName: "selected_bgYellowBoldRow",
        optionOverrides: { table_table_selectedPerson: "bgYellowBoldRow" },
      },
      {
        variantName: "selected_bgYellowBoldCenteredRow",
        optionOverrides: { table_table_selectedPerson: "bgYellowBoldCenteredRow" },
      },
      {
        variantName: "selected_bgYellowBoldName",
        optionOverrides: { table_table_selectedPerson: "bgYellowBoldName" },
      },
      {
        variantName: "caption_titlePlace",
        optionOverrides: { table_table_caption: "titlePlace" },
      },
      {
        variantName: "caption_titlePlaceNoCountry",
        optionOverrides: { table_table_caption: "titlePlaceNoCountry" },
      },
      {
        variantName: "caption_datePlace",
        optionOverrides: { table_table_caption: "datePlace" },
      },
      {
        variantName: "caption_datePlaceNoCountry",
        optionOverrides: { table_table_caption: "datePlaceNoCountry" },
      },
      {
        variantName: "list_default",
        optionOverrides: { table_general_format: "list" },
      },
      {
        variantName: "sentence_default",
        optionOverrides: { table_general_format: "sentence" },
      },
      {
        variantName: "sentence_included_and",
        optionOverrides: {
          table_general_format: "sentence",
          table_sentence_preamble: "included",
          table_sentence_lastItemPunctuation: "and",
        },
      },
      {
        variantName: "sentence_enumerated",
        optionOverrides: {
          table_general_format: "sentence",
          table_sentence_preamble: "enumerated",
          table_sentence_lastItemPunctuation: "commaAnd",
          table_sentence_includeRelationship: false,
          table_sentence_includeAge: false,
        },
      },
    ],
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:728V-TTT2
    caseName: "england_census_1939_ellen_day",
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:MHSV-QLY
    caseName: "us_census_1880_alice_miller",
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:VB3M-FG7
    caseName: "us_census_1940_addie_bullock",
  },
  {
    // https://www.familysearch.org/ark:/61903/1:1:K438-8WS
    caseName: "us_census_1940_william_huffstetler",
  },
  {
    // Case where the fact type is residence rather than census
    // https://www.familysearch.org/ark:/61903/1:1:MQ6G-CR3
    caseName: "us_mn_census_1895_david_palm",
  },
];

async function runTests(testManager) {
  await runBuildHouseholdTableTests("fs", buildHouseholdTable, buildCitation, regressionData, testManager);
}

export { runTests };
