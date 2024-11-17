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

registerSubsectionForOptions("search", "fg", "Find a Grave");
registerSiteSearchPopupOptionsGroup("fg");
registerSubheadingForOptions("search", "fg", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "fg", "Find a Grave");
registerOptionsGroup(citationOptionsGroup);
