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
  subcategory: "eggsagrvs",
  tab: "search",
  subsection: "eggsagrvs",
  subheading: "parameters",
  options: [
    {
      optionName: "fullFirstname",
      type: "checkbox",
      label: "Use all first names in First name field",
      defaultValue: false,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "eggsagrvs",
  tab: "citation",
  subsection: "eggsagrvs",
  options: [
    {
      optionName: "includeLink",
      type: "select",
      label: "Include link to eGGSA Graves site",
      values: [
        { value: "inImageTitle", text: "In image title" },
        { value: "inSourceTitle", text: "In source title" },
        { value: "inRef", text: "In source reference data (if at end)" },
      ],
      defaultValue: "inImageTitle",
    },
    {
      optionName: "includeImgPos",
      type: "checkbox",
      label: "Include (M of N images) in citation if available",
      defaultValue: false,
    },
  ],
};

registerSubsectionForOptions("search", "eggsagrvs", "eGGSA Graves");
registerSiteSearchPopupOptionsGroup("eggsagrvs");
registerSubheadingForOptions("search", "eggsagrvs", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "eggsagrvs", "eGGSA Graves");
registerOptionsGroup(citationOptionsGroup);
