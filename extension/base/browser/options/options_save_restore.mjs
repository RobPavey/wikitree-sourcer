/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

import { callFunctionWithStoredOptions, replaceCachedOptions, options } from "./options_loader.mjs";
import { getOptionsRegistry } from "../../core/options/options_database.mjs";
import { getDefaultOptions } from "../../core/options/options_database.mjs";
import { saveOptions } from "./options_storage.mjs";

async function restoreOptionsGivenOptions(inputOptions) {
  replaceCachedOptions(inputOptions);
  let optionsRegistry = await getOptionsRegistry();
  for (let optionsGroup of optionsRegistry.optionsGroups) {
    let optionNamePrefix = optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;

      let element = document.getElementById(fullOptionName);
      if (!element) {
        console.log("restoreOptions: no element found with id: " + fullOptionName);
        continue;
      }

      if (option.type == "checkbox") {
        element.checked = options[fullOptionName];
      } else {
        element.value = options[fullOptionName];
      }
    }
  }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // get the values from the stored user options
  callFunctionWithStoredOptions(async function (storedOptions) {
    await restoreOptionsGivenOptions(storedOptions);
  });
}

async function saveOptionsFromPage() {
  // get the values from the options page

  let pageOptions = await getDefaultOptions();
  let optionsRegistry = await getOptionsRegistry();

  for (let optionsGroup of optionsRegistry.optionsGroups) {
    let optionNamePrefix = optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;

      let element = document.getElementById(fullOptionName);
      if (!element) {
        console.log("saveOptionsFromPage: no element found with id: " + fullOptionName);
        continue;
      }

      if (option.type == "checkbox") {
        pageOptions[fullOptionName] = element.checked;
      } else {
        pageOptions[fullOptionName] = element.value;
      }
    }
  }

  replaceCachedOptions(pageOptions);
  saveOptions(options);
}

export { restoreOptions, restoreOptionsGivenOptions, saveOptionsFromPage };
