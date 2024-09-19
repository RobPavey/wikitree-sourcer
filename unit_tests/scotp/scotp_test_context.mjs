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

import { buildScotlandsPeopleContextSearchData } from "../../extension/site/scotp/core/scotp_context_menu.mjs";

import {
  writeTestOutputFile,
  readRefFile,
  readFile,
  getRefFilePath,
  getTestFilePath,
} from "../test_utils/ref_file_utils.mjs";
import { deepObjectEquals } from "../test_utils/compare_result_utils.mjs";

import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { reportStringDiff } from "../test_utils/compare_result_utils.mjs";

// Note the text is what comes through from the context selection text - it has newlines removed already.

// in same order as scotpRecordTypes
const regressionData = [
  ////////////////////////////////////////////////////////////////////////////////
  // stat_births
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_births_edit_no_data",
    text: `<ref> '''Birth Registration''': "Statutory Register of Births"<br/> National Records of Scotland, Ref: 685/1/462<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople] (accessed 6 May 2021) </ref>`,
  },
  {
    caseName: "sourcer_stat_births_edit_citing",
    text: `Helen's birth was registered in 1888 in the Anderston district.<ref>'''Birth Registration''': "Statutory Register of Births", database, National Records of Scotland, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople], Helen McCall A'Hara birth registered 1888 in Anderston, mother's maiden name McCall; citing Ref: 644/10/356.</ref>`,
  },
  {
    caseName: "scotproj_stat_births",
    text: `Scotland, "Statutory Registers - Births" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024), James Menzies Wood, mother's MS Wright, M, 1872, Blythswood; citing Reference Number: 644 / 6 / 92.
    `,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // stat_marriages
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_marriages_default",
    text: `Euphemia's marriage to John McBride was registered in 1856 in the Greenock Old or West district.<ref> '''Marriage Registration''': "Statutory Register of Marriages"<br/> National Records of Scotland, Ref: 564/3/44<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Euphemia Lamont marriage to John McBride registered 1856 in Greenock Old or West. </ref>`,
  },
  {
    caseName: "scotproj_stat_marriages",
    text: `Scotland, "Statutory Registers - Marriages" database, National Records of Scotland, (ScotlandsPeople :accessed 15 Nov 2023), Euphemia Lamont, and John McBride, 1856, Greenock Old or West; citing Reference Number: 564 / 3 / 44.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // stat_divorces
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_divorces_default",
    text: `Divorce: "Statutory Register of Divorces" National Records of Scotland, Court Code: 9772; Serial Number: 1421 ScotlandsPeople Margaret Thomso O'Connor divorce from McClounie in 2010 in Hamilton, Scotland.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // stat_deaths
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_deaths_default",
    text: `Death Registration: "Statutory Register of Deaths" National Records of Scotland, Ref: 603/213 ScotlandsPeople Catherine Aagesen death registered 1976 in Glasgow, Martha St (age 85, mother's maiden name McFee).`,
  },
  {
    caseName: "scotproj_stat_deaths",
    text: `"Statutory Registers - Deaths" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024) John Stewart, age 47, Male, 1908, Paisley; citing Reference Number: 573 / 1 / 160.`,
  },
  {
    caseName: "scotproj_stat_deaths_corrected",
    text: `Scotland, "Statutory Registers - Deaths," database with images, (ScotlandsPeople : viewed 28 July 2024), image, citing Joseph Sloy, 12 September 2028, corrected entry, West District, Greenock, Renfrewshire, p. 159, item 475, reference number 564/2 475`,
  },
  {
    // Found on https://www.wikitree.com/wiki/Rendall-372   (16 Sep 2024)
    caseName: "found_stat_deaths_1",
    text: `"Statutory Register of Deaths," database National Records of Scotland (ScotlandsPeople : accessed 24 January 2024) Joan Rendall OR Cooper death registered 1935 in George Square (age 64) citing Ref 685/5/217.`,
  },
  {
    // Found on https://www.wikitree.com/wiki/Stirling-727   (18 Sep 2024)
    // No quotes around source title, partial match on source title.
    caseName: "found_stat_deaths_2",
    text: `Scottish Statutory registers - Deaths, database, National Records of Scotland (ScotlandsPeople : accessed 8 September 2024), Archibald Stirling, male, age 54, date 1869, dwelling in West Kilbride, Ayrshire, Scotland; citing reference number 620/ 5.`,
  },
  {
    // Variation of above - put source title in quotes.
    // Source title is not an exact match.
    caseName: "found_stat_deaths_3",
    text: `"Scottish Statutory registers - Deaths", database, National Records of Scotland (ScotlandsPeople : accessed 8 September 2024), Archibald Stirling, male, age 54, date 1869, dwelling in West Kilbride, Ayrshire, Scotland; citing reference number 620/ 5.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // stat_civilpartnerships
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_civ_part_default",
    text: `Abigail's marriage to Morera-Pallares was registered in 2021 in the Rosskeen district.<ref> '''Marriage Registration''': "Statutory Register of Civil Partnerships"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Abigail Alice Walker marriage to Morera-Pallares registered 2021 in Rosskeen<br/> citing Ref: 195. </ref>`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // stat_dissolutions
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_stat_civ_diss_default",
    text: `Seonaid was divorced from MacIntosh in 2013 in Perth, Scotland.<ref> '''Divorce''': "Statutory Register of Dissolutions"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Seonaid MacNeil Wilson divorce from MacIntosh in 2013 in Perth, Scotland<br/> citing Court Code: 9853; Serial Number: 35. </ref>
    `,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // opr_births
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_opr_birth_default",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms" National Records of Scotland, Parish Number: 382/ ; Ref: 20 9 ScotlandsPeople Search (accessed 23 June 2022) Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland.`,
  },
  {
    caseName: "sourcer_opr_birth_ee_edit",
    text: `<ref>"Church of Scotland: Old Parish Registers - Births and Baptisms", database, National Records of Scotland, ([https://www.scotlandspeople.gov.uk/ ScotlandsPeople] : accessed 23 June 2022), Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland; citing Parish Number 382/ , Ref 20 9.</ref>`,
  },
  {
    caseName: "sourcer_opr_birth_default_scc_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname: CONNAN; Forename: PETER; Parents/Other details: JAMES CONNAN/MARY MCGREGOR; Gender: M; Birth Date: 01/06/1823; Parish: Monzie.`,
  },
  {
    caseName: "sourcer_opr_birth_default_cc_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname: CONNAN, Forename: PETER, Parents/Other details: JAMES CONNAN/MARY MCGREGOR, Gender: M, Birth Date: 01/06/1823, Parish: Monzie.`,
  },
  {
    caseName: "sourcer_opr_birth_default_c_list",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms", National Records of Scotland, Parish Number: 382; Ref: 20/9, ScotlandsPeople (accessed 12 September 2024), Surname CONNAN, Forename PETER, Parents/Other details JAMES CONNAN/MARY MCGREGOR, Gender M, Birth Date 01/06/1823, Parish Monzie.`,
  },
  {
    caseName: "scotproj_opr_birth",
    text: `Govan Parish, Church of Scotland, "Old Parish Registers Births and Baptisms" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024), William Walker birth or baptism 23 Jan 1808, son of Hugh Walker and Ann Young, citing Ref 20 / 211.`,
  },
  {
    caseName: "scotproj_opr_birth_edit",
    text: `<ref name="OPR William 1">Govan Parish, Church of Scotland, "Old Parish Registers Births and Baptisms" database, National Records of Scotland, ([https://www.scotlandspeople.gov.uk ScotlandsPeople] : accessed 29 May 2024), William Walker birth or baptism 23 Jan 1808, son of Hugh Walker and Ann Young,  citing Ref 20 / 211.</ref>`,
  },
  {
    caseName: "scotproj_opr_birth_image",
    text: `Govan Parish, Church of Scotland, "Old Parish Registers Births and Baptisms" database with images, National Records of Scotland, (ScotlandsPeople : image accessed 29 May 2024), William Walker birth 23 Jan 1808, son of Hugh Walker and Ann Young, citing Ref 20 / 211.`,
  },
  {
    // found on: https://www.wikitree.com/wiki/Cairns-117 (15 Sep 2024)
    caseName: "found_opr_birth_1",
    text: `"Church of Scotland: Old Parish Registers - Births and baptisms" database, National Records of Scotland, ScotlandsPeople (https://www.scotlandspeople.gov.uk/: accessed 23 Mar 2023), William Cairns, parents: David Cairns and Margaret Wakinshaw, 8 Sep 1822, Tranent; citing Parish Number 722, Reference Number: 70 42.`,
  },
  {
    // found on: https://www.wikitree.com/wiki/Wilson-6934 (16 Sep 2024)
    // had comma after label,  "[database online]"
    caseName: "found_opr_birth_2",
    text: `Baptism, "Church of Scotland: Old Parish Registers - Births & Baptisms" [database online], National Records of Scotland, Scotlandspeople, (https://www.scotlandspeople.gov.uk/: accessed 13 May 2024), Willliam Wilson, Parents: James Wilson & Agnes Christie. 1 April 1711, Wemyss, Fife; citing Parish: 459, Reference Number: 20/182.`,
  },
  {
    // found on: https://www.wikitree.com/wiki/Douglas-1386 (18 Sep 2024)
    // No ScotlandsPeople before the bare link.
    caseName: "found_opr_birth_3",
    text: `Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms," database, National Records of Scotland, https://www.scotlandspeople.gov.uk/ (accessed 6 December 2022), Marie Douglas-hamilto born or baptised on 30 Apr 1657, daughter of William Duke Of Hamilton Douglas-hamilton Anne Duchess Of Ha, in Hamilton, Lanarkshire, Scotland; citing Parish Number 647, Ref 10/53.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // opr_marriages
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_opr_marriage_default",
    text: `Marriage: "Church of Scotland: Old Parish Registers - Banns and Marriages" National Records of Scotland, Parish Number: 474/ ; Ref: 20 27 ScotlandsPeople Search (accessed 23 June 2022) Christane McGregor marriage to Robert Wright on or after 2 Jul 1668 in Buchanan, Stirlingshire, Scotland.`,
  },
  {
    caseName: "sourcer_opr_marriage_surname_only",
    text: `Marriage: "Church of Scotland: Old Parish Registers - Banns and Marriages" National Records of Scotland ScotlandsPeople McBain marriage to Anne Richart on or after 16 Sep 1797 in Cromarty, Ross & Cromarty, Scotland citing Parish Number: 061; Ref: 10/370.`,
  },
  {
    // found on: https://www.wikitree.com/wiki/Cairns-117 (15 Sep 2024)
    caseName: "found_opr_marriage_1",
    text: `"Church of Scotland: Old Parish Registers - Banns and Marriages" database, National Records of Scotland, ScotlandsPeople (https://www.scotlandspeople.gov.uk/: accessed 23 Mar 2023), David Cairns and Mary Chambers, 6 Dec 1820, Tranent; citing Parish Number 722, Reference Number: 70 105.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // opr_deaths
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_opr_death_default",
    text: `Death or Burial: "Church of Scotland: Old Parish Registers - Deaths and Burials" National Records of Scotland, Parish Number: 496/ ; Ref: 50 16 ScotlandsPeople Search (accessed 23 June 2022) Elizabeth Campbell, daughter of Colny Campbell, death or burial on 8 Mar 1647 in Dumbarton, Dunbartonshire, Scotland.`,
  },
  {
    caseName: "sourcer_opr_death_default_edit_age_0",
    text: `John (age 0), son of James Galloway Gibson, died or was buried on 24 May 1839 in Glasgow, Lanarkshire, Scotland.<ref> '''Death or Burial''': "Church of Scotland: Old Parish Registers - Deaths and Burials"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> John Gibson, son of James Galloway Gibson, death or burial (died age 0) on 24 May 1839 in Glasgow, Lanarkshire, Scotland<br/> citing Parish Number: 644/1; Ref: 550/172. </ref>`,
  },
  {
    caseName: "scotproj_opr_death",
    text: `Glasgow Parish, Church of Scotland, "Old Parish Registers Death and Burials" database with images, National Records of Scotland, (ScotlandsPeople : image accessed 29 May 2024), death of John Burns, 3 March 1839, citing Ref No: 550 / 160.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // cr_baptisms
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_cr_baptism_default",
    text: `Baptism: "Catholic Parish Registers - Births and Baptisms" National Records of Scotland, Parish: Paisley, St Mirin's ScotlandsPeople Search (accessed 23 June 2022) Agnes White baptism on 29 Mar 1839 (born 24 Jan 1839), daughter of Alexander White & Saragh McDonnol, in St Mirin's, Paisley, Renfrewshire, Scotland.`,
  },
  {
    caseName: "scotproj_cr_baptism",
    text: `St John's, Port Glasgow, "Catholic Registers Births and Baptisms" database, National Records of Scotland, ScotlandsPeople (https://www.scotlandspeople.gov.uk : accessed 21 Feb 2021), William McAtasny, birth 31 Dec 1867 and baptism 1 Apr 1868, son of William McAtasny and Margaret McIlveny.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // cr_banns
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_cr_banns_default",
    text: `Marriage: "Catholic Parish Registers - Marriages" National Records of Scotland, Parish: Aberdeen, St Mary's with St Peter's ScotlandsPeople Search (accessed 23 June 2022) James Ronald McGregor marriage to Ruth Margaret Gauld on or after 26 Nov 1941 in St Mary's with St Peter's, Aberdeen, Aberdeenshire, Scotland.`,
  },
  {
    caseName: "scotproj_cr_banns",
    text: `St John's, Port Glasgow, "Catholic Registers Banns and Marriages " database, National Records of Scotland, ScotlandsPeople (https://www.scotlandspeople.gov.uk : accessed 29 May 2024), marriage or banns for Michael McBride and Mary McSloy, 21 Jul 1862, citing reference number: MP 9 1 4 1 69.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // cr_burials
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_cr_burial_default",
    text: `Burial: "Catholic Parish Registers - Deaths, Burials and Funerals" National Records of Scotland, Parish: Glasgow, Old Dalbeth Cemetery ScotlandsPeople Search (accessed 23 June 2022) Ruth Fraser burial (died age 0) on 3 Dec 1860 in Old Dalbeth Cemetery, Glasgow, Lanarkshire, Scotland.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // cr_other
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_cr_other_default",
    text: `Barbara was recorded in a church event in 1855 at St Mary's, Eskadale, Inverness-shire, Scotland.<ref> '''Other Church Event''': "Catholic Parish Registers - Other Events"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Surname: FRASER; Forename: BARBARA; Gender: Female; Event: Communicant; Event Date: 1855; Parish: Eskadale, St Mary's; County/City: Inverness<br/> citing Parish: Eskadale, St Mary's. </ref>`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // ch3_baptisms
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_ch3_baptism_default",
    text: `Baptism: "Other Church Registers - Births and Baptisms" National Records of Scotland ScotlandsPeople Search (accessed 23 June 2022) Peter Connor baptism on 16 Mar 1854 (born 23 Feb 1854), child of Peter Conner & Jean Sneddon, in Wellwynd Associate, Airdrie, Lanarkshire, Scotland.`,
  },
  {
    caseName: "scotproj_ch3_baptism",
    text: `"Church Registers - Other Church Registers Baptisms" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024), John Rutherford, birth 28 August 1848, baptism 20 November 1850, son of George Rutherford and Isabella Waldie, Parish/Congregation Hawick Free.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // ch3_banns
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_ch3_banns_default",
    text: `Marriage: "Other Church Registers - Marriages" National Records of Scotland ScotlandsPeople Search (accessed 23 June 2022) John Kay marriage to Hannah Butler Dewar on 3 Jul 1849 in Scotland.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // ch3_burials
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_ch3_burial_default",
    text: `Death or Burial: "Other Church Registers - Deaths and Burials" National Records of Scotland ScotlandsPeople Search (accessed 23 June 2022) Helen Fraser death or burial on 11 Jul 1842 in St Margaret's United Secession, Dunfermline, Fife, Scotland. Cause of death: Rheumatic Fever.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // ch3_other
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_ch3_other_default",
    text: `'''Other Church Event''': "Other Church Registers - Other Events"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Surname: MATHER; Forename: CATHERINE; Event/Description: COMMUNION ROLL; Date of Event: OCTOBER/1837; Parish/Congregation Name: DUNBAR UNITED PRESBYTERIAN. </ref>`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // census
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_census_default",
    text: `In the 1851 census, Donald (age 11) was in Portnahaven, Argyll, Scotland.<ref>'''1851 Census''': "Scotland Census, 1851", National Records of Scotland, Ref: 547/ 1/ 35, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople] (accessed 13 September 2024), Surname MCKAY, Forename DONALD, Year 1851, Gender M, Age at Census 11, RD Name Portnahaven, County / City Argyll.</ref>`,
  },
  {
    // edit mode
    caseName: "sourcer_census_database_no_accessed",
    text: `In the 1851 census, Donald (age 13) was in Lairg, Sutherland, Scotland.<ref>'''1851 Census''': "Scotland Census, 1851", database, National Records of Scotland, Ref: 053/ 1/ 6, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople], Donald McKay (13) in Lairg registration district in Sutherland, Scotland.</ref>`,
  },
  {
    caseName: "sourcer_census_database_citing",
    text: `1851 Census: "Scotland Census, 1851", database, National Records of Scotland, ScotlandsPeople, Donald McKay (13) in Lairg registration district in Sutherland, Scotland; citing Ref: 053/ 1/ 6.`,
  },
  {
    caseName: "scotproj_census",
    text: `"Scottish Census Returns - 1911" database, National Records of Scotland, ScotlandsPeople (accessed 29 May 2024), Ella W. McMillan, female, age at census 2, Greenock West, Renfrew; citing Reference Number: 564/2 25/ 7.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // census_lds
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_census_lds_default",
    text: `1881 Census: "Scotland Census, 1881 (LDS)" National Records of Scotland ScotlandsPeople Christina Clark Or Pocock (24) at 27 Marshall St, Edinburgh Buccleuch, Edinburgh, Scotland. Born in Turriff, Banff, Scotland citing Ref: 721059.`,
  },
  {
    caseName: "scotproj_census_lds",
    text: `"Census 1881 (LDS)" database, National Records of Scotland, ScotlandsPeople (accessed 29 May 2024), John Stewart, male, age at census 20, Dwelling: 2 Blair Street, Galston, birth place: Galston, Ayr; citing Source: FHL Film 0203597 GRO Ref Volume 593 Enum Dist 10 Page 2, Reference Number: 431519.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // vr
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_vr_default",
    text: `* '''Valuation Roll''': "Valuation Rolls"<br/>National Records of Scotland<br/>[https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/>W J Fraser in 1855 at House No 83 Union Street in the parish of Aberdeen, Scotland<br/>citing Reference Number: VR008600001-.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // wills
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_wills_default",
    text: `Will or Testament: "Wills and Testaments" National Records of Scotland, Reference Number: CC5/6/1 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of will or testament of Robert Faireis at Dumfries Commissary Court on 19 Oct 1624.`,
  },
  {
    caseName: "sourcer_wills_with_death_date",
    text: `Will or Testament: "Wills and Testaments" National Records of Scotland, Reference Number: SC29/44/48 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of will of Adelaide Fraser at Inverness Sheriff Court on 2 Feb 1906. Died 2 Jul 1905.`,
  },
  {
    caseName: "sourcer_wills_inventory",
    text: `Inventory Confirmation: "Wills and Testaments" National Records of Scotland, Reference Number: SC36/48/224 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of inventory for Agnes Fraser at Glasgow Sheriff Court on 18 Apr 1910.`,
  },
  {
    caseName: "sourcer_wills_inventory_death_date",
    text: `Inventory Confirmation: "Wills and Testaments" National Records of Scotland, Reference Number: SC36/48/224 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of inventory for Agnes Fraser at Glasgow Sheriff Court on 18 Apr 1910. Died 27 Dec 1909.`,
  },
  {
    caseName: "sourcer_wills_additional_inventory",
    text: `Additional Inventory Confirmation: "Wills and Testaments" National Records of Scotland, Reference Number: SC70/1/665 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of inventory for Jane Peffers at Edinburgh Sheriff Court on 25 Jun 1921 (original confirmation on 14 Jun 1921).`,
  },
  {
    caseName: "sourcer_wills_additional_inventory_death_date",
    text: `Additional Inventory Confirmation: "Wills and Testaments" National Records of Scotland, Reference Number: SC70/1/665 ScotlandsPeople Search (accessed 23 June 2022) Confirmation of inventory for Jane Peffers at Edinburgh Sheriff Court on 25 Jun 1921 (original confirmation on 14 Jun 1921). Died 6 Apr 1921.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // coa
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_coa_default",
    text: `Alexander was in a heraldic record on 27 November 1899.<ref> '''Heraldic Record''': "Public Register of All Arms and Bearings"<br/> National Records of Scotland<br/> [https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/> Full Name: Alexander Edmund Fraser of the Foreign Office, London; Grant year: 27/11/1899<br/> citing Volume: 15; Record Number: 69. </ref>`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // soldiers_wills
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // military_tribunals
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  // hie
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "sourcer_hie_default",
    text: `* '''Immigration''': "Highland and Island Emigration Society records"<br/>National Records of Scotland<br/>[https://www.scotlandspeople.gov.uk/ ScotlandsPeople]<br/>Surname: FRASER; Forenames: MARION; Shipname: ONTARIO; Departure Date: 03/08/1852; Departure Port: LIVERPOOL; Arrival Port: SYDNEY; Residence: IDINBAIN; County: INVERNESS.`,
  },

  ////////////////////////////////////////////////////////////////////////////////
  // prison_records
  ////////////////////////////////////////////////////////////////////////////////
  {
    caseName: "scotproj_prison_records",
    text: `Edinburgh Prison, "Prison registers," ScotlandsPeople, database, (https://scotlandspeople.co.uk : accessed 4 August 2024), citing Duncan Robertson admitted to prison in 1848, age 16.`,
  },
];

function testEnabled(parameters, testName) {
  return parameters.testName == "" || parameters.testName == testName;
}

// The regressionData passed in must be an array of objects.
async function runContextTests(siteName, regressionData, testManager, optionVariants = undefined) {
  if (!testEnabled(testManager.parameters, "context")) {
    return;
  }

  let testName = siteName + "_context";

  console.log("=== Starting test : " + testName + " ===");

  let logger = new LocalErrorLogger(testManager.results, testName);

  for (var testData of regressionData) {
    if (testManager.parameters.testCaseName != "" && testManager.parameters.testCaseName != testData.caseName) {
      continue;
    }

    /*
    // read in the saved data file
    let inputSubPath = "ancestry/saved_get_all_citations/" + testData.caseName;

    let savedData = readFile(inputSubPath, testData, logger);
    if (!savedData) {
      continue;
    }
    */

    let inputText = testData.text;
    if (!inputText) {
      continue;
    }

    let lcText = inputText.toLowerCase();

    let scotpResult = {};

    try {
      scotpResult = buildScotlandsPeopleContextSearchData(lcText);
    } catch (e) {
      console.log("Error:", e.stack);
      logger.logError(testData, "Exception occurred");
    }

    let result = { success: false };
    if (scotpResult && scotpResult.searchData) {
      result = scotpResult.searchData;
    }

    let resultDir = "context";

    // write out result file.
    if (!writeTestOutputFile(result, siteName, resultDir, testData, logger)) {
      continue;
    }

    //console.log(result);
    testManager.results.totalTestsRun++;

    // read in the reference result
    let refObject = readRefFile(result, siteName, resultDir, testData, logger);
    if (!refObject) {
      // ref file didn't exist it will have been created now
      continue;
    }

    // do compare
    let equal = deepObjectEquals(result, refObject);
    if (!equal) {
      console.log("Result differs from reference. Result is:");
      console.log(result);
      let refFile = getRefFilePath(siteName, resultDir, testData);
      let testFile = getTestFilePath(siteName, resultDir, testData);
      logger.logError(testData, "Result differs from reference", refFile, testFile);
    }
  }

  if (logger.numFailedTests > 0) {
    console.log("Test failed (" + testName + "): " + logger.numFailedTests + " cases failed.");
  } else {
    console.log("Test passed (" + testName + ").");
  }
}

async function runTests(testManager) {
  await runContextTests("scotp", regressionData, testManager);
}

export { runTests };
