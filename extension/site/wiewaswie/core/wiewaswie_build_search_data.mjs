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
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;
  const searchParameters = input.searchParameters;
  const options = input.options;
  const runDate = input.runDate;

  let fieldData = {};
  let selectData = {};

  if (gd.collectionData && gd.collectionData.nameParts) {
    let nameParts = gd.collectionData.nameParts;
    if (nameParts.forenames && nameParts.forenames != "N.N." && nameParts.forenames != "NN") {
      fieldData["vm.GetSearchResultsParameters.PersonA.Voornaam"] = nameParts.forenames;
    }
    if (nameParts.lastNamePrefix) {
      fieldData["vm.GetSearchResultsParameters.PersonA.Tussenvoegsel"] = nameParts.lastNamePrefix;
    }
    if (nameParts.lastName && nameParts.lastName != "N.N." && nameParts.lastName != "NN") {
      fieldData["vm.GetSearchResultsParameters.PersonA.Achternaam"] = nameParts.lastName;
    }
    if (nameParts.patronym) {
      fieldData["vm.GetSearchResultsParameters.PersonA.Patroniem"] = nameParts.patronym;
    }
    if (nameParts.fullName) {
      // should only happen if the name is not broken into parts at all
      let forenames = StringUtils.getWordsBeforeLastWord(nameParts.fullName);
      let lastName = StringUtils.getLastWord(nameParts.fullName);
      let patronym = "";
      if (lastName && lastName == "N.N.") {
        lastName = "";
      }
      if (forenames) {
        fieldData["vm.GetSearchResultsParameters.PersonA.Voornaam"] = forenames;
      }
      if (lastName) {
        fieldData["vm.GetSearchResultsParameters.PersonA.Achternaam"] = lastName;
      }
    }
  } else {
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
  }

  if (typeOfSearch == "SameCollection") {
    let year = gd.inferEventYear();
    if (year) {
      fieldData["vm.GetSearchResultsParameters.PeriodeVan"] = year;
      fieldData["vm.GetSearchResultsParameters.PeriodeTot"] = year;
    }
  } else {
    const maxLifespan = Number(options.search_general_maxLifespan);
    let range = gd.inferPossibleLifeYearRange(maxLifespan, runDate);
    if (range) {
      if (range.startYear) {
        fieldData["vm.GetSearchResultsParameters.PeriodeVan"] = range.startYear;
      }
      if (range.endYear) {
        fieldData["vm.GetSearchResultsParameters.PeriodeTot"] = range.endYear;
      }
    }
  }

  if (typeOfSearch == "SpecifiedParameters") {
    if (searchParameters) {
      if (searchParameters.place && searchParameters.place != "<none>") {
        fieldData["vm.GetSearchResultsParameters.Plaats"] = searchParameters.place;
      }
    }
  } else if (typeOfSearch == "SameCollection") {
    let collectionData = gd.collectionData;
    if (collectionData) {
      if (collectionData.place) {
        fieldData["vm.GetSearchResultsParameters.Plaats"] = collectionData.place;
      }

      if (gd.collectionData.id) {
        let sourceType = RC.mapCollectionId(
          gd.sourceOfData,
          gd.collectionData.id,
          "wiewaswie",
          gd.inferEventCountry(),
          gd.inferEventYear()
        );

        if (sourceType) {
          selectData["vm.CurrentGetSearchResultsParameters.DocumentType"] = sourceType;
        }
      }
    }
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
    selectData: selectData,
  };

  return result;
}

export { buildSearchData };
