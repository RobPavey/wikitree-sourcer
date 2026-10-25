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

const monthNames = [
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

// The issue date of a magazine on the library is "19781001" for an issue on a particular day or "201901" for an
// issue for a month. Returns an object with the year, month and day (the month and day may be undefined) or
// undefined if the string is not a date.
function parseIssueDate(issue) {
  if (!issue) {
    return undefined;
  }
  const match = issue.match(/^(\d{4})(\d{2})(\d{2})?$/);
  if (!match) {
    return undefined;
  }
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    return undefined;
  }
  return {
    year: match[1],
    month: month,
    day: match[3] ? parseInt(match[3], 10) : undefined,
  };
}

// e.g. "19781001" -> "1 October 1978", "201901" -> "January 2019"
function formatIssueDate(issue) {
  const parts = parseIssueDate(issue);
  if (!parts) {
    return "";
  }
  let result = monthNames[parts.month - 1] + " " + parts.year;
  if (parts.day) {
    result = parts.day + " " + result;
  }
  return result;
}

// The title of the magazine or book that a document is in. For a magazine the library gives the title with the year,
// e.g. "The Watchtower Announcing Jehovah’s Kingdom—1978" or "Awake!—1993" or in German "Der Wachtturm 1979".
function getPublicationTitle(ed) {
  let title = ed.parentTitle ? ed.parentTitle : ed.documentDescription;
  if (!title) {
    return "";
  }
  if (ed.issue) {
    title = title.replace(/\s*[\u2014\u2013-]?\s*\d{4}$/, "");
  }
  return title;
}

export { formatIssueDate, getPublicationTitle };
