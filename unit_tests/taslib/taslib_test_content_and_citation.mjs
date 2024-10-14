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

import { extractData } from "../../extension/site/taslib/core/taslib_extract_data.mjs";
import { generalizeData } from "../../extension/site/taslib/core/taslib_generalize_data.mjs";
import { buildCitation } from "../../extension/site/taslib/core/taslib_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "arrival_1840_william_taylor",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1575259/one?qu=Taylor&qf=NI_INDEX%09Record+type%09Arrivals%09Arrivals&qf=NI_NAME_FACET%09Name%09Taylor%2C+William%09Taylor%2C+William&qf=PUBDATE%09Year%091840-1842%091840-1842&qf=PUBDATE%09Year%091840%091840",
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
        },
      },
      {
        variantName: "dataList",
        optionOverrides: {
          citation_taslib_dataStyle: "list",
        },
      },
      {
        variantName: "dataListNoRef",
        optionOverrides: {
          citation_taslib_dataStyle: "listNoRef",
        },
      },
    ],
  },
  {
    caseName: "baptism_1829_amelia_wilson",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=NI_NAME%3DAmelia%20Wilson&qf=PUBDATE%09Year%091820-1824%091820-1824&qf=NI_INDEX%09Record+type%09Births%09Births",
  },
  {
    caseName: "baptism_1838_lucy_lempriere",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091823-1851%091823-1851&qf=PUBDATE%09Year%091837-1840%091837-1840&qf=PUBDATE%09Year%091838%091838&qu=Lempriere%2C&qu=Lucy&qu=Maria#",
  },
  {
    caseName: "baptism_1839_amy_dixon",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091823-1851%091823-1851&qf=PUBDATE%09Year%091837-1840%091837-1840&qf=PUBDATE%09Year%091838%091838&qu=Lempriere%2C&qu=Lucy&qu=Maria#",
  },
  {
    caseName: "birth_1838_margaret_loughnan",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1106997/one?qu=Henry&qu=Abigail&qu=Archdall&qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091846%091846",
  },
  {
    caseName: "birth_1839_amy_dixon",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1106997/one?qu=Henry&qu=Abigail&qu=Archdall&qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091846%091846",
  },
  {
    caseName: "birth_1839_clara_lucas",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1106997/one?qu=Henry&qu=Abigail&qu=Archdall&qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091846%091846",
  },
  {
    caseName: "birth_1846_nr_archdall",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1106997/one?qu=Henry&qu=Abigail&qu=Archdall&qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091846%091846",
  },
  {
    caseName: "birth_1852_lucy_lempriere",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091823-1851%091823-1851&qf=PUBDATE%09Year%091837-1840%091837-1840&qf=PUBDATE%09Year%091838%091838&qu=Lempriere%2C&qu=Lucy&qu=Maria#",
  },
  {
    caseName: "birth_1903_david_watkins_pl",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:2055114/one",
  },
  {
    caseName: "birth_1903_david_watkins_s",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qf=NI_INDEX%09Record+type%09Births%09Births",
  },
  {
    caseName: "burial_1835_mary_jones",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Mary&qu=Jones&qf=NI_INDEX%09Record+type%09Deaths%09Deaths&qf=PUBDATE%09Year%091833-1852%091833-1852#",
  },
  {
    caseName: "burial_1839_esther_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Mary&qu=Jones&qf=NI_INDEX%09Record+type%09Deaths%09Deaths&qf=PUBDATE%09Year%091833-1852%091833-1852#",
  },
  {
    caseName: "census_1848_john_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=NI_NAME%3DJohn+Smith&qf=NI_INDEX%09Record+type%09Census%09Census",
  },
  {
    caseName: "convict_1818_mary_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Mary&qu=Smith&qf=PUBDATE%09Year%091799-1843%091799-1843&qf=PUBDATE%09Year%091817-1822%091817-1822&qf=PUBDATE%09Year%091818%091818#",
  },
  {
    caseName: "convict_1844_sydney_johnson",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1798382/one?qu=NI_INDEX%3D%22Convicts%22&qu=Sydney&qu=Johnson",
    optionVariants: [
      {
        variantName: "dataList",
        optionOverrides: {
          citation_taslib_dataStyle: "list",
        },
      },
      {
        variantName: "dataListNoRef",
        optionOverrides: {
          citation_taslib_dataStyle: "listNoRef",
        },
      },
    ],
  },
  {
    caseName: "death_1839_michael_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1151285/one?qu=Sarah&qu=Proctor&qf=NI_INDEX%09Record+type%09Deaths%09Deaths&qf=PUBDATE%09Year%091874%091874",
  },
  {
    caseName: "death_1874_sarah_proctor",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1151285/one?qu=Sarah&qu=Proctor&qf=NI_INDEX%09Record+type%09Deaths%09Deaths&qf=PUBDATE%09Year%091874%091874",
  },
  {
    caseName: "death_1925_sarah_proctor",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Sarah&qu=Proctor&qf=NI_INDEX%09Record+type%09Deaths%09Deaths",
  },
  {
    caseName: "departure_1818_john_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Mary&qu=Smith&qf=PUBDATE%09Year%091799-1843%091799-1843&qf=PUBDATE%09Year%091817-1822%091817-1822&qf=PUBDATE%09Year%091818%091818#",
  },
  {
    caseName: "divorce_1950_clarence_grice",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=NI_NAME%3DClarence%20Vernon%20Grice&qf=PUBDATE%09Year%091890-1962%091890-1962",
  },
  {
    caseName: "inquest_1845_james_wilson",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1366607/one?qu=James&qu=Wilson&qf=NI_INDEX%09Record+type%09Inquests%09Inquests&qf=NI_NAME_FACET%09Name%09Wilson%2C+James%09Wilson%2C+James&qf=PUBDATE%09Year%091845%091845",
  },
  {
    caseName: "marriage_1842_sarah_bassett",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:829392/one",
  },
  {
    caseName: "marriage_1857_benjamin_harmstrong",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Benjamin&qu=Harmstrong&qu=Mary&qu=Sangwell",
  },
  {
    caseName: "will_1963_clarence_grice",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=NI_NAME%3DClarence+Vernon+Grice&qf=PUBDATE%09Year%091950-1963%091950-1963",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("taslib", extractData, regressionData, testManager);

  await runGeneralizeDataTests("taslib", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("taslib", functions, regressionData, testManager);
}

export { runTests };
