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
  subcategory: "ppnz",
  tab: "search",
  subsection: "ppnz",
  subheading: "parameters",
  options: [
    {
      optionName: "addToDateRange",
      type: "select",
      label: "Extra years to add to date range",
      values: [
        { value: "none", text: "None" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: 2,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "ppnz",
  tab: "citation",
  subsection: "ppnz",
  options: [
    {
      optionName: "includeSearchQuery",
      type: "checkbox",
      label: "Include search query in PapersPast URL",
      defaultValue: false,
    },
  ],
};

registerSubsectionForOptions("search", "ppnz", "Papers Past (NZ)");
registerSiteSearchPopupOptionsGroup("ppnz");

registerSubheadingForOptions("search", "ppnz", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "ppnz", "Papers Past (NZ)");
registerOptionsGroup(citationOptionsGroup);
