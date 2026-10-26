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

import { generalizeData } from "../../extension/site/archivesnz/core/archivesnz_generalize_data.mjs";
import { buildCitation } from "../../extension/site/archivesnz/core/archivesnz_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "probate_item_with_image",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R22059776/cullen-peter-smith---mataura---retired-farmer",
  },
  {
    caseName: "probate_item_with_accession_years",
    pageFile: "./unit_tests/archivesnz/saved_pages/probate_item_with_accession_years.html",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R22213838/mckelvey-william",
    extraExtractedDataFields: {
      title: "McKELVEY, William",
      itemFields: {
        "Record number": "3681",
        Years: "1891 - 1891",
        "Box number": "67",
        Location: "Wellington repository",
        "Access status": "Open",
      },
      seriesFields: {
        "Series name": "Wellington probate files (first sequence)",
        Code: "6029",
        "Holdings years": "1843 - 1939",
        Location: "Wellington repository",
      },
      imageUrl: "https://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE63680665",
    },
  },
  {
    caseName: "dunedin_probate_file",
    pageFile: "./unit_tests/archivesnz/saved_pages/divorce_item_without_image.html",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R22042760/smith-stephen---goodwood---settler",
    extraExtractedDataFields: {
      title: "SMITH Stephen - Goodwood - Settler",
      itemFields: {
        "Record number": "37",
        Years: "1860 - 1860",
        "Box number": "2",
        Location: "Dunedin repository",
        "Access status": "Open",
      },
      seriesFields: { "Series name": "Dunedin probate files", Code: "9073" },
      imageUrl: "https://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE76142462",
    },
  },
  {
    caseName: "divorce_item_without_image",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R22751256/burns-peter-john-cullen-v-burns-grete",
  },
  {
    caseName: "naturalisation_record",
    pageFile: "./unit_tests/archivesnz/saved_pages/divorce_item_without_image.html",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R24925560/from%3A-christian-schischka%2C-puhoi-date%3A-15-july-1899-subject%3A-memorial-for-naturalisation-of-matthew-wech",
    extraExtractedDataFields: {
      title: "From: Christian Schischka, Puhoi Date: 15 July 1899 Subject: Memorial for Naturalisation of Matthew Wech",
      itemFields: {
        "Record number": "1899/2369",
        Years: "1899 - 1899",
        "Box number": "769",
        "Position reference": "[19]",
        Location: "Wellington repository",
        "Access status": "Open",
      },
      seriesFields: { "Series name": "Central filing system", Code: "8333" },
      imageUrl: "https://ndhadeliver.natlib.govt.nz/delivery/DeliveryManagerServlet?dps_pid=IE51998879",
    },
  },
  {
    caseName: "military_personnel_series",
    pageFile: "./unit_tests/archivesnz/saved_pages/divorce_item_without_image.html",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R24055565/cullen-peter-leo-army",
    extraExtractedDataFields: {
      title: "CULLEN, Peter Leo - WWI 27233, WWII 806614 - Army",
      itemFields: {
        "Record number": "0030739",
        Years: "1914 - 1945",
        "Box number": "17",
        Location: "Wellington repository",
        "Access status": "Restricted",
      },
      seriesFields: { "Series name": "Military Personnel Files", Code: "18805" },
    },
  },
  {
    caseName: "coroners_inquest_series",
    pageFile: "./unit_tests/archivesnz/saved_pages/divorce_item_without_image.html",
    url: "https://collections.archives.govt.nz/en/web/arena/search#/entity/aims-archive/R23882339/coroners-inquests-case-files",
    extraExtractedDataFields: {
      title: "Coroners inquests unnecessary - Case files - " + Array(12).fill("Grant, Kathleen Isabell").join("; "),
      itemFields: {
        "Record number": "CR1960/1 -CR1960/100",
        Years: "1960 - 1960",
        "Box number": "1601",
        Location: "Wellington repository",
        "Access status": "Open",
      },
      seriesFields: { "Series name": "Coroners Inquests, case files", Code: "16231" },
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("archivesnz", regressionData, testManager);

  await runGeneralizeDataTests("archivesnz", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("archivesnz", functions, regressionData, testManager);
}

export { runTests };
