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
  subcategory: "gbooks",
  tab: "citation",
  subsection: "gbooks",
  options: [
    {
      optionName: "authorNames",
      type: "select",
      label: "How to generate author text",
      values: [
        { value: "pageAll", text: "Use the authors from the page (first name first)" },
        { value: "page3", text: 'Use the first 3 authors from the page (first name first) with "et al"' },
        { value: "page3Editors", text: "Use the first 3 authors from the page (first name first) or editors" },
        { value: "chicago", text: "Use the authors from the Chicago citation" },
        { value: "apa", text: "Use the authors from the APA citation" },
      ],
      defaultValue: "page3Editors",
    },
    {
      optionName: "titleContent",
      type: "select",
      label: "How to generate the title text",
      values: [
        { value: "title", text: "Use just the title from the page" },
        { value: "titlePlusSubtitle", text: "Use the title and subtitle from the page" },
      ],
      defaultValue: "titlePlusSubtitle",
    },
    {
      optionName: "publisherDetails",
      type: "select",
      label: "How to generate publisher details",
      values: [
        { value: "page", text: "Use the publisher name and date from the page" },
        { value: "chicago", text: "Use the publisher name and date from the Chicago citation (includes country)" },
      ],
      defaultValue: "chicago",
    },
  ],
};

registerSubsectionForOptions("search", "gbooks", "Google Books");
registerSiteSearchPopupOptionsGroup("gbooks", 10, 10);

registerSubsectionForOptions("citation", "gbooks", "Google Books");
registerOptionsGroup(citationOptionsGroup);
