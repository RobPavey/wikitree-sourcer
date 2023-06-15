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
  subcategory: "psuk",
  tab: "citation",
  subsection: "psuk",
  options: [
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        {
          value: "fullSentence",
          text: "Sentence like that in probate calendar",
        },
        {
          value: "string",
          text: "Basic sentence",
        },
        { value: "list", text: "List of field names/values" },
        { value: "table", text: "Table of field names/values" },
      ],
      defaultValue: "fullSentence",
    },
  ],
};

registerSubsectionForOptions("search", "psuk", "Probate Search/Find A Will (UK)");
registerSiteSearchPopupOptionsGroup("psuk", 7, 7);

registerSubsectionForOptions("citation", "psuk", "Probate Search/Find A Will (UK)");
registerOptionsGroup(citationOptionsGroup);
