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

const groups = ["census", "churchbook", "skoleprotokol", "laegsruller"];
function buildSearchData(input) {
  const gd = input.generalizedData;
  const options = input.options || {};
  const p = input.searchParameters || {};
  const lastNames = gd.inferPersonLastNamesArray(gd);
  const fieldData = {
    firstname: p.firstName ?? gd.inferFirstName(),
    lastname: p.lastName ?? lastNames[p.lastNameIndex || 0] ?? gd.inferLastName(),
  };
  if (options.search_dfs_includeBirthYear !== false && gd.inferBirthYear()) {
    const range = {};
    gd.setDatesUsingQualifier(range, gd.inferBirthYear(), gd.inferBirthDateQualifier());
    if (range.startYear) fieldData.bornyearfrom = String(range.startYear);
    if (range.endYear) fieldData.bornyearto = String(range.endYear);
  }
  for (const key of ["bornyearfrom", "bornyearto", "sourceyearfrom", "sourceyearto", "bornplacename", "placename"]) {
    if (p[key] !== undefined) fieldData[key] = String(p[key]);
  }
  const group = p.recordGroup || input.typeOfSearch;
  return {
    fieldData,
    selectData: {
      groups: groups.includes(group) ? [group] : groups.slice(),
      autoSubmit: options.search_dfs_autoSubmit !== false,
    },
  };
}
export { buildSearchData };
