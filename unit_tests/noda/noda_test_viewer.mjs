/*
MIT License

Copyright (c) 2020 Robert M Pavey

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
import fs from "node:fs";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { generalizeData } from "../../extension/site/noda/core/noda_generalize_data.mjs";
import { buildCitation } from "../../extension/site/noda/core/noda_build_citation.mjs";
import {
  viewerSelectionFromUrl,
  sameViewerSelection,
  normalizeViewerMetadata,
  loadViewerMetadata,
  assertViewerSelection,
} from "../../extension/site/noda/core/noda_viewer_metadata.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { writeTestOutputFile } from "../test_utils/ref_file_utils.mjs";
import { compareOrReplaceRefFileWithResult } from "../test_utils/helper_utils.mjs";

const names = ["voss_1794", "voss_1899", "voss_1888", "mixed_1792"];
const fixture = (name = "voss_1899") =>
  JSON.parse(fs.readFileSync(new URL(`./viewer_fixtures/${name}.json`, import.meta.url)));
function plainText(html) {
  const document = new JSDOM(html).window.document;
  document.querySelectorAll("script, style").forEach((node) => node.remove());
  return document.body.textContent;
}
function record(data = fixture()) {
  return normalizeViewerMetadata(viewerSelectionFromUrl(data.url), data, plainText);
}
function extractor() {
  const context = vm.createContext({ URL, console, logDebug() {} });
  vm.runInContext(fs.readFileSync("extension/site/noda/browser/noda_extract_data.js", "utf8"), context);
  return context.extractData;
}
function fetchFixture(data) {
  return async (url) => {
    if (url.includes("/manifest/")) return data.manifest;
    if (url.includes("/file-info/")) return data.fileInfo;
    if (url.endsWith("/pagination")) return data.pagination;
    throw new Error("Unexpected request: " + url);
  };
}

async function runTests(testManager) {
  if (testManager.parameters.testName && testManager.parameters.testName !== "viewer") return;
  const logger = new LocalErrorLogger(testManager.results, "noda_viewer");
  console.log("=== Starting test : noda_viewer ===");
  const tests = {
    recognizes_only_supported_image_routes() {
      const data = fixture();
      const extract = extractor();
      const doc = new JSDOM('<!doctype html><html lang="no"></html>').window.document;
      const address = data.url + "?view=index&current_list_type=gr";
      assert.equal(extract(doc, address).success, true);
      assert.equal(viewerSelectionFromUrl(address).imageUuid, data.fileInfo.uuid);
      for (const url of [
        "https://nye.digitalarkivet.no/source/4536",
        data.url.replace("/parish/", "/photo/"),
        data.url.replace("https:", "http:"),
        data.url.replace(".no/", ".no:444/"),
        data.url.replace(data.fileInfo.uuid, "invalid"),
      ]) {
        assert.equal(viewerSelectionFromUrl(url).success, false);
        assert.equal(extract(doc, url).success, false);
      }
    },
    source_metadata_is_not_personal_event_data() {
      const ed = record();
      assert.equal(ed.sourceInformation, "Church book from Voss parish, Voss local parish 1887-1909 (1235P)");
      assert.equal(ed.viewerMetadata.archiveReference, "AV/SAB-A-79001/H/Haa");
      assert.equal(ed.viewerMetadata.protocol, "A 22");
      assert.equal(ed.viewerMetadata.printedPage, "55");
      assert.equal(ed.viewerMetadata.contents, "Burials, 1899");
      assert.equal(ed.imagePageUrl, "https://goto.digitalarkivet.no/kb20060621010324");
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.name, undefined);
      assert.equal(gd.eventDate, undefined);
      assert.equal(gd.birthDate, undefined);
      assert.equal(gd.deathDate, undefined);
    },
    rejects_metadata_for_another_source_or_image() {
      const data = fixture();
      data.fileInfo.uuid = fixture("voss_1794").fileInfo.uuid;
      assert.throws(() => record(data), /different image/);
      const wrongSource = fixture();
      wrongSource.manifest.id = fixture("voss_1794").manifest.id;
      assert.throws(() => record(wrongSource), /different source/);
      const wrongCanvas = fixture();
      wrongCanvas.manifest.items = [];
      assert.throws(() => record(wrongCanvas), /different source or image/);
    },
    preserves_missing_roman_and_compound_printed_pages() {
      const data = fixture();
      for (const page of ["iv", "55v", "55–56", ""]) {
        data.pagination[data.fileInfo.uuid].page = page;
        assert.equal(record(data).viewerMetadata.printedPage, page);
      }
      delete data.pagination[data.fileInfo.uuid].page;
      assert.equal(record(data).viewerMetadata.printedPage, "");
      // The focused manifest contains a single canvas, yet the printed page is 131.
      assert.equal(record(fixture("voss_1794")).viewerMetadata.printedPage, "131");
    },
    norwegian_fallback_and_inert_metadata_markup() {
      const data = fixture();
      delete data.manifest.label.en;
      data.manifest.metadata.find((field) => field.label.en[0] === "Archive reference").value.en = [
        "<script>bad()</script><a href='https://example.invalid'>AV/TEST</a> &amp; text",
      ];
      const ed = record(data);
      assert.ok(ed.sourceInformation.startsWith("Ministerialbok"));
      assert.equal(ed.viewerMetadata.archiveReference, "AV/TEST & text");
    },
    async optional_failures_keep_verified_details_and_exact_link_fallback() {
      const data = fixture();
      const selection = viewerSelectionFromUrl(data.url);
      const ed = await loadViewerMetadata(
        selection,
        async () => {
          throw Error("Offline");
        },
        async () => selection,
        plainText
      );
      assert.equal(ed.success, true);
      assert.equal(ed.metadataUnavailable, true);
      assert.equal(ed.imagePageUrl, data.url);
      assert.equal(ed.viewerMetadata.printedPage, "");
      const partial = await loadViewerMetadata(
        selection,
        async (url) => {
          if (url.includes("/file-info/")) return data.fileInfo;
          throw Error("Offline");
        },
        async () => selection,
        plainText
      );
      assert.equal(partial.fileTitle, data.fileInfo.info);
      assert.equal(partial.permanentId, data.fileInfo.urnId);
    },
    async rejects_navigation_during_load_and_before_generation() {
      const data = fixture();
      const selection = viewerSelectionFromUrl(data.url);
      const other = viewerSelectionFromUrl(fixture("voss_1794").url);
      await assert.rejects(
        loadViewerMetadata(selection, fetchFixture(data), async () => other, plainText),
        /image changed/
      );
      await assert.rejects(
        assertViewerSelection(selection, async () => other),
        /image changed/
      );
      assert.equal(sameViewerSelection(selection, viewerSelectionFromUrl(data.url + "?view=index")), true);
    },
  };
  for (const name of names)
    tests[name] = () => {
      const data = fixture(name);
      const document = new JSDOM(fs.readFileSync(new URL(`./viewer_fixtures/${name}.html`, import.meta.url))).window
        .document;
      assert.equal(extractor()(document, data.url).success, true);
      const ed = record(data);
      const gd = generalizeData({ extractedData: ed });
      const output = {};
      const variants = {
        std: {},
        plain: { citation_general_target: "plain" },
        referenceAtEnd: { citation_general_referencePosition: "atEnd" },
        plainReferenceAtEnd: { citation_general_target: "plain", citation_general_referencePosition: "atEnd" },
        permanentId: { citation_noda_linkFormat: "withPermanentId" },
        visible: { citation_noda_linkFormat: "visible" },
      };
      for (const [variant, overrides] of Object.entries(variants)) {
        for (const type of ["inline", "narrative", "source"]) {
          const options = { ...testManager.options, ...overrides };
          const result = buildCitation({
            extractedData: ed,
            generalizedData: gd,
            type,
            options,
            runDate: new Date("6 May 2021"),
          });
          if (!(options.citation_general_target === "plain" && type === "narrative")) {
            assert.ok(result.citation.includes(ed.imagePageUrl));
            assert.ok(result.sourceReference.includes("Page: " + ed.viewerMetadata.printedPage));
            assert.equal(result.sourceReference.split("Page: ").length - 1, 1);
            assert.ok(result.sourceReference.includes("Protocol: " + ed.viewerMetadata.protocol));
          }
          output[variant + "_" + type] = { citation: result.citation, type };
        }
      }
      const testData = { caseName: name };
      writeTestOutputFile(output, "noda", "viewer_citations", testData, logger);
      compareOrReplaceRefFileWithResult(output, "noda", testManager, "viewer_citations", testData, logger);
    };
  for (const [caseName, test] of Object.entries(tests)) {
    if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== caseName) continue;
    testManager.results.totalTestsRun++;
    try {
      await test();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
  console.log((logger.numFailedTests ? "Test failed" : "Test passed") + " (noda_viewer).");
}
export { runTests };
