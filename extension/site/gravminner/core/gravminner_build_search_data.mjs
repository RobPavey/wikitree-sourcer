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

function buildSearchData(input) {
  const gd = input.generalizedData;
  const options = input.options || {};
  const fieldData = {};
  const firstName = gd.inferFirstName();
  const surname = gd.inferLastNameAtDeath(options) || gd.inferLastName();
  if (firstName) fieldData.firstName = firstName;
  if (surname) fieldData.surname = surname;
  for (const [prefix, year, qualifier, enabled] of [
    ["born", gd.inferBirthYear(), gd.inferBirthDateQualifier(), options.search_gravminner_includeBirthYear],
    ["death", gd.inferDeathYear(), gd.inferDeathDateQualifier(), options.search_gravminner_includeDeathYear],
  ]) {
    if (enabled === false || !year) continue;
    const range = {};
    gd.setDatesUsingQualifier(range, year, qualifier);
    if (range.startYear > 0) fieldData[prefix + "FromYear"] = range.startYear;
    if (range.endYear > 0) fieldData[prefix + "ToYear"] = range.endYear;
  }
  return { fieldData: fieldData, selectData: {} };
}
export { buildSearchData };
