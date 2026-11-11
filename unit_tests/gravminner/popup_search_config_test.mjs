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

// Isolated ESM test doubles exercise the real shared helper, including its dynamic import.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

for (const allowed of [false, true]) {
  let register,
    click,
    action,
    closed = 0;
  const searches = [];
  const context = vm.createContext({ Date, chrome: { runtime: { getURL: (path) => path } } });
  function moduleFrom(values) {
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value);
      },
      { context }
    );
  }
  const noop = () => {};
  const dependencies = {
    "../options/options_loader.mjs": moduleFrom({ options: {} }),
    "./popup_menu_building.mjs": moduleFrom({
      addMenuItem: (_menu, _text, callback) => {
        click = callback;
      },
      addMenuItemWithSubmenu: noop,
      addSameRecordMenuItem: noop,
      addBackMenuItem: noop,
      beginMainMenu: noop,
      endMainMenu: noop,
      closePopup: () => {
        closed++;
      },
      doAsyncActionWithCatch: (_title, _input, callback) => {
        action = callback();
      },
    }),
    "./popup_search.mjs": moduleFrom({
      doSearch: noop,
      shouldShowSiteSearch: () => true,
      registerSearchMenuItemFunction: (_name, _label, callback) => {
        register = callback;
      },
      doBackgroundSearchWithSearchData: (...args) => {
        searches.push(args);
      },
    }),
    "./popup_search_with_parameters.mjs": moduleFrom({ setupSearchWithParametersSubmenu: noop }),
    "./popup_permissions.mjs": moduleFrom({ checkPermissionForSiteMatches: async () => allowed }),
  };
  const source = fs.readFileSync("extension/base/browser/popup/popup_search_config.mjs", "utf8");
  const helper = new vm.SourceTextModule(source, {
    context,
    async importModuleDynamically() {
      const data = moduleFrom({ buildSearchData: () => ({ fieldData: { firstName: "Signe" }, selectData: {} }) });
      await data.link(() => {});
      await data.evaluate();
      return data;
    },
  });
  await helper.link((specifier) => {
    assert.ok(dependencies[specifier], specifier);
    return dependencies[specifier];
  });
  await helper.evaluate();
  const site = new vm.SourceTextModule(
    fs.readFileSync("extension/site/gravminner/browser/gravminner_popup_search.mjs", "utf8"),
    { context }
  );
  await site.link((specifier) => {
    assert.equal(specifier, "/base/browser/popup/popup_search_config.mjs");
    return helper;
  });
  await site.evaluate();
  register({}, { generalizedData: {} }, noop);
  click();
  await action;
  assert.equal(closed, allowed ? 0 : 1);
  assert.equal(searches.length, allowed ? 1 : 0);
  if (allowed) {
    assert.equal(searches[0][0], "gravminner");
    assert.equal(searches[0][1].url, "https://slektogdata.no/gravminner/finn-en-grav");
    assert.equal(searches[0][1].fieldData.firstName, "Signe");
    assert.ok(!searches[0][2]); // New tab, not tab reuse.
  }
}
console.log("Permission denial and permitted Gravminner menu dispatch passed.");
