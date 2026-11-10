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

import { commonGeneralizeData } from "../../../base/core/generalize_data_creation.mjs";
import { NbEdReader } from "./nb_ed_reader.mjs";
import { getNoticeType, cleanText, escapeText, normalizeName } from "./nb_notice_types.mjs";
import { readNbDate, dateText } from "./nb_dates.mjs";
import { getSuggestions } from "./nb_collection_context.mjs";

const passageFields = [
  "eventDate",
  "eventPlace",
  "secondPerson",
  "dateSuggestion",
  "placeSuggestion",
  "secondSuggestion",
];
const confirmations = ["confirmDate", "confirmPlace", "confirmSecond"];
function prepareUserInput(ed, existing, context = { subjects: [] }) {
  let state = existing;
  const first = !state;
  if (!state) {
    const selected = context.subjects.find((subject) => subject.key === context.selectedSubjectKey);
    state = {
      category: ed.materialType === "book" ? "book" : "mention",
      subjectKey: selected?.key || "",
      aliases: context.aliases || "",
      personName: selected?.name || "",
      passageHeading: "",
      printedPages: "",
    };
    for (const key of passageFields) state[key] = "";
    for (const key of confirmations) state[key] = "no";
  }
  state.category = getNoticeType(ed.materialType, state.category).key;
  const selected = context.subjects.find((subject) => subject.key === state.subjectKey);
  const subjectChanged = !first && state.subjectKey !== state._subjectKey;
  const categoryChanged = !first && state.category !== state._category;
  const aliasesChanged = !first && state.aliases !== state._aliases;
  const nameChanged = !first && state.personName !== state._name;
  if (subjectChanged) {
    state.personName = selected?.name || "";
    state.aliases = "";
  }
  const acceptableNames = [selected?.name || "", ...(state.aliases || "").split(";")].map(normalizeName);
  if (nameChanged && !subjectChanged && state.subjectKey && !acceptableNames.includes(normalizeName(state.personName)))
    state.subjectKey = "";
  const reset = subjectChanged || categoryChanged || aliasesChanged || nameChanged;
  if (reset) {
    for (const key of passageFields) state[key] = "";
    for (const key of confirmations) state[key] = "no";
  }
  const type = getNoticeType(ed.materialType, state.category);
  const suggestions = {
    date: type.event ? getSuggestions(context, state, type.event + "Date") : [],
    place: type.event ? getSuggestions(context, state, type.event + "Place") : [],
    second: type.couple ? getSuggestions(context, state, "secondPerson") : [],
  };
  for (const kind of ["date", "place", "second"]) {
    const field = kind === "second" ? "secondSuggestion" : kind + "Suggestion";
    const confirm = "confirm" + kind[0].toUpperCase() + kind.slice(1);
    if (first || reset) state[field] = suggestions[kind].length === 1 ? suggestions[kind][0].value : "";
    if (state[field] !== state["_" + field]) state[confirm] = "no";
    if (state[field] && !suggestions[kind].some((choice) => choice.value === state[field])) {
      state[field] = "";
      state[confirm] = "no";
    }
    state["_" + field] = state[field];
  }
  Object.assign(state, {
    _subjectKey: state.subjectKey,
    _category: state.category,
    _aliases: state.aliases,
    _name: state.personName,
  });
  return { state, suggestions, type };
}
function confirmedInput(ed, state) {
  const type = getNoticeType(ed.materialType, state.category);
  const value = (manual, suggestion, confirmation) =>
    cleanText(state[manual] || (state[confirmation] === "yes" ? state[suggestion] : ""));
  const personName = cleanText(state.personName);
  const result = {
    category: type.key,
    event: type.event,
    personName,
    passageHeading: cleanText(state.passageHeading),
    printedPages: cleanText(state.printedPages),
  };
  if (personName && type.event) {
    result.eventDate = value("eventDate", "dateSuggestion", "confirmDate");
    result.eventPlace = value("eventPlace", "placeSuggestion", "confirmPlace");
    if (type.couple) result.secondPerson = value("secondPerson", "secondSuggestion", "confirmSecond");
  }
  if (type.event === "death") {
    result.confirmedDeathDate = result.eventDate;
    result.confirmedDeathPlace = result.eventPlace;
  }
  return result;
}
function getInputError(ed, state) {
  const confirmed = confirmedInput(ed, state);
  if (confirmed.eventDate && !readNbDate(confirmed.eventDate))
    return "Enter a valid event date, for example 3 May 1920, 1920, or before 6 May 1920.";
  return "";
}
function buildNbNarrative(ed, confirmed, escape = true) {
  if (!confirmed.personName) return "";
  const text = escape ? escapeText : cleanText;
  const type = getNoticeType(ed.materialType, confirmed.category);
  let result = text(confirmed.personName) + " " + type.phrase + " in " + text(ed.title);
  const publication = readNbDate(ed.publicationDate);
  if (publication) result += ", published " + dateText(publication, true);
  result += ".";
  if (confirmed.secondPerson)
    result += " The notice also named " + text(confirmed.secondPerson) + " in the " + type.event + " announcement.";
  if (confirmed.eventDate || confirmed.eventPlace) {
    result += " The notice reported the " + type.event;
    if (confirmed.eventDate) result += " " + dateText(readNbDate(confirmed.eventDate), true);
    if (confirmed.eventPlace) result += " in " + text(confirmed.eventPlace);
    result += ".";
  }
  return result;
}
function generalizeData(input) {
  const ed = input.extractedData;
  const confirmed = input.confirmed || {};
  const gd = commonGeneralizeData("nb", new NbEdReader(ed, confirmed));
  if (gd.hasValidData) {
    gd.siteData = { nb: { ...confirmed } };
    if (confirmed.personName) gd.userOverrideForNarrative = buildNbNarrative(ed, confirmed);
  }
  return gd;
}
function regeneralizeData(input) {
  const error = getInputError(input.extractedData, input.newData);
  if (error) throw new Error(error);
  const next = generalizeData({
    extractedData: input.extractedData,
    confirmed: confirmedInput(input.extractedData, input.newData),
  });
  for (const key of Object.keys(input.generalizedData)) delete input.generalizedData[key];
  Object.assign(input.generalizedData, next);
}
export { prepareUserInput, confirmedInput, getInputError, buildNbNarrative, generalizeData, regeneralizeData };
