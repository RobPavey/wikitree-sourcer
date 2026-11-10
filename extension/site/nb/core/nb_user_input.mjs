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
import { prepareUserInput, confirmedInput, getInputError, buildNbNarrative } from "./nb_generalize_data.mjs";

function getRequestedUserInput(input, context = { subjects: [] }) {
  const ed = input.extractedData;
  const { state, suggestions, type } = prepareUserInput(ed, input.newData, context);
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
  if (context.subjects.length) {
    select("subjectKey", "Research subject from the active collection", [
      { value: "", text: "Enter a person manually / do not use collection details" },
      ...context.subjects.map((subject) => ({
        value: subject.key,
        text: subject.name + " — " + subject.sources.map((source) => source.label).join("; "),
      })),
    ]);
    if (state.subjectKey)
      text(
        "aliases",
        "Other names for this same person (separate with ;)",
        "Only add name variants you have identified as this person. Other people in the collection are excluded."
      );
  }
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
  function addSuggestion(kind, manual, labelText) {
    const options = suggestions[kind];
    if (options.length) {
      const field = kind === "second" ? "secondSuggestion" : kind + "Suggestion";
      select(field, "Known " + labelText.toLowerCase() + " from collected sources", [
        {
          value: "",
          text:
            options.length > 1
              ? "Conflicting or alternative values: choose one, or leave unused"
              : "Do not use a collected value",
        },
        ...options.map((choice) => ({
          value: choice.value,
          text: choice.value + " — " + choice.sources.map((source) => source.label).join("; "),
        })),
      ]);
      if (state[field])
        label(
          field + "Source",
          "Source: " +
            options
              .find((choice) => choice.value === state[field])
              .sources.map((source) => source.label)
              .join("; ")
        );
      if (state[field])
        select("confirm" + kind[0].toUpperCase() + kind.slice(1), "Is this supported by the current passage?", [
          { value: "no", text: "Not confirmed — exclude from this citation" },
          { value: "yes", text: "Confirmed from this passage — include" },
        ]);
    }
    text(
      manual,
      labelText + " transcribed from this passage",
      kind === "date"
        ? "Optional. A value entered here replaces the suggestion. Use 3 May 1920, 1920, or about/before/after a date."
        : "Optional. A value entered here replaces the suggestion. Include only information stated in this passage."
    );
  }
  if (cleanText(state.personName) && type.event) {
    addSuggestion("date", "eventDate", type.event[0].toUpperCase() + type.event.slice(1) + " date");
    addSuggestion("place", "eventPlace", type.event[0].toUpperCase() + type.event.slice(1) + " place");
    if (type.couple) addSuggestion("second", "secondPerson", "Second person named in the notice");
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
      (buildNbNarrative(ed, confirmedInput(ed, state), false) ||
        "No person-specific narrative; the reference will still be generated.")
  );
  return { resultData: state, fields, validationError };
}
export { getRequestedUserInput };
