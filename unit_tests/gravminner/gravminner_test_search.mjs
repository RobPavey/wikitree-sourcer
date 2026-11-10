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
import { spawnSync } from "node:child_process";
import { JSDOM } from "jsdom";
import { buildSearchData } from "../../extension/site/gravminner/core/gravminner_build_search_data.mjs";
import { GeneralizedData } from "../../extension/base/core/generalize_data_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

const url = "https://slektogdata.no/gravminner/finn-en-grav";
const script = fs.readFileSync("extension/site/gravminner/browser/gravminner_content.js", "utf8");
const restriction = "Du er ikke logget inn og må derfor velge fylke og kommune for å søke.";
const fields = [
  "firstName",
  "surname",
  "maidenName",
  "bornFromYear",
  "bornToYear",
  "deathFromYear",
  "deathToYear",
  "bornFromMonth",
];
function formHtml() {
  return (
    "<form>" +
    fields
      .map(
        (key) =>
          '<input formcontrolname="' +
          key +
          '" type="' +
          (key.includes("Year") || key.includes("Month") ? "number" : "text") +
          '">'
      )
      .join("") +
    '<input type="checkbox" formcontrolname="exactMatch" checked><div class="select-wrapper">' +
    [
      '<select class="select"><option value="578">Norge</option></select>',
      '<select class="select"><option value="0">Velg fylke</option><option value="285">Akershus</option></select>',
      '<select class="select"><option value="0">Velg kommune</option><option value="487">Nordre Follo</option></select>',
      '<select class="select"><option value="0">Velg gravplass</option></select>',
    ].join("") +
    '</div><button type="submit">Søk</button></form><h3></h3>'
  );
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
async function harness({
  delayed = false,
  payload,
  address = url,
  referrer = "",
  outcome = "results",
  omit = "",
  unhydrated = false,
} = {}) {
  const dom = new JSDOM("<ng-component>" + (delayed ? "" : formHtml()) + "</ng-component>", {
    url: address,
    ...(referrer ? { referrer } : {}),
  });
  const window = dom.window;
  let now = 100000;
  const intervals = new Map();
  let removed = 0,
    submits = 0,
    initialized = 0,
    changes = 0;
  const messages = [];
  const fresh =
    payload === undefined
      ? {
          url,
          timeStamp: now,
          fieldData: { firstName: "Signe", surname: "Strande", bornFromYear: 1933, bornToYear: 1939 },
        }
      : payload;
  let boundForm;
  let angularReady = !unhydrated;
  const unboundEvents = [];
  function bindForm() {
    const form = window.document.querySelector("form");
    if (!form || form === boundForm) return;
    boundForm = form;
    if (omit) form.querySelector(omit)?.remove();
    form.addEventListener("input", () => changes++);
    form.addEventListener("submit", (event) => {
      if (!angularReady) {
        unboundEvents.push(event);
        return;
      }
      event.preventDefault();
      submits++;
      const heading = window.document.querySelector("h3");
      if (outcome === "restricted" && submits === 1) heading.textContent = restriction;
      else if (outcome === "zero") heading.textContent = "Fant ingen graver. Prøv å fylle inn færre felter";
      else if (outcome === "message") heading.textContent = "Søket kunne ikke gjennomføres";
      else if (outcome === "pending" || outcome === "restricted") return;
      else {
        const title = window.document.createElement("h2");
        title.id = "search-title";
        title.textContent = "Søkeresultater";
        window.document.querySelector("ng-component").appendChild(title);
      }
    });
  }
  bindForm();
  const context = vm.createContext({
    document: window.document,
    window,
    URL,
    Event: window.Event,
    MutationObserver: window.MutationObserver,
    Date: class extends Date {
      static now() {
        return now;
      }
    },
    setInterval(fn) {
      const id = intervals.size + 1;
      intervals.set(id, fn);
      return id;
    },
    clearInterval(id) {
      intervals.delete(id);
    },
    console: {
      warn(...args) {
        messages.push(args);
      },
    },
    siteContentInit(site) {
      assert.equal(site, "gravminner");
      initialized++;
    },
    chrome: {
      storage: {
        local: {
          async get() {
            return { searchData: fresh };
          },
          async remove(key) {
            assert.equal(key, "searchData");
            removed++;
          },
        },
      },
    },
  });
  vm.runInContext(script, context);
  await flush();
  if (!delayed) {
    now += 1000;
    for (const fn of Array.from(intervals.values())) fn();
    await flush();
  }
  return {
    window,
    context,
    messages,
    get removed() {
      return removed;
    },
    get submits() {
      return submits;
    },
    get initialized() {
      return initialized;
    },
    get unboundEvents() {
      return unboundEvents;
    },
    get changes() {
      return changes;
    },
    get active() {
      return intervals.size;
    },
    async tick(ms = 500) {
      now += ms;
      for (const fn of Array.from(intervals.values())) fn();
      await flush();
    },
    async load() {
      window.document.querySelector("ng-component").innerHTML = formHtml();
      bindForm();
      await flush();
    },
    async hydrate(replace = false) {
      angularReady = true;
      if (replace) {
        window.document.querySelector("ng-component").innerHTML = formHtml();
        bindForm();
      } else for (const input of window.document.querySelectorAll("input")) input.value = "";
      await flush();
    },
    async geography() {
      const selects = window.document.querySelectorAll("select.select");
      selects[1].value = "285";
      selects[1].dispatchEvent(new window.Event("change", { bubbles: true }));
      selects[2].value = "487";
      selects[2].dispatchEvent(new window.Event("change", { bubbles: true }));
      await flush();
    },
    close() {
      window.dispatchEvent(new window.Event("pagehide"));
      window.close();
    },
  };
}

async function runTests(testManager) {
  if (testManager.parameters.testName && !["search", "search_content"].includes(testManager.parameters.testName))
    return;
  const logger = new LocalErrorLogger(testManager.results, "gravminner_search_behavior");
  const checks = {
    async angular_fill_and_success() {
      const h = await harness();
      try {
        assert.equal(h.initialized, 1);
        assert.equal(h.removed, 1);
        assert.equal(h.submits, 1);
        assert.equal(h.window.document.querySelector('[formcontrolname="firstName"]').value, "Signe");
        assert.equal(h.window.document.querySelector('[formcontrolname="maidenName"]').value, "");
        assert.equal(h.window.document.querySelector('[formcontrolname="exactMatch"]').checked, false);
        assert.equal(h.window.document.querySelector("select.select").value, "578");
        assert.ok(h.changes >= 6);
        assert.equal(h.active, 0);
        await h.tick();
        assert.equal(h.submits, 1);
      } finally {
        h.close();
      }
    },
    async delayed_form_and_timeout() {
      const h = await harness({ delayed: true });
      try {
        assert.equal(h.submits, 0);
        await h.tick(1000);
        await h.load();
        await h.tick(1000);
        assert.equal(h.submits, 1);
      } finally {
        h.close();
      }
      const slow = await harness({ delayed: true });
      try {
        await slow.tick(30001);
        assert.equal(slow.active, 0);
        assert.match(slow.window.document.body.textContent, /not become ready/);
        await slow.load();
        assert.equal(slow.submits, 0);
      } finally {
        slow.close();
      }
      const changed = await harness({ omit: '[formcontrolname="surname"]' });
      try {
        await changed.tick(30001);
        assert.equal(changed.submits, 0);
        assert.equal(changed.active, 0);
      } finally {
        changed.close();
      }
    },
    async firefox_server_form_bootstrap() {
      for (const replace of [false, true]) {
        const h = await harness({ unhydrated: true });
        try {
          assert.equal(h.submits, 0); // The unbound form must not perform a native navigation.
          assert.equal(h.unboundEvents.length, 1);
          assert.ok(h.unboundEvents[0].defaultPrevented);
          await h.hydrate(replace);
          await h.tick();
          await h.tick(1000);
          assert.equal(h.submits, 1);
          assert.equal(h.window.document.querySelector('[formcontrolname="firstName"]').value, "Signe");
          assert.equal(h.active, 0);
          await h.tick();
          assert.equal(h.submits, 1);
        } finally {
          h.close();
        }
      }
    },
    async permanently_unbound_form_times_out() {
      const h = await harness({ unhydrated: true });
      try {
        await h.tick(31000);
        assert.equal(h.submits, 0);
        assert.equal(h.active, 0);
        assert.ok(h.unboundEvents.every((event) => event.defaultPrevented));
      } finally {
        h.close();
      }
    },
    async restricted_geography_waits_for_dependencies() {
      const h = await harness({ outcome: "restricted" });
      try {
        assert.equal(h.submits, 1);
        assert.match(h.window.document.body.textContent, /Choose the county/);
        await h.tick(60000);
        assert.equal(h.submits, 1); // User selection is not limited to the loading timeout.
        await h.geography();
        assert.equal(h.submits, 1); // Angular handlers get to finish first.
        const spinner = h.window.document.createElement("img");
        h.window.document.querySelector(".select-wrapper").appendChild(spinner);
        await h.tick();
        assert.equal(h.submits, 1);
        spinner.remove();
        await h.tick();
        assert.equal(h.submits, 2);
        await h.tick();
        assert.equal(h.submits, 2); // Old validation text cannot trigger a retry loop.
        const title = h.window.document.createElement("h2");
        title.id = "search-title";
        h.window.document.body.appendChild(title);
        await flush();
        assert.equal(h.active, 0);
        assert.equal(h.window.document.querySelector('[formcontrolname="surname"]').value, "Strande");
      } finally {
        h.close();
      }
    },
    async manual_takeover_and_cancel() {
      for (const kind of ["edit", "submit", "cancel", "route"]) {
        const h = await harness({ outcome: "restricted" });
        try {
          if (kind === "edit")
            h.window.document
              .querySelector('[formcontrolname="firstName"]')
              .dispatchEvent(new h.window.Event("input", { bubbles: true }));
          if (kind === "submit") h.window.document.querySelector('button[type="submit"]').click();
          if (kind === "cancel") h.window.document.querySelector("#sourcer-gravminner-search button").click();
          if (kind === "route")
            h.window.history.pushState({}, "", "/gravminner/grav/259e0d76-270e-4a55-b46d-d36270407cae");
          await h.tick();
          const count = h.submits;
          await h.geography();
          await h.tick();
          assert.equal(h.active, 0);
          assert.equal(h.submits, count);
        } finally {
          h.close();
        }
      }
    },
    async missing_name_does_not_submit() {
      const h = await harness({ payload: { url, timeStamp: 100000, fieldData: {} } });
      try {
        assert.equal(h.submits, 0);
        assert.equal(h.active, 0);
        assert.match(h.window.document.body.textContent, /No person name/);
      } finally {
        h.close();
      }
    },
    async stale_and_unrelated_requests() {
      for (const payload of [
        null,
        { url, timeStamp: 0 },
        { url, timeStamp: 200000 },
        { url, timeStamp: "invalid" },
        { url: "https://example.com/search", timeStamp: 100000 },
      ]) {
        const h = await harness({ payload });
        try {
          assert.equal(h.removed, 0);
          assert.equal(h.submits, 0);
          assert.equal(h.active, 0);
          assert.equal(h.initialized, 1);
        } finally {
          h.close();
        }
      }
      for (const settings of [
        { address: "https://slektogdata.no/gravminner/grav/259e0d76-270e-4a55-b46d-d36270407cae" },
        { referrer: "https://slektogdata.no/gravminner" },
      ]) {
        const h = await harness(settings);
        try {
          assert.equal(h.removed, 0);
          assert.equal(h.submits, 0);
        } finally {
          h.close();
        }
      }
    },
    async zero_results_and_unexpected_message() {
      for (const outcome of ["zero", "message", "pending"]) {
        const h = await harness({ outcome });
        try {
          await h.tick(30001);
          assert.equal(h.submits, 1);
          assert.equal(h.active, 0);
          assert.ok(h.window.document.querySelector('form button[type="submit"]'));
          if (outcome === "zero") assert.equal(h.window.document.querySelector("#sourcer-gravminner-search"), null);
        } finally {
          h.close();
        }
      }
    },
    async qualifiers_and_optional_filters() {
      for (const [qualifier, expected] of [
        [0, [1897, 1903]],
        [1, [1899, 1901]],
        [2, [1894, 1906]],
        [3, [1894, 1901]],
        [4, [1899, 1906]],
      ]) {
        const gd = GeneralizedData.createFromPlainObject({
          hasValidData: true,
          sourceType: "record",
          recordType: "Memorial",
          name: { forenames: "Åse Øyvind", lastName: "Ærlig" },
          lastNameAtDeath: "Bø",
          birthDate: { yearString: "1900", qualifier: qualifier },
          deathDate: { yearString: "1950", qualifier: qualifier },
        });
        const result = buildSearchData({ generalizedData: gd, options: {} });
        assert.deepEqual([result.fieldData.bornFromYear, result.fieldData.bornToYear], expected);
        assert.deepEqual(
          [result.fieldData.deathFromYear, result.fieldData.deathToYear],
          expected.map((year) => year + 50)
        );
        assert.equal(result.fieldData.firstName, "Åse");
        assert.equal(result.fieldData.surname, "Bø");
        assert.equal(result.fieldData.maidenName, undefined);
        assert.deepEqual(result.selectData, {});
        assert.equal(
          buildSearchData({ generalizedData: gd, options: { search_gravminner_includeBirthYear: false } }).fieldData
            .bornFromYear,
          undefined
        );
      }
      const empty = GeneralizedData.createFromPlainObject({ hasValidData: true });
      assert.deepEqual(buildSearchData({ generalizedData: empty, options: {} }).fieldData, {});
    },
    async permission_denied_and_menu_registration() {
      const child = spawnSync(
        process.execPath,
        ["--experimental-vm-modules", "unit_tests/gravminner/popup_search_config_test.mjs"],
        { encoding: "utf8" }
      );
      assert.equal(child.status, 0, child.stdout + child.stderr);
    },
  };
  console.log("=== Starting test : gravminner_search_behavior ===");
  for (const [caseName, check] of Object.entries(checks)) {
    if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== caseName) continue;
    testManager.results.totalTestsRun++;
    try {
      await check();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
}
export { runTests };
