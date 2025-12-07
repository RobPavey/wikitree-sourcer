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
  subcategory: "ecpp",
  tab: "search",
  subsection: "ecpp",
  subheading: "behavior",
  options: [
    /*
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing Early California Population Project tab if present",
      defaultValue: true,
    },
    */
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "ecpp",
  tab: "citation",
  subsection: "ecpp",
  options: [
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        {
          value: "stdSentence",
          text: "Standard sentence from generalized data",
        },
        { value: "flatList", text: "Flat list of field names/values" },
        { value: "structuredList", text: "Structured list of field names/values" },
      ],
      defaultValue: "flatList",
    },
  ],
};

registerSubsectionForOptions("search", "ecpp", "Early California Population Project");
registerSiteSearchPopupOptionsGroup("ecpp");
registerSubheadingForOptions("search", "ecpp", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);

registerSubsectionForOptions("citation", "ecpp", "Early California Population Project");
registerOptionsGroup(citationOptionsGroup);
