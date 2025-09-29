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
import { StringUtils } from "../../../base/core/string_utils.mjs";

// These date regexes should be searched in this order;
const dateRegExes = [
  /(?<day>\d{1,2})(?:st|nd|rd|th|:)?[\s\-](?<monthStr>[^\d\s]+)[\s\-](?<year>\d{2,4})/,
  //  02 Dec 1792
  //  7 Jul 1850
  //  17-Jun-06
  //  1st October 1891
  //  den 23 Dcbr: 1794
  //  1798, 5 Augustus 1798
  //  1775, 5 Nov: 1775
  //  1779, 18 Julij 1779
  //  1788, 10 Vebriarij 1788
  //  1810, den 20 dito 1810

  /(?<day>\d{1,2})[\.\-](?<month>\d{1,2})[\.\-](?<year>\d{2,4})/,
  //  9.8.1795,
  //  21.2.96,
  //  4-11-1827

  /(?<year>\d{4}),?\s[^\s]+\s(?<day>\d{1,2})[^\s]*\s(?<monthStr>[^\s]+)/,
  //  1789, den 13 7br
  //  1772, den 15 9br:
  //  1775, den 17 Xbr
  //  1785, den 15 Maij
  //  1748, den 5 Meij
  //  1813, den 7den Maart 1813
  //  1814, den 10en November 1814
  //  1723, [d]en 31ste dito (October)
  //  1723, [d]en 31ste October
  //  1732, item (den 3d. Aug)
  //  1732, den 3d. Aug

  /^(?<year>\d{4})?,\s(?<day>\d{1,2})[^\s]*\s(?<monthStr>[^\s]+)/,
  //  1858, 14th Augt
  //  , 14th Augt
  //  1702, ditto (12e Augustus)
  //  1702, 12e Augustus

  /^(?<year>\d{4})?,\s(?<monthStr>[^\s-]+)[\s-](?<day>\d{1,2})[^\s]*(?:\s|$)/,
  //  1899, Feb 25th
  //  1831, Oct-12
  //  1858, June 28th
  //  , June 28th
  /^(?<monthStr>[^\d\s]+)\s(?<day>\d{1,2})[^\s]*\s(?<year>\d{4})/,
  // May 26th 1904

  /(?<year>\d{4})/,
];

const threeLetterMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const montSet = new Set(threeLetterMonths);
const monthMap = new Map([
  ["maa", "mar"],
  ["mae", "mar"],
  ["mai", "may"],
  ["mei", "may"],
  ["okt", "oct"],
  ["veb", "feb"],
  ["dcb", "dec"],
  ["des", "dec"],
]);

function cleanDateStr(dateStr) {
  // Attempt to convert some of the eGGSA dates into something Sourcer's DateUtils would understand

  // First, we replace any "dito (text)" (or with two t's) in with just "text"
  const str = dateStr.replace(/(?:[Dd]itt?o|item) \(([^)]+)\)/, "$1");

  for (const re of dateRegExes) {
    // console.log(`dateStr re:${re}`);
    const match = str.match(re);
    if (match) {
      // console.log(`cleanDate match '${dateStr}' => `, match.groups);
      let monthStr;
      if (match.groups.monthStr) {
        monthStr = match.groups.monthStr.substring(0, 3).toLowerCase();
        monthStr = monthStr
          .replace(/(vii|7)be?r[:.]?/, "sep")
          .replace(/(vi|8)be?r[:.]?/, "oct")
          .replace(/(ix|9)be?r[:.]?/, "nov")
          .replace(/(x|10)be?r[:.]?/, "dec");
        if (monthMap.has(monthStr)) {
          monthStr = monthMap.get(monthStr);
        }
        if (!montSet.has(monthStr)) {
          // console.log(`Unknown month '${monthStr}' extracted from ${dateStr}`);
          break;
        }
      } else if (match.groups.month) {
        monthStr = threeLetterMonths[+match.groups.month - 1];
      }
      if (monthStr) monthStr = StringUtils.toInitialCaps(monthStr);

      let year = match.groups.year;
      if (year?.length == 2) year = "19" + year;

      // console.log(`day=${match.groups.day}, monthStr=${monthStr}, year=${year}`);
      let result = match.groups.day || "";

      addToResult(monthStr);
      addToResult(year);
      return result;

      function addToResult(str) {
        if (!str) return;
        result = result ? result + " " + str : str;
      }
    }
  }
  return dateStr;
}

function getHighlightStyle() {
  return "background-color: palegoldenrod";
}

function getPageType(document) {
  let pageType = "";
  const titleElement = document.querySelector("#content h2");
  let sourceTitle;
  if (titleElement) {
    sourceTitle = titleElement.textContent.replaceAll(/\s+/g, " ").trim();
    pageType = sourceTitle.split(/[, ]/)[0];
  }
  if (!["Baptism", "Marriage", "Burial"].includes(pageType)) {
    pageType = "Unknown";
  }
  return [pageType, sourceTitle];
}

function getRowSelector(pageType) {
  return ".record-start";
}

function getSelectedRow(document) {
  const selectedRows = document.querySelector("[style*='" + getHighlightStyle() + "']");
  return selectedRows;
}

function isRecordOfType(row, type) {
  if (row.id == "content") return false;
  // console.log(`isRecordOfType ${type}: ${row.textContent}`);
  switch (type) {
    case "Baptism":
      // return row.textContent.includes("Baptised");
      return /baptised/i.test(row.textContent);
    case "Marriage":
      // return row.textContent.includes("marriage");
      return /marriage/i.test(row.textContent);
    case "Burial":
      return /buried:|death:|died:|grave/i.test(row.textContent);
  }
}

// Standard HTML5 tags
const allowedHtmlTags = new Set([
  "A",
  "ABBR",
  "ADDRESS",
  "AREA",
  "ARTICLE",
  "ASIDE",
  "AUDIO",
  "B",
  "BASE",
  "BDI",
  "BDO",
  "BLOCKQUOTE",
  "BODY",
  "BR",
  "BUTTON",
  "CANVAS",
  "CAPTION",
  "CITE",
  "CODE",
  "COL",
  "COLGROUP",
  "DATA",
  "DATALIST",
  "DD",
  "DEL",
  "DETAILS",
  "DFN",
  "DIALOG",
  "DIV",
  "DL",
  "DT",
  "EM",
  "EMBED",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEAD",
  "HEADER",
  "HR",
  "HTML",
  "I",
  "IFRAME",
  "IMG",
  "INPUT",
  "INS",
  "KBD",
  "LABEL",
  "LEGEND",
  "LI",
  "LINK",
  "MAIN",
  "MAP",
  "MARK",
  "MATH",
  "META",
  "METER",
  "NAV",
  "NOSCRIPT",
  "OBJECT",
  "OL",
  "OPTGROUP",
  "OPTION",
  "OUTPUT",
  "P",
  "PARAM",
  "PICTURE",
  "PRE",
  "PROGRESS",
  "Q",
  "RP",
  "RT",
  "RUBY",
  "S",
  "SAMP",
  "SCRIPT",
  "SECTION",
  "SELECT",
  "SMALL",
  "SOURCE",
  "SPAN",
  "STRONG",
  "STYLE",
  "SUB",
  "SUMMARY",
  "SUP",
  "SVG",
  "TABLE",
  "TBODY",
  "TD",
  "TEMPLATE",
  "TEXTAREA",
  "TFOOT",
  "TH",
  "THEAD",
  "TIME",
  "TITLE",
  "TR",
  "TRACK",
  "U",
  "UL",
  "VAR",
  "VIDEO",
  "WBR",
]);

function stripUnknownTags(root) {
  root.querySelectorAll("*").forEach((el) => {
    if (!allowedHtmlTags.has(el.tagName)) {
      // unwrap the element but keep its children
      el.replaceWith(...el.childNodes);
    }
  });
}

const Role = {
  BRIDE: "bride",
  CHILD: "child",
  FATHER: "father",
  GROOM: "groom",
  MOTHER: "mother",
  PARENT: "parent",
  PRIMARY: "primary",
  WITNESS: "witness",
};

export {
  cleanDateStr,
  getHighlightStyle,
  getPageType,
  getRowSelector,
  getSelectedRow,
  isRecordOfType,
  Role,
  stripUnknownTags,
};
