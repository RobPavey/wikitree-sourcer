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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

function buildGbooksUrl(ed, builder) {
  if (ed.shareLink && ed.urlPageNumber) {
    // "https://www.google.com/books/edition/Calendar_of_State_Papers_Domestic_Series/Qw4SAAAAYAAJ?hl=en&gbpv=1&pg=PR3&printsec=frontcover"

    let link = ed.shareLink;
    let regexp = new RegExp("\\&pg\\=[A-Z0-9]+");
    link = link.replace(regexp, "&pg=" + ed.urlPageNumber);
    return link;
  }
  if (ed.pageLink) {
    return ed.pageLink;
  }
  if (ed.shareLink) {
    return ed.shareLink;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let title = "";
  if (ed.title) {
    title += ed.title;
  } else if (ed.headTitle) {
    title += ed.headTitle;
  }
  let author = ed.author;
  if (!author && ed.authors && ed.authors.length > 0) {
    author = ed.authors[0];
  }
  let subtitle = ed.subtitle;

  let sourceTitle = "";
  if (author && title && subtitle) {
    sourceTitle = author + ", ''" + title + ": " + subtitle + "''";
  } else if (author && title) {
    sourceTitle = author + ", ''" + title + "''";
  } else if (title && subtitle) {
    sourceTitle = "''" + title + ": " + subtitle + "''";
  } else if (title) {
    sourceTitle = "''" + title + "''";
  }
  if (sourceTitle) {
    builder.sourceTitle = sourceTitle;
    builder.putSourceTitleInQuotes = false;
  }
}

function buildSourceReference(ed, gd, builder) {
  let string = "";
  function addPart(part) {
    if (part) {
      if (string) {
        string += ", ";
      }
      string += part;
    }
  }
  addPart(ed.publisher);
  addPart(ed.date);

  // if the URL includes a page then we can refer to that:
  if (ed.pageNumber) {
    addPart("page " + ed.pageNumber);
  } else {
    let url = buildGbooksUrl(ed, builder);
    let pageNumber = url.replace(/^.*[\?\&]pg\=([^\&]+).*$/, "$1");
    if (pageNumber && pageNumber != url) {
      if (pageNumber.startsWith("PA")) {
        pageNumber = pageNumber.substring(2);
      }
      addPart("page " + pageNumber);
    }
  }

  builder.sourceReference = string;
}

function buildRecordLink(ed, gd, builder) {
  var gbooksUrl = buildGbooksUrl(ed, builder);

  let recordLink = "[" + gbooksUrl + " Google Books]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
