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

function buildArchiveUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let author = ed.metadata["by"];
  if (!author) {
    author = ed.metadata["Associated-names"];
  }

  let title = ed.title;

  if (builder.options.citation_archive_includeArkLink) {
    let ark = ed.metadata["Identifier-ark"];
    if (ark) {
      let link = "https://n2t.net/" + ark;
      title = "[" + link + " " + title + "]";
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
  addTerm("", ed.metadata["Publisher"]);
  addTerm("", ed.metadata["Publication date"]);

  // if the URL is just to the book and not a specific page we don't want to include a page number even though
  // ed.pageXOfY may be something like: (1 of 350)
  if (ed.url.includes("/page/")) {
    let pageXOfY = ed.pageXOfY;
    if (pageXOfY) {
      let page = pageXOfY.replace(/^\s*(\d+)\s+of\s+\d+\s*$/, "$1");
      if (page && page != pageXOfY) {
        addTerm("page", page);
      } else {
        // there can be parentheses, this means there is no actual printed decimal page number on the page
        // we could extract the page like this:
        // page = pageXOfY.replace(/^\s*\(\s*(\d+)\s+of\s+\d+\s*\)\s*$/, "$1");
        // but that would consusing when the page number is really xii and the following page is page 1
        addTerm("page", pageXOfY);
      }
    } else {
      let page = ed.url.replace(/^.*\/page\/(\d+)\/.*$/, "$1");
      if (page && page != ed.url) {
        addTerm("page", page);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var archiveUrl = buildArchiveUrl(ed, builder);

  let recordLink = "[" + archiveUrl + " Internet Archive]";
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
