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
  registerOptionsGroup,
  registerSubheadingForOptions,
  registerSiteSearchPopupOptionsGroup,
} from "../../../base/core/options/options_registry.mjs";

const searchOptionsGroup = {
  category: "search",
  subcategory: "archive",
  tab: "search",
  subsection: "archive",
  subheading: "parameters",
  options: [
    {
      optionName: "nameInQuotes",
      type: "checkbox",
      label: "Put name in quotes",
      defaultValue: false,
    },
    {
      optionName: "searchType",
      type: "select",
      label: "What to search",
      values: [
        { value: "metadata", text: "Metadata" },
        { value: "text", text: "Text contents" },
      ],
      defaultValue: "metadata",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "archive",
  tab: "citation",
  subsection: "archive",
  options: [
    {
      optionName: "includeArkLink",
      type: "checkbox",
      label: "Include a persistent link to the document",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "archive", "Internet Archive");
registerSiteSearchPopupOptionsGroup("archive");
registerSubheadingForOptions("search", "archive", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "archive", "Internet Archive");
registerOptionsGroup(citationOptionsGroup);
