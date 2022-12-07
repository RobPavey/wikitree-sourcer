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
  subcategory: "cwgc",
  tab: "search",
  subsection: "cwgc",
  subheading: "parameters",
  options: [
    {
      optionName: "exactLastName",
      type: "checkbox",
      label: "Exact last name in search",
      defaultValue: false,
      unitTestValue: false,
    },
    {
      optionName: "useFirstnameOrInitial",
      type: "select",
      label: "Use firstname or initial in search",
      values: [
        { value: "firstname", text: "firstname" },
        { value: "initial", text: "initial" },
      ],
      defaultValue: "firstname",
      unitTestValue: "firstname",
    },
    {
      optionName: "exactFirstName",
      type: "checkbox",
      label: "Exact first name in search (if selected)",
      defaultValue: false,
      unitTestValue: false,
    },
    {
      optionName: "deathYearExactness",
      type: "select",
      label: "Search exactness to use for death year",
      values: [
        { value: "none", text: "Do not specify a death year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "1", text: "adjust start and end years by 1 year" },
        { value: "2", text: "adjust start and end years by 2 years" },
        { value: "3", text: "adjust start and end years by 3 years" },
      ],
      defaultValue: "auto",
      unitTestValue: "auto",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "cwgc",
  tab: "citation",
  subsection: "cwgc",
  options: [
    {
      optionName: "changeNamesToInitialCaps",
      type: "checkbox",
      label: "Change any person and place names in all caps to initial caps",
      defaultValue: true,
    },
    {
      optionName: "includeServiceNumber",
      type: "checkbox",
      label: "Include service number (if available)",
      defaultValue: true,
    },
    {
      optionName: "includeUnit",
      type: "checkbox",
      label: "Include details of Regiment & Unit or Ship",
      defaultValue: true,
    },
    {
      optionName: "includeAdditionalInfo",
      type: "checkbox",
      label: "Include any additional information (if available)",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "cwgc", "Commonwealth War Graves Commission");
registerSiteSearchPopupOptionsGroup("cwgc", 10, 10);
registerSubheadingForOptions("search", "cwgc", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);
registerSubsectionForOptions("citation", "cwgc", "Commonwealth War Graves Commission");
registerOptionsGroup(citationOptionsGroup);
