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
import { getNoticeType, cleanText, escapeText } from "./nb_notice_types.mjs";
import { readNbDate, dateText } from "./nb_dates.mjs";

// The form describes one passage. Nothing is restored from other citations.
const eventFields = ["eventDate", "eventPlace", "secondPerson"];
function prepareUserInput(ed, existing) {
  const state = existing || {
    category: ed.materialType === "book" ? "book" : "mention",
    personName: "",
    passageHeading: "",
    printedPages: "",
    eventDate: "",
    eventPlace: "",
    secondPerson: "",
  };
  const type = getNoticeType(ed.materialType, state.category);
  state.category = type.key;
  if (existing && (state.category !== state._category || state.personName !== state._name)) {
    for (const key of eventFields) state[key] = "";
  }
  if (!type.event || !cleanText(state.personName)) {
    for (const key of eventFields) state[key] = "";
  } else if (!type.couple) state.secondPerson = "";
  state._category = state.category;
  state._name = state.personName;
  return { state, type };
}
// Keep only the fields applicable to this passage, even when called without the form.
function passageInput(ed, state) {
  const type = getNoticeType(ed.materialType, state.category);
  const personName = cleanText(state.personName);
  const result = {
    category: type.key,
    event: type.event,
    personName,
    passageHeading: cleanText(state.passageHeading),
    printedPages: cleanText(state.printedPages),
  };
  if (personName && type.event) {
    result.eventDate = cleanText(state.eventDate);
    result.eventPlace = cleanText(state.eventPlace);
    if (type.couple) result.secondPerson = cleanText(state.secondPerson);
  }
  if (type.event === "death") {
    result.confirmedDeathDate = result.eventDate;
    result.confirmedDeathPlace = result.eventPlace;
  }
  return result;
}
function getInputError(ed, state) {
  const passage = passageInput(ed, state);
  if (passage.eventDate && !readNbDate(passage.eventDate))
    return "Enter a valid event date, for example 3 May 1920, 1920, or before 6 May 1920.";
  return "";
}
function buildNbNarrative(ed, passage, escape = true) {
  if (!passage.personName) return "";
  const text = escape ? escapeText : cleanText;
  const type = getNoticeType(ed.materialType, passage.category);
  let result = text(passage.personName) + " " + type.phrase + " in " + text(ed.title);
  const publication = readNbDate(ed.publicationDate);
  if (publication) result += ", published " + dateText(publication, true);
  result += ".";
  if (passage.secondPerson)
    result += " The notice also named " + text(passage.secondPerson) + " in the " + type.event + " announcement.";
  if (passage.eventDate || passage.eventPlace) {
    result += " The notice reported the " + type.event;
    if (passage.eventDate) result += " " + dateText(readNbDate(passage.eventDate), true);
    if (passage.eventPlace) result += " in " + text(passage.eventPlace);
    result += ".";
  }
  return result;
}
function generalizeData(input) {
  const ed = input.extractedData;
  const passage = input.passage || {};
  const gd = commonGeneralizeData("nb", new NbEdReader(ed, passage));
  if (gd.hasValidData) {
    gd.siteData = { nb: { ...passage } };
    if (passage.personName) gd.userOverrideForNarrative = buildNbNarrative(ed, passage);
  }
  return gd;
}
function regeneralizeData(input) {
  const error = getInputError(input.extractedData, input.newData);
  if (error) throw new Error(error);
  const next = generalizeData({
    extractedData: input.extractedData,
    passage: passageInput(input.extractedData, input.newData),
  });
  for (const key of Object.keys(input.generalizedData)) delete input.generalizedData[key];
  Object.assign(input.generalizedData, next);
}
export { prepareUserInput, passageInput, getInputError, buildNbNarrative, generalizeData, regeneralizeData };
