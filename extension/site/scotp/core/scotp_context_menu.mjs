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

/* The text selected is going to be in read mode most likely. So something like this:

Birth or Baptism: "Church of Scotland: Old Parish Registers - Births and Baptisms" National Records of Scotland, Parish Number: 382/ ; Ref: 20 9 ScotlandsPeople Search (accessed 23 June 2022) Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland.

But it could also be in edit mode, in which case it would be like:

<ref> '''Birth or Baptism''': "Church of Scotland: Old Parish Registers - Births and Baptisms"<br/> National Records of Scotland, Parish Number: 382/ ; Ref: 20 9<br/> [https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=%28B%20OR%20C%20OR%20S%29&record_type%5B0%5D=opr_births&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-births-baptisms&surname=CONNAN&surname_so=exact&forename=PETER&forename_so=exact&from_year=1823&to_year=1823&sex=M&parent_names=JAMES%20CONNAN&parent_names_so=exact&parent_name_two=MARY%20MCGREGOR&parent_name_two_so=exact&rd_display_name%5B0%5D=MONZIE_MONZIE%20(PERTH)&rd_name%5B0%5D=MONZIE ScotlandsPeople Search] (accessed 23 June 2022)<br/> Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland. </ref>

NOTE: The selectionText from the context menu automatically has the \n characters removed already
*/

import { scotpRecordTypes, ScotpRecordType, SpEventClass, SpFeature, SpField } from "./scotp_record_type.mjs";
import { ScotpFormDataBuilder } from "./scotp_form_data_builder.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

// NOTE: All patterns try to handle the optional accessed date in all three options
// This non-capturing group should match all possibilities
// (?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )
const reParish = /(.*),? ?/;
const reSourceTitle = /"([^"]+)",?/;
const reDatabaseLiteral = /(?: database with images| database)?,? ?/;
const reWebsiteCreatorOwner = /([^(\[]*),? ?/;
const reSourceRef = /([^(]*),? ?/;
const reLinkStart =
  /\(?(?:scotlandspeople \(https\:\/\/www\.scotlandspeople\.gov\.uk[^\: ]*|scotlandspeople search|scotlandspeople)/;
const reLinkStartEdit = /\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\]/;
const reLinkEnd = /(?: ?\((?:image )?accessed [^\)]+\),? ?| ?\: ?(?:image )?accessed [^\)]+\),? ?| |,|, )/;
const reDataString = /(.*)/;
const reCitingSourceRef = /;? citing (.*)/;

const reb =
  /^(.*),? ?"([^"]+)",?(?: database)?,? ?([^(\[]*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\](?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*);? citing (.*)$/;
const rec =
  /^(.*) "([^"]+)",?(?: database)?,? ?([^(\[]*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\](?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*);? citing (.*)$/;
const rel =
  /^(.*) "([^"]+)",?(?: database)?,? ?([^(]*),? \(? ?scotlandspeople(?: search)?(?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )?(.*) citing (.*)$/;

const citationPatterns = [
  {
    // Example: Sourcer different order due to "Place the source reference data" option
    // "scotland census, 1851", database, national records of scotland, scotlandspeople, donald mckay (13) in lairg registration district in sutherland, scotland; citing ref: 053/ 1/ 6.
    // Another example fro Scotland project:
    // "Statutory Registers - Deaths" database, National Records of Scotland, (ScotlandsPeople : accessed 29 May 2024) John Stewart, age 47, Male, 1908, Paisley; citing Reference Number: 573 / 1 / 160.
    regex:
      /^"([^"]+)",?(?: database)?,? ([^(\[]*),? ?\(?scotlandspeople(?: search)?(?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*);? citing (.*)$/,
    paramKeys: ["sourceTitle", "websiteCreatorOwner", "dataString", "sourceReference"],
    reParts: [
      reSourceTitle,
      reDatabaseLiteral,
      reWebsiteCreatorOwner,
      reLinkStart,
      reLinkEnd,
      reDataString,
      reCitingSourceRef,
    ],
  },
  {
    // Example: Sourcer different order due to "Place the source reference data" option
    // Edit mode
    // "church of scotland: old parish registers - births and baptisms", database, national records of scotland, ([https://www.scotlandspeople.gov.uk/ scotlandspeople] : accessed 23 june 2022), peter connan born or baptised on 1 jun 1823, son of james connan & mary mcgregor, in monzie, perthshire, scotland; citing parish number 382/ , ref 20 9.
    // "Statutory Register of Births", database, National Records of Scotland, [https://www.scotlandspeople.gov.uk/ ScotlandsPeople], Helen McCall A'Hara birth registered 1888 in Anderston, mother's maiden name McCall; citing Ref: 644/10/356.
    // "Church of Scotland: Old Parish Registers - Births and Baptisms", database, National Records of Scotland, ([https://www.scotlandspeople.gov.uk/ ScotlandsPeople] : accessed 23 June 2022), Peter Connan born or baptised on 1 Jun 1823, son of James Connan & Mary McGregor, in Monzie, Perthshire, Scotland; citing Parish Number 382/ , Ref 20 9.
    regex:
      /^"([^"]+)",?(?: database)?,? ([^(]*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\](?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*);? citing (.*)$/,
    paramKeys: ["sourceTitle", "websiteCreatorOwner", "dataString", "sourceReference"],
    reParts: [
      reSourceTitle,
      reDatabaseLiteral,
      reWebsiteCreatorOwner,
      reLinkStartEdit,
      reLinkEnd,
      reDataString,
      reCitingSourceRef,
    ],
  },
  {
    // Example: Sourcer Default order
    // This handles all three values of the "Add an accessed date to citation" option
    // "church of scotland: old parish registers - births and baptisms" national records of scotland, parish number: 382/ ; ref: 20 9 scotlandspeople search (accessed 23 june 2022) peter connan born or baptised on 1 jun 1823, son of james connan & mary mcgregor, in monzie, perthshire, scotland.
    // "Statutory Register of Divorces" National Records of Scotland, Court Code: 9772; Serial Number: 1421 ScotlandsPeople Margaret Thomso O'Connor divorce from McClounie in 2010 in Hamilton, Scotland.
    regex:
      /^"([^"]+)",?(?: database)?,? ([^(]*),? ?\(?scotlandspeople(?: search)?(?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*)$/,
    paramKeys: ["sourceTitle", "sourceReference", "dataString"],
    reParts: [reSourceTitle, reDatabaseLiteral, reSourceRef, reLinkStart, reLinkEnd, reDataString],
  },
  {
    // Example: Sourcer Default order, edit mode
    // "scotland census, 1851", national records of scotland, ref: 547/ 1/ 35, [https://www.scotlandspeople.gov.uk/ scotlandspeople] (accessed 13 september 2024), surname mckay, forename donald, year 1851, gender m, age at census 11, rd name portnahaven, county / city argyll.
    // "scotland census, 1851", database, national records of scotland, ref: 053/ 1/ 6, [https://www.scotlandspeople.gov.uk/ scotlandspeople], donald mckay (13) in lairg registration district in sutherland, scotland.
    regex:
      /^"([^"]+)",?(?: database)?,? ([^(]*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\](?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*)$/,
    paramKeys: ["sourceTitle", "sourceReference", "dataString"],
    reParts: [reSourceTitle, reDatabaseLiteral, reSourceRef, reLinkStartEdit, reLinkEnd, reDataString],
  },
  {
    // Example: Scotland Project
    // Sometimes they have the parish or country name before the source citation
    // govan parish, church of scotland, "old parish registers births and baptisms" database, national records of scotland, (scotlandspeople : accessed 29 may 2024), william walker birth or baptism 23 jan 1808, son of hugh walker and ann young, citing ref 20 / 211.
    // Scotland, "Statutory Registers - Marriages" database, National Records of Scotland, (ScotlandsPeople :accessed 15 Nov 2023), Euphemia Lamont, and John McBride, 1856, Greenock Old or West; citing Reference Number: 564 / 3 / 44.
    regex:
      /^(.*) "([^"]+)",?(?: database)?,? ?([^(]*),? \(? ?scotlandspeople(?: search)?(?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )?(.*) citing (.*)$/,
    paramKeys: ["parish", "sourceTitle", "websiteCreatorOwner", "dataString", "sourceReference"],
    reParts: [
      reParish,
      reSourceTitle,
      reDatabaseLiteral,
      reWebsiteCreatorOwner,
      reLinkStart,
      reLinkEnd,
      reDataString,
      reCitingSourceRef,
    ],
  },
  {
    // Example: Scotland Project, no citing
    // Sometimes they have the parish or country name before the source citation
    // St John's, Port Glasgow, "Catholic Registers Births and Baptisms" database, National Records of Scotland, ScotlandsPeople (https://www.scotlandspeople.gov.uk : accessed 21 Feb 2021), William McAtasny, birth 31 Dec 1867 and baptism 1 Apr 1868, son of William McAtasny and Margaret McIlveny.
    regex:
      /^(.*) "([^"]+)",?(?: database)?,? ?([^(]*),? \(? ?scotlandspeople(?: search)?(?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )?(.*) citing (.*)$/,
    paramKeys: ["parish", "sourceTitle", "websiteCreatorOwner", "dataString", "sourceReference"],
    reParts: [reParish, reSourceTitle, reDatabaseLiteral, reWebsiteCreatorOwner, reLinkStart, reLinkEnd, reDataString],
  },
  {
    // Example: Scotland Project edit mode
    // govan parish, church of scotland, "old parish registers births and baptisms" database, national records of scotland, ([https://www.scotlandspeople.gov.uk scotlandspeople] : accessed 29 may 2024), william walker birth or baptism 23 jan 1808, son of hugh walker and ann young, citing ref 20 / 211.
    regex:
      /^(.*) "([^"]+)",?(?: database)?,? ?([^(]*),? \(?\[https\:\/\/www\.scotlandspeople\.gov\.uk scotlandspeople(?: search)?\](?: ?\(accessed [^\)]+\),? ?| ?\: ?accessed [^\)]+\),? ?| |,|, )(.*) citing (.*)$/,
    paramKeys: ["parish", "sourceTitle", "websiteCreatorOwner", "dataString", "sourceReference"],
    reParts: [
      reParish,
      reSourceTitle,
      reDatabaseLiteral,
      reWebsiteCreatorOwner,
      reLinkStartEdit,
      reLinkEnd,
      reDataString,
      reCitingSourceRef,
    ],
  },
];

// No need to lower case these - that is done in compare
// These are in same order as scotpRecordTypes
const defaultSourcerTitles = [
  {
    recordType: "stat_births",
    titles: ["Statutory Register of Births"],
  },
  {
    recordType: "stat_marriages",
    titles: ["Statutory Register of Marriages"],
  },
  {
    recordType: "stat_divorces",
    titles: ["Statutory Register of Divorces"],
  },
  {
    recordType: "stat_deaths",
    titles: ["Statutory Register of Deaths"],
  },
  {
    recordType: "stat_civilpartnerships",
    titles: ["Statutory Register of Civil Partnerships"],
  },
  {
    recordType: "stat_dissolutions",
    titles: ["Statutory Register of Dissolutions"],
  },
  {
    recordType: "opr_births",
    titles: ["Church of Scotland: Old Parish Registers - Births and Baptisms"],
  },
  {
    recordType: "opr_marriages",
    titles: ["Church of Scotland: Old Parish Registers - Banns and Marriages"],
  },
  {
    recordType: "opr_deaths",
    titles: ["Church of Scotland: Old Parish Registers - Deaths and Burials"],
  },
  {
    recordType: "cr_baptisms",
    titles: ["Catholic Parish Registers - Births and Baptisms"],
  },
  {
    recordType: "cr_banns",
    titles: ["Catholic Parish Registers - Marriages"],
  },
  {
    recordType: "cr_burials",
    titles: ["Catholic Parish Registers - Deaths, Burials and Funerals"],
  },
  {
    recordType: "cr_other",
    titles: ["Catholic Parish Registers - Other Events"],
  },
  {
    recordType: "ch3_baptisms",
    titles: ["Other Church Registers - Births and Baptisms"],
  },
  {
    recordType: "ch3_banns",
    titles: ["Other Church Registers - Marriages"],
  },
  {
    recordType: "ch3_burials",
    titles: ["Other Church Registers - Deaths and Burials"],
  },
  {
    recordType: "ch3_other",
    titles: ["Other Church Registers - Other Events"],
  },

  {
    recordType: "census",
    titles: ["Scotland Census, 1841"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1851"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1861"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1871"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1881"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1891"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1901"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1911"],
  },
  {
    recordType: "census",
    titles: ["Scotland Census, 1921"],
  },
  {
    recordType: "census_lds",
    titles: ["Scotland Census, 1881 (LDS)"],
  },
  {
    recordType: "vr",
    titles: ["Valuation Rolls"],
  },
  {
    recordType: "wills",
    titles: ["Wills and Testaments"],
  },
  {
    recordType: "coa",
    titles: ["Public Register of All Arms and Bearings"],
  },
  {
    recordType: "soldiers_wills",
    titles: ["Soldiers' and Airmen's Wills"],
  },
  {
    recordType: "military_tribunals",
    titles: ["Military Service Appeal Tribunals"],
  },
  {
    recordType: "hie",
    titles: ["Highland and Island Emigration Society records"],
  },
  {
    recordType: "prison_records",
    titles: ["Prison Registers"],
  },
];

// No need to lower case these - that is done in compare
// These are in same order as scotpRecordTypes
const scotlandProjectTitles = [
  {
    recordType: "stat_births",
    titles: ["Statutory Registers - Births"],
  },
  {
    recordType: "stat_marriages",
    titles: ["Statutory Registers - Marriages"],
  },
  {
    recordType: "stat_divorces",
    titles: ["Statutory Register - Divorces"],
  },
  {
    recordType: "stat_deaths",
    titles: ["Statutory Registers - Deaths"],
  },
  {
    recordType: "stat_civilpartnerships",
    titles: ["Statutory Registers - Civil Partnerships"],
  },
  {
    recordType: "stat_dissolutions",
    titles: ["Statutory Registers - Dissolutions"],
  },
  {
    recordType: "opr_births",
    titles: ["Old Parish Registers Births and Baptisms"],
  },
  {
    recordType: "opr_marriages",
    titles: ["Old Parish Registers Banns and Marriages"],
  },
  {
    recordType: "opr_deaths",
    titles: ["Old Parish Registers Death and Burials"],
  },
  {
    recordType: "cr_baptisms",
    titles: ["Catholic Registers Births and Baptisms"],
  },
  {
    recordType: "cr_banns",
    titles: ["Catholic Registers Marriages", "Catholic Registers Banns and Marriages"],
  },
  {
    recordType: "cr_burials",
    titles: ["Catholic Registers Deaths, Burials and Funerals"],
  },
  {
    recordType: "cr_other",
    titles: ["Catholic Registers Other Events"],
  },
  {
    recordType: "ch3_baptisms",
    titles: ["Church Registers - Other Church Registers Baptisms"],
  },
  {
    recordType: "ch3_banns",
    titles: ["Church Registers - Other Church Registers Marriages"],
  },
  {
    recordType: "ch3_burials",
    titles: ["Church Registers - Other Church Registers Burials"],
  },
  {
    recordType: "ch3_other",
    titles: ["Church Registers - Other Church Registers Other Events"], // ??
  },

  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1841"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1851"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1861"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1871"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1881"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1891"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1901"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1911"],
  },
  {
    recordType: "census",
    titles: ["Scottish Census Returns - 1921"],
  },
  {
    recordType: "census_lds",
    titles: ["Census 1881 (LDS)"],
  },
  {
    recordType: "vr",
    titles: ["Valuation Rolls"],
  },
  {
    recordType: "wills",
    titles: ["Wills and Testaments"],
  },
  {
    recordType: "coa",
    titles: ["Public Register of All Arms and Bearings"],
  },
  {
    recordType: "soldiers_wills",
    titles: ["Soldiers' and Airmen's Wills"],
  },
  {
    recordType: "military_tribunals",
    titles: ["Military Service Appeal Tribunals"],
  },
  {
    recordType: "hie",
    titles: ["Highland and Island Emigration Society records"],
  },
  {
    recordType: "prison_records",
    titles: ["Prison registers"],
  },
];

const dataStringSentencePatterns = {
  stat_births: [
    {
      // Sourcer generated. Example:
      // Helen McCall A'Hara birth registered 1888 in Anderston, mother's maiden name McCall
      regex: /^(.*) birth registered ([0-9]+) in (.*), mother's maiden name (.*)$/,
      paramKeys: ["name", "eventDate", "rdName", "mmn"],
    },
    {
      // Scotland Project. Example:
      // James Menzies Wood, mother's MS Wright, M, 1872, Blythswood
      regex: /^(.*), mother's ms ([^,]+), (m|f), (\d\d\d\d), ([^;]+).*$/,
      paramKeys: ["name", "mmn", "gender", "eventDate", "rdName"],
    },
  ],
  stat_marriages: [
    {
      // Sourcer generated. Example:
      // Euphemia Lamont marriage to John McBride registered 1856 in Greenock Old or West.
      regex: /^(.*) marriage to (.+) registered (\d\d\d\d) in ([^;]+).*$/,
      paramKeys: ["name", "spouseName", "eventDate", "rdName"],
    },
    {
      // Scotland Project. Example:
      // Euphemia Lamont, and John McBride, 1856, Greenock Old or West
      regex: /^(.*),? and (.+), (\d\d\d\d), ([^;]+).*$/,
      paramKeys: ["name", "spouseName", "eventDate", "rdName"],
    },
  ],
  stat_divorces: [
    {
      // Sourcer generated. Example:
      // Margaret Thomso O'Connor divorce from McClounie in 2010 in Hamilton, Scotland.
      regex: /^(.*) divorce from (.+) in (\d\d\d\d) in ([^;]+).*$/,
      paramKeys: ["name", "spouseLastName", "eventDate", "court"],
    },
  ],
  stat_deaths: [
    {
      // Sourcer generated. Example:
      // Catherine Aagesen death registered 1976 in Glasgow, Martha St (age 85, mother's maiden name McFee).
      regex: /^(.*) death registered (\d\d\d\d) in ([^\(;]+)\(age ([^,]+), mother's maiden name ([^\)]+)\).*$/,
      paramKeys: ["name", "eventDate", "rdName", "age", "mmn"],
    },
    {
      // Scotland Project. Example:
      // John Stewart, age 47, Male, 1908, Paisley
      regex: /^(.*), age ([^,]+), (male|female|m|f), (\d\d\d\d), (.*)$/,
      paramKeys: ["name", "age", "gender", "eventDate", "rdName"],
    },
  ],
  stat_civilpartnerships: [
    {
      // Sourcer generated. Example:
      // Abigail Alice Walker marriage to Morera-Pallares registered 2021 in Rosskeen
      regex: /^(.*) marriage to (.+) registered (\d\d\d\d) in ([^;]+).*$/,
      paramKeys: ["name", "spouseName", "eventDate", "rdName"],
    },
  ],
  stat_dissolutions: [
    {
      // Sourcer generated. Example:
      // Seonaid MacNeil Wilson divorce from MacIntosh in 2013 in Perth, Scotland
      regex: /^(.*) divorce from (.+) in (\d\d\d\d) in ([^;]+).*$/,
      paramKeys: ["name", "spouseLastName", "eventDate", "court"],
    },
  ],
  opr_births: [
    {
      // Example: Sourcer Default
      // peter connan born or baptised on 1 jun 1823, son of james connan & mary mcgregor, in monzie, perthshire, scotland.
      regex:
        /^(.*) (?:born or baptised|birth or baptism) (?:on |in )?([0-9a-z ]+), (?:son|daughter|child) of ([0-9a-z ]+) (?:&|and) ([0-9a-z ]+),? (?:in|at|on) (.*)$/,
      paramKeys: ["name", "eventDate", "fatherName", "motherName", "eventPlace"],
    },
    {
      // Example: Scotland Project
      // william walker birth or baptism 23 jan 1808, son of hugh walker and ann young
      regex:
        /^(.*) (?:born or baptised|birth or baptism) (?:on |in )?([0-9a-z ]+), (?:son|daughter|child) of ([0-9a-z ]+) (?:&|and) ([0-9a-z ]+).*$/,
      paramKeys: ["name", "eventDate", "fatherName", "motherName"],
    },
    {
      // Example: Scotland Project
      // One parent
      // william walker birth or baptism 23 jan 1808, son of hugh walker
      regex:
        /^(.*) (?:born or baptised|birth or baptism) (?:on |in )?([0-9a-z ]+), (?:son|daughter|child) of ([0-9a-z ]+).*$/,
      paramKeys: ["name", "eventDate", "fatherName"],
    },
    {
      // Example: Scotland Project
      // No parents
      // william walker birth or baptism 23 jan 1808
      regex: /^(.*) (?:born or baptised|birth or baptism) (?:on |in )?([0-9a-z ]+).*$/,
      paramKeys: ["name", "eventDate"],
    },
  ],
  opr_marriages: [
    {
      // Example: Sourcer Default
      // Christane McGregor marriage to Robert Wright on or after 2 Jul 1668 in Buchanan, Stirlingshire, Scotland.
      // Note: in the section (?:on or after |on |in ), "on or after " needs to come before "on "
      regex: /^(.*) marriage to (.*) (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "spouseName", "eventDate", "eventPlace"],
    },
  ],
  opr_deaths: [
    {
      // Example: Sourcer Default, age, one parent
      // John Gibson, son of James Galloway Gibson, death or burial (died age 0) on 24 May 1839 in Glasgow, Lanarkshire, Scotland
      regex:
        /^(.*), (?:son|daughter|child) of (.*), death or burial \(died age ([^\)]+)\) (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "parentName", "age", "eventDate", "eventPlace"],
    },
    {
      // Example: Sourcer Default, one parent
      // Elizabeth Campbell, daughter of Colny Campbell, death or burial on 8 Mar 1647 in Dumbarton, Dunbartonshire, Scotland.
      regex:
        /^(.*), (?:son|daughter|child) of (.*), death or burial (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "parentName", "eventDate", "eventPlace"],
    },
    {
      // Example: Sourcer Default, age no parent
      // John Burns death or burial (died age 96) on 26 Feb 1839 in Glasgow, Lanarkshire, Scotland
      regex: /^(.*) death or burial \(died age ([^\)]+)\) (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "age", "eventDate", "eventPlace"],
    },
    {
      // Example: Sourcer Default, no parent
      // James Fraser death or burial on 16 Aug 1685 in Aberdeen, Aberdeenshire, Scotland
      regex: /^(.*) death or burial (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "eventDate", "eventPlace"],
    },
    {
      // Example: Scotland Project
      // death of John Burns, 3 March 1839
      regex: /^death of (.*), ([0-9a-z ]+).*$/,
      paramKeys: ["name", "eventDate"],
    },
  ],
  cr_baptisms: [
    {
      // Example: Sourcer Default
      // Agnes White baptism on 29 Mar 1839 (born 24 Jan 1839), daughter of Alexander White & Saragh McDonnol, in St Mirin's, Paisley, Renfrewshire, Scotland
      regex:
        /^(.*) baptism (?:on |in )?([0-9a-z ]+) \(born (.*)\), (?:son|daughter|child) of ([0-9a-z ]+) (?:&|and) ([0-9a-z ]+),? (?:in|at|on) (.*)$/,
      paramKeys: ["name", "eventDate", "birthDate", "fatherName", "motherName", "eventPlace"],
    },
    {
      // Example: Sourcer Default no dob
      // Agnes White baptism on 29 Mar 1839, daughter of Alexander White & Saragh McDonnol, in St Mirin's, Paisley, Renfrewshire, Scotland
      regex:
        /^(.*) baptism (?:on |in )?([0-9a-z ]+), (?:son|daughter|child) of ([0-9a-z ]+) (?:&|and) ([0-9a-z ]+),? (?:in|at|on) (.*)$/,
      paramKeys: ["name", "eventDate", "fatherName", "motherName", "eventPlace"],
    },
    {
      // Example: Scotland Project
      // William McAtasny, birth 31 Dec 1867 and baptism 1 Apr 1868, son of William McAtasny and Margaret McIlveny.
      regex:
        /^(.*), birth ([0-9a-z ]+) and baptism ([0-9a-z ]+), (?:son|daughter|child) of ([0-9a-z ]+) (?:&|and) ([0-9a-z ]+)$/,
      paramKeys: ["name", "birthDate", "eventDate", "fatherName", "motherName"],
    },
  ],
  cr_banns: [
    {
      // Example: Sourcer Default
      // James Ronald McGregor marriage to Ruth Margaret Gauld on or after 26 Nov 1941 in St Mary's with St Peter's, Aberdeen, Aberdeenshire, Scotland.
      regex: /^(.*) marriage to (.*) (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "spouseName", "eventDate", "eventPlace"],
    },
    {
      // Example: Scotland Project
      // marriage or banns for Michael McBride and Mary McSloy, 21 Jul 1862
      regex: /^marriage or banns for (.*) and (.*), ([0-9a-z ]+).*$/,
      paramKeys: ["name", "spouseName", "eventDate"],
    },
  ],
  cr_burials: [
    {
      // Example: Sourcer Default, age
      // Ruth Fraser burial (died age 0) on 3 Dec 1860 in Old Dalbeth Cemetery, Glasgow, Lanarkshire, Scotland
      regex: /^(.*) burial \(died age ([^\)]+)\) (?:on or after |on |in )([0-9a-z ]+) (?:in|at|on) (.*)$/,
      paramKeys: ["name", "age", "eventDate", "eventPlace"],
    },
  ],
  cr_other: [
    // Sourcer uses data list
  ],
  ch3_baptisms: [],
  ch3_banns: [],
  ch3_burials: [],
  ch3_other: [],
  census: [
    {
      // Example: Scotland Project
      // Ella W. McMillan, female, age at census 2, Greenock West, Renfrew;
      regex: /^(.*), (male|female), age at census ([^,]+), (.*)$/,
      paramKeys: ["name", "gender", "age", "eventPlace"],
    },
    {
      // Example: Sourcer Default with registration district
      // James Fraser (31) in Milton registration district in Lanarkshire, Scotland.
      regex: /^(.*) \(([^\)]+)\) in (.*) registration district in (.*)$/,
      paramKeys: ["name", "age", "rdName", "countyCity"],
    },
    {
      // Example: Sourcer Default, no registration (may never generate this)
      // James Fraser (31) in Milton registration district in Lanarkshire, Scotland.
      regex: /^(.*) \(([^\)]+)\) in (.*)$/,
      paramKeys: ["name", "age", "eventPlace"],
    },
  ],
  census_lds: [],
  vr: [],
  wills: [],
  coa: [],
  soldiers_wills: [],
  military_tribunals: [],
  hie: [],
  prison_records: [],
};

function getScotpRecordTypeFromSourceTitle(sourceTitle) {
  // first check default Sourcer titles
  for (let defaultSourcerTitle of defaultSourcerTitles) {
    for (let title of defaultSourcerTitle.titles) {
      if (sourceTitle == title.toLowerCase()) {
        return defaultSourcerTitle.recordType;
      }
    }
  }

  for (let recordTypeKey in scotpRecordTypes) {
    let recordType = scotpRecordTypes[recordTypeKey];
    const nrsTitle = recordType.collectionNrsTitle;
    if (nrsTitle) {
      let lcNrsTitle = nrsTitle.toLowerCase();
      if (sourceTitle == lcNrsTitle) {
        return recordTypeKey;
      }
    }
  }

  for (let scotlandProjectTitle of scotlandProjectTitles) {
    for (let title of scotlandProjectTitle.titles) {
      let lcTitle = title.toLowerCase();
      if (sourceTitle == lcTitle) {
        return scotlandProjectTitle.recordType;
      }
    }
  }

  return "";
}

function cleanCitation(parsedCitation) {
  let lcText = parsedCitation.lcText;

  lcText = lcText.trim();

  // replace breaks and newlines with ", "
  lcText = lcText.replace(/<\s*br\s*\/ *> *\n\ *>/g, ", ");
  lcText = lcText.replace(/<\s*br\s*\/ *> */g, ", ");
  lcText = lcText.replace(/ *\n\ */g, ", ");

  // replace any multiple white space chars with one space
  lcText = lcText.replace(/\s+/g, " ");

  // if there is a <ref> in the text then change lcText to be just the part inside the ref
  let startRefIndex = lcText.search(/\<\s*ref(?: name ?= ?"[^"]+" ?)? ?\>/);
  if (startRefIndex != -1) {
    let startRefs = lcText.match(/\<\s*ref(?: name ?= ?"[^"]+" ?)? ?\>/);
    if (!startRefs || startRefs.length != 1) {
      return false;
    }
    let endRefs = lcText.match(/\<\s*\/\s*ref\s*\>/);
    if (!endRefs || endRefs.length != 1) {
      return false;
    }
    let endRefIndex = lcText.search(/\<\s*\/\s*ref\s*\>/);
    if (endRefIndex == -1) {
      return false;
    }
    lcText = lcText.substring(startRefIndex, endRefIndex);
    // this still has the <ref> on the start
    lcText = lcText.replace(/\<\s*ref(?: name ?= ?"[^"]+" ?)?\s*\>/, "");
    lcText = lcText.trim();
    parsedCitation.isEditMode = true;
  }

  if (lcText.startsWith("*")) {
    lcText = lcText.substring(1).trim();
    parsedCitation.isEditMode = true;
  }

  // check for label on start
  const labelRegex = /^(?:\'\')?(?:\'\'\')?([A-Za-z0-9\s]+)(?:\'\')?(?:\'\'\')?\s?\:(.*)$/;
  if (labelRegex.test(lcText)) {
    let labelText = lcText.replace(labelRegex, "$1");
    let remainderText = lcText.replace(labelRegex, "$2");
    if (labelText && labelText != lcText && remainderText && remainderText != lcText) {
      parsedCitation.labelText = labelText;
      lcText = remainderText.trim();
    }
  }

  parsedCitation.cleanText = lcText;
  return true;
}

function getRegexForPattern(pattern) {
  if (pattern.reParts) {
    let regexSource = /^/.source;
    for (let i = 0; i < pattern.reParts.length; i++) {
      regexSource += pattern.reParts[i].source;
    }
    regexSource += /$/.source;
    let regex = new RegExp(regexSource, "");
    return regex;
  } else {
    return pattern.regex;
  }
}

function findMatchingCitationPattern(parsedCitation) {
  let text = parsedCitation.cleanText;

  for (let index = 0; index < citationPatterns.length; index++) {
    let pattern = citationPatterns[index];
    let regex = getRegexForPattern(pattern);

    if (regex.test(text)) {
      parsedCitation.matchingPattern = pattern;
      return true;
    }
  }

  return false;
}

function parseUsingPattern(parsedCitation) {
  let pattern = parsedCitation.matchingPattern;
  let text = parsedCitation.cleanText;
  for (let i = 0; i < pattern.paramKeys.length; i++) {
    let key = pattern.paramKeys[i];
    let resultIndex = i + 1;
    let resultString = "$" + resultIndex;
    let regex = getRegexForPattern(pattern);
    let value = text.replace(regex, resultString);
    if (key && value && value != text) {
      value = value.trim();
      if (value.endsWith(".") || value.endsWith(",")) {
        value = value.substring(0, value.length - 1);
      }
      value = value.trim();
      parsedCitation[key] = value;
    }
  }
}

function setName(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;
  let name = data.name;
  let surname = data.surname;
  let forename = data.forename;
  if (surname || forename) {
    if (forename) {
      if (forename.endsWith(".")) {
        forename = forename.substring(0, forename.length - 1);
      }
      builder.addForename(forename, "exact");
    }
    if (surname) {
      builder.addSurname(surname, "exact");
    }
    return;
  }

  if (!name) {
    return;
  }

  if (scotpRecordType == "coa") {
    builder.addFullName(name, "exact");
    return;
  }

  let numWordsInName = StringUtils.countWords(name);
  if (numWordsInName > 1) {
    let forenames = StringUtils.getWordsBeforeLastWord(name);
    let lastName = StringUtils.getLastWord(name);

    if (forenames && forenames.endsWith(".")) {
      forenames = forenames.substring(0, forenames.length - 1);
    }

    builder.addForename(forenames, "exact");
    builder.addSurname(lastName, "exact");
  } else {
    // there is only one name, use may depend on record type
    // for now assume it is surname
    builder.addSurname(name, "exact");
  }
}

function setParents(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;
  let searchOption = "exact";
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.parents)) {
    if (data.fatherName) {
      builder.addParentName(data.fatherName, searchOption);
    }
    if (data.motherName) {
      builder.addParentName(data.motherName, searchOption);
    }
  }

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.mmn)) {
    let mmn = data.mmn;
    if (mmn) {
      builder.addMothersMaidenName(mmn, searchOption);
    }
  }
}

function setSpouse(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.spouse)) {
    let spouseName = data.spouseName;
    const searchOption = "exact";

    if (spouseName) {
      let numWordsInName = StringUtils.countWords(spouseName);
      if (numWordsInName > 1) {
        let forenames = StringUtils.getWordsBeforeLastWord(spouseName);
        let lastName = StringUtils.getLastWord(spouseName);

        if (forenames && forenames.endsWith(".")) {
          forenames = forenames.substring(0, forenames.length - 1);
        }

        if (forenames) {
          builder.addSpouseForename(forenames, searchOption);
        }

        if (lastName) {
          builder.addSpouseSurname(lastName, searchOption);
        }
      } else {
        // there is only one name, use may depend on record type
      }

      // some record types use full name instead of separate names
      let fullName = spouseName;

      if (fullName) {
        builder.addSpouseFullName(fullName, searchOption);
      }
    } else if (data.spouseLastName) {
      builder.addSpouseSurname(data.spouseLastName, searchOption);
    }
  }
}

function setDates(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;

  let eventDate = data.eventDate;
  let birthDate = data.birthDate;

  // check for values from data list
  if (!eventDate) {
    eventDate = data.year;
  }

  // census has the year in the source title and not in data sentence
  if (!eventDate) {
    if (scotpRecordType == "census_lds") {
      eventDate = "1881";
    } else if (scotpRecordType == "census") {
      let sourceTitle = parsedCitation.sourceTitle;
      let year = sourceTitle.replace(/^.*(\d\d\d\d).*$/, "$1");
      if (year && year != sourceTitle) {
        eventDate = year;
      }
    }
  }

  if (scotpRecordType == "cr_baptisms") {
    // search actually works off birthDate rather than baptism date
    if (birthDate) {
      eventDate = birthDate;
      birthDate = "";
    }
  }

  let parsedDate = DateUtils.parseDateString(eventDate);

  if (!parsedDate.isValid || !parsedDate.yearNum) {
    return;
  }

  let yearString = parsedDate.yearNum.toString();

  let eventClass = ScotpRecordType.getEventClass(scotpRecordType);

  // census is special in that there is no date range
  if (eventClass == SpEventClass.census) {
    builder.addYear(yearString);
    return; // return as census is special case
  }

  if (scotpRecordType == "vr") {
    // another special case. In this case only one year can be specified
    builder.addYear(yearString);
    return; // return as vr is special case
  }

  if (scotpRecordType == "military_tribunals" || scotpRecordType == "hie") {
    // another special case. In this case we just don't specify a year
    return;
  }

  builder.addStartYear(yearString);
  builder.addEndYear(yearString);

  // in some cases the search allows the birth date - e.g. searching stat deaths
  if (birthDate && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.birthYear)) {
    let parsedDate = DateUtils.parseDateString(birthDate);

    if (parsedDate.isValid && parsedDate.yearNum) {
      let yearString = parsedDate.yearNum.toString();
      builder.addBirthYear(yearString, 0);
    }
  }
}

function setAge(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;

  let targetHasAgeRange = ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.ageRange);
  let targetHasAge = ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.age);

  if (!targetHasAgeRange && !targetHasAge) {
    return;
  }

  let age = data.age;

  if (!age) {
    return;
  }

  builder.addAgeRange(age, age);
}

function setPlace(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;

  // we need to find a place name that could be used as a place to search
  // which one to use depends on the type of record being searched and on the
  // source data.

  // eventClass is : birth, death, marriage, divorce, census or other
  let searchEventClass = ScotpRecordType.getEventClass(scotpRecordType);

  let countySearchParam = ScotpRecordType.getSearchField(scotpRecordType, SpField.county);
  if (countySearchParam && ScotpRecordType.hasSearchFeature(SpFeature.county)) {
    if (data.cityCounty) {
      builder.addSelectField(countySearchParam, data.cityCounty);
    }
  }

  let addedPlace = false;
  // Registration district
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rd)) {
    if (data.rdName) {
      if (builder.addRdName(data.rdName, false)) {
        addedPlace = true;
      }
    }
  }

  // OPR parish
  if (!addedPlace && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.oprParish)) {
    if (data.parish) {
      if (builder.addOprParishName(data.parish, false)) {
        addedPlace = true;
      }
    }
  }

  // Catholic parish
  if (!addedPlace && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rcParish)) {
    if (data.parish) {
      if (builder.addCatholicParishName(data.parish, false)) {
        addedPlace = true;
      }
    }
  }
}

function setGender(data, parsedCitation, builder) {
  let scotpRecordType = parsedCitation.scotpRecordType;

  if (!data.gender) {
    return;
  }

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.gender)) {
    let gender = data.gender;
    if (gender == "m") {
      gender = "male";
    } else if (gender == "f") {
      gender = "female";
    }

    builder.addGender(gender);
  }
}

function addDataToBuilder(parsedCitation, data, builder) {
  setName(data, parsedCitation, builder);
  setGender(data, parsedCitation, builder);
  setAge(data, parsedCitation, builder);
  setDates(data, parsedCitation, builder);
  setParents(data, parsedCitation, builder);
  setSpouse(data, parsedCitation, builder);
  setPlace(data, parsedCitation, builder);
}

function addListValueToData(label, value, parsedCitation, data) {
  function getYearFromDate(dateString) {
    const ddmmyyyyRegex = /(\d\d)?\/(\d\d)?\/(\d\d\d\d)/;

    if (ddmmyyyyRegex.test(dateString)) {
      let year = dateString.replace(ddmmyyyyRegex, "$3");
      if (year) {
        return year;
      }
    }

    const yyyyRegex = /(\d\d\d\d)/;
    if (yyyyRegex.test(dateString)) {
      let year = dateString.replace(ddmmyyyyRegex, "$1");
      if (year) {
        return year;
      }
    }

    return "";
  }

  if (label == "surname") {
    data.surname = value;
  } else if (label == "forename") {
    data.forename = value;
  } else if (label == "gender") {
    data.gender = value;
  } else if (label == "parents/other details") {
    let parents = value.split("/");
    if (parents.length == 2) {
      data.fatherName = parents[0].trim();
      data.motherName = parents[1].trim();
    }
  } else if (label == "birth date") {
    let eventClass = ScotpRecordType.getEventClass(parsedCitation.scotpRecordType);
    if (eventClass == SpEventClass.birth) {
      let year = getYearFromDate(value);
      if (year) {
        data.eventDate = year;
      }
    }
  } else if (label == "event date") {
    let year = getYearFromDate(value);
    if (year) {
      data.eventDate = year;
    }
  } else if (label == "parish") {
    data.parish = value;
  } else if (label == "year") {
    data.year = value;
  } else if (label == "age at census") {
    data.age = value;
  } else if (label == "rd name") {
    data.rdName = value;
  } else if (label == "county / city" || label == "county/city") {
    data.countyCity = value;
  }
}

function parseSemiColonColonDataList(dataString, parsedCitation, data) {
  let items = dataString.split(";");
  for (let item of items) {
    let parts = item.split(":");
    if (parts.length == 2) {
      let label = parts[0].trim();
      let value = parts[1].trim();
      addListValueToData(label, value, parsedCitation, data);
    }
  }
}

function parseCommaColonDataList(dataString, parsedCitation, data) {
  let items = dataString.split(",");
  for (let item of items) {
    let parts = item.split(":");
    if (parts.length == 2) {
      let label = parts[0].trim();
      let value = parts[1].trim();
      addListValueToData(label, value, parsedCitation, data);
    }
  }
}

function parseCommaOnlyDataList(dataString, parsedCitation, data) {
  const possibleLabels = [
    "surname",
    "forename",
    "parents/other details",
    "gender",
    "birth date",
    "parish",
    "year",
    "age at census",
    "rd name",
    "county / city",
  ];

  let items = dataString.split(",");
  for (let item of items) {
    let field = item.trim();
    for (let possibleLabel of possibleLabels) {
      if (field.startsWith(possibleLabel)) {
        let label = possibleLabel;
        let value = field.substring(possibleLabel.length + 1).trim();
        addListValueToData(label, value, parsedCitation, data);
        break;
      }
    }
  }
}

function parseDataList(dataString, parsedCitation, builder) {
  let data = {};

  // Semi-colon and colon example:
  // surname: connan; forename: peter; parents/other details: james connan/mary mcgregor; gender: m; birth date: 01/06/1823; parish: monzie.
  // Comma and colon example:
  // surname: connan, forename: peter, parents/other details: james connan/mary mcgregor, gender: m, birth date: 01/06/1823, parish: monzie.
  // Comma only example:
  // surname connan, forename peter, parents/other details james connan/mary mcgregor, gender m, birth date 01/06/1823, parish monzie.
  let semicolons = dataString.match(/;/g);
  let colons = dataString.match(/:/g);

  if (semicolons && semicolons.length && colons && colons.length && semicolons.length == colons.length - 1) {
    parseSemiColonColonDataList(dataString, parsedCitation, data);
  } else if (colons && colons.length) {
    parseCommaColonDataList(dataString, parsedCitation, data);
  } else {
    parseCommaOnlyDataList(dataString, parsedCitation, data);
  }

  addDataToBuilder(parsedCitation, data, builder);

  return true;
}

function parseDataString(parsedCitation, builder) {
  // first need to determine if it is a sentence or a list

  let dataString = parsedCitation.dataString;

  if (!dataString) {
    return;
  }

  dataString = dataString.trim();
  if (dataString.endsWith(";")) {
    // this can happen if there is a "; citing " after data string
    dataString = dataString.substring(0, dataString.length - 1);
  }

  function cleanDataValue(value) {
    value = value.trim();
    if (value.endsWith(".")) {
      value = value.substring(0, value.length - 1);
    }
    value = value.trim();
    if (value.endsWith(",")) {
      value = value.substring(0, value.length - 1);
    }
    value = value.trim();
    if (value.endsWith(";")) {
      value = value.substring(0, value.length - 1);
    }
    value = value.trim();
    return value;
  }

  let data = {};

  let matchedPattern = false;
  let patterns = dataStringSentencePatterns[parsedCitation.scotpRecordType];
  if (patterns) {
    for (let pattern of patterns) {
      if (pattern.regex.test(dataString)) {
        for (let i = 0; i < pattern.paramKeys.length; i++) {
          let key = pattern.paramKeys[i];
          let resultIndex = i + 1;
          let resultString = "$" + resultIndex;
          let value = dataString.replace(pattern.regex, resultString);
          if (key && value && value != dataString) {
            data[key] = cleanDataValue(value);
          }
        }
        matchedPattern = true;
        break;
      }
    }
  }

  if (matchedPattern) {
    addDataToBuilder(parsedCitation, data, builder);
    return;
  }

  // no matched sentence pattern, try a list
  if (dataString.includes("surname")) {
    if (parseDataList(dataString, parsedCitation, builder)) {
      return;
    }
  }
}

function buildScotlandsPeopleContextSearchData(lcText) {
  console.log("buildScotlandsPeopleContextSearchData, lcText is:");
  console.log(lcText);

  // To be Scotlands People we need some identifiers
  if (!(lcText.includes("scotlandspeople") || lcText.includes("scotlands people"))) {
    console.log("buildScotlandsPeopleContextSearchData, no scotlandspeople found");
    return undefined;
  }

  let parsedCitation = {
    lcText: lcText,
  };

  if (!cleanCitation(parsedCitation)) {
    console.log("buildScotlandsPeopleContextSearchData, could not clean");
    return undefined;
  }

  //console.log("buildScotlandsPeopleContextSearchData, after cleanCitation, parsedCitation is:");
  //console.log(parsedCitation);

  let foundPattern = findMatchingCitationPattern(parsedCitation);

  //console.log("buildScotlandsPeopleContextSearchData, after findMatchingCitationPattern, parsedCitation is:");
  //console.log(parsedCitation);

  if (foundPattern) {
    parseUsingPattern(parsedCitation);
  }

  //("buildScotlandsPeopleContextSearchData, after parseUsingPattern, parsedCitation is:");
  //console.log(parsedCitation);

  if (!parsedCitation.sourceTitle) {
    console.log("buildScotlandsPeopleContextSearchData, no sourceTitle");
    return undefined;
  }

  let scotpRecordType = getScotpRecordTypeFromSourceTitle(parsedCitation.sourceTitle);
  if (!scotpRecordType) {
    console.log("buildScotlandsPeopleContextSearchData, no scotpRecordType");
    return undefined;
  }

  //console.log("buildScotlandsPeopleContextSearchData, after getScotpRecordTypeFromSourceTitle, scotpRecordType is:");
  //console.log(scotpRecordType);

  parsedCitation.scotpRecordType = scotpRecordType;

  var builder = new ScotpFormDataBuilder(scotpRecordType);

  parseDataString(parsedCitation, builder);

  let searchData = builder.getFormData();

  // See if we can extract a reference number from sourceReference
  if (searchData && parsedCitation.sourceReference) {
    let sourceReference = parsedCitation.sourceReference;
    const regexes = [
      /^.*reference number:? ([a-z0-9 \/]+).*$/,
      /^.*reference:? ([a-z0-9 \/]+).*$/,
      /^.*ref number:? ([a-z0-9 \/]+).*$/,
      /^.*ref num:? ([a-z0-9 \/]+).*$/,
      /^.*ref no:? ([a-z0-9 \/]+).*$/,
      /^.*ref:? ([a-z0-9 \/]+).*$/,
    ];

    let refNum = "";
    for (let regex of regexes) {
      if (regex.test(sourceReference)) {
        let num = sourceReference.replace(regex, "$1");
        if (num && num != sourceReference) {
          refNum = num;
          break;
        }
      }
    }

    // another way is to look for what this record type would use.
    if (!refNum) {
      let refName = ScotpRecordType.getRecordKey(scotpRecordType, "ref");
      if (refName) {
        let lcRefName = refName.toLowerCase();
        let index = sourceReference.indexOf(lcRefName);
        if (index != -1) {
          let remainder = sourceReference.substring(index + lcRefName.length);
          let num = remainder.replace(/^:? ([a-z0-9 \/]+).*$/, "$1");
          if (num && num != remainder) {
            refNum = num;
          }
        }
      }
    }

    if (refNum) {
      searchData.refNum = refNum;
      searchData.recordType = parsedCitation.scotpRecordType;
    }
  }

  console.log("buildScotlandsPeopleContextSearchData, returning, searchData is:");
  console.log(searchData);

  return searchData;
}

export { buildScotlandsPeopleContextSearchData };
