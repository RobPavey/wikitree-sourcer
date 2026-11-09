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
import { GravminnerEdReader } from "./gravminner_ed_reader.mjs";

function buildCoreCitation(ed, gd, builder) {
  builder.sourceTitle = "Slekt og Data, Gravminner";
  builder.sourceReference = "ID: " + ed.recordId;
  builder.recordLinkOrTemplate =
    builder.getOptions().citation_general_target === "wikitree" ? "[" + ed.url + " Gravminner memorial]" : ed.url;

  let data = "Memorial for " + ed.fullName;
  if (ed.maidenName) data += " (née " + ed.maidenName + ")";
  const dates = [];
  if (ed.birthDate) dates.push("born " + (gd.birthDate ? gd.birthDate.getDateString() : ed.birthDate));
  if (ed.deathDate) dates.push("died " + (gd.deathDate ? gd.deathDate.getDateString() : ed.deathDate));
  if (dates.length) data += ", " + dates.join(", ");
  const cemetery = [ed.cemeteryName, ed.municipality, ed.county, ed.country].filter(Boolean).join(", ");
  if (cemetery) data += "; memorial location: " + cemetery;
  if (ed.burialDate) data += "; burial date: " + (gd.eventDate ? gd.eventDate.getDateString() : ed.burialDate);
  // Bisatt is kept separate: it must not be interpreted as the burial or death date.
  if (ed.ceremonyDate) {
    const date = new GravminnerEdReader(ed).readDate(ed.ceremonyDate);
    data += "; Bisatt: " + (date ? date.getDateString() : ed.ceremonyDate);
  }
  const plot = [
    ["Teig", ed.plotArea],
    ["Felt", ed.plotField],
    ["Rad", ed.plotRow],
    ["Gravnummer", ed.plotNumber],
  ]
    .filter((part) => part[1])
    .map((part) => part.join(" "));
  if (plot.length) data += "; " + plot.join(", ");
  builder.dataString = data + ".";
}

function buildCitation(input) {
  if (!input.extractedData.success || !input.generalizedData.hasValidData) {
    throw new Error("A loaded Gravminner person record is required to build a citation.");
  }
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}
export { buildCitation };
