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

// The site search form only supports ranges of 0, 1, 2, 5 and 10 years
const yearExactnessValues = [
  { value: "auto", text: "Set automatically based on source" },
  { value: "exact", text: "Exact year only" },
  { value: "1", text: "+/- 1 year" },
  { value: "2", text: "+/- 2 years" },
  { value: "5", text: "+/- 5 years" },
  { value: "10", text: "+/- 10 years" },
];

const searchParametersOptionsGroup = {
  category: "search",
  subcategory: "yorkshireburials",
  tab: "search",
  subsection: "yorkshireburials",
  subheading: "parameters",
  options: [
    {
      optionName: "surnameMatch",
      type: "select",
      label: "Surname match type",
      values: [
        { value: "exact", text: "Exact" },
        { value: "starts", text: "Starts with" },
        { value: "soundex", text: "Soundex" },
        { value: "metaphone", text: "Metaphone" },
      ],
      defaultValue: "exact",
    },
    {
      optionName: "forenames",
      type: "select",
      label: "Forenames to use in search",
      values: [
        { value: "none", text: "Do not specify forenames" },
        { value: "first", text: "First name only" },
        { value: "all", text: "All forenames" },
      ],
      defaultValue: "first",
    },
    {
      optionName: "burialYearExactness",
      type: "select",
      label: "Search exactness to use for burial (event) year",
      values: [{ value: "none", text: "Do not specify a burial year" }, ...yearExactnessValues],
      defaultValue: "auto",
    },
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year (only used if there is no death year)",
      values: [{ value: "none", text: "Do not specify a birth year" }, ...yearExactnessValues],
      defaultValue: "none",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "yorkshireburials",
  tab: "citation",
  subsection: "yorkshireburials",
  options: [
    {
      optionName: "includeGraveReference",
      type: "checkbox",
      label: "Include grave reference in source reference (if available)",
      defaultValue: true,
    },
    {
      optionName: "includeRegisterReference",
      type: "checkbox",
      label: "Include register entry in source reference (if available)",
      defaultValue: true,
    },
    {
      optionName: "dataStyle",
      type: "select",
      label: "Include record data at end of citation as",
      values: [
        { value: "none", text: "Do not include data" },
        { value: "string", text: "Sentence" },
        { value: "list", text: "List of field names/values" },
      ],
      defaultValue: "string",
    },
    {
      optionName: "includeAdditionalDetails",
      type: "checkbox",
      label: "Add other details (parents, where born, residence, disease etc.) after the data sentence",
      defaultValue: true,
    },
  ],
};

registerSubsectionForOptions("search", "yorkshireburials", "Yorkshire Burials");
registerSiteSearchPopupOptionsGroup("yorkshireburials");
registerSubheadingForOptions("search", "yorkshireburials", "parameters", "Search Parameters");
registerOptionsGroup(searchParametersOptionsGroup);

registerSubsectionForOptions("citation", "yorkshireburials", "Yorkshire Burials");
registerOptionsGroup(citationOptionsGroup);
