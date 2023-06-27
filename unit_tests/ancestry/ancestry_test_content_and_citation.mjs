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

import { extractData } from "../../extension/site/ancestry/core/ancestry_extract_data.mjs";
import { generalizeData } from "../../extension/site/ancestry/core/ancestry_generalize_data.mjs";
import { buildCitation } from "../../extension/site/ancestry/core/ancestry_build_citation.mjs";
import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";

import { runExtractDataTests } from "../test_utils/test_extract_data_utils.mjs";
import { runGeneralizeDataTests } from "../test_utils/test_generalize_data_utils.mjs";
import { runBuildCitationTests } from "../test_utils/test_build_citation_utils.mjs";

const regressionData = [
  {
    caseName: "australia_baptism_1849_benjamin_barker",
    url: "https://www.ancestry.com/discoveryui-content/view/1160277:9776?tid=172368945&pid=392248068900&hid=1047611145333",
  },
  {
    caseName: "australia_birth_reg_1885_alice_lloyd",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61648&h=250322&clickref=1011lvVHaKEk%2C1011lvVHaKEk&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate%2BExternal",
  },
  {
    caseName: "australia_child_birth_1897_saml_peck",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?dbid=1778&h=150522689&indiv=try&o_vc=Record:OtherRecord&rhSource=1778",
  },
  {
    caseName: "australia_death_1970_alice_armstrong",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=1779&h=1732471",
  },
  {
    caseName: "australia_electoral_roll_1936_george_stemm",
    url: "https://www.ancestry.com/discoveryui-content/view/2135557:1207",
  },
  {
    caseName: "australia_naturalization_1886_abraham_smith",
    url: "https://www.ancestry.com/discoveryui-content/view/3016:60711?_phsrc=AhC1933&_phstart=successSource&gsln=Smith&ml_rpos=1&queryId=8ce96c644c56cd6236dfcda0600cf76b",
  },
  {
    caseName: "australia_pardon_1831_james_toomer",
    url: "https://www.ancestry.com/discoveryui-content/view/40472:1657",
  },
  {
    caseName: "australia_probate_1974_violet_mcconchie",
    url: "https://www.ancestry.com/discoveryui-content/view/462110:61315?tid=172368945&pid=392239251991&hid=1047564774518",
  },
  {
    caseName: "canada_census_1881_clara_travis",
    url: "https://www.ancestry.com/discoveryui-content/view/2074:4628",
  },
  {
    caseName: "canada_census_1911_nominges_albert",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8947&h=442578&ssrc=pt&tid=160114497&pid=412193732194&usePUB=true",
  },
  {
    caseName: "canada_census_1921_frank_beaton",
    url: "https://www.ancestry.com/discoveryui-content/view/8614064:8991",
  },
  {
    caseName: "canada_father_obituary_2007_sandra_bowman",
    url: "https://www.ancestry.com/discoveryui-content/view/686307572:62226?tid=&pid=&queryId=fb8fd94e57b84ebb42d63eedfb7d7fd2&_phsrc=XJK6813&_phstart=successSource",
  },
  {
    caseName: "canada_marriage_1859_honora_buckley",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8510&h=17179&tid=&pid=&queryId=61ee16f934cc220dd3206fb1c54fbced&usePUB=true&_phsrc=XJK1011&_phstart=successSource",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          narrative_general_parentsUseAmpOrAnd: "and",
          narrative_marriage_ageFormat: "commasAged",
          narrative_marriage_parentageFormat: "theTwoCommas",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          narrative_general_dateFormat: "short",
          narrative_general_country: "none",
          narrative_marriage_ageFormat: "plainAge",
          narrative_marriage_includeParentage: "no",
        },
      },
    ],
  },
  {
    caseName: "channel_islands_census_1911_druce-233",
    url: "https://www.ancestry.com/discoveryui-content/view/188915:2355?tid=&pid=&queryId=2030d8a7bbdcfb9eecb95cad68efd69a&_phsrc=ywU8110&_phstart=successSource",
  },
  {
    caseName: "cwgc_james_holmes_1918",
    url: "https://www.ancestry.com/discoveryui-content/view/66407:2706?tid=&pid=&queryId=2a5b5f890a288da244d3fbe3874d866a&_phsrc=jWE3571&_phstart=successSource",
  },
  {
    // has closed entries
    caseName: "england_1939_register_john_smith",
    url: "https://www.ancestry.com/discoveryui-content/view/10027090:61596",
  },
  {
    caseName: "england_1939_register_pavey-452",
    url: "https://www.ancestry.com/discoveryui-content/view/7205480:61596",
  },
  {
    // Newer version (seem June 2022) where Registration District is replaced with Registration Place
    caseName: "england_birth_reg_1887_emmeline_brain",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?dbid=8912&h=33557671&indiv=try&o_vc=Record:OtherRecord&rhSource=8913",
  },
  {
    // Saved July 2022 - still says Registration District, has MMN
    caseName: "england_birth_reg_1949_maureen_hale",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8782&h=22191988&tid=172368945&pid=392241408802&hid=1048116409333&_gl=1*9eek4q*_ga*NTE3MDQyOTk1LjE2NTY5NDk1Nzk.*_ga_4QT8FMEX30*MTY1Njk2OTIyOC4zLjEuMTY1Njk2OTYwNS4w",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_birthRegReg_includeMmn: "no",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_birthRegReg_includeMmn: "inMainSentence",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_birthRegReg_includeMmn: "inSeparateSentence",
        },
      },
    ],
  },
  {
    // Older version with Registration District (pre June 2022)
    caseName: "england_birth_reg_chaplin-1740",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8912&h=37047757&tid=&pid=&queryId=8210154b464e9c6948ce68f1f4d12893&usePUB=true&_phsrc=ywU7512&_phstart=successSource",
  },
  {
    // relies on field names to classify record
    caseName: "england_bt_marriage_1828_james_halliwell",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=60496&h=3995291",
  },
  {
    caseName: "england_census_1841_ann_axland",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8978&h=16161242&tid=&pid=&queryId=1452d1df2d23a3ad7af1da515159f4bf&usePUB=true&_phsrc=ywU8297&_phstart=successSource",
  },
  {
    caseName: "england_census_1851_john_lago",
    url: "https://www.ancestry.com/discoveryui-content/view/5941797:8767?ssrc=pt&tid=118975788&pid=400176376493&clickref=1100lw3b8Ahw%2C1100lw3b8Ahw&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate%2BExternal",
  },
  {
    caseName: "england_census_1871_cole-650",
    url: "https://www.ancestry.com/discoveryui-content/view/11291260:7619",
  },
  {
    caseName: "england_census_1871_grosvenor_hood",
    url: "https://www.ancestry.com/discoveryui-content/view/10856675:7619",
  },
  {
    caseName: "england_census_1871_pavey-451",
    url: "https://www.ancestry.com/discoveryui-content/view/4576313:7619",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inCensusTitle",
          narrative_census_sentenceStructure: "comma",
          narrative_census_ageFormat: "parensAge",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_ageFormat: "commasAge",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "onDate",
          narrative_census_ageFormat: "plainAge",
        },
      },
      {
        variantName: "narrative_4",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_ageFormat: "parensAged",
        },
      },
      {
        variantName: "narrative_5",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_6",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_ageFormat: "plainAged",
        },
      },
      {
        variantName: "narrative_7", // Steve Whitfield preferred
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_includeAge: "no",
        },
      },
    ],
  },
  {
    caseName: "england_census_1871_rebacca_darby",
    url: "https://www.ancestry.com/discoveryui-content/view/2477121:7619",
  },
  {
    caseName: "england_census_1881_searle-38",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=7572&h=26496682&clickref=1100lh4Tvjw5%2C1100lh4Tvjw5&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate%2BExternal",
  },
  {
    caseName: "england_census_1881_william_seddon",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=7572&h=10602933&tid=&pid=&queryId=918527b36e360d9cd105c91de4316714&usePUB=true&_phsrc=RTj20886&_phstart=successSource&_gl=1*1p0bvpw*_ga*MTg1ODgzOTg5Ny4xNjQ3OTQ3OTE4*_ga_4QT8FMEX30*MTY1NTMyNjgxMy4yNzUuMS4xNjU1MzM2MzU2LjA.",
    optionVariants: [
      {
        variantName: "narrative_1", // Steve Whitfield preferred
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_includeAge: "no",
          narrative_census_includeOccupation: "inSeparateSentenceHead",
          narrative_census_sentenceStructure: "comma",
          narrative_census_wasPartFormat: "wasEnumerated",
          narrative_census_householdPartFormat: "withFamily",
        },
      },
    ],
  },
  {
    caseName: "england_census_1891_chaplin-1740",
    url: "https://www.ancestry.com/discoveryui-content/view/7866657:6598?_phsrc=ywU8188&_phstart=successSource&gsfn=Blanche+Amelia&gsln=Radcliffe&ml_rpos=1&queryId=47f46742e730e73a9fca2c081ec3a0df",
  },
  {
    caseName: "england_census_1891_pavey-452",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=6598&h=11301719&clickref=1011lhuMFmjB%2C1011lhuMFmjB&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate%2BExternal",
    optionVariants: [
      {
        variantName: "domain_au",
        optionOverrides: { citation_ancestry_recordTemplateDomain: "ancestry.com.au" },
      },
    ],
  },
  {
    // URL is from clicking on a different person in the wife's record. Note dbid is England1911
    caseName: "england_census_1911_more-785",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?db=1911England&indiv=try&h=51208",
    optionVariants: [
      {
        variantName: "table_afterRef",
        optionOverrides: {
          narrative_general_nameOrPronoun: "forenames",
          table_general_autoGenerate: "afterRef",
        },
      },
      {
        variantName: "table_afterRefBlankLine",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          table_general_autoGenerate: "afterRefBlankLine",
        },
      },
      {
        variantName: "table_withinRefOrSource",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          table_general_autoGenerate: "withinRefOrSource",
          table_general_format: "sentence",
        },
      },
      {
        variantName: "table_withinRefOrSourceList",
        optionOverrides: {
          table_general_autoGenerate: "withinRefOrSource",
          table_general_format: "list",
          citation_ancestry_dataStyle: "string",
        },
      },
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_includeOccupation: "no",
          narrative_census_householdPartFormat: "withFamily",
          narrative_census_includeHousehold: "inMainSentence",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_includeOccupation: "inMainSentence",
          narrative_general_occupationFormat: "lowerCase",
          narrative_census_ageFormat: "commasAge",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_includeOccupation: "inSeparateSentence",
        },
      },
    ],
  },
  {
    caseName: "england_chelsea_pensioner_william_nicholls",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=61068&h=825575&tid=&pid=&queryId=d105456679ffb7a432e3f0e2d8c91fdc&usePUB=true&_phsrc=ywU8090&_phstart=successSource",
  },
  {
    caseName: "england_child_baptism_samuel_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/1071978:9841",
  },
  {
    caseName: "england_child_burial_1794_miles_lumb",
    url: "https://www.ancestry.com/discoveryui-content/view/604340115:2256",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          narrative_burial_ageFormat: "commasAged",
        },
      },
    ],
  },
  {
    caseName: "england_christening_1837_agnes_woodhouse",
    url: "https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&dbid=1351&h=2249655&tid=172368945&pid=392333730623&hid=1048044804201",
    optionVariants: [
      {
        variantName: "narrative_forenames",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_nameOrPronoun: "forenames",
          narrative_general_dateFormat: "long",
        },
      },
      {
        variantName: "narrative_fullName",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_nameOrPronoun: "fullName",
          narrative_general_dateFormat: "short",
        },
      },
      {
        variantName: "narrative_pronoun",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_nameOrPronoun: "pronoun",
          narrative_general_dateFormat: "theNth",
        },
      },
      {
        variantName: "narrative_noParentage",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_includeParentage: "no",
          narrative_baptism_sentenceStructure: "parentsBornSemiBap",
          narrative_general_dateFormat: "monthComma",
        },
      },
      {
        variantName: "narrative_parentageFormat",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_parentageFormat: "theTwoCommas",
          narrative_general_dateFormat: "monthCommaNth",
        },
      },
      {
        variantName: "narrative_parentageSeparate",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_baptism_includeParentage: "inSeparateSentence",
          narrative_general_parentsUseAmpOrAnd: "and",
          narrative_general_dateFormat: "country",
        },
      },
      {
        variantName: "narrative_dateFormatCountryNth",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "countryNth",
        },
      },
    ],
  },
  {
    // Smith-204554
    caseName: "england_death_reg_2002_teresa_fitchie",
    url: "https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&dbid=7579&h=13080918&ssrc=pt&tid=172368945&pid=392239251050&usePUB=true",
  },
  {
    caseName: "england_death_reg_handford-3",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8914&h=14602608&tid=&pid=&queryId=3cb07e6ff167de79091b215fd9c16cf3&usePUB=true&_phsrc=ywU7466&_phstart=successSource",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_deathRegReg_sentenceStructure: "twoSentences",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_deathRegReg_sentenceStructure: "twoSentencesDate",
        },
      },
    ],
  },
  {
    caseName: "england_death_reg_louisa_noble",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=7579&h=40560790",
  },
  {
    caseName: "england_divorce_maria_bradbeer",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?viewrecord=1&r=an&db=divorcerecords&indiv=try&h=160744",
  },
  {
    caseName: "england_electoral_reg_1914_harry_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/54921469:1795",
  },
  {
    caseName: "england_marriage_agnes_longe",
    url: "https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&dbid=61187&h=93209492",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_placeChurchFirst: "yes",
          narrative_marriage_nameOrPronoun: "pronoun",
        },
      },
    ],
  },
  {
    caseName: "england_marriage_allegation_1861_sara_mills",
    url: "https://www.ancestry.com/discoveryui-content/view/688871:2056",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_placeChurchFirst: "yes",
          narrative_marriage_nameOrPronoun: "pronoun",
        },
      },
    ],
  },
  {
    caseName: "england_marriage_reg_1903_rosalie_muirhead",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=8913&h=20507684",
  },
  {
    caseName: "england_marriage_reg_1913_emmeline_brain",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=8913&h=3291674",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "forenames",
          narrative_marriageRegReg_regDistrictFormat: "districtCounty",
          narrative_marriageRegReg_sentenceStructure: "twoSentences",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          narrative_marriageRegReg_regDistrictFormat: "districtName",
          narrative_marriageRegReg_sentenceStructure: "twoSentencesDate",
        },
      },
    ],
  },
  {
    caseName: "england_marriage_reg_1926_leonard_foulger",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8753&h=62060982&tid=&pid=&queryId=1b01eb2d3732c5b1f808cd7f527cb609",
  },
  {
    caseName: "england_marriage_reg_handford-3",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=8913&h=12442064&tid=&pid=&queryId=94de3401cdef1bd72b5ec6ee8ea7461f&usePUB=true&_phsrc=ywU6268&_phstart=successSource",
  },
  {
    caseName: "england_parish_baptism_1821_jane_linnett",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=61699&h=4177362&tid=&pid=&queryId=a1b054f56bbaba50955e509591129d4b&usePUB=true&_phsrc=ULN1037&_phstart=successSource",
  },
  {
    caseName: "england_parish_baptism_littlemore-13",
    url: "https://www.ancestry.com/discoveryui-content/view/1579851:1558",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          narrative_general_placeChurchFirst: "yes",
        },
      },
    ],
  },
  {
    caseName: "england_parish_burial_lovell-93",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=9201&h=797866&tid=&pid=&queryId=9d2a963c864aa43d55b6d554fee39040&usePUB=true&_phsrc=ywU6427&_phstart=successSource",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_burial_nameOrPronoun: "pronoun",
          narrative_burial_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_burial_nameOrPronoun: "fullName",
          narrative_burial_includeAge: "inSeparateSentence",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_burial_nameOrPronoun: "forenames",
          narrative_burial_includeAge: "no",
        },
      },
    ],
  },
  {
    caseName: "england_parish_child_baptism_1753_leonard_pavey",
    url: "https://www.ancestry.com/family-tree/person/tree/86808578/person/46588142707/facts?msg=ntm&msgParams=%7c2%7c2%7c&mpid=46588142707&nec=0&mdbid=2243&mrpid=151040635",
  },
  {
    caseName: "england_pcc_fawsett-4",
    url: "https://www.ancestry.com/discoveryui-content/view/413359:5111?tid=&pid=&_phsrc=ywU133&_phstart=successSource",
  },
  {
    caseName: "england_probate_1962_william_mclaren",
    url: "https://www.ancestry.com/discoveryui-content/view/13762821:1904",
    optionVariants: [
      {
        variantName: "fullName",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
        },
      },
    ],
  },
  {
    caseName: "england_probate_1994_minnie_flatters",
    url: "https://www.ancestry.co.uk/discoveryui-content/view/24194132:1904",
  },
  {
    caseName: "england_probate_pavey-459",
    url: "https://www.ancestry.com/discoveryui-content/view/17893479:1904",
  },
  {
    caseName: "germany_baptism_1840_johanna_hartmann",
    url: "https://www.ancestry.com/discoveryui-content/view/68166661:9866",
  },
  {
    caseName: "germany_family_register_1833_ernst_skopp",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61311&h=2913",
  },
  {
    caseName: "ireland_birth_reg_1878_ruth_shaw",
    url: "https://www.ancestry.com/discoveryui-content/view/3027592:2573",
  },
  {
    caseName: "ireland_census_1901_margaret_kearney",
    url: "https://www.ancestry.co.uk/discoveryui-content/view/10426199:70667?tid=&pid=&queryId=599070b5196aba97ca5be878bcb79ee9&_phsrc=UnG12&_phstart=successSource",
  },
  {
    caseName: "ireland_death_1933_olive_houston",
    url: "https://www.ancestry.com/discoveryui-content/view/6407416:2534",
  },
  {
    caseName: "scotland_birth_1842_christian_mcleod",
    url: "https://www.ancestry.com/discoveryui-content/view/14121139:60143",
  },
  {
    caseName: "scotland_census_1861_james_fraser",
    url: "https://www.ancestry.com/discoveryui-content/view/165755:1080?_phsrc=AhC28&_phstart=successSource&gsfn=James&gsln=Fraser&ml_rpos=1&queryId=ac9ef1c2767e23287bf156e33da8ee3c",
  },
  {
    caseName: "uk_burial_1923_amelia_mccarthy",
    url: "https://www.ancestry.co.uk/discoveryui-content/view/1712038:70845?ssrc=pt&tid=172368945&pid=392239251049",
  },
  {
    caseName: "uk_prison_hulk_1831_jas_toomer",
    url: "https://www.ancestry.com/discoveryui-content/view/219120:1989",
  },
  {
    caseName: "uk_ww1_pension_betsy_brown",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61588&h=111790356",
  },
  {
    caseName: "uk_ww1_pension_cecil_druce",
    url: "https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&db=61588&h=21143847",
  },
  {
    caseName: "us_al_death_1969_mattie_bryant",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=2543&h=1504470",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_death_nameOrPronoun: "pronoun",
          narrative_death_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_death_nameOrPronoun: "fullName",
          narrative_death_includeAge: "inSeparateSentence",
          narrative_death_includeParentage: "inSeparateSentence",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_parentsUseAmpOrAnd: "and",
          narrative_death_nameOrPronoun: "forenames",
          narrative_death_includeAge: "no",
          narrative_death_parentageFormat: "theTwoCommas",
        },
      },
    ],
  },
  {
    caseName: "us_ar_marriage_1953_philip_carson",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61775&h=1236093",
  },
  {
    caseName: "us_burial_fg_1831_ada_kirby",
    url: "https://www.ancestry.co.uk/discoveryui-content/view/106712744:60525",
  },
  {
    caseName: "us_ca_death_reg_1927_mary_miller",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=5187&h=1511274&clickref=1100lii9YCCc%2C1100lii9YCCc&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate%2BExternal",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "forenames",
          narrative_death_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          narrative_death_ageFormat: "plainAge",
          narrative_general_dateFormat: "short",
          narrative_general_country: "none",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "country",
        },
      },
      {
        variantName: "narrative_4",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "countryNth",
        },
      },
    ],
  },
  {
    caseName: "us_ca_death_reg_1971_victoria_cordero",
    url: "https://www.ancestry.com/discoveryui-content/view/4405640:5180?ssrc=pt&tid=170661751&pid=192252043318",
  },
  {
    caseName: "us_ca_divorce_1975_barbara_brinkerhoff",
    url: "https://www.ancestry.com/discoveryui-content/view/3806392:1141",
  },
  {
    caseName: "us_ca_voter_register_1868_william_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/6446850:2221",
  },
  {
    caseName: "us_cemetery_2012_allen_kellogg",
    url: "https://www.ancestry.com/discoveryui-content/view/500681718:2190?ssrc=pt&tid=69302672&pid=402372721267",
  },
  {
    caseName: "us_co_death_2006_leland_thatcher",
    url: "https://www.ancestry.com/discoveryui-content/view/41128:61798",
  },
  {
    caseName: "us_ct_naturalization_1918_robert_best",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=61195&h=75954&tid=&pid=&queryId=cfeed3144371c2b73aec117cb890838b&usePUB=true&_phsrc=XJK1014&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1790_claborn_cawthon",
    url: "https://www.ancestry.com/discoveryui-content/view/111792:2234",
  },
  {
    caseName: "us_federal_census_1800_mical_taylor",
    url: "https://www.ancestry.com/discoveryui-content/view/169250:7590?tid=&pid=&queryId=6115b2551ae4535b44ea2de98ec0b9d6&_phsrc=Vww4217&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1810_steven_jones",
    url: "https://www.ancestry.com/discoveryui-content/view/568306:7613?tid=&pid=&queryId=235d8024cb84330d080e141d11b7a416&_phsrc=Vww4220&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1820_willm_johnson",
    url: "https://www.ancestry.com/discoveryui-content/view/132041:7734?tid=&pid=&queryId=c33626252dce21f5ecab3696b52ac556&_phsrc=Vww4224&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1830_frederick_perry",
    url: "https://www.ancestry.com/discoveryui-content/view/1691734:8058?tid=&pid=&queryId=8f5294ba66fde6fa4a52109fd8927ea8&_phsrc=Vww4227&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1830_joshua_laymon",
    url: "https://www.ancestry.com/discoveryui-content/view/1494711:8058",
  },
  {
    caseName: "us_federal_census_1840_samuel_parker",
    url: "https://www.ancestry.com/discoveryui-content/view/2464636:8057?tid=&pid=&queryId=baa4333e86dd5aab853e75d6460dcd46&_phsrc=Vww4230&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1850_jas_willson",
    url: "https://www.ancestry.com/discoveryui-content/view/1085066:8054?tid=&pid=&queryId=00a36368cbf257b0571bfae477ca79b6&_phsrc=Vww4232&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1860_charles_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/10119823:7667",
  },
  {
    caseName: "us_federal_census_1870_g_h_smith",
    url: "https://www.ancestry.com/discoveryui-content/view/18923868:7163",
  },
  {
    caseName: "us_federal_census_1870_paul_potter",
    url: "https://www.ancestry.com/discoveryui-content/view/10410782:7163?tid=&pid=&queryId=5cd807e56b157c5368ce218360c2c866&_phsrc=Vww4236&_phstart=successSource",
  },
  {
    caseName: "us_federal_census_1880_isabelle_potter",
    url: "https://www.ancestry.com/discoveryui-content/view/10577665:6742",
  },
  {
    caseName: "us_federal_census_1920_henry_barral",
    url: "https://www.ancestry.com/discoveryui-content/view/41984770:6061",
  },
  {
    caseName: "us_federal_census_1950_william_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/106947163:62308?_phsrc=Vww4195&_phstart=successSource&gsln=Pavey&ml_rpos=1&queryId=a49f2cd14190e5fbda1183dad6292633",
  },
  {
    caseName: "us_federal_np_census_1850_charles_pavey",
    url: "https://www.ancestry.com/discoveryui-content/view/4001446:1276",
  },
  {
    caseName: "us_ia_child_birth_1894_eva_warnock",
    url: "https://www.ancestry.com/discoveryui-content/view/602090064:61441",
  },
  {
    caseName: "us_il_birth_1915_henry_ohlman",
    url: "https://www.ancestry.com/discoveryui-content/view/38163:62361",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "short",
          narrative_general_nameOrPronoun: "pronoun",
          narrative_birth_nameOrPronoun: "default",
          narrative_birth_parentageFormat: "theTwoCommas",
          narrative_general_parentsUseAmpOrAnd: "and",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_birth_nameOrPronoun: "fullName",
          narrative_birth_includeParentage: "inSeparateSentence",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_birth_nameOrPronoun: "forenames",
          narrative_birth_includeParentage: "no",
        },
      },
    ],
  },
  {
    caseName: "us_ks_census_1885_james_goggin",
    url: "https://www.ancestry.com/discoveryui-content/view/76967:1088",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "short",
          narrative_general_nameOrPronoun: "pronoun",
          narrative_census_nameOrPronoun: "default",
          narrative_census_sentenceStructure: "comma",
          narrative_census_censusDatePartFormat: "inCensusTitle",
          narrative_census_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_includeAge: "inSeparateSentence",
        },
      },
    ],
  },
  {
    caseName: "us_ks_census_1885_m_a_jones",
    url: "https://www.ancestry.com/discoveryui-content/view/187423:1088",
  },
  {
    caseName: "us_ky_birth_1874_dela_fields",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?dbid=1213&h=69475&indiv=try&o_vc=Record:OtherRecord&rhSource=60525",
  },
  {
    caseName: "us_ky_death_1876_emaline_fields",
    url: "https://www.ancestry.com/discoveryui-content/view/210223:1222",
  },
  {
    caseName: "us_ky_grave_john_kemper",
    url: "https://www.ancestry.com/discoveryui-content/view/29540:4110",
  },
  {
    caseName: "us_ma_arrival_1854_honor_buckley",
    url: "https://www.ancestry.com/discoveryui-content/view/3941667:8745",
  },
  {
    caseName: "us_ma_birth_1642_increase_sumner",
    url: "https://www.ancestry.com/discoveryui-content/view/46470693:2495",
  },
  {
    caseName: "us_ny_census_1892_henry_brixius",
    url: "https://www.ancestry.com/discoveryui-content/view/93143:8940",
  },
  {
    caseName: "us_ny_census_1925_leroy_whitcomb",
    url: "https://www.ancestry.com/discoveryui-content/view/24992583:2704",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_dateFormat: "short",
          narrative_general_nameOrPronoun: "pronoun",
          narrative_census_nameOrPronoun: "default",
          narrative_census_sentenceStructure: "comma",
          narrative_census_censusDatePartFormat: "inCensusTitle",
          narrative_census_ageFormat: "commasAged",
          narrative_census_wasPartFormat: "wasEnumerated",
          narrative_census_householdPartFormat: "withFamily",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_census_censusDatePartFormat: "inYear",
          narrative_census_includeAge: "inSeparateSentence",
        },
      },
    ],
  },
  {
    caseName: "us_ny_guard_enlist_1917_george_leonard",
    url: "https://www.ancestry.com/discoveryui-content/view/7162:2878",
  },
  {
    caseName: "us_ny_marriage_1907_florence_speanburgh",
    url: "https://www.ancestry.com/discoveryui-content/view/198847:61632?ssrc=pt&tid=59952022&pid=362148268781",
  },
  {
    caseName: "us_ny_probate_1877_cornelia_pearsall",
    url: "https://www.ancestry.com/discoveryui-content/view/10725078:8800",
  },
  {
    caseName: "us_obituary_1901_john_gardiner",
    url: "https://www.ancestry.com/discoveryui-content/view/982098692:61843?tid=&pid=&queryId=c04479f2cec3171a504df07c4a358fb4&_phsrc=ywU8200&_phstart=successSource",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          narrative_obituary_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          narrative_obituary_includeAge: "no",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "forenames",
          narrative_obituary_includeAge: "inSeparateSentence",
        },
      },
    ],
  },
  {
    caseName: "us_oh_newspaper_1914_newark_advocate",
    url: "https://www.ancestry.com/imageviewer/collections/7359/images/NEWS-OH-NE_AD.1914_02_21_0005",
  },
  {
    caseName: "us_oh_obituary_1857_david_witter",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=1671&h=2089834&tid=&pid=&queryId=19e575cdf12c6f09b8b5bd713ca5e6d0&usePUB=true&_phsrc=XJK3973&_phstart=successSource",
    optionVariants: [
      {
        variantName: "narrative_1",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "pronoun",
          narrative_obituary_ageFormat: "commasAged",
        },
      },
      {
        variantName: "narrative_2",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "fullName",
          narrative_obituary_includeAge: "no",
        },
      },
      {
        variantName: "narrative_3",
        thisTypeOnly: "narrative",
        optionOverrides: {
          narrative_general_nameOrPronoun: "forenames",
          narrative_obituary_includeAge: "inSeparateSentence",
        },
      },
    ],
  },
  {
    caseName: "us_oh_soldier_grave_1894_george_brown",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=61438&h=53309&tid=78595359&pid=48386985802&queryId=8e22799f5ce973848aac42d75a574505&usePUB=true&_phsrc=RKt47&_phstart=successSource",
  },
  {
    caseName: "us_pa_marriage_1761_patience_brown",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=7830&h=19685&ssrc=pt&tid=151196245&pid=232150076925&usePUB=true&_gl=1*gdg05q*_ga*NTcwNzMwNTUuMTUwNzc2NTI2Ng..*_ga_4QT8FMEX30*MTY1NzM5NjM3NC4yNzUuMS4xNjU3Mzk2Mzg1LjA",
  },
  {
    caseName: "us_passport_1914_edward_baltzell",
    url: "https://www.ancestry.com/discoveryui-content/view/486408:1174?tid=&pid=&queryId=8f5add16a11ea5de69a2c8e717cc6e4e&_phsrc=lQX2683&_phstart=successSource",
  },
  {
    caseName: "us_pension_1929_robert_coleman",
    url: "https://www.ancestry.com/discoveryui-content/view/1382783:1677",
  },
  {
    caseName: "us_public_record_1993_carol_kohler",
    url: "https://www.ancestry.com/discoveryui-content/view/90102600:1788?tid=&pid=&queryId=3f2875963e8fdb060b90dbdfee3bc52b&_phsrc=THy458&_phstart=successSource",
  },
  {
    caseName: "us_quaker_birth_1799_james_broomal",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=2189&h=2035846&tid=&pid=&queryId=ae62831b1c51360241ee065f6ff77d67&usePUB=true&_phsrc=XJK468&_phstart=successSource",
  },
  {
    caseName: "us_railroad_1953_william_ganz",
    url: "https://www.ancestry.com/discoveryui-content/view/15511:6944",
  },
  {
    caseName: "us_railroad_pension_1973_d_holle",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61597&h=81131",
  },
  {
    caseName: "us_ri_census_1925_mary_hughes",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?dbid=4721&h=2697241&indiv=try&o_vc=Record:OtherRecord&rhSource=2469",
  },
  {
    caseName: "us_ri_naturalization_1911_george_simpson",
    url: "https://www.ancestry.com/discoveryui-content/view/264074:61208",
  },
  {
    caseName: "us_ss_death_1996_john_smith",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=3693&h=14641755&tid=&pid=&queryId=cd43f15d15cbf13e87f4dc4888f499dc&usePUB=true&_phsrc=Vww4090&_phstart=successSource",
  },
  {
    caseName: "us_state_census_1855_avis_leonard",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=4472&h=2609994&tid=&pid=&queryId=2195c7429d02e5defc0596882e89c665&usePUB=true&_phsrc=XJK399&_phstart=successSource",
  },
  {
    caseName: "us_tx_birth_1912_hollums",
    url: "https://www.ancestry.com/discoveryui-content/view/1350244:2275?ssrc=pt&tid=50462224&pid=13068854942",
  },
  {
    caseName: "us_tx_death_1865_nellie_drake",
    url: "https://www.ancestry.com/discoveryui-content/view/23886198:2272",
  },
  {
    caseName: "us_va_census_1782_abel_wakefield",
    url: "https://www.ancestry.com/discoveryui-content/view/32837506:3578",
  },
  {
    caseName: "us_va_divorce_1956_harold_baker",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=General-9280&h=125735",
  },
  {
    caseName: "us_vabirls_death_2005_william_carson",
    url: "https://www.ancestry.com/discoveryui-content/view/1562948:2441",
  },
  {
    caseName: "us_veteran_index_1919_george_leonard",
    url: "https://www.ancestry.com/discoveryui-content/view/4102834:61861",
  },
  {
    caseName: "us_yearbook_1935_lorraine_gardiner",
    url: "https://www.ancestry.com/discoveryui-content/view/90610650:1265",
  },
  {
    caseName: "wales_census_1901_emily_black",
    url: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&dbid=7815&h=33333435&ssrc=pt&tid=86808578&pid=46576577645&usePUB=true",
  },

  // Person profile pages
  {
    // Had "ABT" in death date
    caseName: "xx_profile_clement_more_1833_1905_england",
    url: "https://www.ancestry.com/family-tree/person/tree/86808578/person/260052341589/facts",
  },
  {
    // Has middle initial and multiple last names
    caseName: "xx_profile_fannie_kemper_1859_1933_us",
    url: "https://www.ancestry.com/family-tree/person/tree/11748183/person/12992988602/facts",
  },
  {
    caseName: "xx_profile_ralph_pavey_1891_1958_england",
    url: "https://www.ancestry.com/family-tree/person/tree/86808578/person/46552199708/facts",
  },
  {
    // has a "Possible marriage records" fact
    caseName: "xx_profile_william_saville_1995_england",
    url: "https://www.ancestry.com/family-tree/person/tree/86808578/person/262406177056/facts",
  },

  // sharing pages
  {
    caseName: "yy_sharing_england_census_1911_harold_pavey",
    url: "https://www.ancestry.com/sharing/26033082?h=b2ba14&clickref=1011lwhmX9Rt%2C1011lwhmX9Rt&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate+External",
  },
  {
    caseName: "yy_sharing_us_census_1870_wm_kemper",
    url: "https://www.ancestry.com/sharing/236392?token=3832226f2908014024cae3a4bbf644cc019539bca23c8b7133f0affb1529385c",
  },
  {
    // As of 7 Nov 2022 this sharing link: https://www.ancestry.com/sharing/27952110?h=8bcf5f
    // Takes you to this page
    caseName: "yy_sharing_us_census_1940_leslie_cox",
    url: "https://www.ancestry.com/census-search/discoveries?matchdbid=2442&matchrecordid=130891334&matchrelative=relative&share=1&matchgid=ZKaJzrJ3pquxvoYavEO5Hka1nA1QpAf5Wb&matchfirstname=Leslie%20R&matchlastname=Cox&matchbirthdate=1931&matchgender=male",
  },

  // Image pages
  {
    caseName: "zz_image_us_ia_probate_1900",
    url: "https://www.ancestry.com/imageviewer/collections/9064/images/007593442_00286",
  },
  {
    caseName: "zz_image_us_ky_death_1917_samuel_shields",
    url: "https://www.ancestry.com/imageviewer/collections/1222/images/KYVR_7016193-0864?pId=601716004",
  },
  {
    caseName: "zz_image_us_oh_tax_1836",
    url: "https://www.ancestry.com/imageviewer/collections/60104/images/MM9.3.1_2FTH-267-11831-94311-26",
  },
];

const optionVariants = [
  {
    variantName: "dataStyle_none",
    optionOverrides: {
      citation_ancestry_dataStyle: "none",
    },
  },
  {
    variantName: "dataStyle_string",
    optionOverrides: {
      citation_ancestry_dataStyle: "string",
    },
  },
  {
    variantName: "dataStyle_list",
    optionOverrides: {
      citation_ancestry_dataStyle: "list",
    },
  },
  {
    variantName: "dataStyle_table",
    optionOverrides: {
      citation_ancestry_dataStyle: "table",
    },
  },
  {
    variantName: "full_ee_style",
    optionOverrides: {
      citation_general_meaningfulNames: "none",
      citation_general_commaInsideQuotes: true,
      citation_general_addEeItemType: true,
      citation_general_referencePosition: "atEnd",
      citation_general_addAccessedDate: "parenBeforeLink",
      citation_general_sourceReferenceSeparator: "commaSpace",
      citation_general_dataListSeparator: "commaSpace",
      citation_general_addNewlinesWithinBody: false,
      citation_general_addBreaksWithinBody: false,
      citation_general_addNewlinesWithinRefs: false,
      citation_ancestry_dataStyle: "table", // should be ignored
    },
  },
  {
    variantName: "partial_ee_style",
    optionOverrides: {
      citation_general_meaningfulNames: "italic",
      citation_general_commaInsideQuotes: false,
      citation_general_addEeItemType: true,
      citation_general_referencePosition: "afterSourceTitle",
      citation_general_addAccessedDate: "parenBeforeLink",
      citation_general_sourceReferenceSeparator: "commaSpace",
      citation_general_dataListSeparator: "semicolon",
      citation_general_addNewlinesWithinBody: true,
      citation_general_addBreaksWithinBody: false,
      citation_general_addNewlinesWithinRefs: true,
      citation_ancestry_dataStyle: "list",
    },
  },
];

async function runTests(testManager) {
  await runExtractDataTests("ancestry", extractData, regressionData, testManager);

  await runGeneralizeDataTests("ancestry", generalizeData, regressionData, testManager);

  const functions = { buildCitation: buildCitation, buildTable: buildHouseholdTable };
  await runBuildCitationTests("ancestry", functions, regressionData, testManager, optionVariants);
}

export { runTests };
