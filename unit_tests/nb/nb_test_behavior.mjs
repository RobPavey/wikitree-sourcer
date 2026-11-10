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

import assert from "node:assert/strict";
import { fixture, record, extract, personCitation } from "./nb_test_fixtures.mjs";
import { noticeTypes } from "../../extension/site/nb/core/nb_notice_types.mjs";
import { readNbDate, dateText } from "../../extension/site/nb/core/nb_dates.mjs";
import { normalizeMetadata, loadNbMetadata, selectionFromUrl } from "../../extension/site/nb/core/nb_metadata.mjs";
import {
  buildCollectionContext,
  getSuggestions,
  loadActiveCollection,
  saveResearchSubject,
} from "../../extension/site/nb/core/nb_collection_context.mjs";
import {
  prepareUserInput,
  confirmedInput,
  generalizeData,
  regeneralizeData,
  getInputError,
} from "../../extension/site/nb/core/nb_generalize_data.mjs";
import { getRequestedUserInput } from "../../extension/site/nb/core/nb_user_input.mjs";
import { buildCitation } from "../../extension/site/nb/core/nb_build_citation.mjs";
import {
  startNewCollectedCitations,
  addCitationToCollectedCitations,
  stopCollectingCitations,
  restoreCollectedCitations,
  getCollectedCitations,
} from "../../extension/base/browser/common/collected_citations.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

const ed = record();
const subject = "anna hansen";
const collection = { id: "collection-1", citations: [personCitation()] };
const context = buildCollectionContext(collection);
function input(category = "deathNotice", ctx = context) {
  let state = prepareUserInput(ed, undefined, ctx).state;
  state.subjectKey = subject;
  state.category = category;
  return prepareUserInput(ed, state, ctx).state;
}
function output(state) {
  const gd = generalizeData({ extractedData: ed });
  regeneralizeData({ extractedData: ed, generalizedData: gd, newData: state });
  return gd;
}
function citation(gd, options, type = "narrative", recordData = ed) {
  return buildCitation({
    extractedData: recordData,
    generalizedData: gd,
    runDate: new Date(2026, 10, 10),
    type,
    options,
  }).citation;
}
function storageFor(value) {
  let data = value ? { collectedCitations: structuredClone(value) } : {};
  return {
    get: async () => structuredClone(data),
    set: async (value) => {
      Object.assign(data, structuredClone(value));
    },
    replace: (value) => {
      data = value ? { collectedCitations: structuredClone(value) } : {};
    },
  };
}
async function runTests(testManager) {
  if (testManager.parameters.testName && testManager.parameters.testName !== "behavior") return;
  const tests = {
    publication_dates_are_not_life_events() {
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.eventDate.getDateString(), "5 Nov 1952");
      assert.equal(gd.deathDate, undefined);
      assert.equal(gd.inferDeathDateObj(), undefined);
      assert.equal(gd.name, undefined);
    },
    books_do_not_use_catalogue_authors_as_subjects() {
      const book = record("book");
      assert.ok(book.creators.length);
      const gd = generalizeData({ extractedData: book });
      assert.equal(gd.name, undefined);
      assert.equal(
        buildCollectionContext({ id: "b", citations: [{ generalizedData: JSON.parse(JSON.stringify(gd)) }] }).subjects
          .length,
        0
      );
      assert.ok(!citation(gd, testManager.options, "narrative", book).startsWith("This person"));
      assert.ok(!citation(gd, testManager.options, "narrative", book).includes("was mentioned"));
    },
    suggestions_are_not_evidence_until_confirmed() {
      const state = input();
      assert.equal(state.personName, "Anna Hansen");
      assert.equal(state.dateSuggestion, "3 May 1920");
      assert.equal(state.confirmDate, "no");
      let gd = output(state);
      assert.equal(gd.deathDate, undefined);
      assert.ok(!citation(gd, testManager.options).includes("3 May 1920"));
      assert.ok(!JSON.stringify(gd).includes("Source A"));
      const recycled = buildCollectionContext({
        id: "c",
        citations: [{ generalizedData: JSON.parse(JSON.stringify(gd)) }],
      });
      assert.equal(getSuggestions(recycled, { subjectKey: subject }, "deathDate").length, 0);
      state.confirmDate = "yes";
      gd = output(state);
      assert.equal(gd.deathDate.getDateString(), "3 May 1920");
      assert.ok(citation(gd, testManager.options).includes("The notice reported the death on 3 May 1920"));
      assert.ok(!citation(gd, testManager.options).includes("died on 5 November 1952"));
    },
    explicit_transcription_overrides_suggestion() {
      const state = input();
      state.eventDate = "4 May 1920";
      state.eventPlace = "Bergen";
      const gd = output(state);
      assert.equal(gd.deathDate.getDateString(), "4 May 1920");
      assert.equal(gd.deathPlace.placeString, "Bergen");
      assert.ok(!citation(gd, testManager.options).includes("3 May 1920"));
    },
    conflicts_are_not_resolved_by_majority_or_recency() {
      const ctx = buildCollectionContext({
        id: "c",
        citations: [
          personCitation(),
          personCitation("Anna Hansen", "4 May 1920", "Death", "Source B"),
          personCitation("Anna Hansen", "3 May 1920", "Death", "Source C"),
        ],
      });
      const state = input("deathNotice", ctx);
      assert.equal(state.dateSuggestion, "");
      const choices = getSuggestions(ctx, state, "deathDate");
      assert.equal(choices.length, 2);
      assert.equal(choices.find((choice) => choice.value === "3 May 1920").sources.length, 2);
    },
    relatives_and_other_people_are_excluded() {
      const relative = personCitation("Parent Person");
      relative.generalizedData.role = "Parent";
      const ctx = buildCollectionContext({
        id: "c",
        citations: [personCitation(), personCitation("Ole Olsen", "1940"), relative],
      });
      assert.equal(ctx.subjects.length, 2);
      assert.deepEqual(
        getSuggestions(ctx, input("deathNotice", ctx), "deathDate").map((choice) => choice.value),
        ["3 May 1920"]
      );
    },
    name_variants_require_explicit_association() {
      const ctx = buildCollectionContext({
        id: "c",
        citations: [personCitation(), personCitation("Anna Olsen", "4 May 1920", "Death", "Birth surname")],
      });
      const state = input("deathNotice", ctx);
      assert.equal(getSuggestions(ctx, state, "deathDate").length, 1);
      state.aliases = "Anna Olsen";
      prepareUserInput(ed, state, ctx);
      assert.equal(getSuggestions(ctx, state, "deathDate").length, 2);
      assert.equal(state.confirmDate, "no");
    },
    changing_name_subject_or_category_removes_old_facts() {
      const state = input();
      state.confirmDate = "yes";
      const gd = output(state);
      state.category = "marriage";
      prepareUserInput(ed, state, context);
      regeneralizeData({ extractedData: ed, generalizedData: gd, newData: state });
      assert.equal(gd.deathDate, undefined);
      assert.equal(gd.overrideRefTitle, "Marriage Notice");
      assert.ok(!citation(gd, testManager.options).includes("death notice"));
      state.personName = "Ole Olsen";
      prepareUserInput(ed, state, context);
      assert.equal(state.subjectKey, "");
      assert.equal(state.confirmDate, "no");
      state.subjectKey = subject;
      prepareUserInput(ed, state, context);
      assert.equal(state.personName, "Anna Hansen");
      assert.equal(state.aliases, "");
    },
    deliberate_empty_values_survive_rebuilds() {
      const state = input();
      state.dateSuggestion = "";
      state.eventDate = "";
      state.personName = "";
      prepareUserInput(ed, state, context);
      const form = getRequestedUserInput({ extractedData: ed, newData: state, type: "narrative" }, context);
      assert.equal(form.resultData.personName, "");
      assert.equal(form.fields.find((field) => field.property === "personName").defaultValue, "");
      assert.equal(form.resultData.eventDate, "");
    },
    changing_suggestion_clears_confirmation() {
      const state = input();
      state.confirmDate = "yes";
      state.dateSuggestion = "";
      prepareUserInput(ed, state, context);
      assert.equal(state.confirmDate, "no");
      assert.equal(state.dateSuggestion, "");
    },
    burial_limits_and_partial_dates_keep_qualifiers() {
      const ctx = buildCollectionContext({
        id: "c",
        citations: [personCitation("Anna Hansen", "6 May 1920", "Burial")],
      });
      assert.equal(getSuggestions(ctx, input("deathNotice", ctx), "deathDate")[0].value, "before 6 May 1920");
      for (const [raw, expected] of [
        ["1920", "1920"],
        ["about 1920", "about 1920"],
        ["before 6.5.1920", "before 6 May 1920"],
        ["3 mai 1920", "3 May 1920"],
        ["19521105", "5 November 1952"],
      ])
        assert.equal(dateText(readNbDate(raw)), expected);
      for (const raw of ["31.2.1920", "29 Feb 1900", "nothing", "0000"]) assert.equal(readNbDate(raw), undefined);
    },
    approximate_burials_do_not_become_precise_death_limits() {
      for (const date of ["about 6 May 1920", "after 6 May 1920", "1920", "May 1920"]) {
        const ctx = buildCollectionContext({ id: "c", citations: [personCitation("Anna Hansen", date, "Burial")] });
        assert.equal(getSuggestions(ctx, input("deathNotice", ctx), "deathDate").length, 0);
      }
    },
    confirmed_engagements_are_only_suggestions_for_the_next_passage() {
      const state = input("engagement");
      state.eventDate = "3 May 1920";
      state.eventPlace = "Bergen";
      const gd = output(state);
      const ctx = buildCollectionContext({
        id: "c",
        citations: [{ sourceTitle: "Earlier notice", generalizedData: JSON.parse(JSON.stringify(gd)) }],
      });
      const next = input("engagement", ctx);
      assert.equal(next.dateSuggestion, "3 May 1920");
      assert.equal(next.confirmDate, "no");
      assert.equal(confirmedInput(ed, next).eventDate, "");
    },
    two_people_are_only_included_after_confirmation_or_transcription() {
      const c = personCitation();
      c.generalizedData.spouses = [{ name: { name: "Ole Olsen" } }];
      const ctx = buildCollectionContext({ id: "c", citations: [c] });
      const state = input("marriage", ctx);
      assert.equal(state.secondSuggestion, "Ole Olsen");
      assert.equal(confirmedInput(ed, state).secondPerson, "");
      state.confirmSecond = "yes";
      assert.equal(confirmedInput(ed, state).secondPerson, "Ole Olsen");
      assert.ok(citation(output(state), testManager.options).includes("also named Ole Olsen"));
    },
    all_categories_drive_headings_and_narratives() {
      for (const type of noticeTypes) {
        const state = input(type.key);
        const gd = output(state);
        assert.equal(gd.recordType, "Newspaper");
        assert.equal(gd.overrideRefTitle, type.heading);
        assert.ok(citation(gd, testManager.options).includes(type.heading));
        assert.ok(citation(gd, testManager.options).includes(type.phrase));
      }
    },
    source_context_and_viewer_links_remain_distinct() {
      const book = record("book");
      assert.equal(book.pageIndex, 1);
      assert.equal(book.viewerRange, "2-3");
      assert.equal(book.canvasLabel, "28");
      const gd = generalizeData({ extractedData: book });
      const text = citation(gd, testManager.options, "source", book);
      assert.ok(text.includes("Viewer image(s): 2-3"));
      assert.ok(!text.includes("Printed page(s): 28"));
      assert.ok(text.includes("?page=1"));
      const named = generalizeData({
        extractedData: book,
        confirmed: confirmedInput(book, { personName: "Anna Hansen", printedPages: "iv–v" }),
      });
      assert.ok(citation(named, testManager.options, "source", book).includes("Printed page(s): iv–v"));
    },
    distinct_notices_on_one_page_are_collectable() {
      const a = input("deathNotice");
      const b = input("deathListing");
      const object = (state) =>
        buildCitation({
          extractedData: ed,
          generalizedData: output(state),
          options: testManager.options,
          type: "source",
          runDate: new Date(),
        });
      assert.notEqual(object(a).sourceReference, object(b).sourceReference);
      b.category = a.category;
      b.passageHeading = "Column 3";
      assert.notEqual(object(a).sourceReference, object(b).sourceReference);
    },
    user_text_cannot_inject_wikitext_or_html() {
      const state = input();
      state.personName = "Anna <ref>bad</ref> [[link]] {{template}}";
      const text = citation(output(state), testManager.options);
      assert.ok(!text.includes("<ref>bad</ref>"));
      assert.ok(!text.includes("[[link]]"));
      assert.ok(!text.includes("{{template}}"));
    },
    malformed_pages_and_wrong_metadata_are_rejected() {
      for (const url of [
        "https://www.nb.no/search",
        "https://example.org/items/" + ed.itemId,
        "https://www.nb.no/items/bad",
        "https://www.nb.no/items/" + ed.itemId + "?page=-1",
        "not a URL",
      ])
        assert.equal(extract("", url).success, false);
      assert.throws(() => normalizeMetadata(ed, { ...fixture("newspaper_item"), id: "wrong" }), /different item/);
      const physicalOnly = structuredClone(fixture("newspaper_item"));
      physicalOnly.accessInfo.isDigital = false;
      assert.throws(() => normalizeMetadata(ed, physicalOnly), /digitized/);
      const unsupported = structuredClone(fixture("newspaper_item"));
      unsupported.metadata.mediaTypes = ["bilder"];
      assert.throws(() => normalizeMetadata(ed, unsupported), /newspapers and books/);
      assert.throws(
        () => normalizeMetadata({ ...ed, pageIndex: 1000 }, fixture("newspaper_item"), fixture("newspaper_manifest")),
        /outside/
      );
      assert.equal(normalizeMetadata(ed, fixture("newspaper_item")).manifestAvailable, false);
      const upper = "https://nb.no/items/" + ed.itemId.toUpperCase() + "/?page=0&search=test#zoom";
      assert.equal(extract("", upper).url, ed.url);
      assert.deepEqual(selectionFromUrl(upper), { success: true, itemId: ed.itemId, pageIndex: 0 });
    },
    invalid_user_dates_are_reported() {
      const state = input();
      state.eventDate = "31 February 1920";
      assert.ok(getInputError(ed, state));
      assert.ok(getRequestedUserInput({ extractedData: ed, newData: state }, context).validationError);
      assert.throws(() => output(state), /valid event date/);
    },
    fresh_passages_keep_subject_but_reset_confirmation() {
      const ctx = buildCollectionContext({ ...collection, nbContext: { subjectKey: subject, aliases: "Anna Olsen" } });
      const next = prepareUserInput({ ...ed, pageIndex: 1 }, undefined, ctx).state;
      assert.equal(next.personName, "Anna Hansen");
      assert.equal(next.confirmDate, "no");
      assert.equal(next.eventDate, "");
      assert.equal(next.printedPages, "");
    },
    async_metadata_failures_and_navigation() {
      const fetch = async (url) => (url.includes("/iiif/") ? fixture("newspaper_manifest") : fixture("newspaper_item"));
      return (async () => {
        assert.equal((await loadNbMetadata(ed, fetch, async () => ed)).itemId, ed.itemId);
        await assert.rejects(
          loadNbMetadata(ed, fetch, async () => ({ ...ed, pageIndex: 1 })),
          /changed/
        );
        await assert.rejects(
          loadNbMetadata(
            ed,
            async () => {
              throw new Error("HTTP 500");
            },
            async () => ed
          ),
          /HTTP 500/
        );
        const withoutManifest = await loadNbMetadata(
          ed,
          async (url) => {
            if (url.includes("/iiif/")) throw new Error("offline");
            return fixture("newspaper_item");
          },
          async () => ed
        );
        assert.equal(withoutManifest.manifestAvailable, false);
      })();
    },
    shared_collection_lifecycle_and_nb_passage_deduplication() {
      return (async () => {
        const original = globalThis.chrome;
        let data = {};
        globalThis.chrome = {
          storage: {
            local: {
              get: async (_keys, callback) => {
                const result = structuredClone(data);
                if (callback) callback(result);
                return result;
              },
              set: async (items) => {
                Object.assign(data, structuredClone(items));
              },
              remove: async (key) => {
                delete data[key];
              },
            },
          },
        };
        try {
          await startNewCollectedCitations();
          const firstId = data.collectedCitations.id;
          assert.ok(firstId);
          const a = input("deathNotice");
          const b = input("deathListing");
          const object = (state) => ({
            ...buildCitation({
              extractedData: ed,
              generalizedData: output(state),
              options: testManager.options,
              type: "source",
              runDate: new Date(),
            }),
            generalizedData: JSON.parse(JSON.stringify(output(state))),
          });
          await addCitationToCollectedCitations(object(a));
          await addCitationToCollectedCitations(object(b));
          await addCitationToCollectedCitations(object(a));
          assert.equal(data.collectedCitations.citations.length, 2);
          data.collectedCitations.nbContext = { subjectKey: subject };
          await stopCollectingCitations();
          assert.equal(await getCollectedCitations(), undefined);
          assert.equal(buildCollectionContext(await getCollectedCitations()).subjects.length, 0);
          await restoreCollectedCitations();
          assert.equal(data.collectedCitations.id, firstId);
          assert.equal(data.collectedCitations.nbContext.subjectKey, subject);
          await startNewCollectedCitations();
          assert.notEqual(data.collectedCitations.id, firstId);
          assert.equal(data.collectedCitations.nbContext, undefined);
        } finally {
          if (original === undefined) delete globalThis.chrome;
          else globalThis.chrome = original;
        }
      })();
    },
    collection_lifetime_and_legacy_compatibility() {
      return (async () => {
        const storage = storageFor({ citations: [personCitation()] });
        const loaded = await loadActiveCollection(storage, () => "legacy-id");
        assert.equal(loaded.id, "legacy-id");
        const ctx = buildCollectionContext(loaded);
        const state = input("deathNotice", ctx);
        await saveResearchSubject(storage, ctx, state);
        const active = (await storage.get()).collectedCitations;
        assert.equal(active.nbContext.subjectKey, subject);
        assert.equal(active.citations.length, 1);
        storage.replace({ id: "new-collection", citations: [] });
        await assert.rejects(saveResearchSubject(storage, ctx, state), /collection changed/);
        assert.equal(buildCollectionContext((await storage.get()).collectedCitations).selectedSubjectKey, "");
        storage.replace(undefined);
        assert.equal(await loadActiveCollection(storage, () => "unused"), undefined);
        await assert.rejects(saveResearchSubject(storage, ctx, state), /collection changed/);
        storage.replace(active); // Restoring the saved collection restores only research context.
        const restored = buildCollectionContext(await loadActiveCollection(storage, () => "unused"));
        assert.equal(prepareUserInput(ed, undefined, restored).state.personName, "Anna Hansen");
        assert.equal(prepareUserInput(ed, undefined, restored).state.confirmDate, "no");
      })();
    },
  };
  const logger = new LocalErrorLogger(testManager.results, "nb_behavior");
  console.log("=== Starting test : nb_behavior ===");
  for (const [caseName, check] of Object.entries(tests)) {
    if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== caseName) continue;
    testManager.results.totalTestsRun++;
    try {
      await check();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
  console.log((logger.numFailedTests ? "Test failed" : "Test passed") + " (nb_behavior).");
}
export { runTests };
