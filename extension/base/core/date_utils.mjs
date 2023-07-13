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

const threeLetterMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fullMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DateUtils = {
  monthStringToMonthNum: function (string) {
    if (!string || string.length < 1) {
      return 0;
    }

    let months = fullMonths;
    if (string.length == 3) {
      months = threeLetterMonths;
    }

    let lcString = string.toLowerCase();
    for (let monthIndex = 0; monthIndex < threeLetterMonths.length; monthIndex++) {
      if (lcString == months[monthIndex].toLowerCase()) {
        return monthIndex + 1;
      }
    }

    return 0;
  },

  // This returns a parsed data object
  parseDateString: function (string) {
    let result = {
      inputString: string,
      dayNum: 0,
      monthNum: 0,
      yearNum: 0,
      hasDay: false,
      hasMonth: false,
      isValid: false,
    };

    if (!string || string.length == 0) {
      return result;
    }

    if (typeof string !== "string") {
      return result;
    }

    // clean and trim the date string, this has usually been done already but being defensive
    let cleanString = string.replace(/\s+/g, " ").trim();
    if (cleanString.length == 0) {
      return result;
    }

    // sometimes on Ancestry.com.au there are dates like "Mar. 1912" or "10 Mar. 1912"
    // in cases like this remove the period
    cleanString = string.replace(/\.\s+/g, " ").trim();
    if (cleanString.length == 0) {
      return result;
    }

    result.cleanString = cleanString;

    if (string.length <= 4) {
      // it can only be a year
      let nonDigitIndex = cleanString.search(/[^0-9]/);
      if (nonDigitIndex == -1 && cleanString.length == 4) {
        let yearNum = parseInt(cleanString);
        if (!isNaN(yearNum)) {
          result.isValid = true;
          result.yearNum = yearNum;
        }
      }

      return result;
    }

    // check for a year range
    if (/^\d\d\d\d\-\d\d\d\d$/.test(cleanString) || /^\d\d\d\d\-\d\d$/.test(cleanString)) {
      // it is a year range,
      let startYearString = cleanString.substring(0, 4);
      let endYearString = cleanString.substring(5);
      if (endYearString.length == 2) {
        endYearString = startYearString.substring(0, 2) + endYearString;
      }

      let startYearNum = parseInt(startYearString);
      let endYearNum = parseInt(endYearString);
      if (isNaN(startYearNum) || isNaN(endYearNum)) {
        return result;
      }

      result.isRange = true;
      result.isValid = true;
      result.startYearNum = startYearNum;
      result.endYearNum = endYearNum;
      result.yearNum = startYearNum;
      return result;
    }

    // it is longer than 4 digits. The most common formats would be:
    // dd mmm yyyy
    // mmm yyyy
    if (/^\d\d? [a-zA-Z][a-zA-Z][a-zA-Z] \d\d\d\d$/.test(cleanString)) {
      let firstSpaceIndex = cleanString.indexOf(" ");
      let lastSpaceIndex = cleanString.lastIndexOf(" ");
      let dayString = cleanString.substring(0, firstSpaceIndex);
      let monthString = cleanString.substring(firstSpaceIndex + 1, lastSpaceIndex);
      let yearString = cleanString.substring(lastSpaceIndex + 1);
      let dayNum = parseInt(dayString);
      if (isNaN(dayNum) || !dayNum) {
        return result;
      }
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.dayNum = dayNum;
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasDay = true;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    } else if (/^[a-zA-Z][a-zA-Z][a-zA-Z] \d\d\d\d$/.test(cleanString)) {
      let firstSpaceIndex = cleanString.indexOf(" ");
      let monthString = cleanString.substring(0, firstSpaceIndex);
      let yearString = cleanString.substring(firstSpaceIndex + 1);
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    // Did not match the common formats, try less common ones
    if (/^\d\d? [a-zA-Z]+ \d\d\d\d$/.test(cleanString)) {
      let firstSpaceIndex = cleanString.indexOf(" ");
      let lastSpaceIndex = cleanString.lastIndexOf(" ");
      let dayString = cleanString.substring(0, firstSpaceIndex);
      let monthString = cleanString.substring(firstSpaceIndex + 1, lastSpaceIndex);
      let yearString = cleanString.substring(lastSpaceIndex + 1);
      let dayNum = parseInt(dayString);
      if (isNaN(dayNum) || !dayNum) {
        return result;
      }
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.dayNum = dayNum;
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasDay = true;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    // Not sure the format June 12, 1960 is ever used. WikiTree docs say it can be
    if (/^[a-zA-Z]+ \d\d?\, \d\d\d\d$/.test(cleanString)) {
      let firstSpaceIndex = cleanString.indexOf(" ");
      let lastSpaceIndex = cleanString.lastIndexOf(" ");
      let commaIndex = cleanString.indexOf(",");
      let monthString = cleanString.substring(0, firstSpaceIndex);
      let dayString = cleanString.substring(firstSpaceIndex + 1, commaIndex);
      let yearString = cleanString.substring(lastSpaceIndex + 1);
      let dayNum = parseInt(dayString);
      if (isNaN(dayNum) || !dayNum) {
        return result;
      }
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.dayNum = dayNum;
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasDay = true;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    // Sometimes we can get a date like: 27Aug1849
    // e.g.: https://www.familysearch.org/ark:/61903/1:1:27CB-J49
    if (/^\d\d?[a-zA-Z]+\d\d\d\d$/.test(cleanString)) {
      let firstLetterIndex = cleanString.search(/[a-zA-Z]/);
      if (firstLetterIndex == -1) {
        return result;
      }
      let dayString = cleanString.substring(0, firstLetterIndex);
      let remainder = cleanString.substring(firstLetterIndex);

      let yearIndex = remainder.search(/\d/);
      if (yearIndex == -1) {
        return result;
      }
      let monthString = remainder.substring(0, yearIndex);
      let yearString = remainder.substring(yearIndex);

      let dayNum = parseInt(dayString);
      if (isNaN(dayNum) || !dayNum) {
        return result;
      }
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.dayNum = dayNum;
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasDay = true;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    // Sometimes we can get a date like: 1849-08-27
    // e.g.: from newspapers.com
    if (/^\d\d\d\d\-\d\d\-\d\d$/.test(cleanString)) {
      let dateParts = cleanString.split("-");
      if (dateParts.length != 3) {
        return result;
      }

      let yearString = dateParts[0];
      let monthNumString = dateParts[1];
      let dayString = dateParts[2];

      let monthNum = parseInt(monthNumString);
      if (isNaN(monthNum) || !monthNum || monthNum < 1 || monthNum > 12) {
        return result;
      }

      let dayNum = parseInt(dayString);
      if (isNaN(dayNum) || !dayNum) {
        return result;
      }
      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }

      result.dayNum = dayNum;
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasDay = true;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    // Sometimes we can get a date like: July 1852 or Jul 1852
    if (/[a-zA-Z]+\s+\d\d\d\d$/.test(cleanString)) {
      let remainder = cleanString;

      let yearIndex = remainder.search(/\d/);
      if (yearIndex == -1) {
        return result;
      }
      let monthString = remainder.substring(0, yearIndex).trim();
      let yearString = remainder.substring(yearIndex).trim();

      let yearNum = parseInt(yearString);
      if (isNaN(yearNum) || !yearNum) {
        return result;
      }
      let monthNum = DateUtils.monthStringToMonthNum(monthString);
      if (monthNum == 0) {
        return result;
      }
      result.monthNum = monthNum;
      result.yearNum = yearNum;
      result.hasMonth = true;
      result.isValid = true;
      return result;
    }

    console.log("Unusual date format: " + cleanString);

    return result;
  },

  getStdDateString: function (parsedDate, monthStrings) {
    let string = "";
    if (!parsedDate.isValid) {
      return string;
    }

    if (parsedDate.isRange) {
      return parsedDate.startYearNum.toString() + "-" + parsedDate.endYearNum.toString();
    }

    if (parsedDate.hasDay) {
      string += parsedDate.dayNum.toString() + " ";
    }
    if (parsedDate.hasMonth) {
      string += monthStrings[parsedDate.monthNum - 1] + " ";
    }
    string += parsedDate.yearNum.toString();
    return string;
  },

  getStdShortFormDateString: function (parsedDate) {
    return DateUtils.getStdDateString(parsedDate, threeLetterMonths);
  },

  getStdLongFormDateString: function (parsedDate) {
    return DateUtils.getStdDateString(parsedDate, fullMonths);
  },

  getUsLongFormDateString: function (parsedDate) {
    if (!parsedDate.hasDay || !parsedDate.hasMonth || parsedDate.isRange) {
      return DateUtils.getStdDateString(parsedDate, fullMonths);
    }

    let string = fullMonths[parsedDate.monthNum - 1] + " " + parsedDate.dayNum.toString();
    string += ", " + parsedDate.yearNum.toString();
    return string;
  },

  getDayNumberNthString: function (dayNum) {
    let dayString = dayNum.toString();
    if (!dayString) {
      return "";
    }

    // account for 11th, 12th, 111th, 213th etc (not that dates get that big!)
    let isTeen = false;
    if (dayString.length >= 2) {
      if (dayString[dayString.length - 2] == "1") {
        isTeen = true;
      }
    }

    if (isTeen) {
      dayString += "th";
    } else {
      let lastDigit = dayString[dayString.length - 1];
      if (lastDigit == "1") {
        dayString += "st";
      } else if (lastDigit == "2") {
        dayString += "nd";
      } else if (lastDigit == "3") {
        dayString += "rd";
      } else {
        dayString += "th";
      }
    }

    return dayString;
  },

  getStdNthFormDateString: function (parsedDate) {
    if (!parsedDate.hasDay || !parsedDate.hasMonth || parsedDate.isRange) {
      return DateUtils.getStdDateString(parsedDate, fullMonths);
    }

    let dayString = DateUtils.getDayNumberNthString(parsedDate.dayNum);
    if (!dayString) {
      return DateUtils.getStdDateString(parsedDate, fullMonths);
    }

    let string = "the " + dayString + " of " + fullMonths[parsedDate.monthNum - 1];
    string += " " + parsedDate.yearNum.toString();
    return string;
  },

  getUsNthFormDateString: function (parsedDate) {
    if (!parsedDate.hasDay || !parsedDate.hasMonth || parsedDate.isRange) {
      return DateUtils.getStdDateString(parsedDate, fullMonths);
    }

    let dayString = DateUtils.getDayNumberNthString(parsedDate.dayNum);
    if (!dayString) {
      return DateUtils.getStdDateString(parsedDate, fullMonths);
    }

    let string = fullMonths[parsedDate.monthNum - 1] + " " + dayString;
    string += ", " + parsedDate.yearNum.toString();
    return string;
  },

  getParsedDateInDays: function (parsedDate) {
    if (!parsedDate.isValid) {
      return 0;
    }

    let days = parsedDate.yearNum * 365;
    // this is very simplified - currently we don't care about num days in month or leap years
    if (parsedDate.hasMonth) {
      days += (parsedDate.monthNum - 1) * 30;
    }
    if (parsedDate.hasDay) {
      days += parsedDate.dayNum - 1;
    }

    return days;
  },

  getWholeYearsBetweenDateStrings: function (dateString1, dateString2) {
    let parsedDate1 = DateUtils.parseDateString(dateString1);
    let parsedDate2 = DateUtils.parseDateString(dateString2);

    if (!parsedDate1.isValid || !parsedDate2.isValid) {
      return 0;
    }

    let date1Days = DateUtils.getParsedDateInDays(parsedDate1);
    let date2Days = DateUtils.getParsedDateInDays(parsedDate2);

    let diffInDays = date2Days - date1Days;
    return Math.floor(diffInDays / 365);
  },

  getDaysBetweenParsedDates: function (parsedDate1, parsedDate2) {
    if (!parsedDate1.isValid || !parsedDate2.isValid) {
      return 0;
    }

    let date1Days = DateUtils.getParsedDateInDays(parsedDate1);
    let date2Days = DateUtils.getParsedDateInDays(parsedDate2);

    let diffInDays = date2Days - date1Days;
    return diffInDays;
  },

  getDaysBetweenDateStrings: function (dateString1, dateString2) {
    let parsedDate1 = DateUtils.parseDateString(dateString1);
    let parsedDate2 = DateUtils.parseDateString(dateString2);

    return DateUtils.getDaysBetweenParsedDates(parsedDate1, parsedDate2);
  },

  getYearNumFromYearString: function (yearString) {
    if (Number.isFinite(yearString)) {
      return yearString; // just in case a number is passed in
    }

    if (!yearString) {
      return undefined;
    }

    let yearNum = parseInt(yearString);
    if (isNaN(yearNum) || yearNum == 0) {
      return undefined;
    }

    return yearNum;
  },

  getQuarterNumFromQuarterString: function (quarterString) {
    if (!quarterString) {
      return undefined;
    }

    if (!isNaN(quarterString)) {
      return quarterString; // already a number
    }

    let quarterNum = parseInt(quarterString);
    if (isNaN(quarterNum) || quarterNum == 0) {
      return undefined;
    }

    return quarterNum;
  },

  getDateStringFromYearMonthDay: function (year, month, day) {
    let dateString = "";
    if (day) {
      let dayString = day.toString();
      if (dayString) {
        dayString = dayString.replace(/^0*/, "");
        dateString += dayString;
      }
    }
    if (month) {
      let monthString = month;
      if (/^\d+$/.test(month)) {
        let monthNum = parseInt(month);
        if (!isNaN(monthNum)) {
          if (monthNum >= 1 && monthNum <= 12) {
            monthString = threeLetterMonths[monthNum - 1];
          }
        }
      }

      if (dateString) {
        dateString += " ";
      }
      dateString += monthString;
    }
    if (year) {
      if (dateString) {
        dateString += " ";
      }
      dateString += year;
    }

    return dateString;
  },

  compareParsedDates: function (parsedDateA, parsedDateB) {
    if (parsedDateA.isValid) {
      if (parsedDateB.isValid) {
        let dateADays = DateUtils.getParsedDateInDays(parsedDateA);
        let dateBDays = DateUtils.getParsedDateInDays(parsedDateB);

        return dateADays - dateBDays;
      } else {
        // if one has a date and the other doesn't then the one with the date comes first
        return -1;
      }
    } else if (parsedDateB.isValid) {
      return 1;
    }

    return 0;
  },

  compareDateStrings: function (dateStringA, dateStringB) {
    let parsedDateA = DateUtils.parseDateString(dateStringA);
    let parsedDateB = DateUtils.parseDateString(dateStringB);

    return DateUtils.compareParsedDates(parsedDateA, parsedDateB);
  },
};

export { DateUtils };
