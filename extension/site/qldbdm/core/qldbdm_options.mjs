/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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
  subcategory: "qldbdm",
  tab: "search",
  subsection: "qldbdm",
  subheading: "behavior",
  options: [
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing Queensland BDM (Aus) tab if present",
      defaultValue: true,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "qldbdm",
  tab: "search",
  subsection: "qldbdm",
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
        { value: 3, text: "+/- 3 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
        { value: 25, text: "+/- 25 years" },
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
        { value: 3, text: "+/- 3 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
        { value: 25, text: "+/- 25 years" },
      ],
      defaultValue: "auto",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "qldbdm",
  tab: "citation",
  subsection: "qldbdm",
  options: [],
};

registerSubsectionForOptions("search", "qldbdm", "Queensland BDM (Aus)");
registerSiteSearchPopupOptionsGroup("qldbdm");
registerSubheadingForOptions("search", "qldbdm", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "qldbdm", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "qldbdm", "Queensland BDM (Aus)");
registerOptionsGroup(citationOptionsGroup);
