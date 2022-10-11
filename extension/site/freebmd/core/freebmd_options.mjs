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
} from "../../../base/core/options/options_registry.mjs";

const citationOptionsGroup = {
  category: "citation",
  subcategory: "freebmd",
  tab: "citation",
  subsection: "freebmd",
  options: [
    {
      optionName: "changeNamesToInitialCaps",
      type: "checkbox",
      label: "Change any person and place names in all caps to initial caps",
      defaultValue: true,
    },
    {
      optionName: "referenceInItalics",
      type: "checkbox",
      label: 'Put the text "GRO Reference" in italics',
      defaultValue: true,
    },
    {
      optionName: "useDistrictUrl",
      type: "checkbox",
      label:
        "Add a link to the registration district page on ukbmd.org.uk (Not currently implemented)",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "freebmd", "FreeBMD (UK)");
registerSiteSearchPopupOptionsGroup("freebmd", 7, 7);

registerSubsectionForOptions("citation", "freebmd", "FreeBMD (UK)");
registerOptionsGroup(citationOptionsGroup);
