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

import { noticeTypes, cleanText } from "./nb_notice_types.mjs";
import { prepareUserInput, passageInput, getInputError, buildNbNarrative } from "./nb_generalize_data.mjs";

function getRequestedUserInput(input) {
  const ed = input.extractedData;
  const { state, type } = prepareUserInput(ed, input.newData);
  const fields = [];
  const label = (id, text) => fields.push({ id, type: "label", label: text });
  const select = (property, text, options) =>
    fields.push({
      id: property,
      type: "select",
      property,
      label: text,
      options,
      defaultValue: state[property],
      requiresRebuild: true,
    });
  const text = (property, label, comment = "") =>
    fields.push({
      id: property,
      type: "textInput",
      property,
      label,
      comment,
      defaultValue: state[property] || "",
      requiresRebuild: true,
    });
  label("publication", ed.title + (ed.publicationDate ? " — publication date: " + ed.publicationDate : ""));
  label(
    "viewer",
    "Viewer image" +
      (ed.viewerRange.includes("-") ? "s " : " ") +
      (ed.viewerRange || ed.pageIndex + 1) +
      (ed.pageCount ? " of " + ed.pageCount : "") +
      ". This is not necessarily the printed page number."
  );
  if (ed.materialType === "newspaper")
    select(
      "category",
      "Notice category",
      noticeTypes.map((entry) => ({ value: entry.key, text: entry.label }))
    );
  text(
    "personName",
    "Person mentioned in this passage",
    "Editable. Leave blank to copy a reference without a person-specific narrative."
  );
  text(
    "passageHeading",
    ed.materialType === "book" ? "Chapter / passage heading or locator" : "Article / notice heading, column or locator"
  );
  text(
    "printedPages",
    "Printed page(s)",
    "Confirm against the publication. Leave blank to cite the viewer image position."
  );
  if (cleanText(state.personName) && type.event) {
    const event = type.event[0].toUpperCase() + type.event.slice(1);
    text(
      "eventDate",
      event + " date stated in this passage",
      "Optional. Use 3 May 1920, 1920, or about/before/after a date."
    );
    text("eventPlace", event + " place stated in this passage", "Optional. Include only information stated here.");
    if (type.couple) text("secondPerson", "Second person named in this notice");
    if (type.event === "engagement")
      label(
        "engagementHelp",
        "Enter the engagement date only if stated. Do not enter a proposed wedding date as the engagement date."
      );
  }
  const validationError = getInputError(ed, state);
  label(
    "preview",
    "Narrative preview: " +
      (buildNbNarrative(ed, passageInput(ed, state), false) ||
        "No person-specific narrative; the reference will still be generated.")
  );
  return { resultData: state, fields, validationError };
}
export { getRequestedUserInput };
