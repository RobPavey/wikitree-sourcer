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

import { GeneralizedData, DateObj, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { RT, Role } from "../../../base/core/record_type.mjs";
import { normalizeName, cleanText } from "./nb_notice_types.mjs";
import { dateText, readNbDate } from "./nb_dates.mjs";

function sourceKey(citation) {
  return JSON.stringify([citation.url || "", citation.sourceTitle || "", citation.sourceReference || ""]);
}
function buildCollectionContext(collection) {
  const subjects = [];
  if (!collection || !Array.isArray(collection.citations)) return { subjects };
  for (const citation of collection.citations) {
    const gd = GeneralizedData.createFromPlainObject(citation.generalizedData);
    if (!gd || !gd.hasValidData || (gd.role && gd.role !== Role.Primary)) continue;
    if ([RT.Book, RT.Journal].includes(gd.recordType) && !gd.isAboutNamedPerson) continue;
    const name = cleanText(gd.inferFullName());
    if (!name) continue;
    const key = normalizeName(name);
    let subject = subjects.find((entry) => entry.key === key);
    if (!subject) {
      subject = { key, name, sources: [] };
      subjects.push(subject);
    }
    const nb = gd.sourceOfData === "nb" ? gd.siteData?.nb : undefined;
    let deathDate = gd.inferDeathDateObj();
    if (!gd.deathDate && gd.recordType === RT.Burial) {
      // Do not turn an approximate/lower-bound or year-only burial into a precise upper bound on death.
      const burial = gd.eventDate;
      const parsed = DateUtils.parseDateString(burial?.getDateString() || "");
      if (!parsed.hasDay || [dateQualifiers.ABOUT, dateQualifiers.AFTER].includes(burial?.qualifier))
        deathDate = undefined;
    }
    const marriage = [RT.Marriage, RT.MarriageRegistration].includes(gd.recordType);
    const spouse = Array.isArray(gd.spouses) ? gd.spouses.find((person) => person.name) : undefined;
    const source = {
      key: sourceKey(citation),
      label: [citation.sourceTitle || gd.sourceOfData, citation.sourceReference].filter(Boolean).join(" — "),
      url: citation.url || "",
      facts: {
        deathDate: deathDate ? dateText(DateObj.createFromPlainObject(deathDate)) : "",
        deathPlace: gd.inferDeathPlace() || "",
        marriageDate: marriage && gd.eventDate ? dateText(gd.eventDate) : "",
        marriagePlace: marriage ? gd.inferEventPlace() || "" : "",
        secondPerson: spouse ? spouse.name.inferFullName() : "",
      },
    };
    // NB's generic event date is publication time, never the marriage or engagement date.
    if (["marriage", "engagement"].includes(nb?.event)) {
      source.facts[nb.event + "Date"] = dateText(readNbDate(nb.eventDate));
      source.facts[nb.event + "Place"] = nb.eventPlace || "";
    }
    if (nb?.secondPerson) source.facts.secondPerson = nb.secondPerson;
    subject.sources.push(source);
  }
  return {
    collectionId: collection.id,
    selectedSubjectKey: collection.nbContext?.subjectKey || "",
    aliases: collection.nbContext?.aliases || "",
    subjects,
  };
}
function getSuggestions(context, state, field) {
  if (!state.subjectKey) return [];
  const names = [state.subjectKey, ...(state.aliases || "").split(";").map(normalizeName)].filter(Boolean);
  const choices = [];
  for (const subject of context.subjects || []) {
    if (!names.includes(subject.key)) continue;
    for (const source of subject.sources) {
      const value = cleanText(source.facts[field]);
      if (!value) continue;
      let choice = choices.find((entry) => entry.value === value);
      if (!choice) {
        choice = { value, sources: [] };
        choices.push(choice);
      }
      if (!choice.sources.some((entry) => entry.key === source.key))
        choice.sources.push({ key: source.key, label: source.label, url: source.url });
    }
  }
  return choices;
}
// A legacy collection gets an ID once. New collections get their ID at creation.
async function loadActiveCollection(storage, makeId) {
  let { collectedCitations: collection } = await storage.get(["collectedCitations"]);
  if (!collection || !Array.isArray(collection.citations)) return undefined;
  if (!collection.id) {
    const fresh = (await storage.get(["collectedCitations"])).collectedCitations;
    if (!fresh || !Array.isArray(fresh.citations)) return undefined;
    collection = fresh;
    if (!collection.id) {
      collection.id = makeId();
      await storage.set({ collectedCitations: collection });
    }
  }
  return collection;
}
async function saveResearchSubject(storage, context, state) {
  const current = (await storage.get(["collectedCitations"])).collectedCitations;
  if ((current?.id || undefined) !== context.collectionId)
    throw new Error("The active citation collection changed. Reopen Sourcer before using its person details.");
  if (current) {
    current.nbContext = { subjectKey: state.subjectKey || "", aliases: state.aliases || "" };
    await storage.set({ collectedCitations: current });
  }
}
export { buildCollectionContext, getSuggestions, loadActiveCollection, saveResearchSubject, sourceKey };
