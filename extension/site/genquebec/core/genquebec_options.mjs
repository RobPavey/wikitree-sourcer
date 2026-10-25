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

const citationOptionsGroup = {
  category: "citation",
  subcategory: "genquebec",
  tab: "citation",
  subsection: "genquebec",
  options: [],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "genquebec",
  tab: "search",
  subsection: "genquebec",
  subheading: "parameters",
  options: [
    {
      optionName: "dateExactness",
      type: "select",
      label: "Year range to use for the birth and death years",
      values: [
        { value: "0", text: "Exact year" },
        { value: "1", text: "+/- 1 year" },
        { value: "2", text: "+/- 2 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "2",
    },
  ],
};

registerSubsectionForOptions("search", "genquebec", "Genealogie Quebec");
registerSiteSearchPopupOptionsGroup("genquebec");
registerSubheadingForOptions("search", "genquebec", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "genquebec", "Genealogie Quebec");
registerOptionsGroup(citationOptionsGroup);
