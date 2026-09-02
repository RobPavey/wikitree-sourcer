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
  subcategory: "gedenkbuch",
  tab: "search",
  subsection: "gedenkbuch",
  subheading: "behavior",
  options: [
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing Bundesarchiv Gedenkbuch tab if present",
      defaultValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "gedenkbuch",
  tab: "citation",
  subsection: "gedenkbuch",
  options: [],
};

registerSubsectionForOptions("search", "gedenkbuch", "Bundesarchiv Gedenkbuch");
registerSiteSearchPopupOptionsGroup("gedenkbuch");
registerSubheadingForOptions("search", "gedenkbuch", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);

registerSubsectionForOptions("citation", "gedenkbuch", "Bundesarchiv Gedenkbuch");
registerOptionsGroup(citationOptionsGroup);
