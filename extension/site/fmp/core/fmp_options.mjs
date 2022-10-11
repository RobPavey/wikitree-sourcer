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
  subcategory: "fmp",
  tab: "search",
  subsection: "fmp",
  subheading: "parameters",
  options: [
    {
      optionName: "domain",
      type: "select",
      label: "Domain to use for searches (where is your subscription?)",
      comment:
        "NOTE: If you are trying to follow a FindMyPast link that points to a different domain" +
        ' you can right click on the link and use the context menu item "Sourcer: Open Link in New Tab".' +
        " This will redirect to the domain selected above.",
      values: [
        { value: "findmypast.com", text: "findmypast.com" },
        { value: "findmypast.co.uk", text: "findmypast.co.uk" },
        { value: "findmypast.ie", text: "findmypast.ie" },
        { value: "findmypast.com.au", text: "findmypast.com.au" },
      ],
      defaultValue: "findmypast.co.uk",
      unitTestValue: "findmypast.co.uk",
    },
    {
      optionName: "lastNameVariants",
      type: "checkbox",
      label: "Include last name variants in search",
      defaultValue: true,
      unitTestValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "fmp",
  tab: "citation",
  subsection: "fmp",
  options: [
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
        { value: "table", text: "Table of field names/values" },
      ],
      defaultValue: "string",
      unitTestValue: "string",
    },
    {
      optionName: "subscriptionRequired",
      type: "select",
      label: "Indicate that a subscription is required with link",
      values: [
        { value: "none", text: "Do not add any such indication" },
        {
          value: "subscriptionRequired",
          text: 'Include the text "subscription required"',
        },
        {
          value: "requiresSubscription",
          text: 'Include the text "requires subscription"',
        },
        { value: "dollar", text: 'Include the text "$"' },
        { value: "paywall", text: 'Include the text "paywall"' },
      ],
      defaultValue: "none",
      unitTestValue: "none",
    },
    {
      optionName: "includeImageLink",
      type: "checkbox",
      label: "Include a link to the original image if available",
      defaultValue: true,
      unitTestValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "fmp", "FindMyPast");
registerSiteSearchPopupOptionsGroup("fmp", 2, 2);
registerSubheadingForOptions(
  "search",
  "fmp",
  "parameters",
  "Search Parameters"
);
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "fmp", "FindMyPast");
registerOptionsGroup(citationOptionsGroup);
