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
  subcategory: "wikipedia",
  tab: "citation",
  subsection: "wikipedia",
  options: [
    {
      optionName: "citationLinkType",
      type: "select",
      label: "Link type to use in citation",
      values: [
        {
          value: "special",
          text: "Special WikiTree Wikipedia link (double brackets)",
        },
        {
          value: "external",
          text: "Standard WikiTree External link (single brackets)",
        },
        { value: "permalink", text: "Permalink to the current version of the page" },
        {
          value: "plainSimple",
          text: "Plain visible simple URL",
        },
        {
          value: "plainPermalink",
          text: "Plain visible permalink URL to current version of page",
        },
      ],
      defaultValue: "special",
    },
    {
      optionName: "buildLinkType",
      type: "select",
      label: "Link type to use when building link (not citation)",
      values: [
        {
          value: "special",
          text: "Special WikiTree Wikipedia link (double brackets)",
        },
        {
          value: "external",
          text: "Standard WikiTree External link (single brackets)",
        },
        { value: "permalink", text: "Permalink to the current version of the page" },
      ],
      defaultValue: "special",
    },
    {
      optionName: "linkSurroundingText",
      type: "select",
      label: "Extra text to include when building a link (not a citation)",
      values: [
        { value: "none", text: "No extra text" },
        {
          value: "seeOnW",
          text: "'See: <link> on Wikipedia'",
        },
        {
          value: "seeOnWForMoreInfo",
          text: "'See: <link> on Wikipedia for more information'",
        },
      ],
      defaultValue: "none",
    },
  ],
};

registerSubsectionForOptions("search", "wikipedia", "Wikipedia");
registerSiteSearchPopupOptionsGroup("wikipedia", 10, 10);

registerSubsectionForOptions("citation", "wikipedia", "Wikipedia");
registerOptionsGroup(citationOptionsGroup);
