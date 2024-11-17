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
  registerSiteSearchPopupOptionsGroup,
  registerSubheadingForOptions,
} from "../../../base/core/options/options_registry.mjs";

const searchOptionsGroup = {
  category: "search",
  subcategory: "thegen",
  tab: "search",
  subsection: "thegen",
  subheading: "parameters",
  options: [
    {
      optionName: "domain",
      type: "select",
      label: "Domain to use for searches (where is your subscription?)",
      comment:
        "NOTE: If you are trying to follow a The Genealogist link that points to a different domain" +
        ' you can right click on the link and use the context menu item "Sourcer: Open Link in New Tab".' +
        " This will redirect to the domain selected above.",
      values: [
        { value: "thegenealogist.com", text: "thegenealogist.com" },
        { value: "thegenealogist.co.uk", text: "thegenealogist.co.uk" },
      ],
      defaultValue: "thegenealogist.co.uk",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "thegen",
  tab: "citation",
  subsection: "thegen",
  options: [],
};

registerSubsectionForOptions("search", "thegen", "The Genealogist");
registerSiteSearchPopupOptionsGroup("thegen");
registerSubheadingForOptions("search", "thegen", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "thegen", "The Genealogist");
registerOptionsGroup(citationOptionsGroup);
