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
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";
import { record } from "./nb_test_fixtures.mjs";
import { getRequestedUserInput } from "../../extension/site/nb/core/nb_user_input.mjs";
import { generalizeData, regeneralizeData } from "../../extension/site/nb/core/nb_generalize_data.mjs";

// Exercise the actual shared form implementation in a DOM with only its menu dependencies stubbed.
const source = fs.readFileSync("extension/base/browser/popup/popup_menu_building.mjs", "utf8");
const formCode = source.slice(
  source.indexOf("function setupBuildCitationSubmenuForRequestedUserInput("),
  source.indexOf("\nfunction setupBuildCitationSubmenu(")
);
function harness(options) {
  const dom = new JSDOM('<!doctype html><nav id="menu"></nav>');
  const document = dom.window.document;
  const errors = [];
  const environment = vm.createContext({
    document,
    options,
    setTimeout,
    beginMainMenu() {
      const root = document.getElementById("menu");
      root.replaceChildren();
      const list = document.createElement("ul");
      root.append(list);
      return { list };
    },
    endMainMenu() {},
    addBackMenuItem(menu, callback) {
      const button = document.createElement("button");
      button.textContent = "Back";
      button.onclick = callback;
      menu.list.append(button);
    },
    addBreak(node) {
      node.append(document.createElement("br"));
    },
    addMessageMenuItem(menu, message) {
      const label = document.createElement("label");
      label.textContent = message;
      menu.list.append(label);
    },
    getBuildCitationMenuTextForType(type, collecting) {
      return (collecting ? "Add " : "Build ") + type;
    },
    async displayMessageWithIcon(...args) {
      errors.push(args.join(" "));
    },
  });
  vm.runInContext(formCode, environment);
  function show(data, build, regeneralize, userInput, collecting = false) {
    environment.setupBuildCitationSubmenuForRequestedUserInput(
      data,
      build,
      () => {},
      regeneralize,
      userInput,
      null,
      null,
      collecting
    );
  }
  const button = () =>
    Array.from(document.querySelectorAll("button")).find((button) => /^(Build|Add) /.test(button.innerText));
  async function change(id, value) {
    const field = document.getElementById(id);
    assert.ok(field, "Missing field " + id);
    field.value = value;
    field.dispatchEvent(new dom.window.Event("change"));
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return { document, errors, show, button, change, close: () => dom.window.close() };
}
async function runTests(testManager) {
  if (testManager.parameters.testName && testManager.parameters.testName !== "popup") return;
  const tests = {
    async synchronous_hooks_remain_compatible() {
      const ui = harness(testManager.options);
      const calls = [];
      try {
        ui.show(
          { type: "inline", extractedData: {}, generalizedData: {} },
          () => calls.push("build"),
          () => calls.push("generalize"),
          () => ({ resultData: {}, fields: [] })
        );
        await ui.button().onclick();
        assert.deepEqual(calls, ["generalize", "build"]);
      } finally {
        ui.close();
      }
    },
    async asynchronous_hook_finishes_before_build_and_blocks_double_clicks() {
      const ui = harness(testManager.options);
      const calls = [];
      let release;
      try {
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        ui.show(
          { type: "inline", extractedData: {}, generalizedData: {} },
          () => calls.push("build"),
          async () => {
            calls.push("start");
            await gate;
            calls.push("checked");
          },
          () => ({ resultData: {}, fields: [] })
        );
        const button = ui.button();
        const pending = button.onclick();
        assert.equal(button.disabled, true);
        await button.onclick();
        assert.deepEqual(calls, ["start"]);
        release();
        await pending;
        assert.deepEqual(calls, ["start", "checked", "build"]);
      } finally {
        ui.close();
      }
    },
    async rejected_hook_does_not_build() {
      const ui = harness(testManager.options);
      let builds = 0;
      try {
        ui.show(
          { type: "inline", extractedData: {}, generalizedData: {} },
          () => builds++,
          async () => {
            throw new Error("NB page changed");
          },
          () => ({ resultData: {}, fields: [] })
        );
        await ui.button().onclick();
        assert.equal(builds, 0);
        assert.ok(ui.errors[0].includes("NB page changed"));
      } finally {
        ui.close();
      }
    },
    async cancelled_hook_does_not_build() {
      const ui = harness(testManager.options);
      let builds = 0;
      try {
        ui.show(
          { type: "inline", extractedData: {}, generalizedData: {} },
          () => builds++,
          () => false,
          () => ({ resultData: {}, fields: [] })
        );
        await ui.button().onclick();
        assert.equal(builds, 0);
      } finally {
        ui.close();
      }
    },
    async real_nb_form_uses_manual_input_and_retains_collection_button_label() {
      const ui = harness(testManager.options);
      const ed = record();
      const gd = generalizeData({ extractedData: ed });
      let generated;
      try {
        ui.show(
          { type: "narrative", extractedData: ed, generalizedData: gd },
          () => {
            generated = JSON.parse(JSON.stringify(gd));
          },
          regeneralizeData,
          getRequestedUserInput,
          true
        );
        assert.equal(ui.document.getElementById("personName").value, "");
        assert.equal(ui.document.getElementById("subjectKey"), null);
        await ui.change("personName", "Anna Hansen");
        await ui.change("category", "deathNotice");
        assert.equal(ui.document.getElementById("personName").value, "Anna Hansen");
        assert.equal(ui.document.getElementById("eventDate").value, "");
        assert.equal(ui.document.getElementById("dateSuggestion"), null);
        assert.equal(ui.button().innerText, "Add narrative");
        await ui.button().onclick();
        assert.equal(generated.deathDate, undefined);
        await ui.change("eventDate", "3 May 1920");
        assert.ok(
          Array.from(ui.document.querySelectorAll("label")).some((label) =>
            label.textContent?.includes("death on 3 May 1920")
          )
        );
        await ui.button().onclick();
        assert.equal(generated.deathDate.dateString, "3 May 1920");
      } finally {
        ui.close();
      }
    },
    async validation_and_clearing_work_in_actual_form() {
      const ui = harness(testManager.options);
      const ed = record();
      const gd = generalizeData({ extractedData: ed });
      try {
        ui.show(
          { type: "inline", extractedData: ed, generalizedData: gd },
          () => {},
          regeneralizeData,
          (input) => getRequestedUserInput(input)
        );
        await ui.change("personName", "Anna Hansen");
        await ui.change("category", "deathNotice");
        await ui.change("eventDate", "31 February 1920");
        assert.equal(ui.button().disabled, true);
        await ui.change("eventDate", "1920");
        assert.equal(ui.button().disabled, false);
        await ui.change("eventDate", "");
        assert.equal(ui.document.getElementById("eventDate").value, "");
        await ui.change("category", "marriage");
        assert.equal(ui.document.getElementById("eventDate").value, "");
        assert.ok(ui.document.getElementById("secondPerson"));
        await ui.change("personName", "");
        assert.equal(ui.document.getElementById("personName").value, "");
        assert.equal(ui.document.getElementById("eventDate"), null);
      } finally {
        ui.close();
      }
    },
  };
  const logger = new LocalErrorLogger(testManager.results, "nb_popup");
  console.log("=== Starting test : nb_popup ===");
  for (const [caseName, check] of Object.entries(tests)) {
    if (testManager.parameters.testCaseName && testManager.parameters.testCaseName !== caseName) continue;
    testManager.results.totalTestsRun++;
    try {
      await check();
    } catch (error) {
      logger.logError({ caseName }, error.stack);
    }
  }
  console.log((logger.numFailedTests ? "Test failed" : "Test passed") + " (nb_popup).");
}
export { runTests };
