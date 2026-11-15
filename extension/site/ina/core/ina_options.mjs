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
  registerSubheadingForOptions,
  registerOptionsGroup,
  registerSiteSearchPopupOptionsGroup,
} from "../../../base/core/options/options_registry.mjs";

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "ina",
  tab: "search",
  subsection: "ina",
  subheading: "parameters",
  options: [
    {
      optionName: "nameMatch",
      type: "select",
      label: "How to search for the name",
      values: [
        { value: "exact", text: 'Exact phrase, e.g. "John Power"' },
        { value: "near", text: 'Words near each other, e.g. "John Power"~2 (also finds John J. Power, Power, John)' },
        { value: "all", text: "Both words anywhere on the page (finds the most, including unrelated pages)" },
      ],
      defaultValue: "exact",
    },
    {
      optionName: "forenames",
      type: "select",
      label: "Forenames to search for",
      values: [
        { value: "first", text: "First forename only" },
        { value: "all", text: "All forenames" },
      ],
      defaultValue: "first",
    },
    {
      optionName: "sortOrder",
      type: "select",
      label: "Sort the results by",
      values: [
        { value: "relevance", text: "Relevance" },
        { value: "oldest", text: "Date, oldest first" },
        { value: "newest", text: "Date, newest first" },
      ],
      defaultValue: "relevance",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "ina",
  tab: "citation",
  subsection: "ina",
  options: [
    {
      optionName: "includeClippingTitle",
      type: "checkbox",
      label: "Include the clipping title in citations from a clipping",
      defaultValue: true,
    },
    {
      optionName: "includeClippingNote",
      type: "checkbox",
      label: "Include the clipping's note in citations from a clipping",
      defaultValue: true,
    },
    {
      optionName: "clippingLink",
      type: "select",
      label: "In citations from a clipping, link to",
      values: [
        { value: "clipping", text: "The clipping (can be viewed without a subscription if it is public)" },
        { value: "page", text: "The newspaper page" },
        { value: "both", text: "Both the clipping and the newspaper page" },
      ],
      defaultValue: "clipping",
    },
    {
      optionName: "subscriptionRequired",
      type: "select",
      label: "Indicate that a subscription is required with a link to a newspaper page or a private clipping",
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
      defaultValue: "subscriptionRequired",
      unitTestValue: "subscriptionRequired",
    },
  ],
};

registerSubsectionForOptions("search", "ina", "Irish Newspaper Archives");
registerSiteSearchPopupOptionsGroup("ina");
registerSubheadingForOptions("search", "ina", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "ina", "Irish Newspaper Archives");
registerOptionsGroup(citationOptionsGroup);
