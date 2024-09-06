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
    caseName: "birth_1846_nr_archdall",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/detailnonmodal/ent:$002f$002fNAME_INDEXES$002f0$002fNAME_INDEXES:1106997/one?qu=Henry&qu=Abigail&qu=Archdall&qf=NI_INDEX%09Record+type%09Births%09Births&qf=PUBDATE%09Year%091846%091846",
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
    caseName: "convict_1818_mary_smith",
    url: "https://librariestas.ent.sirsidynix.net.au/client/en_AU/names/search/results?qu=Mary&qu=Smith&qf=PUBDATE%09Year%091799-1843%091799-1843&qf=PUBDATE%09Year%091817-1822%091817-1822&qf=PUBDATE%09Year%091818%091818#",
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
