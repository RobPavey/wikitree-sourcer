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

import { separateLastNameIntoParts } from "./wiewaswie_name_utils.mjs";

function buildSearchData(input) {
  const gd = input.generalizedData;
  const options = input.options;

  let fieldData = {
    utf8: true,
  };

  let forenames = gd.inferForenames();
  if (forenames) {
    fieldData["vm.GetSearchResultsParameters.PersonA.Voornaam"] = forenames;
  }

  let lastName = gd.inferLastName();
  if (lastName) {
    let lastNameParts = separateLastNameIntoParts(lastName);
    if (lastNameParts.lastName) {
      fieldData["vm.GetSearchResultsParameters.PersonA.Achternaam"] = lastNameParts.lastName;
    }
    if (lastNameParts.lastNamePrefix) {
      fieldData["vm.GetSearchResultsParameters.PersonA.Tussenvoegsel"] = lastNameParts.lastNamePrefix;
    }
    if (lastNameParts.patronym) {
      fieldData["vm.GetSearchResultsParameters.PersonA.Patroniem"] = lastNameParts.patronym;
    }
  }

  let range = gd.inferPossibleLifeYearRange();
  if (range) {
    if (range.startYear) {
      fieldData["vm.GetSearchResultsParameters.PeriodeVan"] = range.startYear;
    }
    if (range.endYear) {
      fieldData["vm.GetSearchResultsParameters.PeriodeTot"] = range.endYear;
    }
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
