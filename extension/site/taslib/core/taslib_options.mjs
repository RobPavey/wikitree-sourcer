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

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "taslib",
  tab: "search",
  subsection: "taslib",
  subheading: "parameters",
  options: [
    {
      optionName: "dateExactness",
      type: "select",
      label: "Search exactness to use for the search from/to dates",
      values: [
        { value: "exact", text: "Exact year only" },
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
  subcategory: "taslib",
  tab: "citation",
  subsection: "taslib",
  options: [
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data as",
      values: [
        { value: "none", text: "Do not include data" },
        { value: "sentence", text: "Standard Sourcer sentence for the record type" },
        { value: "list", text: "List of field names/values from record (excluding ones used in source reference)" },
        {
          value: "listNoRef",
          text: "List of field names/values as shown from record (no Source Reference)",
        },
      ],
      defaultValue: "sentence",
    },
  ],
};

registerSubsectionForOptions("search", "taslib", "Libraries Tasmania");
registerSiteSearchPopupOptionsGroup("taslib");
registerSubheadingForOptions("search", "taslib", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "taslib", "Libraries Tasmania");
registerOptionsGroup(citationOptionsGroup);
