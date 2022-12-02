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

import { extractData } from "../../extension/site/scotp/core/scotp_extract_data.mjs";
import { generalizeData } from "../../extension/site/scotp/core/scotp_generalize_data.mjs";
import { buildCitation } from "../../extension/site/scotp/core/scotp_build_citation.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  // ============ Census ==============
  {
    caseName: "census_1841_christian_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results/1750042657638166d195d80",
    optionVariants: [
      {
        variantName: "urlVisible",
        optionOverrides: { citation_scotp_urlStyle: "visible", citation_scotp_urlIncludeRef: true },
      },
      {
        variantName: "urlBase",
        optionOverrides: { citation_scotp_urlStyle: "base", citation_scotp_urlIncludeRef: true },
      },
      /*
      {
        variantName: "urlOriginalRef",
        optionOverrides: { citation_scotp_urlStyle: "original", citation_scotp_urlIncludeRef: true },
      },
      {
        variantName: "urlOriginalNoRef",
        optionOverrides: { citation_scotp_urlStyle: "original", citation_scotp_urlIncludeRef: false },
      },
      {
        variantName: "urlShortRef",
        optionOverrides: { citation_scotp_urlStyle: "short", citation_scotp_urlIncludeRef: true },
      },
      {
        variantName: "urlShortNoRef",
        optionOverrides: { citation_scotp_urlStyle: "short", citation_scotp_urlIncludeRef: false },
      },
      */
    ],
  },
  {
    caseName: "census_1851_john_campbell",
    url: "https://www.scotlandspeople.gov.uk/record-results/10198090206386859514533",
  },
  {
    caseName: "census_1861_james_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results/156245878163869550b461a",
  },
  {
    caseName: "census_1871_bartley_oconnor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=O%26%23039%3BConnor&surname_so=exact&forename=BARTLEY&forename_so=starts&second_person_forename_so=exact&record_type=census&year%5B0%5D=1871",
  },
  {
    caseName: "census_1881_john_mackenzie",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=mackenzie&surname_so=exact&forename=john%20mc%20leod&forename_so=starts&second_person_forename_so=exact&record_type=census&year%5B0%5D=1881",
  },
  {
    caseName: "census_1891_duncan_mcallister",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=McAllister&surname_so=starts&forename=Duncan%20Mcn&forename_so=starts&second_person_forename_so=exact&record_type=census&year%5B0%5D=1891",
  },
  // ============ Census LDS ==============
  {
    caseName: "census_lds_1881_adam_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=Fraser&surname_so=exact&forename=Adam%20G&forename_so=starts&record_type=census_lds&year%5B0%5D=1881_LDS",
  },
  {
    caseName: "census_lds_1881_james_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=Fraser&surname_so=exact&forename=James&forename_so=starts&sex=M&age_from=27&age_to=27&census_place=Lanark&birthplace=Elgin&record_type=census_lds&year%5B0%5D=1881_LDS",
  },
  {
    caseName: "census_lds_1881_mrs_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&surname=%28Mrs%29%20Fraser&surname_so=exact&forename_so=starts&record_type=census_lds&year%5B0%5D=1881_LDS",
  },
  {
    caseName: "census_lds_1881_robert_duncan",
    url: "https://www.scotlandspeople.gov.uk/record-results?page=20&search_type=people&dl_cat=census&surname=Duncan&surname_so=exact&forename=Robert&forename_so=starts&sex=M&record_type=census_lds&year%5B0%5D=1881_LDS",
  },
  // ============ Church registers - Births and baptisms - Church of Scotland ==============
  {
    // Has FR217 on end of Parents/Other Details
    caseName: "church_bap_cos_1759_agnes_faichney",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=Faichney&surname_so=exact&forename_so=starts&sex=F&parent_names_so=exact&parent_name_two_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  {
    caseName: "church_bap_cos_1810_agnes_reid",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=Reid&surname_so=wild&forename_so=wild&parent_names_so=wild&parent_name_two=Jane%20Gemmel&parent_name_two_so=wild&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  {
    // page has multiple results, all in same Parish
    caseName: "church_bap_cos_1813_thomas_reid",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=Reid&surname_so=wild&forename_so=wild&parent_names_so=wild&parent_name_two=Jane%20Gemm%2Al&parent_name_two_so=wild&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  {
    caseName: "church_bap_cos_1823_peter_connan",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=CONNAN&surname_so=exact&forename=PETER&forename_so=exact&from_year=1823&to_year=1823&sex=M&parent_names=JAMES%20CONNAN&parent_names_so=exact&parent_name_two=MARY%20MCGREGOR&parent_name_two_so=exact&rd_display_name%5B0%5D=MONZIE_MONZIE%20(PERTH)&rd_name%5B0%5D=MONZIE&ref=20%209",
  },
  {
    // has PG72 on end of Parents/Other Details
    caseName: "church_bap_cos_1850_catherine_faichney",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=FAICHNEY&forename=CATHERINE&from_year=1850&to_year=1850&sex=F&parent_names=JOHN%20FAICHNEY&parent_name_two=MARGARET&rd_display_name%5B0%5D=DUNBLANE_DUNBLANE&rd_name%5B0%5D=DUNBLANE&ref=40%20141",
  },
  {
    // has county in url
    caseName: "church_bap_cos_1850_christina_baird",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=BAIRD&forename=CHRISTINA&from_year=1850&to_year=1850&sex=F&parent_names=ROBERT%20BAIRD&parent_name_two=HELEN%20ELLIOT&county=ROXBURGH&rd_display_name%5B0%5D=ROBERTON_ROBERTON%20(ROXBURGH)&rd_name%5B0%5D=ROBERTON&ref=30%2041",
  },
  // ============ Church registers - Births and baptisms - Roman Catholic Church (cr_baptisms) ==============
  {
    caseName: "church_bap_rcc_1839_agnes_white",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=crbirths_baptism&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=White&surname_so=exact&forename=agnes&forename_so=starts&sex=F&from_year=1839&to_year=1839&parent_names_so=exact&parent_name_two_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  {
    caseName: "church_bap_rcc_1902_isabella_macgregor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=crbirths_baptism&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=Macgregor&surname_so=exact&forename_so=starts&parent_names_so=exact&parent_name_two_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Births and baptisms - Other Church (ch3_baptism) ==============
  {
    caseName: "church_bap_other_1854_peter_connor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=ch3_baptism&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-births-baptisms&surname=Connor&surname_so=exact&forename=Peter&forename_so=starts&from_year=1854&to_year=1854&parent_names_so=exact&parent_name_two_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Deaths and Burial - Church of Scotland  ==============
  {
    caseName: "church_bur_cos_1647_elizabeth_campbell",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=D&record_type%5B0%5D=opr_deaths&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-deaths-burials&surname=Campbell&surname_so=exact&forename_so=starts&parent_names=colny&parent_names_so=starts&sex=F&from_year=1600&to_year=1650&county=DUNBARTON&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches&rd_real_name%5B0%5D=DUMBARTON%20LANDWARD%20OR%20DUMBARTON%20BURGH%20OR%20DUMBARTON&rd_display_name%5B0%5D=DUMBARTON%20LANDWARD%7CDUMBARTON%20BURGH%7CDUMBARTON_DUMBARTON&rd_label%5B0%5D=DUMBARTON&rd_name%5B0%5D=DUMBARTON%20LANDWARD%20OR%20DUMBARTON%20BURGH%20OR%20DUMBARTON",
  },
  {
    caseName: "church_bur_cos_1846_margt_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=D&record_type%5B0%5D=opr_deaths&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-deaths-burials&surname=BRUCE&forename=MARGT&from_year=1846&to_year=1846&sex=F&rd_display_name%5B0%5D=CUPAR%20LANDWARD%7CCUPAR%20BURGH%7CCUPAR_CUPAR&rd_name%5B0%5D=CUPAR%20LANDWARD%20OR%20CUPAR%20BURGH%20OR%20CUPAR&ref=50%20364",
  },
  {
    caseName: "church_bur_cos_1853_elizabeth_hall",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=D&record_type%5B0%5D=opr_deaths&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-deaths-burials&surname=HALL&forename=ELIZABETH&from_year=1853&to_year=1853&sex=F&rd_display_name%5B0%5D=ST%20CUTHBERT%27S_ST%20CUTHBERT%27S&rd_name%5B0%5D=ST%20CUTHBERT%27S&ref=580%20193",
  },
  // ============ Church registers - Deaths and Burial - Roman Catholic Church (cr_burials)  ==============
  {
    caseName: "church_bur_rcc_1860_ruth_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=D&record_type%5B0%5D=crdeath_burial&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-deaths-burials&surname=Fraser&surname_so=exact&forename=ruth&forename_so=starts&sex=F&birth_year_range=1&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Deaths and Burial - Other Church (ch3_burials)  ==============
  {
    caseName: "church_bur_other_1842_helen_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=D&record_type%5B0%5D=ch3_burials&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-deaths-burials&surname=Fraser&surname_so=exact&forename=helen&forename_so=starts&sex=F&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Banns and Marriages - Church of Scotland  ==============
  {
    caseName: "church_mar_cos_1654_unknown_mcgregor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=M&record_type%5B0%5D=opr_marriages&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-banns-marriages&surname=McGregor&surname_so=exact&forename_so=starts&spouse_name_so=exact&from_year=1654&to_year=1654&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  {
    caseName: "church_mar_cos_1668_christane_mcgregor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=M&record_type%5B0%5D=opr_marriages&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-banns-marriages&surname=McGregor&surname_so=exact&forename=Christane&forename_so=starts&spouse_name_so=exact&from_year=1600&to_year=1700&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Banns and Marriages - Roman Catholic Church (cr_banns) ==============
  {
    caseName: "church_mar_rcc_1922_davidem_baird",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=M&record_type%5B0%5D=crbanns_marriages&church_type=Catholic%20Registers&dl_cat=church&dl_rec=church-banns-marriages&surname=McGregor&surname_so=exact&forename_so=starts&spouse_surname_so=exact&spouse_forename_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Banns and Marriages - Other (ch3_banns) ==============
  {
    caseName: "church_mar_other_1849_john_kay",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=M&record_type%5B0%5D=ch3_marriages&church_type=Presbyterian%20registers&dl_cat=church&dl_rec=church-banns-marriages&surname=Kay&surname_so=exact&forename=John&forename_so=starts&spouse_name_so=exact&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches",
  },
  // ============ Church registers - Other Events - Roman Catholic Church  ==============
  {
    caseName: "church_other_rcc_conf_1912_jacobus_campbell",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&record_type%5B0%5D=cr_other&church_type=Catholic%20Registers&surname=Campbell&surname_so=exact&forename_so=starts&record=Roman%20Catholic%20Church%20Other%20churches&dl_cat=church&dl_rec=church-other",
  },
  // ============ Church registers - Other Events - Other (ch3_other)  ==============
  {
    caseName: "church_other_other_1835_john_mather",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&record_type%5B0%5D=ch3_other&church_type=Presbyterian%20registers&surname_so=exact&forename=John&forename_so=starts&from_year=1835&record=Roman%20Catholic%20Church%20Other%20churches&dl_cat=church&dl_rec=church-other",
  },
  // ============ Legal - Coats of Arms  ==============
  {
    caseName: "legal_arms_1867_victor_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-coats-arms&name=Bruce&name_so=exact&from_year=1867&to_year=1867&record_type=coa",
  },
  // ============ Legal - Military Tribunals  ==============
  {
    caseName: "legal_miltrib_1917_william_kay",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-military-service&surname=Kay&surname_so=exact&forenames_so=starts&record_type=military_tribunals",
  },
  // ============ Legal - Soldier's and Airman's Wills  ==============
  {
    caseName: "legal_saw_1915_donald_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-soldiers-wills&surname=Fraser&surname_so=exact&forename_so=starts&from_year=1915&to_year=1915&service_number=8878&record_type=soldiers_wills",
  },
  // ============ Legal - Wills  ==============
  {
    caseName: "legal_will_1584_bessie_alexander",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Alexander&surname_so=exact&forename=bessie&forename_so=starts&from_year=1584&to_year=1584&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1873_alexander_peffers",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=peffers&surname_so=wild&forename=alexander&forename_so=soundex&from_year=1873&to_year=1873&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1882_abercromby_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Fraser&surname_so=exact&forename=Abercromby&forename_so=exact&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1892_catherine_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&record_type=wills_testaments&surname=Bruce&surname_so=exact&forename=Catherine&forename_so=exact&from_year=1892&to_year=1892&court%5B0%5D=Wick%20Sheriff%20Court%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&description=Breadalbane%20Terrace%2C%20Pulteneytown%2C%20d.%2002%2F03%2F1888%20at%20Pulteneytown%2C%20testate",
  },
  {
    caseName: "legal_will_1897_agnes_bruce_ns",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Bruce&surname_so=exact&forename=Agnes&forename_so=exact&from_year=1897&to_year=1897&court%5B0%5D=non-Scottish%20Court%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1897_agnes_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&record_type=wills_testaments&surname=Bruce&surname_so=exact&forename=Agnes&forename_so=exact&from_year=1897&to_year=1897&description=of%203%20Haldane%20Terrace%2C%20Newcastle-upon-Tyne%2C%20widow&ref=SC70%2F6%2F68",
  },
  {
    caseName: "legal_will_1910_agnes_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Fraser&surname_so=exact&forename=Agnes&forename_so=exact&from_year=1910&to_year=1910&description=or%20MacLeod%2C%20wife%20of%20Alexander%20Fraser%2C%20banker%2C%20308%20Maxwell%20Road%2C%20Pollokshields%2C%20Glasgow%2C%20wife%20of%20Alexander%20Fraser%2C%20Glasgow%2C%20d.%2027&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1920_agnes_thomson",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Thomson&surname_so=soundex&forename=Agnes&forename_so=soundex&from_year=1920&to_year=1920&description=Miss%2C%2020%20Rose%20Street%2C&record_type=wills_testaments",
  },
  {
    caseName: "legal_will_1921_jane_peffers",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=legal&dl_rec=legal-wills-testaments&surname=Peffers&surname_so=exact&forename=Jane&forename_so=exact&from_year=1920&to_year=1923&record_type=wills_testaments",
  },
  // ============ Poor relief and migration records - Highlands and Island Emigration  ==============
  {
    caseName: "mig_hie_1854_william_black",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=poor-relief&dl_rec=poor-relief-hie&surname=Black&surname_so=exact&forename_so=starts&record_type=hie",
  },
  // ============ Prison registers  ==============
  {
    caseName: "prison_1891_albert_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=prison&surname=Fraser&surname_so=exact&forename=Albert%20Attwood&forename_so=starts&trial_court_so=starts&record_type=prison_records",
  },
  {
    caseName: "prison_1891_albert_fraser_quicklook",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=prison&surname=Fraser&surname_so=exact&forename=Albert%20Attwood&forename_so=starts&trial_court_so=starts&record_type=prison_records",
  },
  // ============ Statutory registers - Births ==============
  {
    caseName: "stat_birth_1871_jane_black",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-births&surname=Black&surname_so=exact&forename=Louisa&forename_so=starts&sex=F&from_year=1870&to_year=1890&record_type=stat_births",
  },
  {
    caseName: "stat_birth_1886_louisa_black",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-births&surname=Black&surname_so=exact&forename=Louisa%20Annie&forename_so=exact&sex=F&from_year=1870&to_year=1890&county=ABERDEEN&record_type=stat_births",
  },
  // ============ Statutory registers - Civil Dissolutions (stat_dissolutions) ==============
  {
    caseName: "stat_civdiss_2009_dorothy_taylor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-dissolutions&surname=Taylor&surname_so=exact&forename_so=starts&psurname_so=exact&from_year=2007&to_year=2015&record_type=dissolutions",
  },
  // ============ Statutory registers - Civil Partnerships ==============
  {
    caseName: "stat_civpart_2005_andrew_smith",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-civilpartnerships&surname=Smith&surname_so=exact&forename_so=starts&psurname_so=exact&from_year=2005&to_year=2005&record_type=civilpartnership",
  },
  // ============ Statutory registers - Deaths ==============
  {
    // RD Name of "Greenock Old or West" doesn't match a search name exactly
    caseName: "stat_death_1858_norman_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-deaths&surname=Fraser&surname_so=exact&forename=Norman&forename_so=starts&other_surname_so=exact&mmsurname_so=exact&birth_year_range=1&rd_real_name%5B0%5D=GREENOCK%20OLD%20OR%20WEST%20OR%20GREENOCK%20WEST%20OR%20GREENOCK%20MIDDLE%20OR%20GREENOCK%20NEW%20OR%20MIDDLE%20OR%20GREENOCK%20EAST%20OR%20GREENOCK&rd_display_name%5B0%5D=GREENOCK%20OLD%20OR%20WEST%7CGREENOCK%20WEST%7CGREENOCK%20MIDDLE%7CGREENOCK%20NEW%20OR%20MIDDLE%7CGREENOCK%20EAST%7CGREENOCK_GREENOCK&rdno%5B0%5D=GREENOCK%20OLD%20OR%20WEST%20OR%20GREENOCK%20WEST%20OR%20GREENOCK%20MIDDLE%20OR%20GREENOCK%20NEW%20OR%20MIDDLE%20OR%20GREENOCK%20EAST%20OR%20GREENOCK&record_type=stat_deaths",
  },
  {
    // Hundreds of results, this is not first page
    caseName: "stat_death_1880_christina_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?page=3&search_type=people&dl_cat=statutory&dl_rec=statutory-deaths&surname=Bruce&surname_so=exact&forename_so=starts&other_surname_so=exact&mmsurname_so=exact&from_year=1880&to_year=1920&birth_year_range=1&record_type=stat_deaths",
  },
  {
    // No Mother's Maiden Name
    caseName: "stat_death_1880_jean_bruce",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-deaths&surname=Bruce&surname_so=exact&forename=Jean&forename_so=starts&other_surname_so=exact&mmsurname_so=exact&from_year=1880&to_year=1880&age_from=70&age_to=70&birth_year_range=1&record_type=stat_deaths",
  },
  {
    // service returns
    caseName: "stat_death_1917_james_thomson",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-deaths&surname=Thomson&surname_so=exact&forename=James&forename_so=exact&other_surname_so=exact&mmsurname_so=exact&from_year=1917&to_year=1917&age_from=19&age_to=21&birth_year_range=1&county=MINOR%20RECORDS&record_type=stat_deaths",
  },
  // ============ Statutory registers - Divorces ==============
  {
    caseName: "stat_divorce_1987_john_smith",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-divorces&surname=smith&surname_so=exact&forename=john&forename_so=starts&spsurname_so=exact&from_year=1960&to_year=2000&record_type=stat_divorces",
  },
  // ============ Statutory registers - Marriages ==============
  {
    caseName: "stat_marriage_1863_john_taylor",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=statutory&dl_rec=statutory-marriages&surname=taylor&surname_so=wild&forename=john&forename_so=starts&spsurname_so=wild&spforename=ann&spforename_so=exact&from_year=1863&to_year=1863&record_type=stat_marriages",
  },
  // ============ Valuation Rolls ==============
  {
    caseName: "val_1855_mary_brodie_or_fraser",
    url: "https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=valuation&surname=Fraser&surname_so=exact&forename=Mary&forename_so=starts&record_type=valuation_rolls&year%5B0%5D=1855",
  },
];

const optionVariants = [
  {
    variantName: "dataStyle_none",
    optionOverrides: {
      citation_scotp_dataStyle: "none",
    },
  },
  {
    variantName: "dataStyle_string",
    optionOverrides: {
      citation_scotp_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_list",
    optionOverrides: {
      citation_scotp_dataStyle: "list",
    },
  },
  {
    variantName: "dataStyle_table",
    optionOverrides: {
      citation_scotp_dataStyle: "table",
    },
  },
  /*
  {
    variantName: "full_ee_style", 
    optionOverrides: {
      citation_general_meaningfulNames: "none",
      citation_general_commaInsideQuotes: true,
      citation_general_addEeItemType: true,
      citation_general_referencePosition: "atEnd",
      citation_general_addAccessedDate: "parenBeforeLink",
      citation_general_sourceReferenceSeparator: "commaColon",
      citation_general_dataListSeparator: "commaColon",
      citation_general_addNewlinesWithinBody: false,
      citation_general_addBreaksWithinBody: false,
      citation_general_addNewlinesWithinRefs: false,
      citation_scotp_dataStyle: "table", // should be ignored
    },
  },
  */
];

async function runTests(testManager) {
  await runExtractDataTests("scotp", extractData, regressionData, testManager);

  await runGeneralizeDataTests("scotp", generalizeData, regressionData, testManager);

  await runBuildCitationTests("scotp", buildCitation, undefined, regressionData, testManager, optionVariants);
}

export { runTests };
