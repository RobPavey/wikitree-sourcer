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

import { DateObj } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

function readNbDate(value) {
  if (!value || typeof value !== "string") return undefined;
  let text = value.trim();
  const result = new DateObj();
  result.setDateAndQualifierFromString(text);
  text = result.getDateString();
  if (!text) return undefined;
  let parts = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(text);
  if (parts) text = [parts[3], parts[2], parts[1]].join(".");
  parts = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  if (parts) {
    const [, d, m, y] = parts;
    const date = new Date(0);
    date.setUTCFullYear(Number(y), Number(m) - 1, Number(d));
    if (
      !Number(y) ||
      Number(m) < 1 ||
      Number(m) > 12 ||
      Number(d) < 1 ||
      date.getUTCMonth() !== Number(m) - 1 ||
      date.getUTCDate() !== Number(d)
    )
      return undefined;
    text = DateUtils.getDateStringFromYearMonthDay(Number(y), Number(m), Number(d));
  }
  const norwegianMonths = {
    januar: "January",
    februar: "February",
    mars: "March",
    april: "April",
    mai: "May",
    juni: "June",
    juli: "July",
    august: "August",
    september: "September",
    oktober: "October",
    november: "November",
    desember: "December",
  };
  text = text.replace(/[a-zæøå]+/gi, (word) => norwegianMonths[word.toLowerCase()] || word);
  const parsed = DateUtils.parseDateString(text);
  if (!parsed.isValid || !parsed.yearNum || parsed.isRange) return undefined;
  if (parsed.hasDay) {
    const date = new Date(0);
    date.setUTCFullYear(parsed.yearNum, parsed.monthNum - 1, parsed.dayNum);
    if (date.getUTCMonth() !== parsed.monthNum - 1 || date.getUTCDate() !== parsed.dayNum) return undefined;
  }
  const normalized = DateUtils.getStdShortFormDateString(parsed);
  if (/^\d{4}$/.test(normalized)) {
    result.yearString = normalized;
    delete result.dateString;
  } else result.dateString = normalized;
  return result;
}
function dateText(date, preposition = false) {
  return date ? date.getFormattedStringForCitationOrNarrative("long", "none", preposition) : "";
}
export { readNbDate, dateText };
