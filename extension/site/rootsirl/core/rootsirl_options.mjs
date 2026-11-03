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

const searchBehaviorOptionsGroup = {
  category: "search",
  subcategory: "rootsirl",
  tab: "search",
  subsection: "rootsirl",
  subheading: "behavior",
  options: [
    {
      optionName: "reuseExistingTab",
      type: "checkbox",
      label: "Do search in existing Roots Ireland tab if present",
      defaultValue: true,
    },
  ],
};

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "rootsirl",
  tab: "search",
  subsection: "rootsirl",
  subheading: "parameters",
  options: [
    {
      optionName: "yearRange",
      type: "select",
      label: "Search this many years either side of the year",
      values: [
        { value: "0", text: "0 (exact year)" },
        { value: "1", text: "1" },
        { value: "2", text: "2" },
        { value: "3", text: "3" },
        { value: "5", text: "5" },
        { value: "10", text: "10" },
      ],
      defaultValue: "2",
    },
    {
      optionName: "includeParents",
      type: "checkbox",
      label: "Include parents' names in baptism/birth searches (fewer results, but misses records without them)",
      defaultValue: false,
    },
    {
      optionName: "includeSpouse",
      type: "checkbox",
      label: "Include the spouse's name in marriage searches when the person has one spouse",
      defaultValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "rootsirl",
  tab: "citation",
  subsection: "rootsirl",
  options: [
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
      defaultValue: "subscriptionRequired",
      unitTestValue: "subscriptionRequired",
    },
    {
      optionName: "includeMicrofilmLink",
      type: "checkbox",
      label: "Include a link to the National Library of Ireland parish register when the record has one",
      defaultValue: true,
      unitTestValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "rootsirl", "Roots Ireland");
registerSiteSearchPopupOptionsGroup("rootsirl");
registerSubheadingForOptions("search", "rootsirl", "behavior", "Search Behavior");
registerOptionsGroup(searchBehaviorOptionsGroup);
registerSubheadingForOptions("search", "rootsirl", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "rootsirl", "Roots Ireland");
registerOptionsGroup(citationOptionsGroup);
