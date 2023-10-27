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

function buildJstorUrl(ed, builder) {
  // ed.url could be something like:
  // https://www.jstor.org/stable/10.1163/j.ctvbqs5nk.31?searchText=Dugdale%27&searchUri=%2Faction%2FdoBasicSearch%3FQuery%3DDugdale%2527&ab_segments=0%2Fbasic_search_gsv2%2Fcontrol&refreqid=fastly-default%3Ab209ad1a9e68bba2d6181fe7370af661&seq=4
  //
  // ed.stableUrl is usually sounething like:
  // https://www.jstor.org/stable/4243451
  // but can be more complicated, e.g.:
  // "https://www.jstor.org/stable/10.1163/j.ctvbqs5nk.31"
  if (ed.stableUrl) {
    let url = ed.stableUrl;
    if (ed.url.includes("seq=")) {
      let seqNumber = ed.url.replace(/^.*[\?\&]seq\=(\d+).*$/, "$1");
      if (seqNumber && seqNumber != ed.url) {
        url += "?seq=" + seqNumber;
      }
    }
    return url;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let author = ed.authors;

  let title = ed.title;

  if (title) {
    if (ed.bookTitle) {
      // the title is probably a chapter title
      title = ed.bookTitle + ": " + title;
    }
  }

  let sourceTitle = "";
  if (author && title) {
    sourceTitle = author + ", ''" + title + "''";
  } else if (title) {
    sourceTitle = "''" + title + "''";
  }
  if (sourceTitle) {
    builder.sourceTitle = sourceTitle;
    builder.putSourceTitleInQuotes = false;
  }
}

function buildSourceReference(ed, gd, builder) {
  function addTerm(title, value) {
    if (value) {
      if (value.endsWith(".")) {
        value = value.substring(0, value.length - 1);
      }

      builder.addSourceReferenceField(title, value);
    }
  }
  if (ed.journalName || ed.journalPublisher) {
    addTerm("", ed.journalName);
    addTerm("", ed.journalDetails);
    addTerm("", ed.journalPublisher);
  } else {
    if (ed.publisher) {
      addTerm("", ed.publisher);
    } else if (ed.additionalFields && ed.additionalFields["Publisher"]) {
      addTerm("", ed.additionalFields["Publisher"]);
    }

    addTerm("", ed.publishedDate);
    addTerm("", ed.bookPageDetails);
  }
  // This number is just the image number - not the number printed on the page
  addTerm("image", ed.pageNumber);
}

function buildRecordLink(ed, gd, builder) {
  var jstorUrl = buildJstorUrl(ed, builder);

  let recordLink = "[" + jstorUrl + " JSTOR]";
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
