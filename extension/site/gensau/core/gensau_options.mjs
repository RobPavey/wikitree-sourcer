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
  registerOptionsGroup,
  registerSiteSearchPopupOptionsGroup,
} from "../../../base/core/options/options_registry.mjs";

const citationOptionsGroup = {
  category: "citation",
  subcategory: "gensau",
  tab: "citation",
  subsection: "gensau",
  options: [
    {
      optionName: "linkType",
      type: "select",
      label: "Type of link to Genealogy SA site",
      values: [
        { value: "toHomePage", text: "To home page" },
        { value: "toRecord", text: "To record page" },
      ],
      defaultValue: "toHomePage",
    },
    {
      optionName: "sourceReferenceIncludes",
      type: "select",
      label: "Data to put in Source Reference",
      values: [
        { value: "searchPlusRef", text: "All data needed to find in search plus reference type data" },
        { value: "refOnly", text: "Just reference type data" },
      ],
      defaultValue: "searchPlusRef",
    },
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        {
          value: "string",
          text: "Sentence (fall back to list if no sentence)",
        },
        { value: "list", text: "List of field names/values" },
      ],
      defaultValue: "string",
    },
  ],
};

registerSubsectionForOptions("search", "gensau", "Genealogy SA");
registerSiteSearchPopupOptionsGroup("gensau");

registerSubsectionForOptions("citation", "gensau", "Genealogy SA");
registerOptionsGroup(citationOptionsGroup);
