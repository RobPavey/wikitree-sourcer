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
import { generalizeData } from "../../extension/site/dfs/core/dfs_generalize_data.mjs";
import { DfsEdReader, recordType } from "../../extension/site/dfs/core/dfs_ed_reader.mjs";
import { buildCitation } from "../../extension/site/dfs/core/dfs_build_citation.mjs";
import { getSiteRegistry } from "../../extension/base/core/site_registry.mjs";
import "../../extension/site/dfs/core/dfs_site_data.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { SearchWithParametersData } from "../../extension/site/dfs/core/dfs_search_menu_data.mjs";

const source = fs.readFileSync("extension/site/dfs/browser/dfs_extract_data.js", "utf8");
const content = fs.readFileSync("extension/site/dfs/browser/dfs_content.js", "utf8");
const base = "https://www.danishfamilysearch.dk";
const addresses = {
  census_1845_hans: "/cid5500978",
  church_1840_hans: "/kbid953766",
  school_1811_hans: "/sogn804/skole66/source152527/opslag17728149",
  levy_1791_hans: "/kilder/laegdsruller/kreds2/bsid17267/opslag12157806",
  church_image_1840: "/churchbook/sogn701/churchlisting143098/opslag15978995",
};
const saved = (name) => fs.readFileSync("unit_tests/dfs/saved_pages/" + name + ".html", "utf8");
const context = vm.createContext({ URL });
vm.runInContext(source, context);
function page(name) {
  return new JSDOM(saved(name), { url: base + (addresses[name] || "/search/") });
}
function extract(dom) {
  return context.extractData(dom.window.document, dom.window.location.href);
}
function read(name) {
  return extract(page(name));
}
function select(dom, id) {
  const ed = extract(dom);
  const selector = dom.window.document.createElement("select");
  selector.id = "sourcer-dfs-person";
  selector.dataset.indexSignature = ed.indexSignature;
  const option = dom.window.document.createElement("option");
  option.value = id;
  selector.appendChild(option);
  dom.window.document.body.appendChild(selector);
  return extract(dom);
}
const flush = async () => {
  for (let i = 0; i < 8; i++) await new Promise((resolve) => setImmediate(resolve));
};
function runner(dom, initial) {
  let data = initial;
  let submitted = 0;
  let resets = 0;
  const sandbox = vm.createContext({
    URL,
    document: dom.window.document,
    window: dom.window,
    Event: dom.window.Event,
    console,
    setTimeout: () => 1,
    MutationObserver: class {
      observe() {}
    },
    siteContentInit() {},
    chrome: {
      storage: {
        local: {
          async get() {
            return { searchData: data };
          },
          async set(value) {
            data = value.searchData;
          },
          async remove() {
            data = undefined;
          },
        },
      },
    },
  });
  dom.window.document.querySelector('[id$="btn_search"]')?.addEventListener("click", () => submitted++);
  dom.window.document.querySelector('[id$="btn_reset"]')?.addEventListener("click", () => resets++);
  vm.runInContext(source, sandbox);
  vm.runInContext(content, sandbox);
  return {
    sandbox,
    get data() {
      return data;
    },
    get submitted() {
      return submitted;
    },
    get resets() {
      return resets;
    },
  };
}
function request(extra = {}) {
  return {
    url: base + "/search/",
    timeStamp: Date.now(),
    fieldData: { firstname: "Hans", lastname: "Hansen", bornyearfrom: "1838", bornyearto: "1842" },
    selectData: { groups: ["churchbook"], autoSubmit: true },
    refineData: { dfsReset: true },
    ...extra,
  };
}

async function runTests(manager) {
  if (manager.parameters.testName && manager.parameters.testName !== "behavior") return;
  const checks = {
    missing_record_and_login() {
      const dom = page("logged_out");
      dom.reconfigure({ url: base + "/cid5500978" });
      const ed = extract(dom);
      assert.equal(ed.success, false);
      assert.match(ed.overrideFailureMessage, /Sign in/);
      assert.equal(
        context.extractData(
          new JSDOM('<a id="header_hyp_userinfo" href="/user">Signed in</a>').window.document,
          base + "/forum/"
        ).success,
        false
      );
      assert.equal(
        context.extractData(page("census_1845_hans").window.document, "https://example.com/cid5500978").success,
        false
      );
    },
    stale_census() {
      const dom = page("census_1845_hans");
      dom.reconfigure({ url: base + "/cid5500974" });
      assert.equal(extract(dom).success, false);
    },
    image_selection_is_invalidated() {
      const dom = page("school_1811_hans");
      assert.equal(select(dom, "1562153").imageOnly, false);
      dom.window.document.querySelector('input[id$="cmb_opslag_Input"]').value = "Opslag 18";
      assert.equal(extract(dom).imageOnly, true);
    },
    both_domain_aliases() {
      for (const host of [
        "danishfamilysearch.dk",
        "www.danishfamilysearch.dk",
        "danishfamilysearch.com",
        "www.danishfamilysearch.com",
      ]) {
        const ed = context.extractData(page("census_1845_hans").window.document, "https://" + host + "/cid5500978");
        assert.equal(ed.success, true);
      }
    },
    danish_dates() {
      const reader = new DfsEdReader({});
      for (const [raw, expected] of [
        ["23 Februar 1840", "23 Feb 1840"],
        ["Maj 1811", "May 1811"],
        ["19 Okt 1840", "19 Oct 1840"],
        ["1840", "1840"],
        ["13 Octbr. 1841", "13 Oct 1841"],
        ["23.02.1840", "23 Feb 1840"],
      ])
        assert.equal(reader.readDate(raw).getDateString(), expected);
      assert.equal(reader.readDate("not a date"), undefined);
      assert.equal(reader.readDate("ca. 1840").qualifier, 2);
    },
    explicit_record_types() {
      for (const [entryType, expected] of [
        ["Fødte", "Birth"],
        ["Døbte", "Baptism"],
        ["Konfirmerede", "Confirmation"],
        ["Viede", "Marriage"],
        ["Viede/Trolovede", "OtherChurchEvent"],
        ["Døde", "Death"],
        ["Begravede", "Burial"],
        ["Døde og Begravede", "DeathOrBurial"],
        ["Fødte og Døbte", "BirthOrBaptism"],
      ])
        assert.equal(recordType({ group: "churchbook", entryType }), expected);
    },
    individual_census_household_context() {
      const ed = read("census_1845_hans");
      const cite = (record, table = "") =>
        buildCitation({
          extractedData: record,
          generalizedData: generalizeData({ extractedData: record }),
          options: manager.options,
          runDate: new Date(2026, 10, 12),
          type: "inline",
          householdTableString: table,
        }).citation;
      assert.ok(cite(ed).includes("Hans Andreasen Hansen in the household of Hans Andreasen"));
      const head = { ...ed, recordId: "cid5500973", fullName: "Hans Andreasen" };
      assert.ok(!cite(head).includes("in the household of"));
      // Identical names still represent different people: use record IDs, not name equality.
      ed.household[0].Navn = ed.fullName;
      assert.ok(cite(ed).includes("in the household of Hans Andreasen Hansen"));
      assert.ok(!cite(ed, "{|\n| Household table\n|}").includes("in the household of"));
      assert.ok(!cite({ ...ed, household: [] }).includes("in the household of"));
      assert.ok(!cite({ ...ed, recordId: "cid999999" }).includes("in the household of"));
      assert.ok(!cite({ ...ed, group: "churchbook" }).includes("in the household of"));
    },
    explicit_census_head_overrides_display_order() {
      const ed = read("census_1845_hans");
      ed.household[1].Information = "Husmoder";
      const cite = () =>
        buildCitation({
          extractedData: ed,
          generalizedData: generalizeData({ extractedData: ed }),
          options: manager.options,
          runDate: new Date(2026, 10, 12),
          type: "inline",
        }).citation;
      assert.ok(cite().includes("in the household of Kirsten Hansdatter"));
      ed.household[0].Information = "Husfader";
      assert.ok(!cite().includes("in the household of"));
    },
    invalid_page_cannot_be_cited() {
      assert.throws(() => buildCitation({ extractedData: read("logged_out"), generalizedData: {} }));
    },
    async fills_and_submits_once() {
      const dom = page("search");
      const run = runner(dom, request());
      await flush();
      await run.sandbox.checkForDfsSearch();
      assert.equal(run.submitted, 1);
      assert.equal(run.data, undefined);
      assert.equal(dom.window.document.querySelector('[id$="txt_firstname"]').value, "Hans");
      assert.equal(dom.window.document.querySelector('[id$="txt_gadenavn"]').value, "");
      assert.equal(dom.window.document.querySelector('[id$="chk_churchbook"]').checked, true);
      assert.equal(dom.window.document.querySelector('[id$="chk_census"]').checked, false);
      assert.equal(dom.window.document.querySelector('[name="__VIEWSTATE"]').value, "synthetic-preserve-me");
    },
    async reset_round_trip() {
      const run = runner(page("search"), request({ refineData: {} }));
      await flush();
      await run.sandbox.checkForDfsSearch();
      assert.equal(run.resets, 1);
      assert.equal(run.submitted, 0);
      assert.equal(run.data.refineData.dfsReset, true);
      const next = runner(page("search"), run.data);
      await flush();
      assert.equal(next.resets, 0);
      assert.equal(next.submitted, 1);
    },
    async review_mode() {
      const run = runner(page("search"), request({ selectData: { groups: ["census"], autoSubmit: false } }));
      await flush();
      assert.equal(run.submitted, 0);
      assert.equal(run.data, undefined);
    },
    async stale_and_future_requests() {
      for (const timeStamp of [Date.now() - 61000, Date.now() + 61000, undefined]) {
        const run = runner(page("search"), request({ timeStamp }));
        await flush();
        assert.equal(run.submitted, 0);
        assert.ok(run.data);
      }
    },
    async other_sites_are_untouched() {
      const run = runner(page("search"), request({ url: "https://example.com/search/" }));
      await flush();
      assert.equal(run.submitted, 0);
      assert.ok(run.data);
    },
    async login_requires_retry() {
      const dom = page("logged_out");
      const run = runner(dom, request());
      await flush();
      assert.equal(run.submitted, 0);
      assert.ok(run.data.refineData.dfsLoginBlocked);
      assert.match(dom.window.document.body.textContent, /Sign in/);
      const loggedIn = runner(page("search"), run.data);
      await flush();
      assert.equal(loggedIn.submitted, 0);
    },
    async changed_form_does_not_submit() {
      const dom = page("search");
      dom.window.document.querySelector('[id$="txt_lastname"]').remove();
      const run = runner(dom, request());
      await flush();
      assert.equal(run.submitted, 0);
      assert.ok(run.data);
    },
    async selector_rebuilds_after_index_change() {
      const dom = page("school_1811_hans");
      const run = runner(dom);
      await flush();
      const selector = dom.window.document.getElementById("sourcer-dfs-person");
      assert.equal(selector.value, "");
      selector.value = "1562153";
      assert.equal(extract(dom).fullName, "Hans Hansen");
      dom.window.document.querySelector('input[id$="cmb_opslag_Input"]').value = "Opslag 18";
      run.sandbox.updateDfsPersonSelector();
      assert.equal(dom.window.document.getElementById("sourcer-dfs-person").value, "");
      assert.equal(extract(dom).imageOnly, true);
    },
    registration_and_manifests() {
      assert.equal(getSiteRegistry().dfs.repositoryName, "Danish Family Search");
      for (const name of [
        "extension/manifest.json",
        "browser_variants/firefox/manifest.json",
        "browser_variants/safari/macos/manifest.json",
        "browser_variants/safari/ios/manifest.json",
      ]) {
        const manifest = JSON.parse(fs.readFileSync(name, "utf8"));
        for (const domain of ["dk", "com"])
          assert.ok(manifest.optional_host_permissions.includes("*://*.danishfamilysearch." + domain + "/*"));
      }
    },
    specified_text_fields_bind_parameters() {
      const dom = new JSDOM("<ul></ul>");
      const module = fs.readFileSync("extension/base/browser/popup/popup_search_with_parameters.mjs", "utf8");
      const start = module.indexOf("function addAdditionalControls(");
      const end = module.indexOf("function addWarningMessages(", start);
      const scope = vm.createContext({ document: dom.window.document, options: {}, addControlSelector() {} });
      vm.runInContext(module.slice(start, end), scope);
      const parameters = {};
      scope.addAdditionalControls(
        { generalizedData: {} },
        SearchWithParametersData,
        dom.window.document.querySelector("ul"),
        parameters
      );
      const input = dom.window.document.getElementById("bornplacename");
      assert.ok(input);
      input.value = "Åbenrå";
      input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      assert.equal(parameters.bornplacename, "Åbenrå");
      assert.equal(dom.window.document.querySelectorAll("input").length, 6);
    },
  };
  console.log("=== Starting test : dfs_behavior ===");
  const logger = new LocalErrorLogger(manager.results, "dfs_behavior");
  for (const [caseName, check] of Object.entries(checks)) {
    if (manager.parameters.testCaseName && manager.parameters.testCaseName !== caseName) continue;
    manager.results.totalTestsRun++;
    try {
      await check();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
}
export { runTests };
