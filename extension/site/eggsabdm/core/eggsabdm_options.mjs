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
  subcategory: "eggsabdm",
  tab: "search",
  subsection: "eggsabdm",
  subheading: "parameters",
  options: [
    {
      optionName: "fullFirstName",
      type: "checkbox",
      label: "Use all first names in First name field",
      defaultValue: false,
    },
    {
      optionName: "firstNameMode",
      type: "select",
      label: "First Name(s) search mode",
      values: [
        { value: "1", text: "should appear anywhere in the first name" },
        { value: "2", text: "should appear at the start of the first name" },
        { value: "3", text: "should appear at the end of the first name " },
        { value: "4", text: "should match exactly" },
      ],
      defaultValue: "1",
    },
    {
      optionName: "surnameMode",
      type: "select",
      label: "Surname search mode",
      values: [
        { value: "1", text: "should appear anywhere in the  surname" },
        { value: "2", text: "should appear at the start of the surname" },
        { value: "3", text: "should appear at the end of the surname " },
        { value: "4", text: "should match exactly" },
      ],
      defaultValue: "1",
    },
    {
      optionName: "resultOrder",
      type: "select",
      label: "Order results by",
      values: [
        { value: "by_Surname", text: "Surname" },
        { value: "by_Year", text: "Year" },
      ],
      defaultValue: "by_Surname",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "eggsabdm",
  tab: "citation",
  subsection: "eggsabdm",
  options: [],
};

registerSubsectionForOptions("search", "eggsabdm", "eGGSA BDM");
registerSiteSearchPopupOptionsGroup("eggsabdm");
registerSubheadingForOptions("search", "eggsabdm", "parameters", "Default Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "eggsabdm", "eGGSA BDM");
registerOptionsGroup(citationOptionsGroup);
