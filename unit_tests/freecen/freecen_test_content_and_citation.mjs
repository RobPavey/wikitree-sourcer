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

import { extractData } from "../../extension/site/freecen/core/freecen_extract_data.mjs";
import { generalizeData } from "../../extension/site/freecen/core/freecen_generalize_data.mjs";
import { buildCitation } from "../../extension/site/freecen/core/freecen_build_citation.mjs";
import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "1841_dev_zachariah_pavey",
    url: "https://www.freecen.org.uk/search_records/5a1447aaf4040b9d6e39609c/zachariah-pavey-1841-devon-axminster-1761-?locale=en",
  },
  {
    caseName: "1851_som_eliza_pavey",
    url: "https://www.freecen.org.uk/search_records/5accf4a9f4040b6d5177d1d1/eliza-pavey-1851-somerset-axbridge-1813-?locale=en",
  },
  {
    caseName: "1861_dev_william_pavey",
    url: "https://www.freecen.org.uk/search_records/5a1466eaf4040b9d6e5d459a/william-pavey-1861-devon-chardstock-1788-?locale=en",
  },
  {
    caseName: "1871_ery_louisa_barker",
    url: "https://www.freecen.org.uk/search_records/5c38cb9df4040b8d324b5eb0/louisa-barker-1871-yorkshire-east-riding-york-1850-?locale=en",
  },
  {
    caseName: "1881_cai_john_williamson",
    url: "https://www.freecen.org.uk/search_records/59028a7be9379091b15ccad9/john-williamson-1881-caithness-halkirk-1831-?locale=en",
  },
  {
    caseName: "1891_dev_louisa_hockridge",
    url: "https://www.freecen.org.uk/search_records/5902e09ce9379091b1b7a9eb/louisa-hockridge-1891-devon-plymouth-1876-?locale=en",
  },
  {
    caseName: "1891_lnd_felix_mills",
    url: "https://www.freecen.org.uk/search_records/5903c431e9379091b1ccfb4d/felix-mills-1891-london-city-pancras-1854-?locale=en",
  },
  {
    caseName: "1901_con_elizabeth_jonas",
    url: "https://www.freecen.org.uk/search_records/6255156ef493fd50a59653e5/elizabeth-s-jonas-1901-cornwall-launceston-1881-?locale=en",
  },
  {
    caseName: "1911_som_beatrice_jones",
    url: "https://www.freecen.org.uk/search_records/5ff99b0ef493fdf2b5504fc1/beatrice-florence-jones-1911-somerset-minehead-1879-?locale=en",
  },
  {
    // same URL as above but it was laid out differently this time (28 Apr 2022)
    caseName: "1911_som_beatrice_jones_variant",
    url: "https://www.freecen.org.uk/search_records/5ff99b0ef493fdf2b5504fc1/beatrice-florence-jones-1911-somerset-minehead-1879-?locale=en",
  },
  {
    caseName: "1911_som_elizabeth_taylor",
    url: "https://www.freecen.org.uk/search_records/61811fa6f493fdc50c65e3b0/elizabeth-taylor-1911-somerset-luxborough-1842-?locale=en",
  },
];

const optionVariants = [
  {
    variantName: "dataStyle_none",
    optionOverrides: {
      citation_freecen_dataStyle: "none",
    },
  },
  {
    variantName: "dataStyle_string",
    optionOverrides: {
      citation_freecen_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_list",
    optionOverrides: {
      citation_freecen_dataStyle: "list",
    },
  },
  {
    variantName: "dataStyle_table",
    optionOverrides: {
      citation_freecen_dataStyle: "table",
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("freecen", extractData, regressionData, testManager);

  await runGeneralizeDataTests("freecen", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation, buildTable: buildHouseholdTable };
  await runBuildCitationTests("freecen", functions, regressionData, testManager, optionVariants);
}

export { runTests };
