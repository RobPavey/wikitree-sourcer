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
import fs from "node:fs";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { generalizeData } from "../../extension/site/gravminner/core/gravminner_generalize_data.mjs";
import { GravminnerEdReader } from "../../extension/site/gravminner/core/gravminner_ed_reader.mjs";
import { buildCitation } from "../../extension/site/gravminner/core/gravminner_build_citation.mjs";
import { getSiteRegistry } from "../../extension/base/core/site_registry.mjs";
import "../../extension/site/gravminner/core/gravminner_site_data.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

const context = vm.createContext({ URL });
vm.runInContext(fs.readFileSync("extension/site/gravminner/browser/gravminner_extract_data.js", "utf8"), context);
const id = "259e0d76-270e-4a55-b46d-d36270407cae";
const url = "https://slektogdata.no/gravminner/grav/" + id;
const saved = (name) => fs.readFileSync("unit_tests/gravminner/saved_pages/" + name + ".html", "utf8");
const extract = (html, address = url) => context.extractData(new JSDOM(html).window.document, address);
const read = (name, address = url) => extract(saved(name), address);

async function runTests(testManager) {
  if (testManager.parameters.testName && testManager.parameters.testName !== "behavior") return;
  const logger = new LocalErrorLogger(testManager.results, "gravminner_behavior");
  const checks = {
    person_isolation() {
      const ed = read("signe_strande");
      assert.equal(ed.success, true);
      assert.equal(ed.fullName, "Signe Strande");
      assert.equal(ed.birthDate, "24.04.1936");
      assert.equal(ed.photographer, "Terje Strømsnes");
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.birthDate.getDateString(), "24 Apr 1936");
      assert.equal(gd.deathDate.getDateString(), "6 Mar 2022");
      assert.equal(gd.eventDate.getDateString(), "16 May 2022");
      assert.equal(gd.recordType, "Burial");
      assert.equal(gd.personGender, "female");
      assert.equal(gd.deathPlace, undefined);
      assert.equal(gd.parents, undefined);
      assert.equal(gd.spouses, undefined);
      assert.equal(gd.householdArray, undefined);
      const citation = buildCitation({
        extractedData: ed,
        generalizedData: gd,
        options: testManager.options,
        type: "inline",
        runDate: new Date(2026, 10, 9),
      }).citation;
      assert.ok(citation.includes("Signe Strande"));
      assert.ok(citation.includes(id));
      assert.ok(citation.includes("Kolbotn, Nordre Follo, Akershus, Norge"));
      assert.ok(!citation.includes("John Strande"));
      assert.ok(!citation.includes("Terje Strømsnes"));
      assert.ok(!citation.includes("January 2000"));
    },
    structured_maiden_name() {
      const address = "https://slektogdata.no/gravminner/grav/ea281e18-402a-4724-b151-4733c7ec0bbd";
      const ed = read("magdalene_johansen", address);
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.lastNameAtBirth, "Rasmusdatter");
      assert.equal(gd.lastNameAtDeath, "Johansen");
      assert.equal(ed.birthPlace, "Skånland Store");
      assert.ok(ed.sourceReference.includes("født Skånland Store"));
      assert.equal(gd.recordType, "Memorial");
    },
    monument_does_not_assert_burial() {
      const ed = read(
        "anders_olsen_grov",
        "https://slektogdata.no/gravminner/grav/b8ac84e7-ba92-4dcb-8982-522be1be5c5b"
      );
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.birthDate.getDateString(), "1890");
      assert.equal(gd.recordType, "Memorial");
      assert.equal(gd.eventDate, undefined);
      assert.equal(gd.eventPlace, undefined);
      assert.equal(gd.deathPlace, undefined);
      const citation = buildCitation({
        extractedData: ed,
        generalizedData: gd,
        options: testManager.options,
        type: "narrative",
        runDate: new Date(2026, 10, 9),
      }).citation;
      assert.ok(!citation.includes("was buried"));
    },
    date_precision_and_validation() {
      const reader = new GravminnerEdReader({ success: true });
      for (const [raw, expected] of [
        ["1900", "1900"],
        ["00.00.1900", "1900"],
        ["00.04.1900", "Apr 1900"],
        ["01.02.1900", "1 Feb 1900"],
        ["29.02.2000", "29 Feb 2000"],
      ]) {
        assert.equal(reader.readDate(raw).getDateString(), expected);
      }
      for (const raw of ["", "Ukjent", "00.00.0000", "31.02.1900", "29.02.1900", "01.00.1900", "00.13.1900"]) {
        assert.equal(reader.readDate(raw), undefined);
      }
    },
    ceremony_is_not_burial() {
      const ed = read("ceremony_only", "https://slektogdata.no/gravminner/grav/33333333-3333-3333-3333-333333333333");
      const gd = generalizeData({ extractedData: ed });
      assert.equal(gd.recordType, "Memorial");
      assert.equal(gd.eventDate, undefined);
      assert.equal(gd.deathDate.getDateString(), "1980");
    },
    citation_options_and_missing_values() {
      const ed = read("signe_strande");
      const gd = generalizeData({ extractedData: ed });
      const input = {
        extractedData: ed,
        generalizedData: gd,
        options: testManager.options,
        type: "inline",
        runDate: new Date(2026, 10, 9),
      };
      assert.ok(buildCitation(input).citation.includes("accessed 9 November 2026"));
      const withoutDate = buildCitation({
        ...input,
        options: { ...testManager.options, citation_general_addAccessedDate: "none" },
      }).citation;
      assert.ok(!withoutDate.includes("accessed"));
      const plain = buildCitation({
        ...input,
        options: { ...testManager.options, citation_general_target: "other" },
      }).citation;
      assert.ok(!plain.includes("<ref>"));
      assert.ok(plain.includes(url));
      const empty = read("no_dates", "https://slektogdata.no/gravminner/grav/22222222-2222-2222-2222-222222222222");
      const citation = buildCitation({
        ...input,
        extractedData: empty,
        generalizedData: generalizeData({ extractedData: empty }),
      }).citation;
      assert.ok(citation.includes("Memorial for Anne Olsen."));
      assert.ok(!citation.includes("undefined"));
      assert.ok(!citation.includes("memorial location:"));
      assert.ok(!citation.includes("burial date:"));
    },
    canonical_url() {
      assert.equal(read("signe_strande", "http://www.slektogdata.no/gravminner/grav/" + id + "/?q=1#photo").url, url);
    },
    invalid_pages_and_stale_navigation() {
      for (const address of [
        "https://slektogdata.no/gravminner/finn-en-grav",
        "https://example.com/gravminner/grav/" + id,
        "https://slektogdata.no/gravminner/grav/not-an-id",
        "https://slektogdata.no/gravminner/grav/11111111-1111-1111-1111-111111111111",
        "not a URL",
      ]) {
        assert.equal(read("signe_strande", address).success, false);
      }
      assert.equal(extract("<h1>Page not found</h1>").success, false);
      assert.equal(
        extract(
          saved("signe_strande")
            .replace('data-key="firstName"', 'data-key="missingFirst"')
            .replace('data-key="surname"', 'data-key="missingLast"')
        ).success,
        false
      );
      const noId = saved("signe_strande").replaceAll(id, "11111111-1111-1111-1111-111111111111");
      assert.equal(extract(noId).success, false);
      assert.equal(extract(noId).dataMayBeIncomplete, true);
      assert.equal(extract("<h1>Loading</h1>").dataMayBeIncomplete, true);
      assert.equal(extract(saved("signe_strande") + saved("signe_strande")).success, false);
      const ed = extract("<h1>Page not found</h1>");
      const gd = generalizeData({ extractedData: ed });
      assert.ok(!gd.hasValidData);
      assert.throws(() => buildCitation({ extractedData: ed, generalizedData: gd }), /loaded Gravminner/);
    },
    manifests_and_registered_modules() {
      const site = getSiteRegistry().gravminner;
      assert.equal(site.repositoryName, "Slekt og Data – Gravminner");
      assert.ok(site.matches.includes("*://slektogdata.no/gravminner*"));
      assert.ok(site.matches.includes("*://www.slektogdata.no/gravminner*"));
      for (const manifest of [
        "extension/manifest.json",
        "browser_variants/firefox/manifest.json",
        "browser_variants/safari/macos/manifest.json",
        "browser_variants/safari/ios/manifest.json",
      ]) {
        const data = JSON.parse(fs.readFileSync(manifest, "utf8"));
        for (const host of ["*://slektogdata.no/*", "*://www.slektogdata.no/*"])
          assert.ok(data.optional_host_permissions.includes(host));
      }
      for (const name of ["content.js", "extract_data.js", "popup.html", "popup.mjs", "popup_search.mjs"]) {
        assert.ok(fs.existsSync("extension/site/gravminner/browser/gravminner_" + name));
      }
    },
  };
  console.log("=== Starting test : gravminner_behavior ===");
  for (const [caseName, check] of Object.entries(checks)) {
    if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== caseName) continue;
    testManager.results.totalTestsRun++;
    try {
      check();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
}
export { runTests };
