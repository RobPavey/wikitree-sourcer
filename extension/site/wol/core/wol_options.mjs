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

const searchOptionsGroup = {
  category: "search",
  subcategory: "wol",
  tab: "search",
  subsection: "wol",
  options: [
    {
      optionName: "language",
      type: "select",
      label: "Library (language) to search",
      values: [
        { value: "en", text: "English" },
        { value: "af", text: "Afrikaans" },
        { value: "cs", text: "Czech" },
        { value: "da", text: "Danish" },
        { value: "nl", text: "Dutch" },
        { value: "fi", text: "Finnish" },
        { value: "fr", text: "French" },
        { value: "de", text: "German" },
        { value: "el", text: "Greek" },
        { value: "hu", text: "Hungarian" },
        { value: "it", text: "Italian" },
        { value: "ja", text: "Japanese" },
        { value: "ko", text: "Korean" },
        { value: "no", text: "Norwegian" },
        { value: "pl", text: "Polish" },
        { value: "pt", text: "Portuguese" },
        { value: "ro", text: "Romanian" },
        { value: "ru", text: "Russian" },
        { value: "es", text: "Spanish" },
        { value: "sv", text: "Swedish" },
        { value: "uk", text: "Ukrainian" },
      ],
      defaultValue: "en",
    },
    {
      optionName: "includeBirthName",
      type: "checkbox",
      label: "Also search for the first name with the last name at birth, and with both last names (if different)",
      defaultValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "wol",
  tab: "citation",
  subsection: "wol",
  options: [
    {
      optionName: "linkType",
      type: "select",
      label: "Link to use for the article",
      values: [
        { value: "share", text: "Share link (www.jw.org/finder?...), the link from the library's share button" },
        { value: "page", text: "Page link (wol.jw.org/...)" },
      ],
      defaultValue: "share",
    },
  ],
};

registerSubsectionForOptions("search", "wol", "Watchtower Online Library (JW)");
registerOptionsGroup(searchOptionsGroup);
registerSiteSearchPopupOptionsGroup("wol");

registerSubsectionForOptions("citation", "wol", "Watchtower Online Library (JW)");
registerOptionsGroup(citationOptionsGroup);
