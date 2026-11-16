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
  subcategory: "agatha",
  tab: "search",
  subsection: "agatha",
  subheading: "behavior",
  options: [
    /*{
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing AGATHA tab if present",
      defaultValue: true,
    },*/
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "agatha",
  tab: "citation",
  subsection: "agatha",
  subheading: "title",
  options: [
    {
      optionName: "informativeTitle",
      type: "checkbox",
      label:
        "Make titles more informative (e.g., 'Birth Registration of Marie Coppens' instead of 'Birth Registration')",
      defaultValue: true,
    },
    {
      optionName: "yearInTitle",
      type: "checkbox",
      label:
        "Add the event year at the end of the title (e.g., 'Birth Registration of Marie Coppens (1826)' instead of 'Birth Registration of Marie Coppens')",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "agatha", "AGATHA");
registerSiteSearchPopupOptionsGroup("agatha");
registerSubheadingForOptions("search", "agatha", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);

registerSubsectionForOptions("citation", "agatha", "AGATHA");
registerSubheadingForOptions("citation", "agatha", "title", "Reference Titles");
registerOptionsGroup(citationOptionsGroup);
