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

import {
  registerSubsectionForOptions,
  registerSubheadingForOptions,
  registerOptionsGroup,
} from "./options_registry.mjs";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Search options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const searchOptionsGroup = {
  category: "search",
  subcategory: "general",
  tab: "search",
  subsection: "general",
  options: [
    {
      optionName: "newTabPos",
      type: "select",
      label: "Where to open search results tab",
      values: [
        { value: "rightMost", text: "To the right of all existing tabs" },
        { value: "nextToRight", text: "To the right of the current tab" },
        { value: "newWindow", text: "In a new window" },
      ],
      defaultValue: "rightMost",
    },
    {
      optionName: "popup_showSameSite",
      type: "checkbox",
      label: "On the popup show a search menu item for the site that you are currently on",
      defaultValue: true,
    },
    {
      optionName: "popup_maxSearchItemsInTopMenu",
      type: "number",
      label: "Maximum number of search menu items to show on top-level popup (0 means just show search submenu)",
      defaultValue: 16,
    },
    {
      optionName: "maxLifespan",
      type: "number",
      label: "Maximum lifespan to consider when building search date/age ranges",
      defaultValue: 120,
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Citation options groups, General
////////////////////////////////////////////////////////////////////////////////////////////////////

const citationOptionsGroup = {
  category: "citation",
  subcategory: "general",
  tab: "citation",
  subsection: "general",
  options: [
    {
      optionName: "meaningfulNames",
      type: "select",
      label: 'Add a label at the start of each reference (this shows up in the "Sources" section)',
      values: [
        { value: "none", text: "None" },
        { value: "normal", text: "In normal text" },
        { value: "bold", text: "In bold text" },
        { value: "italic", text: "In italic text" },
      ],
      defaultValue: "bold",
    },
    {
      optionName: "commaInsideQuotes",
      type: "checkbox",
      label: "Put commas inside quotation marks (old US typographical convention) [EE style]",
      defaultValue: false,
    },
    {
      optionName: "addEeItemType",
      type: "checkbox",
      label: 'Add "database" or "database with images" after the database/collection title [EE style]',
      defaultValue: false,
    },
    {
      optionName: "referencePosition",
      type: "select",
      label: "Place the source reference data",
      values: [
        {
          value: "afterSourceTitle",
          text: "After the database/collection title",
        },
        {
          value: "atEnd",
          text: "At the end of the citation (disables data table) [EE Style]",
        },
      ],
      defaultValue: "afterSourceTitle",
    },
    {
      optionName: "addAccessedDate",
      type: "select",
      label: "Add an accessed date to citation",
      values: [
        { value: "none", text: "None" },
        {
          value: "parenAfterLink",
          text: "In form '<link> (accessed 15 June 2022)'",
        },
        {
          value: "parenBeforeLink",
          text: "In form '(<link> : accessed 15 June 2022)' [EE style]",
        },
      ],
      defaultValue: "parenAfterLink",
    },
    {
      optionName: "sourceReferenceSeparator",
      type: "select",
      label: "Separators to use between parts of the source reference data",
      values: [
        {
          value: "semicolon",
          text: "Semi-colon (and colon if key/value pair) (; Page: 2)",
        },
        {
          value: "commaColon",
          text: "Comma and (and colon if key/value pair) (, Page: 2)",
        },
        { value: "commaSpace", text: "Comma only (, Page 2) [EE style?]" },
        {
          value: "siteStyle",
          text: "Follow the style of the site being cited (if any, else semi-colon)",
        },
      ],
      defaultValue: "semicolon",
    },
    {
      optionName: "dataListSeparator",
      type: "select",
      label: "Separators to use for key/value pairs in data list (if list used rather than sentence or table)",
      values: [
        { value: "semicolon", text: "Semi-colon and colon (; Age: 20)" },
        { value: "commaColon", text: "Comma and colon (, Age: 20)" },
        { value: "commaSpace", text: "Comma only (, Age 20) [EE style?]" },
      ],
      defaultValue: "semicolon",
    },
    {
      optionName: "addNewlinesWithinRefs",
      type: "checkbox",
      label:
        "Add newlines after the <ref> and before the </ref> (for readability in edit mode, no effect in read mode)",
      defaultValue: true,
    },
    {
      optionName: "addNewlinesWithinBody",
      type: "checkbox",
      label: "Add newlines within the citation between sections (for readability in edit mode, no effect in read mode)",
      defaultValue: true,
    },
    {
      optionName: "addBreaksWithinBody",
      type: "checkbox",
      label: "Add <br/>s within the citation between sections (for readability in read mode)",
      defaultValue: true,
    },
    {
      optionName: "dataStringInItalics",
      type: "checkbox",
      label: "Put the 'data string' part of the citation in italics",
      defaultValue: false,
    },
    {
      optionName: "dataStringIndented",
      type: "checkbox",
      label: "Indent the 'data string' part of the citation (inline citations only)",
      defaultValue: false,
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Citation options groups, User Citation
////////////////////////////////////////////////////////////////////////////////////////////////////

const userCitationOptionsGroup = {
  category: "citation",
  subcategory: "userCitation",
  tab: "citation",
  subsection: "userCitation",
  options: [
    {
      optionName: "showPreview",
      type: "checkbox",
      label: "Show live preview of the resulting citation text",
      defaultValue: true,
    },
    {
      optionName: "showHints",
      type: "checkbox",
      label: "Show hints below the input fields",
      defaultValue: true,
    },
    {
      optionName: "showPlaceholders",
      type: "checkbox",
      label: "Show example placeholder text in input fields",
      defaultValue: true,
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Narrative options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const narrativeOptionsGroup = {
  category: "narrative",
  subcategory: "general",
  tab: "narrative",
  subsection: "general",
  options: [
    {
      optionName: "spelling",
      type: "select",
      label: "Spelling",
      values: [
        { value: "en_uk", text: "UK English" },
        { value: "en_us", text: "US English" },
      ],
      defaultValue: "en_uk",
    },
    {
      optionName: "nameOrPronoun",
      type: "select",
      label: "Name/pronoun to use in narrative events",
      values: [
        {
          value: "firstName",
          text: "First name (single word), if not known use last name",
        },
        { value: "forenames", text: "Forenames, if not known use last name" },
        { value: "fullName", text: "Full name" },
        {
          value: "pronoun",
          text: "Pronoun (he/she), if not known use first name",
        },
      ],
      defaultValue: "firstName",
    },
    {
      optionName: "country",
      type: "select",
      label: "Include country in place names in narrative events (if known)",
      values: [
        { value: "full", text: "Include country as recorded in record" },
        { value: "standard", text: "Use standardized or abbreviated country" },
        { value: "none", text: "Omit country from place name" },
      ],
      defaultValue: "standard",
      unitTestValue: "full",
    },
    {
      optionName: "dateFormat",
      type: "select",
      label: "Date format in narrative string",
      values: [
        { value: "long", text: "dd Month yyyy (e.g. '12 September 1845')" },
        { value: "short", text: "dd Mmm yyyy (e.g. '12 Sep 1845')" },
        {
          value: "theNth",
          text: "the ddth of Month yyyy (e.g. 'the 12th of September 1845')",
        },
        {
          value: "monthComma",
          text: "Month dd, yyyy (e.g. 'September 12, 1845')",
        },
        {
          value: "monthCommaNth",
          text: "Month ddth, yyyy (e.g. 'September 12th, 1845')",
        },
        {
          value: "country",
          text: "Country specific (e.g. 'September 12, 1845' in US, '12 September 1845' elsewhere)",
        },
        {
          value: "countryNth",
          text: "Country specific, long (e.g. 'September 12th, 1845' in US, 'the 12th of September 1845' elsewhere)",
        },
      ],
      defaultValue: "long",
    },
    {
      optionName: "dateHighlight",
      type: "select",
      label: "Highlight the date in a narrative string",
      values: [
        { value: "none", text: "No highlight" },
        { value: "bold", text: "Bold" },
        { value: "italic", text: "Italic" },
      ],
      defaultValue: "none",
    },
    {
      optionName: "parentsUseAmpOrAnd",
      type: "select",
      label: "Separator to use between parents",
      values: [
        { value: "amp", text: " & " },
        { value: "and", text: " and " },
      ],
      defaultValue: "amp",
    },
    {
      optionName: "occupationFormat",
      type: "select",
      label: "Case/format to use for occupations",
      values: [
        {
          value: "keepCase",
          text: "Keep case from record (with some cleanup)",
        },
        { value: "titleCase", text: "Title Case (e.g. 'Coal Miner')" },
        { value: "lowerCase", text: "Lower Case (e.g. 'coal miner')" },
      ],
      defaultValue: "keepCase",
    },
    {
      optionName: "placeChurchFirst",
      type: "select",
      label: "Attempt to put church name before town name (for certain sites and countries)",
      values: [
        { value: "no", text: "No" },
        { value: "yes", text: "Yes" },
      ],
      defaultValue: "no",
    },
  ],
};

const narrativeRecordTypeNameOrPronounOption = {
  optionName: "nameOrPronoun",
  type: "select",
  label: "Name/pronoun to use in narrative events",
  values: [
    {
      value: "default",
      text: "Use default specified in the 'General' subsection",
    },
    {
      value: "firstName",
      text: "First name (single word), if not known use last name",
    },
    { value: "forenames", text: "Forenames, if not known use last name" },
    { value: "fullName", text: "Full name" },
    {
      value: "pronoun",
      text: "Pronoun (he/she), if gender not known use first name",
    },
  ],
  defaultValue: "default",
};

const narrativeIncludeParentageOption = {
  optionName: "includeParentage",
  type: "select",
  label: "Include parentage if known",
  values: [
    { value: "no", text: "No" },
    { value: "inMainSentence", text: "In the main sentence" },
    { value: "inSeparateSentence", text: "In a separate following sentence" },
  ],
  defaultValue: "inMainSentence",
};

function getNarrativeIncludeParentageOption(defaultValue) {
  return {
    optionName: "includeParentage",
    type: "select",
    label: "Include parentage if known",
    values: [
      { value: "no", text: "No" },
      { value: "inMainSentence", text: "In the main sentence" },
      { value: "inSeparateSentence", text: "In a separate following sentence" },
    ],
    defaultValue: defaultValue,
  };
}

const narrativeParentageFormatOption = {
  optionName: "parentageFormat",
  type: "select",
  label: "Parentage format if in main sentence",
  values: [
    {
      value: "twoCommas",
      text: ", <son/daughter/child> of <parentName1>[ & <parentName2>],",
    },
    {
      value: "theTwoCommas",
      text: ", the <son/daughter/child> of <parentName1>[ & <parentName2>],",
    },
  ],
  defaultValue: "twoCommas",
  comment:
    "NOTE: [square brackets] in options above denote optional parts that are only present if that data is known.",
};

const narrativeRegistrationDistrictFormatOption = {
  optionName: "regDistrictFormat",
  type: "select",
  label: "Registration district format",
  values: [
    { value: "theDistrict", text: "the <district name> district" },
    { value: "districtName", text: "<district name>" },
    { value: "districtCounty", text: "<district name>[, <county name>]" },
  ],
  defaultValue: "theDistrict",
};

const narrativeIncludeMmnOption = {
  optionName: "includeMmn",
  type: "select",
  label: "Include mother's maiden name if known",
  values: [
    { value: "no", text: "No" },
    { value: "inMainSentence", text: "In the main sentence" },
    { value: "inSeparateSentence", text: "In a separate following sentence" },
  ],
  defaultValue: "no",
};

const narrativeIncludeAgeOption = {
  optionName: "includeAge",
  type: "select",
  label: "Include age if known",
  values: [
    { value: "no", text: "No" },
    { value: "inMainSentence", text: "In the main sentence" },
    { value: "inSeparateSentence", text: "In a separate following sentence" },
  ],
  defaultValue: "inMainSentence",
};

const narrativeAgeFormatOption = {
  optionName: "ageFormat",
  type: "select",
  label: "Age format",
  values: [
    { value: "parensAge", text: "(age <age>)" },
    { value: "commasAge", text: ", age <age>," },
    { value: "plainAge", text: " age <age>" },
    { value: "parensAged", text: "(aged <age>)" },
    { value: "commasAged", text: ", aged <age>," },
    { value: "plainAged", text: " aged <age>" },
  ],
  defaultValue: "parensAge",
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Record type specific narrative options groups
////////////////////////////////////////////////////////////////////////////////////////////////////
const narrativeBirthOptionsGroup = {
  category: "narrative",
  subcategory: "birth",
  tab: "narrative",
  subsection: "birth",
  options: [narrativeRecordTypeNameOrPronounOption, narrativeIncludeParentageOption, narrativeParentageFormatOption],
};

const narrativeBirthRegOptionsGroup = {
  category: "narrative",
  subcategory: "birthReg",
  tab: "narrative",
  subsection: "birthReg",
  options: [narrativeRecordTypeNameOrPronounOption],
};

const narrativeBirthRegEvtOptionsGroup = {
  category: "narrative",
  subcategory: "birthRegEvt",
  tab: "narrative",
  subsection: "birthReg",
  subheading: "evt",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "oneSentence",
          text: "<name/pronoun> was born <date> <place>.",
        },
      ],
      defaultValue: "oneSentence",
    },
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
  ],
};

const narrativeBirthRegRegOptionsGroup = {
  category: "narrative",
  subcategory: "birthRegReg",
  tab: "narrative",
  subsection: "birthReg",
  subheading: "reg",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "oneSentence",
          text: "<possessive name/pronoun> birth was registered <date> in <place>.",
        },
        {
          value: "twoSentences",
          text: "<name/pronoun> was born <date>. <possessive pronoun> birth was registered in <place>.",
        },
        {
          value: "twoSentencesDate",
          text: "<name/pronoun> was born <date>. <possessive pronoun> birth was registered <date> in <place>.",
        },
      ],
      defaultValue: "oneSentence",
    },
    getNarrativeIncludeParentageOption("inSeparateSentence"),
    narrativeParentageFormatOption,
    narrativeIncludeMmnOption,
    narrativeRegistrationDistrictFormatOption,
  ],
};

const narrativeBaptismOptionsGroup = {
  category: "narrative",
  subcategory: "baptism",
  tab: "narrative",
  subsection: "baptism",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "parentsBornAndBap",
          text: "<name/pronoun>[<parentage>] was[ born on <date> and] baptised on <date> in <place>.",
        },
        {
          value: "parentsBornSemiBap",
          text: "<name/pronoun>[<parentage>] was[ born on <date>;] baptised on <date> in <place>.",
        },
      ],
      defaultValue: "parentsBornAndBap",
    },
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    {
      optionName: "includeBirthDate",
      type: "checkbox",
      label: "Include birth date if known",
      defaultValue: true,
    },
    {
      optionName: "includeDeathDate",
      type: "checkbox",
      label: "Include death date if known",
      defaultValue: true,
    },
  ],
};

const narrativeBirthOrBaptismOptionsGroup = {
  category: "narrative",
  subcategory: "birthOrBaptism",
  tab: "narrative",
  subsection: "birthOrBaptism",
  options: [narrativeRecordTypeNameOrPronounOption, narrativeIncludeParentageOption, narrativeParentageFormatOption],
};

const narrativeMarriageOptionsGroup = {
  category: "narrative",
  subcategory: "marriage",
  tab: "narrative",
  subsection: "marriage",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
  ],
};

const narrativeMarriageRegOptionsGroup = {
  category: "narrative",
  subcategory: "marriageReg",
  tab: "narrative",
  subsection: "marriageReg",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
  ],
};

const narrativeMarriageRegEvtOptionsGroup = {
  category: "narrative",
  subcategory: "marriageRegEvt",
  tab: "narrative",
  subsection: "marriageReg",
  subheading: "evt",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "oneSentence",
          text: "<name/pronoun> married[ <spouse>] <date> <place>.",
        },
      ],
      defaultValue: "oneSentence",
    },
  ],
};

const narrativeMarriageRegRegOptionsGroup = {
  category: "narrative",
  subcategory: "marriageRegReg",
  tab: "narrative",
  subsection: "marriageReg",
  subheading: "reg",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "oneSentence",
          text: "<name/pronoun> marriage[ to <spouse>] was registered <date> in <place>.",
        },
        {
          value: "twoSentences",
          text: "<name/pronoun> married[ <spouse>] <year(s)>. Their marriage was registered in <place>.",
        },
        {
          value: "twoSentencesDate",
          text: "<name/pronoun> married[ <spouse>] <year(s)>. Their marriage was registered <date> in <place>.",
        },
      ],
      defaultValue: "oneSentence",
    },
    narrativeRegistrationDistrictFormatOption,
  ],
};

const narrativeDeathOptionsGroup = {
  category: "narrative",
  subcategory: "death",
  tab: "narrative",
  subsection: "death",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
  ],
};

const narrativeDeathRegOptionsGroup = {
  category: "narrative",
  subcategory: "deathReg", // abbreviated to keep storage size of options down
  tab: "narrative",
  subsection: "deathReg",
  options: [narrativeRecordTypeNameOrPronounOption, narrativeIncludeAgeOption, narrativeAgeFormatOption],
};

const narrativeDeathRegEvtOptionsGroup = {
  category: "narrative",
  subcategory: "deathRegEvt", // abbreviated to keep storage size of options down
  tab: "narrative",
  subsection: "deathReg",
  subheading: "evt",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [{ value: "oneSentence", text: "<name/pronoun> died <date> <place>." }],
      defaultValue: "oneSentence",
    },
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
  ],
};

const narrativeDeathRegRegOptionsGroup = {
  category: "narrative",
  subcategory: "deathRegReg", // abbreviated to keep storage size of options down
  tab: "narrative",
  subsection: "deathReg",
  subheading: "reg",
  options: [
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Sentence structure",
      values: [
        {
          value: "oneSentence",
          text: "<possessive name/pronoun> death was registered <date> in <place>.",
        },
        {
          value: "twoSentences",
          text: "<name/pronoun> died <date>. <possessive pronoun> death was registered in <place>.",
        },
        {
          value: "twoSentencesDate",
          text: "<name/pronoun> died <date>. <possessive pronoun> death was registered <date> in <place>.",
        },
      ],
      defaultValue: "oneSentence",
    },
    narrativeIncludeMmnOption,
    narrativeRegistrationDistrictFormatOption,
  ],
};

const narrativeBurialOptionsGroup = {
  category: "narrative",
  subcategory: "burial",
  tab: "narrative",
  subsection: "burial",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
  ],
};

const narrativeObituaryOptionsGroup = {
  category: "narrative",
  subcategory: "obituary",
  tab: "narrative",
  subsection: "obituary",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    narrativeIncludeParentageOption,
    narrativeParentageFormatOption,
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
  ],
};

const narrativeCensusOptionsGroup = {
  category: "narrative",
  subcategory: "census",
  tab: "narrative",
  subsection: "census",
  options: [
    narrativeRecordTypeNameOrPronounOption,
    {
      optionName: "sentenceStructure",
      type: "select",
      label: "Main sentence structure",
      values: [
        {
          value: "noComma",
          text: "<census/date part> <name/pronoun>[ <agePart>][, <occupation>,] <was part> [<household part>] <in/on/at> <place>",
        },
        {
          value: "comma",
          text: "<census/date part>, <name/pronoun>[ <agePart>][, <occupation>,] <was part> [<household part>] <in/on/at> <place>",
        },
      ],
      defaultValue: "comma",
      unitTestValue: "noComma",
    },
    {
      optionName: "censusDatePartFormat",
      type: "select",
      label: "Census/date part format",
      values: [
        { value: "inCensusTitle", text: "In the <census title>" },
        { value: "inYearCensus", text: "In the <year> census" },
        { value: "inYear", text: "In <year>" },
        { value: "onDate", text: "On <date>" },
      ],
      defaultValue: "inYearCensus",
    },
    narrativeIncludeAgeOption,
    narrativeAgeFormatOption,
    {
      optionName: "includeOccupation",
      type: "select",
      label: "Include occupation if known",
      values: [
        { value: "no", text: "No" },
        { value: "inMainSentence", text: "In the main sentence" },
        {
          value: "inSeparateSentence",
          text: "In a separate following sentence",
        },
        {
          value: "inSeparateSentenceHead",
          text: "In a separate following sentence. If no occupation give head's",
        },
      ],
      defaultValue: "inMainSentence",
    },
    {
      optionName: "wasPartFormat",
      type: "select",
      label: "Was part format",
      values: [
        { value: "was", text: "was" },
        { value: "wasEnumerated", text: "was enumerated" },
        { value: "wasRecorded", text: "was recorded" },
      ],
      defaultValue: "was",
    },
    {
      optionName: "includeHousehold",
      type: "select",
      label: "Include household part in narrative",
      values: [
        { value: "no", text: "No" },
        { value: "inMainSentence", text: "In the main sentence" },
        {
          value: "inSeparateSentence",
          text: "In a separate following sentence",
        },
      ],
      defaultValue: "inMainSentence",
    },
    {
      optionName: "householdPartFormat",
      type: "select",
      label: "Household part format",
      values: [
        { value: "relationship", text: "the <relationship> of <name of head>" },
        { value: "withFamily", text: "[with <describe close family members>]" },
      ],
      defaultValue: "relationship",
    },
  ],
};

const narrativePassengerListOptionsGroup = {
  category: "narrative",
  subcategory: "passengerList",
  tab: "narrative",
  subsection: "passengerList",
  options: [narrativeIncludeAgeOption, narrativeAgeFormatOption],
};

const narrativeSlaveScheduleOptionsGroup = {
  category: "narrative",
  subcategory: "slaveSchedule",
  tab: "narrative",
  subsection: "slaveSchedule",
  options: [narrativeIncludeAgeOption, narrativeAgeFormatOption],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Household Table options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const tableGeneralOptionsGroup = {
  category: "table",
  subcategory: "general",
  tab: "table",
  subsection: "general",
  options: [
    {
      optionName: "autoGenerate",
      type: "select",
      label: "Automatically add household table in census citations",
      values: [
        { value: "none", text: "No" },
        {
          value: "afterRef",
          text: "After the ref (so it shows up in the biography)",
        },
        {
          value: "afterRefBlankLine",
          text: "After the ref with a blank line preceding it (so it shows up in the biography)",
        },
        {
          value: "withinRefOrSource",
          text: "Within the ref or source (so it shows up in sources section)",
        },
        {
          value: "citationInTableCaption",
          text: "Instead include the citation ref in the household table caption (requires caption option)",
        },
      ],
      defaultValue: "none",
    },
    {
      optionName: "format",
      type: "select",
      label: "How to layout the household data",
      values: [
        { value: "table", text: "Table" },
        { value: "list", text: "List" },
        { value: "sentence", text: "Sentence" },
      ],
      defaultValue: "table",
    },
    {
      optionName: "includeRace",
      type: "checkbox",
      label: "Include race for person if known",
      defaultValue: true,
    },
    {
      optionName: "maxLimit",
      type: "number",
      label: "Maximum number of people to include in a table",
      defaultValue: 20,
    },
    {
      optionName: "limitStyleRelated",
      type: "select",
      label: "If the max is exceeded and selected person is related to the head",
      values: [
        { value: "related", text: "Include only people related to head (ignoring max limit)" },
        {
          value: "relatedPlus",
          text: "Include only people related to head (ignoring max limit) plus others up to limit",
        },
        { value: "relatedCapped", text: "Include only people related to head (up to max limit)" },
        {
          value: "relatedPlusCapped",
          text: "Include only people related to head (up to max limit) plus others up to limit",
        },
      ],
      defaultValue: "relatedPlus",
    },
    {
      optionName: "limitStyleUnrelated",
      type: "select",
      label: "If the max is exceeded and selected person is not related to the head",
      values: [
        { value: "headSelected", text: "Include the head plus selected person" },
        {
          value: "headSelectedPlusTwo",
          text: "Include the head plus selected person plus the people just before and after selected",
        },
        {
          value: "headSelectedCapped",
          text: "Include the head plus selected person plus the people before and after up to limit",
        },
      ],
      defaultValue: "headSelectedPlusTwo",
    },
  ],
};

const tableTableOptionsGroup = {
  category: "table",
  subcategory: "table",
  tab: "table",
  subsection: "general",
  subheading: "table",
  options: [
    {
      optionName: "heading",
      type: "select",
      label: "Heading row",
      values: [
        { value: "none", text: "No heading row" },
        { value: "plain", text: "Heading row with no highlight" },
        {
          value: "bgGreen",
          text: "Heading row with *heading* background color",
        },
        { value: "boldCentered", text: "Heading row with bold centered text" },
        {
          value: "bgGreenBoldCentered",
          text: "Heading row with *heading* background color and bold centered text",
        },
      ],
      defaultValue: "bgGreen",
    },
    {
      optionName: "selectedPerson",
      type: "select",
      label: "Selected person row",
      values: [
        { value: "plain", text: "No highlight for selected person" },
        { value: "boldRow", text: "Selected person row in bold text" },
        {
          value: "boldCenteredRow",
          text: "Selected person row in bold centered text",
        },
        { value: "boldName", text: "Selected person name in bold text" },
        {
          value: "bgYellowRow",
          text: "Selected person row with *selected* background color",
        },
        {
          value: "bgYellowBoldRow",
          text: "Selected person row with *selected* background color and bold text",
        },
        {
          value: "bgYellowBoldCenteredRow",
          text: "Selected person row with *selected* background color and bold centered text",
        },
        {
          value: "bgYellowBoldName",
          text: "Selected person row with *selected* background color and name in bold text",
        },
      ],
      defaultValue: "boldRow",
    },
    {
      optionName: "headingColor",
      type: "color",
      label: "Background color for heading row (if chosen above)",
      defaultValue: "#E1F0B4",
    },
    {
      optionName: "selectedColor",
      type: "color",
      label: "Background color for selected person row (if chosen above)",
      defaultValue: "#ffffb3",
    },
    {
      optionName: "closedColor",
      type: "color",
      label: "Background color for closed record row",
      defaultValue: "#d0d0d0",
    },
    {
      optionName: "border",
      type: "checkbox",
      label: "Include a border around the table",
      defaultValue: true,
    },
    {
      optionName: "padding",
      type: "checkbox",
      label: "Include padding in the table cells",
      defaultValue: true,
    },
    {
      optionName: "horizPadChars",
      type: "select",
      label: "Extra horizontal spacing",
      values: [
        { value: "none", text: "None" },
        { value: "nbsp", text: "&nbsp;" },
        { value: "emsp", text: "&emsp;" },
      ],
      defaultValue: "none",
    },
    {
      optionName: "fullWidth",
      type: "checkbox",
      label: "Make table the full width of the biography area",
      defaultValue: false,
    },
    {
      optionName: "caption",
      type: "select",
      label: "Add a caption above the table",
      values: [
        { value: "none", text: "No caption" },
        { value: "titlePlace", text: "<collection title>: <full place>" },
        {
          value: "titlePlaceNoCountry",
          text: "<collection title>: <full place without country>",
        },
        { value: "datePlace", text: "<date of event>: <full place>" },
        {
          value: "datePlaceNoCountry",
          text: "<date of event>: <full place without country>",
        },
      ],
      defaultValue: "none",
    },
  ],
};

const tableListOptionsGroup = {
  category: "table",
  subcategory: "list",
  tab: "table",
  subsection: "general",
  subheading: "list",
  options: [
    {
      optionName: "type",
      type: "select",
      label: "Type of list",
      values: [
        { value: "bullet", text: "Bulleted list (*)" },
        { value: "bullet2", text: "Bulleted inner list (**)" },
        { value: "number", text: "Numbered list (#)" },
        { value: "bulletNumber", text: "Numbered inner list (*#)" },
        { value: "indented1", text: "Indented lines (:)" },
        { value: "indented2", text: "Twice indented lines (::)" },
      ],
      defaultValue: "indented2",
    },
    {
      optionName: "selectedPerson",
      type: "select",
      label: "Selected person line",
      values: [
        { value: "plain", text: "No highlight for selected person" },
        { value: "boldLine", text: "Selected person line in bold text" },
        { value: "italicLine", text: "Selected person line in italic text" },
        { value: "boldItalicLine", text: "Selected person line in bold italic text" },
        { value: "boldName", text: "Selected person name in bold text" },
        { value: "italicName", text: "Selected person name in italic text" },
        { value: "boldItalicName", text: "Selected person name in bold italic text" },
      ],
      defaultValue: "plain",
    },
    {
      optionName: "separator",
      type: "select",
      label: "Separator between fields",
      values: [
        { value: "space", text: "Single space" },
        { value: "fourSpaces", text: "Four spaces (only shows as single space in read mode)" },
        { value: "nbsp", text: "&nbsp;" },
        { value: "nbsp2", text: "&nbsp;&nbsp;" },
        { value: "emsp", text: "&emsp;" },
        { value: "emsp2", text: "&emsp;&emsp;" },
      ],
      defaultValue: "fourSpaces",
    },
  ],
};

const tableSentenceOptionsGroup = {
  category: "table",
  subcategory: "sentence",
  tab: "table",
  subsection: "general",
  subheading: "sentence",
  options: [
    {
      optionName: "preamble",
      type: "select",
      label: "Preamble",
      values: [
        { value: "none", text: "None" },
        { value: "included", text: "The household included" },
        { value: "consisted", text: "The household consisted of" },
        { value: "enumerated", text: "The household was enumerated as" },
      ],
      defaultValue: "none",
    },
    {
      optionName: "includeRelationship",
      type: "checkbox",
      label: "Include relationship for each person (if known)",
      defaultValue: true,
      unitTestValue: true,
    },
    {
      optionName: "includeAge",
      type: "checkbox",
      label: "Include age for each person (if known)",
      defaultValue: true,
      unitTestValue: true,
    },
    {
      optionName: "lastItemPunctuation",
      type: "select",
      label: "Last member punctuation",
      values: [
        { value: "comma", text: "', '" },
        { value: "and", text: "' and '" },
        { value: "commaAnd", text: "', and '" },
      ],
      defaultValue: "comma",
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Add/Merge options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const buildAllGeneralOptionsGroup = {
  category: "buildAll",
  subcategory: "general",
  tab: "buildAll",
  subsection: "general",
  options: [
    {
      optionName: "mergeMarriages",
      type: "checkbox",
      label: "Merge Marriages, Marriage Banns and Marriage Registrations",
      defaultValue: true,
      unitTestValue: true,
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Add/Merge options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const addMergeGeneralOptionsGroup = {
  category: "addMerge",
  subcategory: "general",
  tab: "addMerge",
  subsection: "general",
  options: [
    {
      optionName: "splitForenames",
      type: "select",
      label: "Separate forenames into a first name and middle names",
      values: [
        { value: "never", text: "Never" },
        { value: "always", text: "Always" },
        { value: "countrySpecific", text: "Only for certain countries" },
      ],
      defaultValue: "countrySpecific",
    },
    {
      optionName: "useHusbandsLastName",
      type: "select",
      label: "Assume that a woman took husband's last name",
      values: [
        { value: "never", text: "Never" },
        { value: "always", text: "Always" },
        { value: "countrySpecific", text: "Only for certain countries" },
      ],
      defaultValue: "countrySpecific",
    },
    {
      optionName: "standardizeCountryNameForUsa",
      type: "select",
      label: "Standardize the country name for the United States of America to",
      values: [
        { value: "none", text: "Do not change" },
        { value: "United States", text: "United States" },
        { value: "United States of America", text: "United States of America" },
        { value: "USA", text: "USA" },
      ],
      defaultValue: "United States",
    },
    {
      optionName: "standardizeCountryNameForOther",
      type: "checkbox",
      label: "Standardize the country name for other countries (BETA)",
      defaultValue: false,
    },
  ],
};

const addMergeAddPersonOptionsGroup = {
  category: "addMerge",
  subcategory: "addPerson",
  tab: "addMerge",
  subsection: "addPerson",
  options: [
    {
      optionName: "includeCitation",
      type: "checkbox",
      label: "Fill citation in appropriate field if filling from a citation",
      defaultValue: false,
    },
    {
      optionName: "includeAllCitations",
      type: "checkbox",
      label: "Include all source citations after doing Save Person Data on a person profile (if site supports it)",
      defaultValue: false,
    },
    {
      optionName: "includeProfileLink",
      type: "checkbox",
      label: "Add a link/template to the source profile in sources if filling from a profile",
      defaultValue: false,
    },
    {
      optionName: "addDiedYoung",
      type: "checkbox",
      label: "Include Died Young sticker if person died aged 15 or less and no known spouse",
      defaultValue: false,
    },
    {
      optionName: "diedYoungImage",
      type: "text",
      label: "Image to use in Died Young sticker if default not wanted (e.g. 'Died_Young-1.jpg')",
      defaultValue: "",
    },
    {
      optionName: "generateIntro",
      type: "select",
      label: "Create a birth/parentage line in the biography",
      values: [
        { value: "none", text: "No" },
        {
          value: "fromSavedData",
          text: "Yes, with parent info based on the saved data only",
        },
        {
          value: "fromPageData",
          text: "Yes, with parent info based on the links on Edit Family page only",
        },
        {
          value: "fromBoth",
          text: "Yes, with parent info based on all available information",
        },
      ],
      defaultValue: "none",
    },
    {
      optionName: "includeLinks",
      type: "checkbox",
      label: "Include WikiTree person link for parents in birth/parentage if available",
      defaultValue: false,
    },
    {
      optionName: "includeMarriageLines",
      type: "checkbox",
      label: "Include a line in bio for each known marriage (if not already including narratives or inline citations)",
      defaultValue: false,
    },
    {
      optionName: "includeDeathLine",
      type: "checkbox",
      label: "Include a line in bio for any known death info (if not already including narratives or inline citations)",
      defaultValue: false,
    },
  ],
};

const addMergeMergeEditOptionsGroup = {
  category: "addMerge",
  subcategory: "mergeEdit",
  tab: "addMerge",
  subsection: "mergeEdit",
  options: [
    {
      optionName: "includeCitation",
      type: "checkbox",
      label: "Put citation text in biography if merging from a citation.",
      defaultValue: false,
    },
    {
      optionName: "includeAllCitations",
      type: "checkbox",
      label: "Include all source citations after doing Save Person Data on a person profile (if site supports it)",
      defaultValue: false,
    },
    {
      optionName: "includeProfileLink",
      type: "checkbox",
      label: "Add a link/template to the biography if merging from a profile",
      defaultValue: false,
    },
    {
      optionName: "includeBirthLine",
      type: "checkbox",
      label: "Include a line in bio for any known birth info (if not already including narratives or inline citations)",
      defaultValue: false,
    },
    {
      optionName: "includeMarriageLines",
      type: "checkbox",
      label: "Include a line in bio for each known marriage (if not already including narratives or inline citations)",
      defaultValue: false,
    },
    {
      optionName: "includeDeathLine",
      type: "checkbox",
      label: "Include a line in bio for any known death info (if not already including narratives or inline citations)",
      defaultValue: false,
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Context Menu options groups
////////////////////////////////////////////////////////////////////////////////////////////////////

const contextGeneralOptionsGroup = {
  category: "context",
  subcategory: "general",
  tab: "context",
  subsection: "general",
  options: [
    {
      optionName: "newTabPos",
      type: "select",
      label: "Where to open link in new tab",
      values: [
        { value: "rightMost", text: "To the right of all existing tabs" },
        { value: "nextToRight", text: "To the right of the current tab" },
        { value: "newWindow", text: "In a new window" },
      ],
      defaultValue: "rightMost",
    },
  ],
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Register the groups
////////////////////////////////////////////////////////////////////////////////////////////////////

registerSubsectionForOptions("search", "general", "General");

registerSubsectionForOptions("citation", "general", "General");
registerSubsectionForOptions("citation", "userCitation", "Citation Assistant");

registerSubsectionForOptions("narrative", "general", "General");
registerSubsectionForOptions("narrative", "baptism", "Baptism");
registerSubsectionForOptions("narrative", "birth", "Birth");
registerSubsectionForOptions("narrative", "birthOrBaptism", "Birth or Baptism");
registerSubsectionForOptions("narrative", "birthReg", "Birth Registration");
registerSubheadingForOptions("narrative", "birthReg", "evt", "When date and place are for birth event");
registerSubheadingForOptions("narrative", "birthReg", "reg", "When date and place are for registration, not birth");
registerSubsectionForOptions("narrative", "burial", "Burial");
registerSubsectionForOptions("narrative", "census", "Census");
registerSubsectionForOptions("narrative", "death", "Death");
registerSubsectionForOptions("narrative", "deathReg", "Death Registration");
registerSubheadingForOptions("narrative", "deathReg", "evt", "When date and place are for death event");
registerSubheadingForOptions("narrative", "deathReg", "reg", "When date and place are for registration, not death");
registerSubsectionForOptions("narrative", "marriage", "Marriage");
registerSubsectionForOptions("narrative", "marriageReg", "Marriage Registration");
registerSubheadingForOptions("narrative", "marriageReg", "evt", "When date and place are for marriage event");
registerSubheadingForOptions(
  "narrative",
  "marriageReg",
  "reg",
  "When date and place are for registration, not marriage"
);
registerSubsectionForOptions("narrative", "obituary", "Obituary");
registerSubsectionForOptions("narrative", "slaveSchedule", "Slave Schedule");

registerSubsectionForOptions("table", "general", "General");
registerSubheadingForOptions("table", "general", "table", "When using a table");
registerSubheadingForOptions("table", "general", "list", "When using a list");
registerSubheadingForOptions("table", "general", "sentence", "When using a sentence");

registerSubsectionForOptions("buildAll", "general", "General");

registerSubsectionForOptions("addMerge", "general", "General");
registerSubsectionForOptions("addMerge", "addPerson", "Add Person");
registerSubsectionForOptions("addMerge", "mergeEdit", "Merge/Edit");

registerSubsectionForOptions("context", "general", "General");

registerOptionsGroup(searchOptionsGroup);
registerOptionsGroup(citationOptionsGroup);
registerOptionsGroup(userCitationOptionsGroup);

registerOptionsGroup(narrativeOptionsGroup);
registerOptionsGroup(narrativeBaptismOptionsGroup);
registerOptionsGroup(narrativeBirthOptionsGroup);
registerOptionsGroup(narrativeBirthOrBaptismOptionsGroup);
registerOptionsGroup(narrativeBirthRegOptionsGroup);
registerOptionsGroup(narrativeBirthRegEvtOptionsGroup);
registerOptionsGroup(narrativeBirthRegRegOptionsGroup);
registerOptionsGroup(narrativeBurialOptionsGroup);
registerOptionsGroup(narrativeCensusOptionsGroup);
registerOptionsGroup(narrativeDeathOptionsGroup);
registerOptionsGroup(narrativeDeathRegOptionsGroup);
registerOptionsGroup(narrativeDeathRegEvtOptionsGroup);
registerOptionsGroup(narrativeDeathRegRegOptionsGroup);
registerOptionsGroup(narrativeMarriageOptionsGroup);
registerOptionsGroup(narrativeMarriageRegOptionsGroup);
registerOptionsGroup(narrativeMarriageRegEvtOptionsGroup);
registerOptionsGroup(narrativeMarriageRegRegOptionsGroup);
registerOptionsGroup(narrativeObituaryOptionsGroup);
registerOptionsGroup(narrativePassengerListOptionsGroup);
registerOptionsGroup(narrativeSlaveScheduleOptionsGroup);

registerOptionsGroup(tableGeneralOptionsGroup);
registerOptionsGroup(tableTableOptionsGroup);
registerOptionsGroup(tableListOptionsGroup);
registerOptionsGroup(tableSentenceOptionsGroup);

registerOptionsGroup(buildAllGeneralOptionsGroup);

registerOptionsGroup(addMergeGeneralOptionsGroup);
registerOptionsGroup(addMergeAddPersonOptionsGroup);
registerOptionsGroup(addMergeMergeEditOptionsGroup);

registerOptionsGroup(contextGeneralOptionsGroup);
