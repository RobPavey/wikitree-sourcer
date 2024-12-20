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
  registerSubheadingForOptions,
} from "../../../base/core/options/options_registry.mjs";

const searchOptionsGroup = {
  category: "search",
  subcategory: "noda",
  tab: "search",
  subsection: "noda",
  subheading: "parameters",
  options: [
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        { value: "exact", text: "Exact year only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 3, text: "+/- 3 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: 2,
    },
    {
      optionName: "useExactBirthDate",
      type: "checkbox",
      label: "If an exact birth day or month is known use that rather than a birth year range",
      defaultValue: true,
    },
    {
      optionName: "includeSourcePeriod",
      type: "select",
      label: "Include source period",
      values: [
        { value: "always", text: "Always" },
        { value: "ifNoBirth", text: "Only if no birth year being used" },
        { value: "never", text: "Never" },
      ],
      defaultValue: "ifNoBirth",
    },
    {
      optionName: "sourcePeriodExactness",
      type: "select",
      label: "Search exactness to use for source period",
      values: [
        { value: "exact", text: "Exact range only" },
        { value: 1, text: "+/- 1 years" },
        { value: 2, text: "+/- 2 years" },
        { value: 3, text: "+/- 3 years" },
        { value: 5, text: "+/- 5 years" },
        { value: 10, text: "+/- 10 years" },
      ],
      defaultValue: 2,
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "noda",
  tab: "citation",
  subsection: "noda",
  options: [
    {
      optionName: "linkFormat",
      type: "select",
      label: "Link format",
      values: [
        { value: "simple", text: "As external link" },
        {
          value: "withPermanentId",
          text: "As external link with permanent ID",
        },
        { value: "visible", text: "As a visible URL" },
      ],
      defaultValue: "withPermanentId",
      unitTestValue: "simple",
    },
    {
      optionName: "includeImageLink",
      type: "checkbox",
      label: "For a record citation, include a link to the original image if available",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "noda", "Digitalarkivet (Norway)");
registerSiteSearchPopupOptionsGroup("noda");
registerSubheadingForOptions("search", "noda", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "noda", "Digitalarkivet (Norway)");
registerOptionsGroup(citationOptionsGroup);
