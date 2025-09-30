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

import { extractData } from "../../extension/site/eggsabdm/core/eggsabdm_extract_data.mjs";
import { generalizeData } from "../../extension/site/eggsabdm/core/eggsabdm_generalize_data.mjs";
import { buildCitation } from "../../extension/site/eggsabdm/core/eggsabdm_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

// All the searches below for the test cases were done on "all registers"
//
const regressionData = [
  ////////////////////////////////////////////////////////////////////////////////////////////////
  // BAPTISM
  //
  // Different forms of father, mother and dates
  {
    // Aletta
    // Baptised: 1762, den 14 Maert
    // Father: Barend van den Berg
    // Mother: Johanna Sophia van Wijk
    caseName: "baptism_aletta_van_den_berg_1762",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Mother  with van Wijk anywhere in the surname  with Johanna Sophia anywhere in the first name
  },
  {
    // Same as above, but the mother (Johanna Sophia van Wijk)
    caseName: "baptism_aletta_van_den_berg_1762-mother",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    pageFile: "./unit_tests/eggsabdm/saved_pages/baptism_aletta_van_den_berg_1762.html",
    primaryPersonIndex: 2,
  },
  {
    // Aletta Catharina
    // Baptised: 1769, 17 September 1769
    // Father: Aleweijn SMITH (JACOBUSZOON)
    // Mother: Engela Helena VAN NIEUWKERKEN
    caseName: "baptism_aletta_catharina_1769",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with aletta catharina anywhere in the first name
  },
  {
    // Anna Sophia
    // Baptised: 08 Apr 1838
    // Born: 04 Feb 1839
    // Father: Petrus Erasmus Johannes SMITH
    // Mother: Anna Dorothea Willemina MERWE vd
    caseName: "baptism_anna_sophia_smith_1838",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with anna sophia anywhere in the first name
  },
  {
    // Elisabeth Louisa
    // Baptised: 11 Jul 1841
    // Born: 08 Oct 1840
    // Father: Abraham Paulus BERG vd
    // Mother: Cornelia Gertruida Margaritha STEYN
    caseName: "baptism_elisabeth_louisa_vd_berg_1841",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with berg anywhere in the surname  with Elisabeth Louisa anywhere in the first name
  },
  {
    // Engela Elisabeth Christina
    // Baptised: 1801, 5 Apr 1801
    // Born: dn 20 Febr:
    // Father: Maarten Johs. SMIT (Maartenzn:)
    // Mother: Adriana Beatrix SMIT
    caseName: "baptism_engela_elisabeth_smit_1801",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit anywhere in the surname  with Engela Elisabeth Christina anywhere in the first name
  },
  {
    // Hilletje Aletta Johanna
    // Baptised: 1800, 30 Maart 1800
    // Father: Everhardus Johannis SMIT (Chris[])
    // Mother: Maria BRAND
    caseName: "baptism_hilletje_aletta_1800",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit exact match to the surname  with Hilletje Aletta exact match to the first name  in all the registers
  },
  {
    // Hilletje Aletta
    // Baptised: 1801, 4 Oct 1801
    // Born: dn 7 Julij
    // Father: Jacobus Everhardus SMIT Maartzn
    // Mother: Huijbrechtje Elisabeth SMIT
    caseName: "baptism_hilletje_aletta_1801",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit exact match to the surname  with Hilletje Aletta exact match to the first name  in all the registers
  },
  {
    // Jacobus Johannes Poulus
    // Baptised: 21.4.1793
    // Father: Jacobus SMIT, Jasper Zn
    // Mother: Jacoba Elisabet Meyntjies VAN DEN BERG
    caseName: "baptism_jacobus_johannes_smit_1793",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit anywhere in the surname  with Jacobus Johannes Poulus anywhere in the first name
  },
  {
    // Johanna Ale[r]tha Jordina
    // Baptised: 1815, Zondag 26en Maart 1815
    // Born: 8: Maart 1815
    // Father: Jasper SMIT P:Z.
    // Mother: Hester VAN ZIJL
    caseName: "baptism_johanna_alertha_smit_1815",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit anywhere in the surname  with jordina anywhere in the first name
  },
  {
    // Johanna Christina
    // Baptised: 1782, den 14 April
    // Father: Abraham Paulus Van den Bergh
    // Mother: Handrina Jansen
    caseName: "baptism_johanna_christina_vd_bergh_1782",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Father  with van den bergh anywhere in the surname  with Abraham Paulus anywhere in the first name
  },
  {
    // Johannes
    // Baptised: 14.5.1805
    // Father: Pieter Meintjies VAN DEN BERG , De Oude
    // Mother: Nn NN
    caseName: "baptism_johannes_vd_berg_1805",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Father  with van den berg anywhere in the surname  with pieter meintjies anywhere in the first name
  },
  {
    // Maria Magdalena
    // Baptised: 26 May 1844, at Winburg (Vals River)
    // Born: 22 Nov 1842
    // Father: Gerhardus Johannes VOSLOO
    // Mother: Anna Maria Jacomina ENSLIN
    caseName: "baptism_maria_magdalena_vosloo_1844",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child with Vosloo anywhere in the surname with Maria anywhere
  },
  {
    // Martha Magdalena
    // Baptised: 1785, den 15 Maij
    // Father: Jacobus van der Berg d'oude
    // Mother: Martha Diederiks
    caseName: "baptism_martha_magdalena_vd_berg_1785",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with berg anywhere in the surname  with Martha Magdalena anywhere in the first name
  },
  {
    // Martha Margaretha
    // Baptised: 3 Nov 1851, at Smithfield
    // Born: 24 Mar 1851
    // Father: Jacobus Johannes E SMIT
    // Mother: Martha Maria VAN NIMWEGEN (?)
    caseName: "baptism_martha_margaretha_smit_1851",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smit anywhere in the surname  with martha margaretha anywhere in the first name
  },
  {
    // Neeltje Johanna Maria
    // Baptised: 1793, 3 November 1793
    // Father: Johannes SMITH (Gideon zn:)
    // Mother: Huijbregtje VISSER
    caseName: "baptism_neetltje_johanna_smit_1793",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with Neeltje Johanna Maria anywhere in the first name
  },
  {
    // [So]phia Elizabeth
    // Baptised: 1769, 5 Maart 1769
    // Father: Cristoffel SMITH CHRISTOFFELSZOON
    // Mother: Maria VAN WEIJK
    caseName: "baptism_sophia_elizabeth_smith_1769",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with sophia elisabeth anywhere in the first name
  },
  /* 
  {
    caseName: "baptism_",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search:
  },
 */
  // Different forms of Parents and dates (no father or mother field)
  // ----------------------------------------------------------------
  {
    // Gordon Lewis
    // Baptised: , October 13th
    // Born: September 17th 1907
    // Parents: James Lewis & Emily May SMITH
    caseName: "baptism_gordon_lewis_smith_1907",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with gordon lewis anywhere in the first name
  },
  {
    // Isabella
    // Baptised: 04 July 1819
    // daughter of: John SMITH
    // Baptised: English Church
    caseName: "baptism_isabella_smith_1819",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with isabella anywhere in the first name
  },
  {
    // Jan Johannes Petrus Jacobus
    // Baptised: 07 Jun 1890
    // Born: 12 May 1890
    // Parents: Jan Johannes Petrus and Aletta Elizabeth DE SMIEDT
    caseName: "baptism_jan_johannes_de_smiedt_1890_05",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smiedt anywhere in the surname  with johannes petrus anywhere in the first name
  },
  {
    // As above, but the mother ( Aletta Elizabeth de Smiedt)
    caseName: "baptism_jan_johannes_de_smiedt_1890_05-mother",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    pageFile: "./unit_tests/eggsabdm/saved_pages/baptism_jan_johannes_de_smiedt_1890_05.html",
    primaryPersonIndex: 2,
  },
  {
    // John
    // Baptised: 1850, Decr 27
    // Parents: John Caroline VERVORD SMITH
    // Occupation: Servant
    // Residence: Graham's Town
    caseName: "baptism_john_vervord_smith_1850",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with vervord anywhere in the surname  with john anywhere in the first name
  },
  {
    // Magdalena Johanna
    // Baptised: 25 Oct 1829
    // Born: 18 Sep 1829
    // Parents: Anna Carolina Frederica Smith
    caseName: "baptism_magdalena_johanna_smith_1829",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with magdalena johanna anywhere in the first name
  },
  {
    // Percival Frere
    // Baptised: 1877, Oct. 11
    // Born: Sept. 8 1877
    // Parents: Charles Thomas, Julia Emily SMITH
    caseName: "baptism_percival_smith_1877",
    url: "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",
    // Search: Child  with smith anywhere in the surname  with percival anywhere in the first name
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // BURIALS
  //
  {
    // last name at birth; buried date contains other information
    // ALING Catharina Wilhemena Jacoba
    // geb. de Vos
    // Died: 18 Nov 1940
    // Age at death: 67 Jaar
    // Buried: 19 Nov 1940, Blk C No 1
    caseName: "burial_aling_catharina_wilhelmina_1940",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search: Surname: Aling, First Name: catharina in all the registers
  },
  {
    // Only initials as first names
    // DE VOS J. J.
    // Born: 31 Jul 1959
    // Died: 28 Jan 2000
    // Buried: 03 Feb 2000
    caseName: "burial_de_vos_jj_2000",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search:
  },
  {
    // lastname capitalisation (Janse van Rensburg); removal of incorrect eGGSA URL
    // JANSE VAN RENSBURG Alwyn P. (Allie)
    // Born: 03 Jun 1953
    // Died: 26 Feb 2000
    // Buried: 01 Mar 2000
    caseName: "burial_janse_van_rensburg_alwyn_2000",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search: Surname: rensburg, First Name: alwyn in all the registers
  },
  {
    // residence, born, died, buried (all standard)
    // VOSLOO Catherina Maria
    // Residence: Westering
    // Born: 25 Feb 1902
    // Died: 09 Oct 1987
    // Buried: 13 Oct 1987
    caseName: "burial_vosloo_catharina_maria_1987",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search: Surname: vosloo, First Name: maria
  },
  {
    // died, age, buried (years only)
    // VOSLOO Maria Magdalena Elizabeth
    // Died: 1958
    // Age at death: 50
    // Buried: 1958
    caseName: "burial_vosloo_maria_magdalena_1958",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search: Surname: vosloo, First Name: maria
  },
  /*   
  {
    caseName: "burial_",
    url: "https://www.eggsa.org/cgi-bin/dosearchBurials.pl",
    // Search:
  },
 */
  ////////////////////////////////////////////////////////////////////////////////////////////////
  // MARRIAGES
  //
  {
    // 15 Aug 1842
    // 1842,
    // Cornelis Frans (F zn) Vermeulen
    // and
    // Engela Helena Smit
    caseName: "marriage_cornelis_vermeulen_1842",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    // Search: Groom  with vermeulen anywhere in the surname  with cornelis frans anywhere in the first name
  },
  {
    // 7 Dec 1834
    // 1834, 7 Decemb.
    // Eduard Christiaan Hamman, Nicolaas zoon
    // age: oud 20 jaren, status: jongman
    // (getrouwd) met
    // Maria Margaretha Wilhelmina Smith, [Alius] dochter
    // age: oud 17 jaren , status: jonge dochter
    caseName: "marriage_eduard_hamman_1834",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    // Groom  with hamman anywhere in the surname  with eduard anywhere in the first name
  },
  {
    // As above but the bride (Maria Margaretha Wilhelmina Smith)
    caseName: "marriage_eduard_hamman_1834-bride",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    pageFile: "./unit_tests/eggsabdm/saved_pages/marriage_eduard_hamman_1834.html",
    primaryPersonIndex: 1,
  },
  {
    // all caps last names, multi-word last name, single record, not selected
    // 26 Oct 1857
    // den 26 October 1857
    // Fredrik Willem Carel Emil GILDERMEESTER
    // age: Meerderjarig, status: Jongman
    // occupation: Onderwyser
    // residence: Bokkeveld
    // and
    // Maria Aletta VAN DER MERWE
    // age: Meerderjarig, status: Jonge dochter
    // residence: Bokkeveld
    caseName: "marriage_fredrik_gildermeester_1857",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    //Search: meester anywhere in the surname with willem anywhere in the first name
  },
  {
    // No all caps last names, multi-word last name
    // 7 May 1832
    // 1832, this seventh day of May 1832
    // Hermanus Johannes Casparis Fourie
    // status: Bachelor
    // residence: of this District
    // and
    // Anna Johanna Maria Van Dyk
    // status: Spinster
    // residence: of this District
    caseName: "marriage_hermanus_johannes_fourie_1832",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    // Search: Groom with fourie anywhere in the surname with johannes anywhere in the first name
  },
  {
    // As above, but the bride (Anna Johanna Maria van Dyk)
    caseName: "marriage_hermanus_johannes_fourie_1832-bride",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    pageFile: "./unit_tests/eggsabdm/saved_pages/marriage_hermanus_johannes_fourie_1832.html",
    primaryPersonIndex: 1,
  },
  {
    // 06 Apr 1840
    // 1840,
    // Jan Hendrik (J.H zn) Viljoen
    // and
    // Cath M. Jac. W.H.G. dg.) Smit
    caseName: "marriage_jan_hendrik_viljoen_1840",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    // Search: Groom  with viljoen anywhere in the surname  with Jan hendrik anywhere in the first name
  },
  {
    // As above but the bride (Cath M. Jac. Smit)
    caseName: "marriage_jan_hendrik_viljoen_1840-bride",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    pageFile: "./unit_tests/eggsabdm/saved_pages/marriage_jan_hendrik_viljoen_1840.html",
    primaryPersonIndex: 1,
  },
  /*   
  {
    caseName: "marriage_",
    url: "https://www.eggsa.org/cgi-bin/dosearchMarriages.pl",
    // Search:
  },
  */
];

async function runTests(testManager) {
  await runExtractDataTests("eggsabdm", extractData, regressionData, testManager);

  await runGeneralizeDataTests("eggsabdm", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation };
  await runBuildCitationTests("eggsabdm", functions, regressionData, testManager);
}

export { runTests };
