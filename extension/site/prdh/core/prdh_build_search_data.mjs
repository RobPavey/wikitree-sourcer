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

  let fieldData = {};
  let selectData = {};

  // The keys are the element ids on the PRDH "Search for an individual" form
  const lastName = gd.inferLastName();
  if (lastName) {
    fieldData["MainContent_MainContent_NomMentionTextBox"] = lastName;
  }

  const forenames = gd.inferForenames();
  if (forenames) {
    fieldData["MainContent_MainContent_PrenomMentionTextBox"] = forenames;
  }

  // PRDH covers 1621-1861 (marriages to 1871) so only use the life range inside that
  const range = gd.inferPossibleLifeYearRange(100, new Date(), 0);
  if (range && range.startYear && range.endYear && range.startYear <= 1871 && range.endYear >= 1621) {
    fieldData["MainContent_MainContent_AnneeMinTextBox"] = String(Math.max(range.startYear, 1621));
    fieldData["MainContent_MainContent_AnneeMaxTextBox"] = String(Math.min(range.endYear, 1871));
  }

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
