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
  subcategory: "fg",
  tab: "search",
  subsection: "fg",
  subheading: "parameters",
  options: [
    {
      optionName: "includeFirstName",
      type: "checkbox",
      label: "Include first name in search",
      defaultValue: true,
    },
    {
      optionName: "includeMiddleName",
      type: "checkbox",
      label: "Include middle name in search",
      defaultValue: true,
    },
    {
      optionName: "includeMaidenName",
      type: "checkbox",
      label: "Include matches with a memorial's maiden name in search",
      defaultValue: true,
    },
    {
      optionName: "includeCemeteryLocation",
      type: "checkbox",
      label: "Include death/profile location as cemetery location in search",
      defaultValue: false,
    },
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "1", text: "+/- 1 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
        { value: "25", text: "+/- 25 years" },
      ],
      defaultValue: "auto",
    },
    {
      optionName: "deathYearExactness",
      type: "select",
      label: "Search exactness to use for death year",
      values: [
        { value: "none", text: "Do not specify a death year" },
        { value: "auto", text: "Set automatically based on source" },
        { value: "exact", text: "Exact year only" },
        { value: "1", text: "+/- 1 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "10", text: "+/- 10 years" },
        { value: "25", text: "+/- 25 years" },
      ],
      defaultValue: "auto",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "fg",
  tab: "citation",
  subsection: "fg",
  options: [
    {
      optionName: "includeImageStatus",
      type: "checkbox",
      label: "Include an indication of whether there is an image or not",
      defaultValue: true,
    },
    {
      optionName: "includePlot",
      type: "checkbox",
      label: "Include the burial plot details if available",
      defaultValue: true,
    },
    {
      optionName: "includeMaintainer",
      type: "checkbox",
      label: "Include the maintainer in the citation",
      defaultValue: true,
    },
    {
      optionName: "includeInscription",
      type: "checkbox",
      label: "Include the inscription in the citation if available",
      defaultValue: false,
      unitTestValue: true,
    },
    {
      optionName: "italicsInName",
      type: "select",
      label: "If the name has a part in italics (usually maiden name)",
      values: [
        { value: "omit", text: "Omit that part of name from citation" },
        {
          value: "italic",
          text: "Put that part of name in italics in citation",
        },
        {
          value: "plain",
          text: "Make that part of the name plain text in citation",
        },
      ],
      defaultValue: "italic",
    },
  ],
};

const uiOptionsPageModBehaviourGroup = {
  category: "ui",
  subcategory: "fg",
  tab: "ui",
  subsection: "fg",
  subheading: "wtIconPageModBehaviour",

  options: [
    {
      optionName: "showProcessingIcon",
      type: "checkbox",
      label: "Show a processing icon while determining if a WikiTree usage icon should be shown",
      defaultValue: true,
    },
    {
      optionName: "animateProcessingIcon",
      type: "checkbox",
      label: "Animate the processing icon",
      defaultValue: true,
    },
    {
      optionName: "rightClickCopy",
      type: "checkbox",
      label: "Override right-click on icons to copy the wikiID or other relevant text",
      defaultValue: true,
    },
  ],
};

const uiOptionsPageModLocationsGroup = {
  category: "ui",
  subcategory: "fg",
  tab: "ui",
  subsection: "fg",
  subheading: "wtIconPageModLocactions",

  options: [
    {
      optionName: "memorialShowWtIconH1",
      type: "checkbox",
      label: "On memorial pages show icon next to top-level heading",
      defaultValue: true,
    },
    {
      optionName: "memorialShowWtIconForOutRefH1",
      type: "checkbox",
      label: "On memorial pages in icon next to top-level heading, indicate if there are links back to WT",
      defaultValue: true,
    },
    {
      optionName: "memorialShowWtIconFamilyMember",
      type: "checkbox",
      label: "On memorial pages show icon next to family members",
      defaultValue: true,
    },
    {
      optionName: "memorialSearchShowWtIcon",
      type: "checkbox",
      label: "On memorial search pages show icon next to each memorial",
      defaultValue: true,
    },
    {
      optionName: "cemeteryShowWtIconH1",
      type: "checkbox",
      label: "On cemetery pages show icon next to top-level heading to indicate if WT profiles reference this cemetery",
      defaultValue: true,
    },
    {
      optionName: "cemeteryShowWtCategoryIconH1",
      type: "checkbox",
      label: "On cemetery pages show icon next to top-level heading to show WT category for this cemetery",
      defaultValue: true,
    },
    {
      optionName: "cemeterySearchShowWtIcon",
      type: "checkbox",
      label: "On cemetery search pages show icon next to each memorial",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "fg", "Find a Grave");
registerSiteSearchPopupOptionsGroup("fg");
registerSubheadingForOptions("search", "fg", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "fg", "Find a Grave");
registerOptionsGroup(citationOptionsGroup);

registerSubsectionForOptions("ui", "fg", "FindAGrave");
registerSubheadingForOptions(
  "ui",
  "fg",
  "wtIconPageModBehaviour",
  "Page Modifications for WikiTree usage icons (behaviour)"
);
registerOptionsGroup(uiOptionsPageModBehaviourGroup);
registerSubheadingForOptions(
  "ui",
  "fg",
  "wtIconPageModLocactions",
  "Page Modifications for WikiTree usage icons (locations)"
);
registerOptionsGroup(uiOptionsPageModLocationsGroup);
