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

function householdContext(ed) {
  if (ed.group !== "census" || ed.imageOnly || !ed.household?.length) return "";
  const selected = ed.household.find((person) => "cid" + person.id === ed.recordId);
  if (!selected) return "";
  const heads = ed.household.filter((person) =>
    /^(?:husfader|husmoder|head(?: of household)?)(?:$|[ ,.;])/i.test((person.Information || "").trim())
  );
  // DFS lists the main person first when no explicit head is transcribed.
  // Keep this citation context separate from structured relationship/parent inference.
  if (heads.length > 1) return "";
  const head = heads[0] || ed.household[0];
  return head.Navn && head.id !== selected.id ? "in the household of " + head.Navn : "";
}

function buildCoreCitation(ed, gd, builder) {
  builder.sourceTitle = "Danish Family Search, " + ed.sourceTitle;
  builder.sourceReference = [
    ed.locality,
    ed.district,
    ed.levyNumber && "Lægd " + ed.levyNumber,
    ed.imageReference,
    ed.entryNumber && "entry " + ed.entryNumber,
    ed.recordId && "DFS ID " + ed.recordId,
    ed.sourceReference,
    ed.provenance,
  ]
    .filter(Boolean)
    .join("; ");
  builder.recordLinkOrTemplate =
    builder.getOptions().citation_general_target === "wikitree" ? "[" + ed.url + " Danish Family Search]" : ed.url;
  const secondaryImage = ed.imagePageUrl || ed.imageUrl;
  if (secondaryImage && secondaryImage !== ed.url) {
    builder.externalSiteLink =
      builder.getOptions().citation_general_target === "wikitree"
        ? "[" + secondaryImage + " Register image]"
        : secondaryImage;
  }
  builder.dataString = ed.imageOnly
    ? "Register image."
    : [
        [ed.fullName, !builder.householdTableString && householdContext(ed)].filter(Boolean).join(" "),
        ed.group === "laegsruller" ? "military levy registration" : ed.entryType,
        gd.eventDate?.getDateString() || ed.eventDate,
        ed.fields?.Alder && "age " + ed.fields.Alder,
        ed.fields?.["Familie nr."] && "family " + ed.fields["Familie nr."],
      ]
        .filter(Boolean)
        .join(", ") + ".";
}
function buildCitation(input) {
  if (!input.extractedData?.success || !input.generalizedData?.hasValidData)
    throw new Error("Open a loaded Danish Family Search record or image.");
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}
export { buildCitation };
