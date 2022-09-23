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
  subcategory: "freereg",
  tab: "search",
  subsection: "freereg",
  subheading: "parameters",
  options: [
    {
      optionName: "fuzzy",
      type: "checkbox",
      label: "Use Name Soundex",
      defaultValue: true,
    },  
    {
      optionName: "yearRange",
      type: "select",
      label: "Search range to use for event year",
      values: [
        { value: "none", text: "Do not specify a year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "2", text: "+/- 2 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "auto",
    },  
    {
      optionName: "includeCounty",
      type: "checkbox",
      label: "Include county in search (if known)",
      defaultValue: true,
    },  
  ],
}

const citationOptionsGroup = {
  category: "citation",
  subcategory: "freereg",
  tab: "citation",
  subsection: "freereg",
  options: [
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        { value: "string", text: "Sentence (fall back to list if no sentence)" },
        { value: "list", text: "List of field names/values" },
        { value: "table", text: "Table of field names/values" },
      ],
      defaultValue: "string",
      unitTestValue: "table"
    },
  ],
};

registerSubsectionForOptions("search", "freereg", "FreeReg (UK)");
registerSiteSearchPopupOptionsGroup("freereg", 8, 8);
registerSubheadingForOptions("search", "freereg", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "freereg", "FreeReg (UK)");
registerOptionsGroup(citationOptionsGroup);
