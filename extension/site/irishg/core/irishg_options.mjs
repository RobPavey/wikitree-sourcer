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
  registerOptionsGroup,
  registerSiteSearchPopupOptionsGroup,
  registerSubheadingForOptions,
} from "../../../base/core/options/options_registry.mjs";

const searchOptionsGroup = {
  category: "search",
  subcategory: "irishg",
  tab: "search",
  subsection: "irishg",
  subheading: "parameters",
  options: [
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
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "irishg",
  tab: "citation",
  subsection: "irishg",
  options: [
    {
      optionName: "dataStringFormat",
      type: "select",
      label: "Data sentence to include in citation",
      values: [
        { value: "none", text: "None" },
        { value: "dataString", text: "Sourcer style data string" },
        { value: "fromPage", text: "Text shown as event summary on page" },
      ],
      defaultValue: "dataString",
    },
  ],
};

registerSubsectionForOptions("search", "irishg", "IrishGenealogy.ie");
registerSiteSearchPopupOptionsGroup("irishg", 7, 7);
registerSubheadingForOptions("search", "irishg", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "irishg", "IrishGenealogy.ie");
registerOptionsGroup(citationOptionsGroup);
