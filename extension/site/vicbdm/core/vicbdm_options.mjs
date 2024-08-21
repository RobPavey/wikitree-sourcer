/*
MIT License

Copyright (c) 2024 Robert M Pavey

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
  subcategory: "vicbdm",
  tab: "search",
  subsection: "vicbdm",
  subheading: "behavior",
  options: [
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing BDM Victoria tab if present (faster)",
      defaultValue: true,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "vicbdm",
  tab: "search",
  subsection: "vicbdm",
  subheading: "parameters",
  options: [
    {
      optionName: "includeMiddleName",
      type: "checkbox",
      label: "Include middle name(s) in search",
      defaultValue: true,
    },
    {
      optionName: "includePrefName",
      type: "checkbox",
      label: "Include preferred name in search",
      defaultValue: true,
    },
    {
      optionName: "includeNicknames",
      type: "checkbox",
      label: "Include nicknames in search",
      defaultValue: false,
    },
    {
      optionName: "includeMmn",
      type: "checkbox",
      label: "Include mother's maiden name in non-parameters Births/Deaths search",
      defaultValue: false,
    },
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "1", text: "+/- 1 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
        { value: "25", text: "+/- 25 years" },
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
        { value: "1", text: "+/- 1 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
        { value: "25", text: "+/- 25 years" },
      ],
      defaultValue: "auto",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "vicbdm",
  tab: "citation",
  subsection: "vicbdm",
  options: [
    {
      optionName: "sourceTitleFormat",
      type: "select",
      label: "Source title",
      values: [
        { value: "vrbdm", text: "Victoria Registry of Births, Deaths & Marriages" },
        { value: "vsgrbdmv", text: "Victoria State Government, Registry of Births, Deaths and Marriages Victoria" },
        { value: "vsgrbdm", text: "Victoria State Government, Registry of Births, Deaths and Marriages" },
        { value: "vbdm", text: "Victoria Births, Deaths & Marriages" },
        { value: "bdmv", text: "Births, Deaths & Marriages Victoria" },
      ],
      defaultValue: "vrbdm",
    },
    {
      optionName: "includeLink",
      type: "select",
      label: "Include link to BDM Victoria site",
      values: [
        { value: "none", text: "No" },
        { value: "asBDMVictoria", text: 'As "BDM Victoria"' },
        { value: "asLinkToSearchPage", text: 'As "Link to search page"' },
        { value: "inSourceTitle", text: "In source title" },
      ],
      defaultValue: "asBDMVictoria",
    },
  ],
};

registerSubsectionForOptions("search", "vicbdm", "Victoria BDM (Aus)");
registerSiteSearchPopupOptionsGroup("vicbdm", 7, 7);
registerSubheadingForOptions("search", "vicbdm", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "vicbdm", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "vicbdm", "Victoria BDM (Aus)");
registerOptionsGroup(citationOptionsGroup);
