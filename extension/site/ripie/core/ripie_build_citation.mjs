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

function buildRipieUrl(ed, builder) {
  // drop any query string or fragment so the link is the plain notice URL
  return ed.url ? ed.url.split(/[?#]/)[0] : "";
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "RIP.ie";
}

function buildSourceReference(ed, gd, builder) {
  let published = gd.inferEventDate();
  if (published) {
    builder.sourceReference = "Date Published: " + published;
  } else {
    builder.sourceReference = "Publish Date Unknown";
  }
}

function buildRecordLink(ed, gd, builder) {
  let ripieUrl = buildRipieUrl(ed, builder);

  let recordLink = "[" + ripieUrl + " RIP.ie record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataString(ed, gd, builder) {
  // The generic data string would say "Name on <publication date>", which does not mention the death.
  let name = gd.inferFullName();
  if (!name) {
    builder.addStandardDataString(gd);
    return;
  }

  let dataString = name;
  if (gd.lastNameAtBirth && gd.lastNameAtBirth != gd.inferLastName()) {
    dataString += " (née " + gd.lastNameAtBirth + ")";
  }

  let deathDate = gd.inferDeathDate();
  dataString += deathDate ? " died on " + deathDate + "." : ".";

  // The town and county are where the person lived, so label them as such
  let residence = ed.town ? ed.town : "";
  if (ed.county) {
    residence += residence ? ", " + ed.county : ed.county;
  }
  if (residence) {
    dataString += " Residence: " + residence + ".";
  }

  builder.dataString = dataString;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function refTitleOverride(ed, gd) {
  return "Death Notice";
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, refTitleOverride);
}

export { buildCitation };
