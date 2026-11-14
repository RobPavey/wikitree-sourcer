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

const SearchWithParametersData = {
  includeCategories: () => false,
  includeSubcategories: () => false,
  includeCollections: () => false,
  includeSpouses: () => false,
  includeParents: () => false,
  includeOtherPerson: () => false,
  getAdditionalControls() {
    return [
      {
        elementId: "recordGroup",
        parameterName: "recordGroup",
        type: "select",
        label: "Record group",
        values: [
          { value: "all", text: "All four groups" },
          { value: "churchbook", text: "Church books" },
          { value: "census", text: "Censuses" },
          { value: "skoleprotokol", text: "School protocols" },
          { value: "laegsruller", text: "Military levy rolls" },
        ],
      },
      ...[
        ["sourceyearfrom", "Source year from"],
        ["sourceyearto", "Source year to"],
        ["bornyearfrom", "Birth year from"],
        ["bornyearto", "Birth year to"],
        ["bornplacename", "Birthplace"],
        ["placename", "Locality"],
      ].map(([key, label]) => ({ elementId: key, parameterName: key, type: "text", label })),
    ];
  },
  setDefaultSearchParameters(gd, parameters) {
    parameters.recordGroup = "all";
  },
  updateParametersOnCategoryChange() {},
  updateParametersOnSubcategoryChange() {},
  updateParametersOnCollectionChange() {},
};
export { SearchWithParametersData };
