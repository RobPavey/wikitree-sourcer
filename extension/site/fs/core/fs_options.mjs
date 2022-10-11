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
      unitTestValue: "fsCitation",
    },
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
  ],
};

registerSubsectionForOptions("search", "fs", "FamilySearch");
registerSiteSearchPopupOptionsGroup("fs", 3, 3);
registerSubheadingForOptions("search", "fs", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerOptionsGroup(citationOptionsGroup);
registerSubsectionForOptions("citation", "fs", "FamilySearch");
