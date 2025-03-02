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
  subcategory: "wikitree",
  tab: "search",
  subsection: "wikitree",
  subheading: "parameters",
  options: [
    {
      optionName: "nameExactness",
      type: "select",
      label: "Include name variant matches",
      values: [
        { value: "bothVariant", text: "Yes, include both first & last name variants" },
        { value: "firstVariant", text: "Include first name variants, only exact last name matches" },
        { value: "lastVariant", text: "Include last name variants, only exact first name matches" },
        { value: "exact", text: "No, only exact name matches" },
      ],
      defaultValue: "bothVariant",
    },
    {
      optionName: "dateExactness",
      type: "select",
      label: "Date range for matching",
      values: [
        { value: "auto", text: "Set automatically based on source" },
        { value: "exactDate", text: "Match exact date" },
        { value: "exactYear", text: "Match year" },
        { value: "2", text: "+/- 2 years" },
        { value: "12", text: "+/- 12 years" },
        { value: "30", text: "+/- 30 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "includeBirthDate",
      type: "checkbox",
      label: "Include birth date in default search",
      defaultValue: true,
    },
    {
      optionName: "includeDeathDate",
      type: "checkbox",
      label: "Include death date in default search",
      defaultValue: true,
    },
    {
      optionName: "birthLocationExactness",
      type: "select",
      label: "Include birth location in default search",
      values: [
        { value: "full", text: "Use full location" },
        { value: "country", text: "Use country only" },
        { value: "none", text: "Do not include location" },
      ],
      defaultValue: "country",
      unitTestValue: "full",
    },
    {
      optionName: "deathLocationExactness",
      type: "select",
      label: "Include death location in default search",
      values: [
        { value: "full", text: "Use full location" },
        { value: "country", text: "Use country only" },
        { value: "none", text: "Do not include location" },
      ],
      defaultValue: "country",
      unitTestValue: "full",
    },
    {
      optionName: "includeFatherName",
      type: "checkbox",
      label: "Include father's name in default search",
      defaultValue: true,
    },
    {
      optionName: "includeMotherName",
      type: "checkbox",
      label: "Include mother's name in default search",
      defaultValue: true,
    },
    {
      optionName: "removeInvalidCountryName",
      type: "checkbox",
      label: "Remove country name from locations in default search if it is invalid for the date",
      comment:
        "NOTE: This only implemented for a few countries. If you see it using a country name that it should not" +
        " for the given date please let me know.",

      defaultValue: true,
    },
    {
      optionName: "useDev2025Server",
      type: "checkbox",
      label: "Perform search on the dev-2025 server (for temporary testing)",
      defaultValue: false,
    },
  ],
};

registerSubsectionForOptions("search", "wikitree", "WikiTree");
registerSiteSearchPopupOptionsGroup("wikitree");
registerSubheadingForOptions("search", "wikitree", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);
