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
  subcategory: "scotp",
  tab: "search",
  subsection: "scotp",
  subheading: "parameters",
  options: [
    {
      optionName: "surnameSoundex",
      type: "checkbox",
      label: "Use 'Phonetic matching' search option for surname",
      defaultValue: true,
    },
    {
      optionName: "forenameSoundex",
      type: "checkbox",
      label: "Use 'Phonetic matching' search option for forename",
      defaultValue: true,
    },
    {
      optionName: "parentNameSoundex",
      type: "checkbox",
      label: "Use 'Phonetic matching' search option for parent names",
      defaultValue: true,
    },
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "auto", text: "Set automatically based on source" },
        { value: 0, text: "Exact year only" },
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
        { value: "auto", text: "Set automatically based on source" },
        { value: 0, text: "Exact year only" },
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
        { value: "auto", text: "Set automatically based on source" },
        { value: 0, text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "ageExactness",
      type: "select",
      label: "Search exactness to use for age in census",
      values: [
        { value: "auto", text: "Set automatically based on source" },
        { value: 0, text: "Exact year only" },
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
  subcategory: "scotp",
  tab: "citation",
  subsection: "scotp",
  options: [
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
      ],
      defaultValue: "string",
      unitTestValue: "string",
    },
    {
      optionName: "urlStyle",
      type: "select",
      label: "Include Scotlands People URL as",
      values: [
        {
          value: "visible",
          text: "Just https://www.scotlandspeople.gov.uk/ as a visible URL",
        },
        {
          value: "base",
          text: "Just https://www.scotlandspeople.gov.uk/ as a WikiTree external link",
        },
        /*
        {
          value: "original",
          text: "The search URL used on the page the citation was created on",
        },
        {
          value: "created",
          text: "A search URL created by Sourcer to try to just get the one correct result",
        },
        {
          value: "best",
          text: "A search URL created by Sourcer unless the current page one had only one result",
        },
        {
          value: "short",
          text: "A shorter search URL created by Sourcer that avoids the verbose search parameters",
        },
        */
      ],
      defaultValue: "base",
      unitTestValue: "base",
    },
    {
      optionName: "databaseTitle",
      type: "select",
      label: "Get the text for the database/collection title from",
      values: [
        {
          value: "nrs",
          text: "The National Records of Scotland collection name",
        },
        { value: "header", text: "The heading of the search results page" },
      ],
      defaultValue: "nrs",
      unitTestValue: "nrs",
    },
    /*
    {
      optionName: "urlIncludeRef",
      type: "checkbox",
      label: "Include a '&ref=' query in search URL. It will only have effect for Sourcer users.",
      defaultValue: true,
    },
    */
  ],
};

registerSubsectionForOptions("search", "scotp", "ScotlandsPeople");
registerSiteSearchPopupOptionsGroup("scotp", 7, 7);
registerSubheadingForOptions("search", "scotp", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "scotp", "ScotlandsPeople");
registerOptionsGroup(citationOptionsGroup);
