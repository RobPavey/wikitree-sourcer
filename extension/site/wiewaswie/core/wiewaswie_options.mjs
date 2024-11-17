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
  subcategory: "wiewaswie",
  tab: "search",
  subsection: "wiewaswie",
  subheading: "parameters",
  options: [
    {
      optionName: "searchLang",
      type: "select",
      label: "Which language verion of the search page to use",
      values: [
        { value: "en", text: "en" },
        { value: "nl", text: "nl" },
      ],
      defaultValue: "en",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "wiewaswie",
  tab: "citation",
  subsection: "wiewaswie",
  options: [
    {
      optionName: "languageVersionToCite",
      type: "select",
      label: "Which language version of the WiewasWie details page to cite",
      values: [
        { value: "page", text: "Use the language of the current page" },
        { value: "en", text: "en" },
        { value: "nl", text: "nl" },
        { value: "omit", text: "No language in URL (defaults to nl)" },
      ],
      defaultValue: "page",
    },
    {
      optionName: "includeArchiveNumInSourceRef",
      type: "checkbox",
      label: "Include archive number/code in source reference",
      defaultValue: true,
    },
    {
      optionName: "includeRegNumInSourceRef",
      type: "checkbox",
      label: "Include registration number in source reference",
      defaultValue: true,
    },
    {
      optionName: "includePageNumInSourceRef",
      type: "checkbox",
      label: "Include page number in source reference",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "wiewaswie", "WieWasWie (NL)");
registerSiteSearchPopupOptionsGroup("wiewaswie");
registerSubheadingForOptions("search", "wiewaswie", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "wiewaswie", "WieWasWie (NL)");
registerOptionsGroup(citationOptionsGroup);
