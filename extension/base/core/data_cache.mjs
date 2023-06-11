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

import { GeneralizedData } from "./generalize_data_utils.mjs";

const DataCache = {
  getLcFirstAndLastNameFromGeneralizedData: function (gd, useLnab) {
    let firstNameMatch = undefined;
    let firstName = gd.inferFirstName();
    if (firstName) {
      firstName = firstName.toLowerCase();
    }

    let lastName = useLnab ? gd.lastNameAtBirth : gd.lastNameAtDeath;
    if (!lastName && gd.name) {
      lastName = gd.name.inferLastName();
    }

    if (lastName) {
      lastName = lastName.toLowerCase();
    }

    return { firstName: firstName, lastName: lastName };
  },

  findClosestWikiTreeProfilePrioritizingFirstName: function (generalizedData, dataCache, useLnab) {
    let result = undefined;

    if (dataCache && dataCache.wikiTreeProfileCache) {
      let firstNameMatch = undefined;

      let names = DataCache.getLcFirstAndLastNameFromGeneralizedData(generalizedData, useLnab);

      for (let entry of dataCache.wikiTreeProfileCache.items) {
        let gd = GeneralizedData.createFromPlainObject(entry.generalizedData);
        let dataNames = DataCache.getLcFirstAndLastNameFromGeneralizedData(gd, useLnab);

        if (dataNames.firstName == names.firstName) {
          if (dataNames.lastName == names.lastName) {
            return entry;
          }

          if (!firstNameMatch) {
            firstNameMatch = entry;
          }
        }
      }

      result = firstNameMatch;
    }

    return result;
  },
};

export { DataCache };
