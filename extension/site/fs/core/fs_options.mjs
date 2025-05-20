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
  registerSiteSearchPopupOptionsGroup,
} from "../../../base/core/options/options_registry.mjs";

const searchOptionsGroup = {
  category: "search",
  subcategory: "fs",
  tab: "search",
  subsection: "fs",
  subheading: "parameters",
  options: [
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "deathYearExactness",
      type: "select",
      label: "Search exactness to use for death year",
      values: [
        { value: "none", text: "Do not specify a death year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "marriageYearExactness",
      type: "select",
      label: "Search exactness to use for marriage year",
      values: [
        { value: "none", text: "Do not specify a marriage year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "residenceYearExactness",
      type: "select",
      label: "Search exactness to use for residence year",
      values: [
        { value: "none", text: "Do not specify a residence year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "genderSearchTerm",
      type: "checkbox",
      label:
        "When not searching a specific collection should the sex be specified (can exclude results with no gender specified)",
      defaultValue: false,
      unitTestValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "fs",
  tab: "citation",
  subsection: "fs",
  options: [
    {
      optionName: "sourceRef",
      type: "select",
      label: "Build source reference",
      values: [
        { value: "record", text: "From record data" },
        {
          value: "fsCitationShort",
          text: "Reuse & abbreviate reference from citation on FamilySearch page",
        },
        {
          value: "fsCitationLong",
          text: "Reuse full reference from citation on FamilySearch page",
        },
      ],
      defaultValue: "fsCitationShort",
    },
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        {
          value: "string",
          text: "Sentence (fall back to list if no sentence)",
        },
        { value: "list", text: "List of field names/values" },
        { value: "table", text: "Table of field names/values" },
        {
          value: "fsCitation",
          text: "Reuse parts of the citation on the FamilySearch page",
        },
      ],
      defaultValue: "string",
    },
    /* decided to remove external links 31 Jan 2024 because they can make bad links
    {
      optionName: "includeExternalImageLink",
      type: "checkbox",
      label: "Include a link to an external image if available",
      defaultValue: true,
    },
    {
      optionName: "subscriptionRequired",
      type: "select",
      label: "Indicate that a subscription is required with FMP link",
      values: [
        { value: "none", text: "Do not add any such indication" },
        {
          value: "subscriptionRequired",
          text: 'Include the text "subscription required"',
        },
        {
          value: "requiresSubscription",
          text: 'Include the text "requires subscription"',
        },
        { value: "dollar", text: 'Include the text "$"' },
        { value: "paywall", text: 'Include the text "paywall"' },
      ],
      defaultValue: "none",
      unitTestValue: "subscriptionRequired",
    },
    */
  ],
};

const buildAllCitationsOptionsGroup = {
  category: "buildAll",
  subcategory: "fs",
  tab: "buildAll",
  subsection: "fs",
  options: [
    {
      optionName: "citationType",
      type: "select",
      label: "Type of citations to generate",
      values: [
        { value: "narrative", text: "Narrative plus Sourcer style inline citation" },
        { value: "inline", text: "Sourcer style inline citation" },
        { value: "source", text: "Sourcer style source citation" },
        { value: "fsPlainInline", text: "Inline citation using text on FS Sources page" },
        { value: "fsPlainSource", text: "Source citation using text on FS Sources page" },
      ],
      defaultValue: "narrative",
    },
    {
      optionName: "groupCitations",
      type: "checkbox",
      label: "Group Sourcer inline citations by fact and merge narratives",
      defaultValue: true,
    },
    {
      optionName: "includeNotes",
      type: "checkbox",
      label: "Include FS Source Notes when not using a full Sourcer citation",
      defaultValue: true,
    },
    {
      optionName: "excludeNonFsSources",
      type: "checkbox",
      label: "Exclude sources that do not have a valid link to a FamilySearch record",
      defaultValue: false,
    },
    {
      optionName: "excludeOtherRoleSources",
      type: "checkbox",
      label:
        "For Sourcer style citations, exclude sources where the source person is not a primary person for the event",
      defaultValue: false,
      comment:
        "Be careful with this option because sometimes the wrong person in a source is connected to the profile.",
    },
    {
      optionName: "excludeRetiredSources",
      type: "select",
      label: "For Sourcer style citations, exclude sources that are marked as retired duplicate sources",
      values: [
        { value: "never", text: "Never" },
        { value: "ifDuplicate", text: "If the current source is also in source list" },
        { value: "always", text: "Always" },
      ],
      defaultValue: "ifDuplicate",
    },
  ],
};

registerSubsectionForOptions("search", "fs", "FamilySearch");
registerSiteSearchPopupOptionsGroup("fs");
registerSubheadingForOptions("search", "fs", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerOptionsGroup(citationOptionsGroup);
registerSubsectionForOptions("citation", "fs", "FamilySearch");

registerSubsectionForOptions(
  "buildAll",
  "fs",
  "FamilySearch",
  "NOTE: Some FamilySearch profiles have many incorrect sources - please check the generated citations."
);
registerOptionsGroup(buildAllCitationsOptionsGroup);

// This is just for historical reasons and can be removed a few releases after 2.2.1
registerSubsectionForOptions(
  "addMerge",
  "fsAllCitations",
  "FamilySearch Build All Citations",
  'These options have moved to the "Build All Citations" tab.'
);
