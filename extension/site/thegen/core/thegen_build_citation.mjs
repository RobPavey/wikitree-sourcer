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

function buildThegenUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  if (ed.pageType == "record") {
    if (ed.breadcrumb) {
      let breadcrumbs = ed.breadcrumb.split("»");
      if (breadcrumbs.length == 3) {
        builder.sourceTitle = breadcrumbs[1].trim();
      }
    } else if (ed.title) {
      builder.sourceTitle = ed.title;
    }
  } else if (ed.pageType == "image") {
    if (ed.navData) {
      if (ed.navData["Title"]) {
        builder.sourceTitle = ed.navData["Title"];
      } else if (ed.navData["Year"]) {
        builder.sourceTitle = ed.navData["Year"];
      }
    }
  }
}

function buildSourceReference(ed, gd, builder) {
  if (ed.pageType == "record") {
    if (ed.sourceInfo) {
      if (ed.sourceInfo.length < 150) {
        builder.sourceReference += ed.sourceInfo;
      }
    }

    if (ed.recordData) {
      builder.addSourceReferenceField("Volume", ed.recordData["Volume"]);
      builder.addSourceReferenceField("Page", ed.recordData["Page"]);
    }
  } else if (ed.pageType == "image") {
    if (ed.navData) {
      for (let key of Object.keys(ed.navData)) {
        let value = ed.navData[key];
        if (!builder.sourceTitle.includes(value)) {
          builder.addSourceReferenceField(key, value);
        }
      }
    }
    if (ed.bookmarkPath) {
      for (let bookmark of ed.bookmarkPath) {
        builder.addSourceReferenceText(bookmark);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var thegenUrl = buildThegenUrl(ed, builder);

  let recordLink = "[" + thegenUrl + " The Genealogist Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
