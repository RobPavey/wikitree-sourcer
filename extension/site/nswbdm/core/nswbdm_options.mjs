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
  subcategory: "nswbdm",
  tab: "search",
  subsection: "nswbdm",
  subheading: "behavior",
  options: [
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing NSW BDM tab if present",
      defaultValue: false,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "nswbdm",
  tab: "search",
  subsection: "nswbdm",
  subheading: "parameters",
  options: [
    {
      optionName: "dateExactness",
      type: "select",
      label: "Search exactness to use for the search from/to dates",
      values: [
        { value: "exactDate", text: "Exact date" },
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
  subcategory: "nswbdm",
  tab: "citation",
  subsection: "nswbdm",
  options: [
    {
      optionName: "sourceTitleFormat",
      type: "select",
      label: "Source title",
      values: [
        { value: "nswbdm", text: "New South Wales Births, Deaths and Marriages" },
        { value: "nswgrbdm", text: "NSW Government. Registry of Births, Deaths and Marriages" },
      ],
      defaultValue: "nswbdm",
    },
    {
      optionName: "includeLink",
      type: "select",
      label: "Include link to NSW BDM site",
      values: [
        { value: "none", text: "No" },
        { value: "asNswBdm", text: 'As "NSW BDM"' },
        { value: "asTypeSearchPage", text: 'As "<type> search page"' },
        { value: "inSourceTitle", text: "In source title" },
      ],
      defaultValue: "asTypeSearchPage",
    },
  ],
};

registerSubsectionForOptions("search", "nswbdm", "New South Wales BDM (Aus)");
registerSiteSearchPopupOptionsGroup("nswbdm", 4, 4);
registerSubheadingForOptions("search", "nswbdm", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "nswbdm", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "nswbdm", "New South Wales BDM (Aus)");
registerOptionsGroup(citationOptionsGroup);
