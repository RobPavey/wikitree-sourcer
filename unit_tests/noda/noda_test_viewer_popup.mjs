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
import {
  viewerSelectionFromUrl,
  loadViewerMetadata,
  assertViewerSelection,
} from "../../extension/site/noda/core/noda_viewer_metadata.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

const fixture = JSON.parse(fs.readFileSync(new URL("./viewer_fixtures/voss_1899.json", import.meta.url)));
const popupCode = fs
  .readFileSync("extension/site/noda/browser/noda_popup.mjs", "utf8")
  .replace(/^import[\s\S]*?;\s*$/gm, "");
function harness({ allowed = true, offline = false, wrongImage = false, navigateDuringLoad = false } = {}) {
  const state = { url: fixture.url, menus: [], warnings: [], requests: [] };
  const context = vm.createContext({
    setTimeout,
    clearTimeout,
    DOMParser: new JSDOM("").window.DOMParser,
    viewerSelectionFromUrl,
    loadViewerMetadata: (selection, fetchJson, current) =>
      loadViewerMetadata(selection, fetchJson, current, (html) => new JSDOM(html).window.document.body.textContent),
    assertViewerSelection,
    checkPermissionForSite: async () => allowed,
    displayBusyMessage() {},
    displayMessageWithIcon: async (...args) => state.warnings.push(args.join(" ")),
    setupSimplePopupMenu: (input) => state.menus.push(input),
    generalizeData() {},
    buildCitation() {},
    buildHouseholdTable() {},
    initPopup() {},
    chrome: {
      tabs: { get: async () => ({ url: state.url }) },
      runtime: {
        sendMessage(request, callback) {
          state.requests.push(request);
          if (navigateDuringLoad)
            state.url = fixture.url.replace(fixture.fileInfo.uuid, "00000000-0000-0000-0000-000000000000");
          const json = request.fetchUrl.includes("/manifest/")
            ? fixture.manifest
            : request.fetchUrl.includes("/file-info/")
            ? { ...fixture.fileInfo, uuid: wrongImage ? "other" : fixture.fileInfo.uuid }
            : fixture.pagination;
          callback(offline ? { success: false } : { success: true, json });
        },
      },
    },
  });
  vm.runInContext(popupCode, context);
  return {
    state,
    show: () =>
      context.setupNodaPopupMenu({ ...viewerSelectionFromUrl(fixture.url), newViewer: true, pageType: "image" }, 1),
  };
}
async function runTests(testManager) {
  if (testManager.parameters.testName && testManager.parameters.testName !== "viewer") return;
  const logger = new LocalErrorLogger(testManager.results, "noda_viewer_popup");
  const tests = {
    async popup_loads_metadata_and_guards_generation() {
      const ui = harness();
      await ui.show();
      assert.equal(ui.state.requests.length, 3);
      assert.ok(ui.state.requests.every((request) => request.fetchOptions.credentials === "omit"));
      const input = ui.state.menus[0];
      assert.equal(input.extractedData.viewerMetadata.printedPage, "55");
      assert.equal(input.doNotIncludeSearch, true);
      assert.equal(input.userInputFunction().fields.length, 0);
      await input.regeneralizeFunction();
      ui.state.url = "https://nye.digitalarkivet.no/source/4536";
      await assert.rejects(input.regeneralizeFunction(), /image changed/);
    },
    async popup_permission_decline_does_not_fetch() {
      const ui = harness({ allowed: false });
      await ui.show();
      assert.equal(ui.state.requests.length, 0);
      assert.equal(ui.state.menus.length, 0);
    },
    async popup_optional_network_failures_offer_link_only_citation() {
      const ui = harness({ offline: true });
      await ui.show();
      assert.equal(ui.state.menus[0].extractedData.imagePageUrl, fixture.url);
      assert.match(ui.state.menus[0].userInputFunction().fields[0].label, /image link only/);
    },
    async popup_refuses_wrong_image_and_navigation_during_load() {
      for (const options of [{ wrongImage: true }, { navigateDuringLoad: true }]) {
        const ui = harness(options);
        await ui.show();
        assert.equal(ui.state.menus.length, 0);
        assert.equal(ui.state.warnings.length, 1);
      }
    },
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
  console.log((logger.numFailedTests ? "Test failed" : "Test passed") + " (noda_viewer_popup).");
}
export { runTests };
