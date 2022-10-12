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
  ],
};

registerSubsectionForOptions("search", "wikitree", "WikiTree");
registerSiteSearchPopupOptionsGroup("wikitree", 6, 6);
registerSubheadingForOptions("search", "wikitree", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);
