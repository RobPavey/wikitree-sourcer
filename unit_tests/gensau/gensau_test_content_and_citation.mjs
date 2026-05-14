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

import { generalizeData } from "../../extension/site/gensau/core/gensau_generalize_data.mjs";
import { buildCitation } from "../../extension/site/gensau/core/gensau_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    // Name has a space
    caseName: "baptism_1855_ludovina_de_silva",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=40610&coid=church-baptism&cid=4&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bchurch-baptism%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3Bsilva%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3Bcf_clearance%26quot%3B%3A%26quot%3BAVszxRLpeSzwp1jtD0cr.3lflcYrPXHN.qGFNOTyrvg-1778715867-1.2.1.1-d_LqhN7qEfDXdasSlzvnFzkE2RILMuNRL9O0ggWLt6MWzOoySLZnO.LBusuLrPIq33X4_szuLt1pvenII7bHE7kKaJLuMLNrWhCH5iDFb0IM74H7K5dmsi1eZss1aK9uhKs34MfPBt9SXpM5OpaWnY9tlCltLAVGp.w2nyF2L1Kg9lc08Lr2SpUxiDu0JE5i7YkPtAprOVSOznNTFYWOlysPRM7lkzaEPyo9DM9rYd5tA3.CAXK_f3WcZma1wvgjlN2EG5hIzovZ5wgWAc.oIfOWDYuCjbiVfbWvpFYTUG3LDJqJWEK7E2tVsKE69PYjxvpY8zuHUTXsilyatSLr1w%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778716281%24j43%24l0%24h0%26quot%3B%7D",
  },
  {
    // Name should have an apostrophe
    caseName: "birthreg_1912_john_oreilly",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=531039&coid=birth&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BOReilly%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3BJohn%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BBook_Page%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715513%24j36%24l0%24h0%26quot%3B%7D",
  },
  {
    // Birth year is a range
    caseName: "birthreg_1859_07_john_smith",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=45682&coid=birth&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B3%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BSmith%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3BJohn%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BBook_Page%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715328%24j40%24l0%24h0%26quot%3B%7D",
  },
  {
    caseName: "birthreg_1898_marion_pavey",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=398862&coid=birth&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BPavey%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BShipName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B6d52faaaf5542f42fd9ea0c70e06845c%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.122280162.1758508694%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1764054188.1758508694%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1758508694%24o1%24g1%24t1758508710%24j44%24l0%24h0%26quot%3B%7D",
  },
  {
    caseName: "deathreg_1877_george_wilson",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=64887&coid=death&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bdeath%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B3%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BWilson%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715670%24j26%24l0%24h0%26quot%3B%7D",
  },
  {
    caseName: "deathreg_1902_dorothy_macdonald",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=168180&coid=death&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bdeath%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B2%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3Bmacdonald%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3BF%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3Bcf_clearance%26quot%3B%3A%26quot%3BAVszxRLpeSzwp1jtD0cr.3lflcYrPXHN.qGFNOTyrvg-1778715867-1.2.1.1-d_LqhN7qEfDXdasSlzvnFzkE2RILMuNRL9O0ggWLt6MWzOoySLZnO.LBusuLrPIq33X4_szuLt1pvenII7bHE7kKaJLuMLNrWhCH5iDFb0IM74H7K5dmsi1eZss1aK9uhKs34MfPBt9SXpM5OpaWnY9tlCltLAVGp.w2nyF2L1Kg9lc08Lr2SpUxiDu0JE5i7YkPtAprOVSOznNTFYWOlysPRM7lkzaEPyo9DM9rYd5tA3.CAXK_f3WcZma1wvgjlN2EG5hIzovZ5wgWAc.oIfOWDYuCjbiVfbWvpFYTUG3LDJqJWEK7E2tVsKE69PYjxvpY8zuHUTXsilyatSLr1w%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715931%24j60%24l0%24h0%26quot%3B%7D",
  },
  {
    caseName: "marriagereg_1854_roberta_macdonald",
    url: "https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=584450ecbde29be3334ebc5fa276dca5&coid=marriage&cid=5&Surname=macdonald&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bmarriage%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B2%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3Bmacdonald%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3Bcf_clearance%26quot%3B%3A%26quot%3BAVszxRLpeSzwp1jtD0cr.3lflcYrPXHN.qGFNOTyrvg-1778715867-1.2.1.1-d_LqhN7qEfDXdasSlzvnFzkE2RILMuNRL9O0ggWLt6MWzOoySLZnO.LBusuLrPIq33X4_szuLt1pvenII7bHE7kKaJLuMLNrWhCH5iDFb0IM74H7K5dmsi1eZss1aK9uhKs34MfPBt9SXpM5OpaWnY9tlCltLAVGp.w2nyF2L1Kg9lc08Lr2SpUxiDu0JE5i7YkPtAprOVSOznNTFYWOlysPRM7lkzaEPyo9DM9rYd5tA3.CAXK_f3WcZma1wvgjlN2EG5hIzovZ5wgWAc.oIfOWDYuCjbiVfbWvpFYTUG3LDJqJWEK7E2tVsKE69PYjxvpY8zuHUTXsilyatSLr1w%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778716040%24j53%24l0%24h0%26quot%3B%7D",
  },
];

async function runTests(testManager) {
  await runExtractDataTests("gensau", regressionData, testManager);

  await runGeneralizeDataTests("gensau", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("gensau", functions, regressionData, testManager);
}

export { runTests };
