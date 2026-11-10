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
import { getNoticeType, escapeText } from "./nb_notice_types.mjs";
import { canonicalNbUrl } from "./nb_metadata.mjs";
import { dateText, readNbDate } from "./nb_dates.mjs";

function buildCoreCitation(ed, gd, builder) {
  const passage = gd.siteData?.nb || {};
  const type = getNoticeType(ed.materialType, passage.category);
  const title = [];
  if (ed.materialType === "book" && ed.creators.length)
    title.push(ed.creators.map((person) => person.name + (person.editor ? " (ed.)" : "")).join("; "));
  title.push(ed.title);
  const publication = [
    ed.publicationPlace,
    ed.publisher,
    dateText(readNbDate(ed.publicationDate)) || ed.publicationDate,
  ].filter(Boolean);
  if (publication.length) title.push(publication.join(", "));
  if (ed.edition) title.push("Edition: " + ed.edition);
  builder.sourceTitle = title.map(escapeText).join(". ");
  const locator = passage.printedPages
    ? "Printed page(s): " + passage.printedPages
    : "Viewer image(s): " + (ed.viewerRange || ed.pageIndex + 1);
  const reference = ["Nasjonalbiblioteket", ed.urn || ed.itemId, locator, type.heading];
  if (passage.personName) reference.push("Person: " + passage.personName);
  if (passage.secondPerson) reference.push("Also named: " + passage.secondPerson);
  if (passage.passageHeading) reference.push(passage.passageHeading);
  builder.sourceReference = reference.map(escapeText).join("; ");
  builder.recordLinkOrTemplate =
    builder.getOptions().citation_general_target === "wikitree" ? "[" + ed.url + " NB digital copy]" : ed.url;
  // Only confirmed/transcribed data enter this string. Suggestions are not part of gd.
  const details = [];
  if (passage.personName) details.push("Mention of " + passage.personName);
  if (passage.eventDate)
    details.push(type.event + " date stated in passage: " + dateText(readNbDate(passage.eventDate)));
  if (passage.eventPlace) details.push(type.event + " place stated in passage: " + passage.eventPlace);
  builder.dataString = details.map(escapeText).join("; ");
}
function buildCitation(input) {
  if (!input.extractedData.success || !input.generalizedData.hasValidData)
    throw new Error("A loaded NB newspaper or book is required.");
  input = { ...input, extractedData: { ...input.extractedData, url: canonicalNbUrl(input.extractedData) } };
  const requestedType = input.type;
  if (requestedType === "narrative" && !input.generalizedData.userOverrideForNarrative)
    input = { ...input, type: "inline" };
  const result = simpleBuildCitationWrapper(input, buildCoreCitation);
  result.type = requestedType;
  return result;
}
export { buildCitation };
