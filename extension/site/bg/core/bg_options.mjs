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
  subcategory: "bg",
  tab: "search",
  subsection: "bg",
  subheading: "parameters",
  options: [
    {
      optionName: "exactLastName",
      type: "checkbox",
      label: "Exact last name in search",
      defaultValue: false,
    },
    {
      optionName: "includeFirstName",
      type: "checkbox",
      label: "Include first name in search",
      defaultValue: true,
    },
    {
      optionName: "exactFirstNames",
      type: "checkbox",
      label: "Exact first names in search",
      defaultValue: false,
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
      label: "Include maiden name in search",
      defaultValue: true,
    },
    {
      optionName: "exactMaidenName",
      type: "checkbox",
      label: "Exact maiden name in search",
      defaultValue: false,
    },
    {
      optionName: "birthYearExactness",
      type: "select",
      label: "Search exactness to use for birth year",
      values: [
        { value: "none", text: "Do not specify a birth year" },
        //{ value: "auto", text: "Set automatically based on source" },
        { value: "0", text: "+/- 0 years" },
        { value: "1", text: "+/- 1 years" },        
        { value: "2", text: "+/- 2 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "4", text: "+/- 4 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "6", text: "+/- 6 years" },
        { value: "7", text: "+/- 7 years" },
        { value: "8", text: "+/- 8 years" },
        { value: "9", text: "+/- 9 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "5",
    },
    {
      optionName: "deathYearExactness",
      type: "select",
      label: "Search exactness to use for death year",
      values: [
        { value: "none", text: "Do not specify a death year" },
        //{ value: "auto", text: "Set automatically based on source" },
        { value: "0", text: "+/- 0 years" },
        { value: "1", text: "+/- 1 years" },        
        { value: "2", text: "+/- 2 years" },
        { value: "3", text: "+/- 3 years" },
        { value: "4", text: "+/- 4 years" },
        { value: "5", text: "+/- 5 years" },
        { value: "6", text: "+/- 6 years" },
        { value: "7", text: "+/- 7 years" },
        { value: "8", text: "+/- 8 years" },
        { value: "9", text: "+/- 9 years" },
        { value: "10", text: "+/- 10 years" },
      ],
      defaultValue: "5",
    },
  ],
};

const citationOptionsGroup = {
  category: "citation",
  subcategory: "bg",
  tab: "citation",
  subsection: "bg",
  options: [
        {
      optionName: "includeTranscriber",
      type: "checkbox",
      label: "Include the transcriber in the citation",
      defaultValue: true,
      unitTestValue: true,
    },
    {
      optionName: "includePhotographer",
      type: "checkbox",
      label: "Include the photographer in the citation",
      defaultValue: true,
      unitTestValue: true,
    },
    {
      optionName: "includeRelatives",
      type: "checkbox",
      label: "List others mentioned on memorial (if any)",
      defaultValue: false,
      unitTestValue: true,
    },
    {
      optionName: "includeEpitaph",
      type: "checkbox",
      label: "Include the epitaph (if any)",
      defaultValue: true,
    },
    {
      optionName: "bracketsRoundName",
      type: "select",
      label: "If the name has a part surrounded by brackets (usually maiden name)",
      values: [
        { 
          value: "omit", 
          text: "Omit that part of name from citation",
        },
        {
          value: "bracket",
          text: "Leave that part of name in brackets in citation",
        },
        {
          value: "insert",
          text: "Insert before last name. e.g. Mary Smith (Brown) to Mary (Brown) Smith",
        },
      ],
      defaultValue: "insert",
    },
  ],
};

registerSubsectionForOptions("search", "bg", "BillionGraves");
registerSiteSearchPopupOptionsGroup("bg", 4, 4);
registerSubheadingForOptions("search", "bg", "parameters", "Search Parameters");
registerOptionsGroup(searchOptionsGroup);

registerSubsectionForOptions("citation", "bg", "BillionGraves");
registerOptionsGroup(citationOptionsGroup);
