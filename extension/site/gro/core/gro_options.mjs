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

const citationOptionsGroup = {
  category: "citation",
  subcategory: "gro",
  tab: "citation",
  subsection: "gro",
  options: [
    {
      optionName: "changeNamesToInitialCaps",
      type: "checkbox",
      label: "Change person and place names from all caps to initial caps",
      defaultValue: true,
    },  
    {
      optionName: "referenceInItalics",
      type: "checkbox",
      label: "Put the text \"GRO Reference\" in italics",
      defaultValue: true,
    },  
    {
      optionName: "linkStyle",
      type: "select",
      label: "Link to GRO site by",
      values: [
        { value: "search", text: "Hyperlink with full search parameters" },
        { value: "index", text: "Hyperlink to correct GRO index" },
        { value: "content", text: "Hyperlink to GRO content site" },
        { value: "url_content", text: "Visible URL to GRO content site" },
      ],
      defaultValue: "search",
    },  
    {
      optionName: "useDistrictUrl",
      type: "checkbox",
      label: "Add a link to the registration district page on ukbmd.org.uk",
      defaultValue: true,
    },  
  ],
}

registerSubsectionForOptions("search", "gro", "GRO (UK)");
registerSiteSearchPopupOptionsGroup("gro", 5, 5);

registerSubsectionForOptions("citation", "gro", "GRO (UK)");
registerOptionsGroup(citationOptionsGroup);
