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

const searchBehaviorOptionsGroup = {
  category: "search",
  subcategory: "freebmd",
  tab: "search",
  subsection: "freebmd",
  subheading: "behavior",
  options: [
    {
      optionName: "useNewSite",
      type: "checkbox",
      label: "Do search using the new FreeBMD site (freebmd2)",
      defaultValue: false,
    },
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing freebmd2 tab if present",
      defaultValue: false,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "freebmd",
  tab: "search",
  subsection: "freebmd",
  subheading: "parameters",
  options: [
    {
      optionName: "fuzzyInDefault",
      type: "checkbox",
      label: "Use Name Soundex (when not searching same collection)",
      defaultValue: true,
    },
    {
      optionName: "fuzzyInSameCollection",
      type: "checkbox",
      label: "Use Name Soundex (when searching same collection)",
      defaultValue: true,
    },
    {
      optionName: "birthYearRangeDefault",
      type: "select",
      label: "Search range to use for birth year (when not searching same collection)",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "2", text: "+/- 2 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "birthYearRangeSameCollection",
      type: "select",
      label: "Search range to use for birth year (when searching same collection)",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "2", text: "+/- 2 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "exact",
    },
    {
      optionName: "includeCounty",
      type: "checkbox",
      label: "Include county in search (if known)",
      defaultValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "freebmd",
  tab: "citation",
  subsection: "freebmd",
  options: [
    {
      optionName: "changeNamesToInitialCaps",
      type: "checkbox",
      label: "Change any person and place names in all caps to initial caps",
      defaultValue: true,
    },
    {
      optionName: "referenceInItalics",
      type: "checkbox",
      label: 'Put the text "GRO Reference" in italics',
      defaultValue: true,
    },
    {
      optionName: "useDistrictUrl",
      type: "checkbox",
      label: "Add a link to the registration district page on ukbmd.org.uk (Not currently implemented)",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "freebmd", "FreeBMD (UK)");
registerSiteSearchPopupOptionsGroup("freebmd");
registerSubheadingForOptions("search", "freebmd", "behavior", "Search Parameters");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "freebmd", "parameters", "Search Behavior");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "freebmd", "FreeBMD (UK)");
registerOptionsGroup(citationOptionsGroup);
