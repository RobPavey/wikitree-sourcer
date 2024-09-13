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

const citationPatterns = [
  {
    // Example: Sourcer different order due to "Place the source reference data" option
    // "scotland census, 1851", database, national records of scotland, scotlandspeople, donald mckay (13) in lairg registration district in sutherland, scotland; citing ref: 053/ 1/ 6.
    regex:
      /^"([^"]+)",?(?: database)?,? (.*),? ?\(?scotlandspeople(?: search)? ?\(?(?:accessed [^\)]+\))?,? (.*);? citing (.*)$/,
    paramKeys: ["sourceTitle", "database", "dataString", "sourceReference"],
  },
  {
    // Example: Sourcer different order due to "Place the source reference data" option
    // Edit mode
    // "church of scotland: old parish registers - births and baptisms", database, national records of scotland, ([https://www.scotlandspeople.gov.uk/ scotlandspeople] : accessed 23 june 2022), peter connan born or baptised on 1 jun 1823, son of james connan & mary mcgregor, in monzie, perthshire, scotland; citing parish number 382/ , ref 20 9.
    regex:
      /^"([^"]+)",?(?: database)?,? (.*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\] \: accessed [^\)]+\),? (.*);? citing (.*)$/,
    paramKeys: ["sourceTitle", "database", "dataString", "sourceReference"],
  },
  {
    // Example: Sourcer Default order
    // This handles all three values of the "Add an accessed date to citation" option
    // "church of scotland: old parish registers - births and baptisms" national records of scotland, parish number: 382/ ; ref: 20 9 scotlandspeople search (accessed 23 june 2022) peter connan born or baptised on 1 jun 1823, son of james connan & mary mcgregor, in monzie, perthshire, scotland.
    regex: /^"([^"]+)",?(?: database)?,? (.*),? ?\(?scotlandspeople(?: search)? ?\(?(?:accessed [^\)]+\))?,? (.*)$/,
    paramKeys: ["sourceTitle", "sourceReference", "dataString"],
  },
  {
    // Example: Sourcer Default order, edit mode
    // "scotland census, 1851", national records of scotland, ref: 547/ 1/ 35, [https://www.scotlandspeople.gov.uk/ scotlandspeople] (accessed 13 september 2024), surname mckay, forename donald, year 1851, gender m, age at census 11, rd name portnahaven, county / city argyll.
    // "scotland census, 1851", database, national records of scotland, ref: 053/ 1/ 6, [https://www.scotlandspeople.gov.uk/ scotlandspeople], donald mckay (13) in lairg registration district in sutherland, scotland.
    regex:
      /^"([^"]+)",?(?: database)?,? (.*),? ?\(?\[https\:\/\/www\.scotlandspeople\.gov\.uk.* scotlandspeople(?: search)?\],? ?\(?(?:accessed [^\)]+\))?,? (.*)$/,
    paramKeys: ["sourceTitle", "sourceReference", "dataString"],
  },
  {
    // Example: Scotland Project
    // Sometimes they have the parish or country name before the source citation
    // govan parish, church of scotland, "old parish registers births and baptisms" database, national records of scotland, (scotlandspeople : accessed 29 may 2024), william walker birth or baptism 23 jan 1808, son of hugh walker and ann young, citing ref 20 / 211.
    regex:
      /^(.*) "([^"]+)",?(?: database)?,? ?(.*),? \(? ?scotlandspeople(?: search)? : accessed [^\)]+\),? (.*) citing (.*)$/,
    paramKeys: ["parish", "sourceTitle", "database", "dataString", "sourceReference"],
  },
  {
    // Example: Scotland Project edit mode
    // govan parish, church of scotland, "old parish registers births and baptisms" database, national records of scotland, ([https://www.scotlandspeople.gov.uk scotlandspeople] : accessed 29 may 2024), william walker birth or baptism 23 jan 1808, son of hugh walker and ann young, citing ref 20 / 211.
    regex:
      /^(.*) "([^"]+)",?(?: database)?,? ?(.*),? \(?\[https\:\/\/www\.scotlandspeople\.gov\.uk scotlandspeople(?: search)?\] : accessed [^\)]+\),? (.*) citing (.*)$/,
    paramKeys: ["parish", "sourceTitle", "database", "dataString", "sourceReference"],
  },
];

// No need to lower case these - that is done in compare
// These are in same order as scotpRecordTypes
const defaultSourcerTitles = [
  {
    recordType: "stat_births",
    title: "Statutory Register of Births",
  },
  {
    recordType: "stat_marriages",
    title: "Statutory Register of Marriages",
  },
  {
    recordType: "stat_divorces",
    title: "Statutory Register of Divorces",
  },
  {
    recordType: "stat_deaths",
    title: "Statutory Register of Deaths",
  },
  {
    recordType: "stat_civilpartnerships",
    title: "Statutory Register of Civil Partnerships",
  },
  {
    recordType: "stat_dissolutions",
    title: "Statutory Register of Dissolutions",
  },
  {
    recordType: "opr_births",
    title: "Church of Scotland: Old Parish Registers - Births and Baptisms",
  },
  {
    recordType: "opr_marriages",
    title: "Church of Scotland: Old Parish Registers - Banns and Marriages",
  },
  {
    recordType: "opr_deaths",
    title: "Church of Scotland: Old Parish Registers - Deaths and Burials",
  },
  {
    recordType: "cr_baptisms",
    title: "Catholic Parish Registers - Births and Baptisms",
  },
  {
    recordType: "cr_banns",
    title: "Catholic Parish Registers - Marriages",
  },
  {
    recordType: "cr_burials",
    title: "Catholic Parish Registers - Deaths, Burials and Funerals",
  },
  {
    recordType: "cr_other",
    title: "Catholic Parish Registers - Other Events",
  },
  {
    recordType: "ch3_baptisms",
    title: "Other Church Registers - Births and Baptisms",
  },
  {
    recordType: "ch3_banns",
    title: "Other Church Registers - Marriages",
  },
  {
    recordType: "ch3_burials",
    title: "Other Church Registers - Deaths and Burials",
  },
  {
    recordType: "ch3_other",
    title: "Other Church Registers - Other Events",
  },

  {
    recordType: "census",
    title: "Scotland Census, 1841",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1851",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1861",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1871",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1881",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1891",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1901",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1911",
  },
  {
    recordType: "census",
    title: "Scotland Census, 1921",
  },
  {
    recordType: "census_lds",
    title: "Scotland Census, 1881 (LDS)",
  },
  {
    recordType: "vr",
    title: "Valuation Rolls",
  },
  {
    recordType: "wills",
    title: "Wills and Testaments",
  },
  {
    recordType: "coa",
    title: "Public Register of All Arms and Bearings",
  },
  {
    recordType: "soldiers_wills",
    title: "Soldiers' and Airmen's Wills",
  },
  {
    recordType: "military_tribunals",
    title: "Military Service Appeal Tribunals",
  },
  {
    recordType: "hie",
    title: "Highland and Island Emigration Society records",
  },
  {
    recordType: "prison_records",
    title: "Prison Registers",
  },
];

// No need to lower case these - that is done in compare
// These are in same order as scotpRecordTypes
const scotlandProjectTitles = [
  {
    recordType: "stat_births",
    title: "Statutory Registers - Births",
  },
  {
    recordType: "stat_marriages",
    title: "Statutory Registers - Marriages",
  },
  {
    recordType: "stat_divorces",
    title: "Statutory Register - Divorces",
  },
  {
    recordType: "stat_deaths",
    title: "Statutory Registers - Deaths",
  },
  {
    recordType: "stat_civilpartnerships",
    title: "Statutory Registers - Civil Partnerships",
  },
  {
    recordType: "stat_dissolutions",
    title: "Statutory Registers - Dissolutions",
  },
  {
    recordType: "opr_births",
    title: "Old Parish Registers Births and Baptisms",
  },
  {
    recordType: "opr_marriages",
    title: "Old Parish Registers Banns and Marriages",
  },
  {
    recordType: "opr_deaths",
    title: "Old Parish Registers Death and Burials",
  },
  {
    recordType: "cr_baptisms",
    title: "Catholic Registers Births and Baptisms",
  },
  {
    recordType: "cr_banns",
    title: "Catholic Registers Marriages",
  },
  {
    recordType: "cr_burials",
    title: "Catholic Registers Deaths, Burials and Funerals",
  },
  {
    recordType: "cr_other",
    title: "Catholic Registers Other Events",
  },
  {
    recordType: "ch3_baptisms",
    title: "Church Registers - Other Church Registers Baptisms",
  },
  {
    recordType: "ch3_banns",
    title: "Church Registers - Other Church Registers Marriages",
  },
  {
    recordType: "ch3_burials",
    title: "Church Registers - Other Church Registers Burials",
  },
  {
    recordType: "ch3_other",
    title: "Church Registers - Other Church Registers Other Events", // ??
  },

  {
    recordType: "census",
    title: "Scottish Census Returns - 1841",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1851",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1861",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1871",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1881",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1891",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1901",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1911",
  },
  {
    recordType: "census",
    title: "Scottish Census Returns - 1921",
  },
  {
    recordType: "census_lds",
    title: "Census 1881 (LDS)",
  },
  {
    recordType: "vr",
    title: "Valuation Rolls",
  },
  {
    recordType: "wills",
    title: "Wills and Testaments",
  },
  {
    recordType: "coa",
    title: "Public Register of All Arms and Bearings",
  },
  {
    recordType: "soldiers_wills",
    title: "Soldiers' and Airmen's Wills",
  },
  {
    recordType: "military_tribunals",
    title: "Military Service Appeal Tribunals",
  },
  {
    recordType: "hie",
    title: "Highland and Island Emigration Society records",
  },
  {
    recordType: "prison_records",
    title: "Prison registers",
  },
];

const dataStringSentencePatterns = {
  stat_births: [],
  stat_marriages: [],
  stat_divorces: [],
  stat_deaths: [],
  stat_civilpartnerships: [],
  stat_dissolutions: [],
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
  opr_marriages: [],
  opr_deaths: [],
  cr_baptisms: [],
  cr_banns: [],
  cr_burials: [],
  cr_other: [],
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
    if (sourceTitle == defaultSourcerTitle.title.toLowerCase()) {
      return defaultSourcerTitle.recordType;
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
    let lcTitle = scotlandProjectTitle.title.toLowerCase();
    if (sourceTitle == lcTitle) {
      return scotlandProjectTitle.recordType;
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

function findMatchingCitationPattern(parsedCitation) {
  let text = parsedCitation.cleanText;

  for (let pattern of citationPatterns) {
    if (pattern.regex.test(text)) {
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
    let value = text.replace(pattern.regex, resultString);
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
    builder.addGender(data.gender);
  }
}

function addDataToBuilder(parsedCitation, data, builder) {
  setName(data, parsedCitation, builder);
  setGender(data, parsedCitation, builder);
  setAge(data, parsedCitation, builder);
  setDates(data, parsedCitation, builder);
  setParents(data, parsedCitation, builder);
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

    return "";
  }

  if (label == "surname") {
    data.surname = value;
  } else if (label == "forename") {
    data.forename = value;
  } else if (label == "gender") {
    if (value == "m" || value == "male") {
      data.gender = "male";
    } else if (value == "f" || value == "female") {
      data.gender = "female";
    }
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
  } else if (label == "parish") {
  } else if (label == "year") {
    data.year = value;
  } else if (label == "age at census") {
    data.age = value;
  } else if (label == "rd name") {
    data.rdName = value;
  } else if (label == "county / city") {
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
  // To be Scotlands People we need some identifiers
  if (!(lcText.includes("scotlandspeople") || lcText.includes("scotlands people"))) {
    return undefined;
  }

  let parsedCitation = {
    lcText: lcText,
  };

  //console.log("buildScotlandsPeopleContextSearchData, lcText is:");
  //console.log(lcText);

  if (!cleanCitation(parsedCitation)) {
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
    return undefined;
  }

  let scotpRecordType = getScotpRecordTypeFromSourceTitle(parsedCitation.sourceTitle);
  if (!scotpRecordType) {
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

    if (refNum) {
      searchData.refNum = refNum;
      searchData.recordType = parsedCitation.scotpRecordType;
    }
  }

  return searchData;
}

export { buildScotlandsPeopleContextSearchData };
