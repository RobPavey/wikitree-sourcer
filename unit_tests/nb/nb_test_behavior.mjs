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
import { fixture, record, extract } from "./nb_test_fixtures.mjs";
import { noticeTypes } from "../../extension/site/nb/core/nb_notice_types.mjs";
import { readNbDate, dateText } from "../../extension/site/nb/core/nb_dates.mjs";
import {
  normalizeMetadata,
  loadNbMetadata,
  selectionFromUrl,
  sameSelection,
} from "../../extension/site/nb/core/nb_metadata.mjs";
import {
  prepareUserInput,
  passageInput,
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
function input(category = "deathNotice") {
  const state = prepareUserInput(ed).state;
  state.personName = "Anna Hansen";
  state.category = category;
  return prepareUserInput(ed, state).state;
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
      assert.ok(!citation(gd, testManager.options, "narrative", book).startsWith("This person"));
      assert.ok(!citation(gd, testManager.options, "narrative", book).includes("was mentioned"));
    },
    transcribed_event_facts_are_attributed() {
      const state = input();
      state.eventDate = "4 May 1920";
      state.eventPlace = "Bergen";
      const gd = output(state);
      assert.equal(gd.deathDate.getDateString(), "4 May 1920");
      assert.equal(gd.deathPlace.placeString, "Bergen");
      assert.ok(citation(gd, testManager.options).includes("The notice reported the death on 4 May 1920"));
    },
    deliberate_empty_values_survive_rebuilds() {
      const state = input();
      state.eventDate = "";
      state.personName = "";
      prepareUserInput(ed, state);
      const form = getRequestedUserInput({ extractedData: ed, newData: state, type: "narrative" });
      assert.equal(form.resultData.personName, "");
      assert.equal(form.fields.find((field) => field.property === "personName").defaultValue, "");
      assert.equal(form.resultData.eventDate, "");
    },
    partial_dates_keep_precision_and_qualifiers() {
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
        passage: passageInput(book, { personName: "Anna Hansen", printedPages: "iv–v" }),
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
      assert.equal(extract("", upper).url, "https://www.nb.no/items/" + ed.itemId + "?page=0");
      assert.deepEqual(selectionFromUrl(upper), { success: true, itemId: ed.itemId, pageIndex: 0 });
    },
    invalid_user_dates_are_reported() {
      const state = input();
      state.eventDate = "31 February 1920";
      assert.ok(getInputError(ed, state));
      assert.ok(getRequestedUserInput({ extractedData: ed, newData: state }).validationError);
      assert.throws(() => output(state), /valid event date/);
    },
    urn_routes_use_permanent_links_and_preserve_the_selected_page() {
      for (const [kind, page] of [
        ["urn_newspaper", 1],
        ["urn_book", 585],
      ]) {
        const item = fixture(kind + "_item");
        const urn = item.metadata.identifiers.urn;
        const url = "https://www.nb.no/items/" + urn + "?page=" + page;
        const selection = extract("", url);
        assert.equal(selection.success, true);
        assert.equal(selection.itemId, urn);
        assert.equal(selection.pageIndex, page);
        const encoded = url.replaceAll(":", "%3A").replace("https%3A", "https:");
        assert.deepEqual(selectionFromUrl(encoded), selectionFromUrl(url));
        assert.equal(extract("", encoded).itemId, urn);
        const normalized = record(kind);
        assert.equal(normalized.url, url);
        assert.equal(normalized.itemId, item.metadata.identifiers.sesamId);
        assert.equal(sameSelection(selection, normalized), true);
        const gd = generalizeData({ extractedData: normalized });
        for (const target of ["wikitree", "plain"]) {
          for (const type of ["inline", "narrative", "source"]) {
            const result = buildCitation({
              extractedData: normalized,
              generalizedData: gd,
              options: { ...testManager.options, citation_general_target: target },
              type,
              runDate: new Date(2026, 10, 10),
            });
            assert.ok(result.citation.includes(url));
            assert.equal(result.url, url);
            assert.ok(!result.citation.includes("https://www.nb.no/items/" + normalized.itemId));
          }
        }
      }
    },
    id_routes_and_older_extracted_data_also_generate_urn_links() {
      const gd = generalizeData({ extractedData: ed });
      const hashUrl = "https://www.nb.no/items/" + ed.itemId + "?page=0";
      const expected = "https://www.nb.no/items/" + ed.urn + "?page=0";
      assert.equal(ed.url, expected);
      const result = buildCitation({
        extractedData: { ...ed, url: hashUrl },
        generalizedData: gd,
        options: testManager.options,
        type: "source",
        runDate: new Date(),
      });
      assert.equal(result.url, expected);
      assert.ok(result.citation.includes(expected));
      assert.ok(!result.citation.includes(hashUrl));
      const missingUrn = structuredClone(fixture("newspaper_item"));
      delete missingUrn.metadata.identifiers.urn;
      const fallback = normalizeMetadata(ed, missingUrn);
      assert.equal(fallback.url, hashUrl); // Do not invent an identifier when NB supplies none.
    },
    alias_navigation_keeps_identity_checks_without_false_stale_page_errors() {
      return (async () => {
        const fetch = async (url) =>
          url.includes("/iiif/") ? fixture("newspaper_manifest") : fixture("newspaper_item");
        const urnSelection = { ...ed, itemId: ed.urn };
        assert.equal((await loadNbMetadata(urnSelection, fetch, async () => ed)).url, ed.url);
        assert.equal((await loadNbMetadata(ed, fetch, async () => urnSelection)).url, ed.url);
        await assert.rejects(
          loadNbMetadata(urnSelection, fetch, async () => ({
            ...urnSelection,
            itemId: fixture("book_item").metadata.identifiers.urn,
          })),
          /changed/
        );
        await assert.rejects(
          loadNbMetadata(urnSelection, fetch, async () => ({ ...urnSelection, pageIndex: 1 })),
          /changed/
        );
      })();
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
          const originalCitation = { url: "https://example.org/prior", sourceTitle: "Earlier source" };
          await addCitationToCollectedCitations(originalCitation);
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
          assert.equal(data.collectedCitations.citations.length, 3);
          assert.deepEqual(data.collectedCitations.citations[0], originalCitation);
          const saved = structuredClone(data.collectedCitations);
          await stopCollectingCitations();
          assert.equal(await getCollectedCitations(), undefined);
          await restoreCollectedCitations();
          assert.deepEqual(data.collectedCitations, saved);
          await startNewCollectedCitations();
          assert.deepEqual(data.collectedCitations, { citations: [] });
        } finally {
          if (original === undefined) delete globalThis.chrome;
          else globalThis.chrome = original;
        }
      })();
    },
    new_forms_start_without_person_or_event_facts() {
      for (const kind of ["newspaper", "book"]) {
        const form = getRequestedUserInput({ extractedData: record(kind) });
        for (const key of ["personName", "eventDate", "eventPlace", "secondPerson", "printedPages", "passageHeading"])
          assert.equal(form.resultData[key], "");
        assert.ok(!form.fields.some((field) => /subjectKey|alias|suggestion|confirm/i.test(field.id)));
      }
    },
    changing_person_or_category_clears_event_facts_and_generalized_data() {
      const state = input();
      state.eventDate = "1920";
      state.eventPlace = "Bergen";
      const gd = output(state);
      assert.equal(gd.deathDate.getDateString(), "1920");
      state.category = "marriage";
      prepareUserInput(ed, state);
      regeneralizeData({ extractedData: ed, generalizedData: gd, newData: state });
      assert.equal(gd.deathDate, undefined);
      assert.equal(gd.deathPlace, undefined);
      assert.equal(gd.overrideRefTitle, "Marriage Notice");
      state.eventDate = "1921";
      state.eventPlace = "Oslo";
      state.secondPerson = "Ole Olsen";
      state.personName = "Åse Østby";
      prepareUserInput(ed, state);
      for (const key of ["eventDate", "eventPlace", "secondPerson"]) assert.equal(state[key], "");
      regeneralizeData({ extractedData: ed, generalizedData: gd, newData: state });
      assert.ok(!citation(gd, testManager.options).includes("Ole Olsen"));
      state.personName = "";
      prepareUserInput(ed, state);
      regeneralizeData({ extractedData: ed, generalizedData: gd, newData: state });
      assert.equal(gd.name, undefined);
      assert.equal(gd.userOverrideForNarrative, undefined);
      assert.ok(!citation(gd, testManager.options).includes("was named"));
    },
    second_person_is_only_used_for_couple_notices() {
      const state = input("marriage");
      state.secondPerson = "Ole Olsen";
      assert.ok(citation(output(state), testManager.options).includes("also named Ole Olsen"));
      state.category = "mention";
      assert.equal(passageInput(ed, state).secondPerson, undefined);
      assert.equal(
        passageInput(ed, { ...state, category: "deathNotice", personName: "", eventDate: "1920" }).eventDate,
        undefined
      );
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
