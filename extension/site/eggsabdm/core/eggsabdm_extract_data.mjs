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

// import { RT } from "../../../base/core/record_type.mjs";
import * as EggsaBdmCommon from "./eggsabdm_common.mjs";

function findPossibleRecords(document, pageType) {
  let records = [];
  const rowSelector = EggsaBdmCommon.getRowSelector(pageType);
  if (rowSelector) {
    records = document.querySelectorAll(rowSelector);
  }
  return records;
}

function extractField(str, regex) {
  const match = str.match(regex);
  return match
    ? match[1] // skip match[0] (the full match)
        .replaceAll(/[\[\]]/g, "") // strip square brackets
        .replaceAll(/\s+/g, " ") // strip extra whitespace and ensure ' ', not nbsp
        .replaceAll(/\s*,\s*/g, ", ") // standardise commas, i.e. <word>,<space>
        .trim()
    : "";
}

function clearEmphasis(html) {
  return html.replaceAll(/<\/?strong>|<\/?b>|<\/?span[^>]*>/g, "");
}

const baptismFields = [
  { name: "nameStr", re: /\s*([^<]+)\s*<br>Baptised:/ },
  { name: "baptismDateStr", re: /Baptised:\s*([^<]+)\s*<br>/ },
  { name: "bornDateStr", re: /Born:\s*([^<]+)\s*<br>/ },
  { name: "father", re: /Father:\s*([^<]+)\s*<br>/ },
  { name: "mother", re: /Mother:\s*([^<]+)\s*<br>/ },
  { name: "parentsStr", re: /(?:Parents|[Ss]on of|[Dd]aughter(?: of)):\s*([^<]+)\s*<br>/ },
  { name: "witnessStr", re: /Witnesses:\s*([^<]+)\s*<br>/ },
];

function parseBaptismRecord(recordHtml, result) {
  if (!recordHtml) return;
  for (const field of baptismFields) {
    result[field.name] = extractField(recordHtml, field.re);
  }
}

const marriageFields = [
  { name: "brideAgeStr", re: /(?:[Mm]et|[Aa]nd)\s*<br>(?:(?!<br>).*?<br>)*?\s*(?:[Aa]ge:|[Oo]ud)[^<]*?(\d+)/ }, // the number in the line (after met or and) that starts with age
  { name: "brideStr", re: /(?:[Mm]et|[Aa]nd)\s*<br>([^<]+)<br>/ }, // the first line after 'met' or 'and'
  { name: "groomAgeStr", re: /<br>\s*(?:[Aa]ge:|[Oo]ud)[^\d<]*(\d+).*?(?:[Aa]nd|[Mm]et)\s*<br>/ }, // the number in the line (before met or and) that starts with age
  { name: "groomStr", re: /(?:^|<br>)([^\d<]+)(?=<br>)/ }, // the first line without a digit
  { name: "marriageDateStr", re: /^(?:\s*<br>)*\s*([^<]+)\s*<br>/ }, // the first non-empty line
  { name: "occupation", re: /<br>[Oo]ccupation:\s*([^<]+)<br>/ },
  { name: "witnessStr", re: /witnessed by:\s*([^<]+)\s*<br>/i },
];

function parseMarriageRecord(recordHtml, result) {
  if (!recordHtml) return;
  for (const field of marriageFields) {
    result[field.name] = extractField(recordHtml, field.re);
  }
}

const burielFields = [
  { name: "ageAtDeathStr", re: /Age at death:\s*([^<]+)\s*<br>/ },
  { name: "bornDateStr", re: /Born:\s*([^<]+)\s*<br>/ },
  { name: "burialDateStr", re: /Buried:\s*([^<]+)\s*<br>/ },
  { name: "deathDateStr", re: /Died:\s*([^<]+)\s*<br>/ },
  { name: "lnab", re: /<br>geb.\s*([^<]+)<br>/ },
  { name: "nameStr", re: /(?:^|<br>)([^\d<]+)(?=<br>)/ },
  { name: "occupation", re: /<br>[Oo]ccupation:\s*([^<]+)<br>/ },
  { name: "placeOfDeath", re: /Place of death:\s*([^<]+)\s*<br>/ },
  { name: "residence", re: /Residence:\s*([^<]+)\s*<br>/ },
  { name: "witnessStr", re: /Witnesses:\s*([^<]+)\s*<br>/ },
];

function parseBurialRecord(recordHtml, result) {
  if (!recordHtml) return;
  for (const field of burielFields) {
    result[field.name] = extractField(recordHtml, field.re);
  }
}

function addPeriodIfnone(text) {
  return text && text.at(-1) != "." ? (text += ".") : text;
}

function getSearchParameters(document, pageType) {
  const paragraphs = document.querySelectorAll("p");

  let resultParagraph = null;
  for (const p of paragraphs) {
    if (p.textContent.includes("Your search for")) {
      if (pageType == "Marriage") {
        // get the next paragraph sibling
        let next = p.nextElementSibling;
        if (next && next.tagName === "P") {
          resultParagraph = next;
        }
      } else {
        resultParagraph = p;
      }
      break; // stop once found
    }
  }
  const text = resultParagraph
    ? resultParagraph.textContent.replaceAll(/\s+/g, " ").replace("Your search for ", "").trim()
    : "";

  return addPeriodIfnone(text);
}

const TEXT_NODE = typeof Node !== "undefined" ? Node.TEXT_NODE : 3;

function extractData(document, url) {
  const result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;
  const [pageType, sourceTitle] = EggsaBdmCommon.getPageType(document);
  if (pageType == "Unkown") {
    // result.overrideFailureMessage = `This page does not contain any ${pageType} record we could find.`;
    return result;
  }

  let selectedRow = EggsaBdmCommon.getSelectedRow(document);
  // console.log(selectedRow);
  if (!selectedRow) {
    const possibleRecords = findPossibleRecords(document, pageType);
    // console.log(`possible ${pageType} records`, possibleRecords);
    if (possibleRecords.length == 1) {
      selectedRow = possibleRecords[0];
    } else {
      if (possibleRecords.length == 0) {
        result.overrideFailureMessage =
          "This page looks like eGGSA BDM search results, but " +
          `it does not contain any ${pageType} record we could find.`;
      } else {
        result.overrideFailureMessage =
          `While this page does look like an eGGSA ${pageType} search result containing ${possibleRecords.length} ` +
          `${pageType} records, you need to select one of them by clicking on it.`;
        console.log(`Found ${possibleRecords.length} records - user must select one`);
      }
      return result;
    }
  }
  // console.log(selectedRow.innerHTML);

  const recordHtml = clearEmphasis(selectedRow.innerHTML);
  // console.log("sanitised:", recordHtml);
  switch (pageType) {
    case "Baptism":
      parseBaptismRecord(recordHtml, result);
      break;
    case "Marriage":
      parseMarriageRecord(recordHtml, result);
      break;
    case "Burial":
      parseBurialRecord(recordHtml, result);
      break;
  }
  const source = selectedRow.querySelector(".sourceText");
  if (source) {
    const clone = source.cloneNode(true);
    // Replace obsolete, non-functioning eggsa links to grave images with a generic link to
    // the eggsa graves search page
    clone.querySelectorAll('a[href*="http://www.eggsa.org/library/main"]').forEach((a) => {
      a.href = "https://www.graves.eggsa.org/";
    });
    // Remove "See also <heemkring URL>" from the source since heemkring.org.za no longer exists.
    clone.querySelectorAll('a[href*="heemkring.org.za"]').forEach((link) => {
      const prev = link.previousSibling;
      if (prev && prev.nodeType === TEXT_NODE) {
        const newTextContent = prev.textContent.replace(/\s*See also\s*$/, "");
        if (newTextContent == "") {
          prev.remove();
        } else {
          prev.textContent = newTextContent;
        }
      }
      link.remove();
    });

    result.source = addPeriodIfnone(clearEmphasis(clone.innerHTML));
  }
  result.sourceTitle = sourceTitle;
  result.searchParameters = getSearchParameters(document, pageType);

  result.eggsaPageType = pageType;
  result.success = true;

  // console.log("extracted:", result);

  return result;
}

export { extractData };
