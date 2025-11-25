/*
MIT License

Copyright (c) 2025 Robert M Pavey

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

import { NameUtils } from "./name_utils.mjs";
import { DataCache } from "./data_cache.mjs";

const GenderUtils = {
  getGenderFromDataCache: function (gd, dataCache, useLnabForMatch = true) {
    // search the data cache for the person
    let entry = DataCache.findClosestWikiTreeProfilePrioritizingFirstName(gd, dataCache, useLnabForMatch);
    if (entry) {
      return entry.generalizedData.personGender;
    }
  },

  getOrPredictGender: function (gd, allowPredict = false, dataCache = null, useLnabForMatch = true) {
    let gender = gd.inferPersonGender();
    if (gender) {
      return gender;
    }

    if (dataCache) {
      gender = this.getGenderFromDataCache(gd, dataCache, useLnabForMatch);
      if (gender) {
        return gender;
      }
    }

    if (allowPredict) {
      gender = NameUtils.predictGenderFromGivenNames(gd.inferForenames());
      if (gender) {
        return gender;
      }
    }

    return "";
  },
};

export { GenderUtils };
