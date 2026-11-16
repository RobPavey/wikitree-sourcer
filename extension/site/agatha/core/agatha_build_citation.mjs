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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function refTitleOverrideFunction(ed, gd, options) {
  let primary = gd.name;
  let meaningfulTitle;
  if (primary && options.citation_agatha_informativeTitle == true) {
    let spouses = gd.spouses;
    if (spouses) {
      spouses = spouses[0].name;
    }
    meaningfulTitle = gd.getRefTitle();
    if (gd.recordType == RT.Marriage) {
      meaningfulTitle += " between " + primary.name;
      if (spouses) {
        meaningfulTitle += " and " + spouses.name;
      }
    } else {
      meaningfulTitle += " of " + primary.name;
    }
  } else {
    meaningfulTitle = gd.getRefTitle();
  }
  if (options.citation_agatha_yearInTitle) {
    const date = gd.eventDate;
    if (date) {
      let year;
      if (date.yearString) {
        year = date.yearString;
      } else {
        const parts = date.dateString.split(" ");
        year = parts[parts.length - 1];
      }
      meaningfulTitle += " (" + year + ")";
    }
  }
  return meaningfulTitle;
}

function buildAgathaUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "State Archives of Belgium: AGATHA";
}

function buildSourceReference(ed, gd, builder) {
  let ref = "";
  if (ed.isRecord) {
    let parts = ed.url.split("/");
    const id = parts[parts.length - 1];
    const project = id.split("_")[0];
    ref += "Project " + project + ", id: " + id;
  } else {
    if (ed.selection) {
      ref += ed.selection; //ed.source;
    } else if (ed.source) {
      ref += ed.source;
    }
    if (ed.currentPage && ed.maxPage) {
      ref += " > Image " + ed.currentPage + " of " + ed.maxPage + ".";
    }
  }
  builder.sourceReference = ref;
}

function buildRecordLink(ed, gd, builder) {
  var agathaUrl = buildAgathaUrl(ed, builder);
  let recordOrImage;
  if (ed.isRecord) {
    recordOrImage = "Record";
  } else {
    recordOrImage = "Image (account required)";
  }
  let recordLink = "[" + agathaUrl + " AGATHA " + recordOrImage + "]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, function (ed, gd) {
    return refTitleOverrideFunction(ed, gd, input.options);
  });
}

export { buildCitation };
