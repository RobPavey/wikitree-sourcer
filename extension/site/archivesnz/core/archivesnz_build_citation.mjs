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

const MAX_CITATION_ITEM_TITLE_LENGTH = 200;

function buildArchivesnzUrl(ed, builder) {
  return ed.url;
}

function getCitationItemTitle(title) {
  if (!title || title.length <= MAX_CITATION_ITEM_TITLE_LENGTH) {
    return title;
  }

  const contentLimit = MAX_CITATION_ITEM_TITLE_LENGTH - 3;
  let endIndex = title.lastIndexOf(";", contentLimit - 1);
  if (endIndex >= contentLimit / 2) {
    endIndex += 1;
  } else {
    endIndex = title.lastIndexOf(" ", contentLimit);
  }
  if (endIndex < 1) {
    endIndex = contentLimit;
  }

  return title.substring(0, endIndex).trimEnd() + "...";
}

function buildSourceReference(ed, gd, builder) {
  const itemFields = ed.itemFields || {};
  const seriesFields = ed.seriesFields || {};
  const fields = [];

  if (ed.title) {
    fields.push(getCitationItemTitle(ed.title));
  }
  if (seriesFields["Series name"]) {
    let series = seriesFields["Series name"];
    if (seriesFields["Code"]) {
      series += " (Series " + seriesFields["Code"] + ")";
    }
    fields.push(series);
  }
  if (itemFields["Box number"]) {
    fields.push("Box " + itemFields["Box number"]);
  }
  if (itemFields["Record number"]) {
    fields.push("Record number: " + itemFields["Record number"]);
  }
  if (itemFields["Years"]) {
    fields.push("Years: " + itemFields["Years"]);
  }
  if (itemFields["Location"]) {
    fields.push(itemFields["Location"]);
  }

  builder.sourceReference = fields.join(", ");
}

function buildRecordLink(ed, gd, builder) {
  let recordLink = "[" + buildArchivesnzUrl(ed, builder) + " Archives New Zealand Record]";
  if (ed.code) {
    recordLink = "{{Archives New Zealand|" + ed.code + "}}";
  }
  builder.recordLinkOrTemplate = recordLink;
}

function buildImageLink(ed, builder) {
  if (ed.imageUrl) {
    builder.externalSiteLink = "[" + ed.imageUrl + " Image]";
  }
}

function buildRefTitle(ed) {
  if (/naturalised|naturalisation/i.test(ed.title || "")) {
    return "Naturalisation Record";
  }

  const seriesName = ((ed.seriesFields && ed.seriesFields["Series name"]) || "").toLowerCase();
  if (seriesName.includes("probate")) {
    return "Probate Record";
  }
  if (seriesName.includes("military personnel files")) {
    return "Military Personnel Record";
  }
  if (seriesName.includes("divorce")) {
    return "Divorce Case File";
  }
  if (seriesName.includes("coroner") && seriesName.includes("inquest")) {
    return "Coroner's Inquest Record";
  }
  return "Archives New Zealand Record";
}

function buildNarrative(ed) {
  const years = ed.itemFields && ed.itemFields["Years"];
  const refTitle = buildRefTitle(ed);
  let narrative = "This person was named in an Archives New Zealand record";
  if (refTitle === "Probate Record") {
    narrative = "This person was named in a probate record";
  } else if (refTitle === "Military Personnel Record") {
    narrative = "This person's military service was recorded in a personnel file";
  } else if (refTitle === "Divorce Case File") {
    narrative = "This person was named in a divorce case file";
  } else if (refTitle === "Coroner's Inquest Record") {
    narrative = "This person was named in a coroner's inquest record";
  } else if (refTitle === "Naturalisation Record") {
    narrative = "This person was the subject of a naturalisation memorial";
  }
  if (years) {
    const yearParts = years.split(/\s+-\s+/);
    if (yearParts.length === 2 && yearParts[0] === yearParts[1]) {
      narrative += " in " + yearParts[0];
    } else if (yearParts.length === 2) {
      narrative += " between " + yearParts[0] + " and " + yearParts[1];
    } else {
      narrative += " in " + years;
    }
  }
  return narrative + ".";
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildImageLink(ed, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  const gd = input.generalizedData;
  const existingNarrative = gd.userOverrideForNarrative;
  const narrative = input.type === "narrative" && !existingNarrative ? buildNarrative(input.extractedData) : "";
  const hadNarrativeProperty = Object.prototype.hasOwnProperty.call(gd, "userOverrideForNarrative");

  if (narrative) {
    gd.userOverrideForNarrative = narrative;
  }

  try {
    return simpleBuildCitationWrapper(input, buildCoreCitation, buildRefTitle);
  } finally {
    if (narrative) {
      if (hadNarrativeProperty) {
        gd.userOverrideForNarrative = existingNarrative;
      } else {
        delete gd.userOverrideForNarrative;
      }
    }
  }
}

export { buildCitation };
