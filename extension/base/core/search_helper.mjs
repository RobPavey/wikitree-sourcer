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

import { dateQualifiers } from "./generalize_data_utils.mjs";

class SearchHelper {
  constructor(gd, options, runDate) {
    this.gd = gd;
    this.options = options;
    this.runDate = runDate;
    this.startYearPadForExact = 0;
    this.endYearPadForExact = 0;
    this.overrideQualifier = undefined;
  }

  getOptions() {
    return this.options;
  }

  clampRange(yearRange) {
    if (this.allowedDateRange) {
      let from = this.allowedDateRange.from;
      let to = this.allowedDateRange.to;
      if (yearRange.startYear < from) {
        yearRange.startYear = from;
      }
      if (yearRange.endYear > to) {
        yearRange.endYear = to;
      }
    }
  }
  getYearRangeFromYearNumAndQualifier(yearNum, wtsQualifier) {
    let startYear = yearNum;
    let endYear = yearNum;

    // can be used for "sameCollection"
    if (this.overrideQualifier !== undefined) {
      wtsQualifier = this.overrideQualifier;
    }

    switch (wtsQualifier) {
      case dateQualifiers.NONE:
        startYear = yearNum - 2;
        endYear = yearNum + 2;
        break;
      case dateQualifiers.EXACT:
        startYear = yearNum;
        // e.g. add an extra year to toYear because registration date could be after birth date
        endYear = yearNum + this.endYearPadForExact;
        break;
      case dateQualifiers.ABOUT:
        startYear = yearNum - 5;
        endYear = yearNum + 5;
        break;
      case dateQualifiers.BEFORE:
        startYear = yearNum - 5;
        endYear = yearNum;
        break;
      case dateQualifiers.AFTER:
        startYear = yearNum;
        endYear = yearNum + 5;
        break;
    }

    let yearRange = { startYear: startYear, endYear: endYear };

    this.clampRange(yearRange);

    return yearRange;
  }

  getYearRangeFromYearNumAndExactness(yearNum, exactness) {
    let startYear = yearNum;
    let endYear = yearNum;

    let plusOrMinus = exactness;
    if (exactness == "exact") {
      plusOrMinus = 0;
    }

    if (!Number.isFinite(plusOrMinus)) {
      // should never happen
      plusOrMinus = parseInt(plusOrMinus);

      if (isNaN(plusOrMinus) || plusOrMinus > 100 || plusOrMinus < -100) {
        return null;
      }
    }

    if (plusOrMinus != undefined) {
      startYear -= plusOrMinus;
      endYear += plusOrMinus;
    }

    let yearRange = { startYear: startYear, endYear: endYear };

    this.clampRange(yearRange);

    return yearRange;
  }

  getYearRangeFromYearNumQualifierAndExactness(yearNum, qualifier, exactness) {
    if (exactness == "auto") {
      return this.getYearRangeFromYearNumAndQualifier(yearNum, qualifier);
    } else {
      return this.getYearRangeFromYearNumAndExactness(yearNum, exactness);
    }
  }

  adjustYearRangeForQualifiersAndExactness(range, startExactness, endExactness, startQualifier, endQualifier) {
    if (!range || range.startYear === undefined || range.endYear === undefined || range.startYear > range.endYear) {
      return;
    }

    let startRange = this.getYearRangeFromYearNumQualifierAndExactness(range.startYear, startQualifier, startExactness);
    if (startRange) {
      range.startYear = startRange.startYear;
    }
    let endRange = this.getYearRangeFromYearNumQualifierAndExactness(range.endYear, endQualifier, endExactness);
    if (endRange) {
      range.endYear = endRange.endYear;
    }
  }

  getYearRangeForYearStringQualifiersAndExactness(yearString, qualifier, exactness) {
    if (!yearString || typeof yearString !== "string") {
      return null;
    }

    const yearNum = parseInt(yearString);
    if (isNaN(yearNum) || yearNum > 3000 || yearNum < 0) {
      return null;
    }

    return this.getYearRangeFromYearNumQualifierAndExactness(yearNum, qualifier, exactness);
  }

  getYearRangeForAgeToDeath(startAge, birthExactness, deathExactness) {
    const maxLifespan = Number(this.options.search_general_maxLifespan);
    let lifeRange = this.gd.inferPossibleLifeYearRange(maxLifespan, this.runDate);
    if (lifeRange.startYear && lifeRange.endYear) {
      lifeRange.startYear = Math.min(lifeRange.startYear + startAge, lifeRange.endYear);

      let startExactness = birthExactness;
      let endExactness = deathExactness;
      let startQualifier = this.gd.inferBirthDateQualifier();
      let endQualifier = this.gd.inferDeathDateQualifier();

      if (startExactness == "none" || endExactness == "none") {
        return null;
      }

      this.adjustYearRangeForQualifiersAndExactness(
        lifeRange,
        startExactness,
        endExactness,
        startQualifier,
        endQualifier
      );
      return lifeRange;
    }
    return null;
  }

  getYearRangeForBirth(birthExactness) {
    return this.getYearRangeForYearStringQualifiersAndExactness(
      this.gd.inferBirthYear(),
      this.gd.inferBirthDateQualifier(),
      birthExactness
    );
  }

  getYearRangeForDeath(deathExactness) {
    return this.getYearRangeForYearStringQualifiersAndExactness(
      this.gd.inferDeathYear(),
      this.gd.inferDeathDateQualifier(),
      deathExactness
    );
  }

  getYearRangeForEvent(exactness) {
    return this.getYearRangeForYearStringQualifiersAndExactness(
      this.gd.inferEventYear(),
      this.gd.inferEventDateQualifier(),
      exactness
    );
  }

  getYearRangeForLifespan(birthExactness, deathExactness, birthOffset = 0) {
    const maxLifespan = Number(this.options.search_general_maxLifespan);
    let range = this.gd.inferPossibleLifeYearRange(maxLifespan, this.runDate);
    if (range) {
      if (range.startYear) {
        let startNum = Number(range.startYear);
        if (startNum) {
          startNum += birthOffset;
          range.startYear = startNum.toString();
        }
      }
    }

    let birthqualifier = this.gd.inferBirthDateQualifier();
    let deathqualifier = this.gd.inferDeathDateQualifier();
    if (!birthqualifier) {
      birthqualifier = dateQualifiers.NONE;
    }
    if (!deathqualifier) {
      deathqualifier = dateQualifiers.NONE;
    }

    this.adjustYearRangeForQualifiersAndExactness(
      range,
      birthExactness,
      deathExactness,
      birthqualifier,
      deathqualifier
    );

    return range;
  }

  setAllowedDateRange(range) {
    // range should either be undefined or have "from" and "to" properties as in collections
    this.allowedDateRange = range;
  }
}

export { SearchHelper };
