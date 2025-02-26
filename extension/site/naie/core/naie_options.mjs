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
  subcategory: "naie",
  tab: "search",
  subsection: "naie",
  subheading: "behavior",
  options: [
    {
      optionName: "usePre2025Site",
      type: "checkbox",
      label: "Do search on old (pre-2025) National Archives site",
      defaultValue: false,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "naie",
  tab: "search",
  subsection: "naie",
  subheading: "parameters",
  options: [
    {
      optionName: "ageExactness",
      type: "select",
      label: "Search exactness to use for the person's recorded age in census",
      values: [
        { value: "exactYear", text: "Exact year" },
        { value: "1", text: "+/- 1 years" },
        { value: "2", text: "+/- 2 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
        { value: "25", text: "+/- 25 years" },
      ],
      defaultValue: "2",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "naie",
  tab: "citation",
  subsection: "naie",
  options: [],
};

registerSubsectionForOptions("search", "naie", "National Archives of Ireland");
registerSiteSearchPopupOptionsGroup("naie");
registerSubheadingForOptions("search", "naie", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "naie", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "naie", "National Archives of Ireland");
registerOptionsGroup(citationOptionsGroup);
