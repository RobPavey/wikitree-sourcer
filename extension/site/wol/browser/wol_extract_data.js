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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

// The Watchtower Online Library (wol.jw.org) has the text of the publications of Jehovah's Witnesses
// (Watchtower and Awake! magazines, books, yearbooks, brochures etc.). Sourcer can cite an article ("document")
// page, e.g. https://wol.jw.org/en/wol/d/r1/lp-e/1978726
// All the data needed is in the hidden input fields that the library puts on each document page. These have
// the same ids in every language of the library.

function wolCleanText(text) {
  if (!text) {
    return "";
  }
  // The library puts zero-width spaces around dashes
  return text
    .replace(/[​‌‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wolGetInputValue(document, id) {
  const input = document.querySelector("input#" + id);
  if (!input) {
    return "";
  }
  return wolCleanText(input.getAttribute("value"));
}

// e.g. "w78 10/1 pp. 20-24", "yb74 pp. 128-191", "jv chap. 22 p. 444-p. 461 par. 2"
function wolGetPublicationReference(document) {
  const link = document.querySelector("li.documentLocation a");
  if (link) {
    return wolCleanText(link.textContent);
  }
  const item = document.querySelector("li.documentLocation");
  return item ? wolCleanText(item.textContent) : "";
}

// Returns { first, last } as numbers, or undefined
function wolParsePagesFromReference(reference) {
  if (!reference) {
    return undefined;
  }
  // The English forms, e.g. "w78 10/1 pp. 20-24", "yb74 p. 20" or "jv chap. 22 p. 444-p. 461 par. 2"
  let match = reference.match(/\bpp?\.\s*(\d+)(?:\s*[-\u2013]\s*(?:pp?\.\s*)?(\d+))?/);
  if (!match) {
    // Other languages have a different abbreviation for page, e.g. German "w79 1. 1. S. 20-23"
    match = reference.match(/\p{L}{1,4}\.\s*(\d+)(?:\s*[-\u2013]\s*(\d+))?\s*$/u);
  }
  if (!match) {
    return undefined;
  }
  const first = parseInt(match[1], 10);
  const last = match[2] ? parseInt(match[2], 10) : first;
  return { first: first, last: last };
}

// The text has a marker at the start of each page with the page number
function wolGetPagesFromPageMarkers(document) {
  const markers = document.querySelectorAll("span.pageNum[data-no]");
  let first = undefined;
  let last = undefined;
  for (let marker of markers) {
    const number = parseInt(marker.getAttribute("data-no"), 10);
    if (isNaN(number)) {
      continue;
    }
    if (first === undefined || number < first) {
      first = number;
    }
    if (last === undefined || number > last) {
      last = number;
    }
  }
  return first === undefined ? undefined : { first: first, last: last };
}

// Some articles have a byline in the paragraph after the title. e.g. "As told by Max Liebster" or
// "By Awake! correspondent in Germany". A life story can instead end with it, e.g.
// "And down to this day, Jehovah has done just that!—As told by Simone Arnold Liebster."
// The text is only recognized in English.
function wolGetByline(document) {
  const paragraphs = document.querySelectorAll("div.scalableui > p");
  for (let i = 0; i < paragraphs.length && i < 4; i++) {
    const paragraph = paragraphs[i];
    if (!paragraph.classList.contains("sa")) {
      continue;
    }
    const text = wolCleanText(paragraph.textContent);
    let match = text.match(/^as told by (.+)$/i);
    if (match) {
      return { type: "told by", name: match[1].trim() };
    }
    match = text.match(/^by (.+)$/i);
    if (match) {
      return { type: "by", name: match[1].trim() };
    }
  }

  // At the end the text has to follow a dash and end the paragraph, so that a mention in the text of the article
  // (e.g. a reference to another article "as told by ...") is not used.
  let numChecked = 0;
  for (let i = paragraphs.length - 1; i >= 0 && numChecked < 4; i--) {
    const text = wolCleanText(paragraphs[i].textContent);
    if (!text) {
      continue;
    }
    numChecked++;
    const match = text.match(/[\u2014\u2013-]\s*as told by ([^.\u2014\u2013]+?)\.?$/i);
    if (match) {
      return { type: "told by", name: match[1].trim() };
    }
  }
  return undefined;
}

function extractData(document, url) {
  let result = { url: url, success: false };

  // The search results page has class "search" and a document page has class "document"
  const article = document.querySelector("article#article");
  if (!article) {
    return result;
  }
  result.pageType = article.classList.contains("document") ? "document" : "other";
  if (result.pageType != "document") {
    return result;
  }

  const docId = wolGetInputValue(document, "docId");
  if (!docId) {
    return result;
  }
  result.docId = docId;

  let title = wolGetInputValue(document, "contentTitle");
  if (!title) {
    const heading = document.querySelector("div.scalableui > p.st, div.scalableui > h1");
    if (heading) {
      title = wolCleanText(heading.textContent);
    }
  }
  if (!title) {
    return result;
  }
  result.title = title;

  const parentTitle = wolGetInputValue(document, "parentTitle");
  if (parentTitle) {
    result.parentTitle = parentTitle;
  }

  // The symbol used in English, e.g. "w" for The Watchtower, "g" for Awake! or "yb74" for the 1974 Yearbook
  const pubSymbol = wolGetInputValue(document, "englishSym");
  if (pubSymbol) {
    result.pubSymbol = pubSymbol;
  }

  // e.g. "w78 10/1" for a magazine or the title of the book
  const description = wolGetInputValue(document, "documentDescription");
  if (description) {
    result.documentDescription = description;
  }

  // The issue date of a magazine e.g. "19781001" (or "201901" for an issue with just a month)
  const issue = wolGetInputValue(document, "issue");
  if (issue) {
    result.issue = issue;
  }

  // -1 if the document is not a chapter
  const chapNo = wolGetInputValue(document, "chapNo");
  if (chapNo && chapNo != "-1") {
    result.chapterNumber = chapNo;
  }

  const reference = wolGetPublicationReference(document);
  if (reference) {
    result.pubReference = reference;
  }

  let pages = wolParsePagesFromReference(reference);
  if (!pages) {
    // The reference may not be in English so look at the page markers. A document that is just a numbered
    // article (e.g. "mrt article 145") has the article number as its only page marker so that is not a page.
    pages = wolGetPagesFromPageMarkers(document);
    if (pages && pages.first == pages.last && String(pages.first) == result.chapterNumber) {
      pages = undefined;
    }
  }
  if (pages) {
    result.firstPage = pages.first;
    result.lastPage = pages.last;
  }

  const byline = wolGetByline(document);
  if (byline) {
    result.bylineType = byline.type;
    result.bylineName = byline.name;
  }

  // The library the page is in. e.g. English is locale "en", rsconf "r1", lib "lp-e". German is "de", "r10", "lp-x".
  const locale = wolGetInputValue(document, "contentLocale");
  const rsconf = wolGetInputValue(document, "contentRsconf");
  const lib = wolGetInputValue(document, "contentLib");
  const libLang = wolGetInputValue(document, "contentLibLang");
  if (locale) {
    result.locale = locale;
  }
  if (libLang) {
    result.libraryLanguage = libLang;
  }
  if (locale && rsconf && lib) {
    result.pageUrl = "https://wol.jw.org/" + locale + "/wol/d/" + rsconf + "/" + lib + "/" + docId;
  }

  // This is the link that the share button of the library gives, e.g.
  // https://www.jw.org/finder?wtlocale=E&docid=1978726&srctype=wol&srcid=share
  const shareUrl = wolGetInputValue(document, "shareBaseUrl");
  if (shareUrl) {
    result.shareUrl = shareUrl;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
