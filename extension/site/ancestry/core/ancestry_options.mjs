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
  subcategory: "ancestry",
  tab: "search",
  subsection: "ancestry",
  subheading: "parameters",
  options: [
    {
      optionName: "domain",
      type: "select",
      label: "Domain to use for searches (where is your subscription?)",
      comment:
        "NOTE: If you are trying to follow an Ancestry link/template that points to a different domain" +
        ' you can right click on the link and use the context menu item "Sourcer: Open Link in New Tab".' +
        " This will redirect to the domain selected above.",
      values: [
        { value: "ancestry.com", text: "ancestry.com" },
        { value: "ancestry.co.uk", text: "ancestry.co.uk" },
        { value: "ancestry.ca", text: "ancestry.ca" },
        { value: "ancestry.com.au", text: "ancestry.com.au" },
        { value: "ancestry.de", text: "ancestry.de" },
        { value: "ancestry.it", text: "ancestry.it" },
        { value: "ancestry.fr", text: "ancestry.fr" },
        { value: "ancestry.se", text: "ancestry.se" },
        { value: "ancestry.mx", text: "ancestry.mx" },
        { value: "ancestrylibrary.com", text: "ancestrylibrary.com" },
        {
          value: "ancestrylibraryedition.co.uk",
          text: "ancestrylibraryedition.co.uk",
        },
        { value: "ancestrylibrary.ca", text: "ancestrylibrary.ca" },
        { value: "ancestrylibrary.com.au", text: "ancestrylibrary.com.au" },
        { value: "ancestryheritagequest.com", text: "ancestryheritagequest.com" },
      ],
      defaultValue: "ancestry.com",
    },
    {
      optionName: "restrictToRecords",
      type: "checkbox",
      label: "Restrict the search to record results (not trees, stories or photos)",
      defaultValue: true,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "ancestry",
  tab: "citation",
  subsection: "ancestry",
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
      unitTestValue: "table",
    },
    {
      optionName: "recordTemplateDomain",
      type: "select",
      label: "Ancestry Record template domain",
      values: [
        { value: "fromRecord", text: "Use the domain from record being cited" },
        { value: "ancestry.com", text: "ancestry.com (no 3rd parameter)" },
        { value: "ancestry.co.uk", text: "ancestry.co.uk" },
        { value: "ancestry.ca", text: "ancestry.ca" },
        { value: "ancestry.com.au", text: "ancestry.com.au" },
        { value: "ancestry.de", text: "ancestry.de" },
        { value: "ancestry.it", text: "ancestry.it" },
        { value: "ancestry.fr", text: "ancestry.fr" },
        { value: "ancestry.se", text: "ancestry.se" },
        { value: "ancestry.mx", text: "ancestry.mx" },
      ],
      defaultValue: "fromRecord",
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
    },
    {
      optionName: "includeSharingTemplate",
      type: "checkbox",
      label: "Include a sharing template to the original image if available",
      defaultValue: true,
    },
    {
      optionName: "addEditCitationButton",
      type: "checkbox",
      label: "On Ancestry image pages add a button to edit citation in panel",
      defaultValue: true,
    },
  ],
};

const buildAllCitationsOptionsGroup = {
  category: "buildAll",
  subcategory: "ancestry",
  tab: "buildAll",
  subsection: "ancestry",
  options: [
    {
      optionName: "citationType",
      type: "select",
      label: "Type of citations to generate",
      values: [
        { value: "narrative", text: "Narrative plus inline citation" },
        { value: "inline", text: "Inline citation" },
        { value: "source", text: "Source citation" },
      ],
      defaultValue: "narrative",
    },
    {
      optionName: "groupCitations",
      type: "checkbox",
      label: "Group inline citations by fact and merge narratives",
      defaultValue: true,
    },
    {
      optionName: "excludeOtherRoleSources",
      type: "checkbox",
      label: "Exclude sources where the source person is not a primary person for the event",
      defaultValue: false,
    },
  ],
};

registerSubsectionForOptions("search", "ancestry", "Ancestry");
registerSiteSearchPopupOptionsGroup("ancestry");
registerSubheadingForOptions("search", "ancestry", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "ancestry", "Ancestry");
registerOptionsGroup(citationOptionsGroup);

registerSubsectionForOptions(
  "buildAll",
  "ancestry",
  "Ancestry",
  "NOTE: Some Ancestry profiles have many incorrect sources - please check the generated citations."
);
registerOptionsGroup(buildAllCitationsOptionsGroup);
