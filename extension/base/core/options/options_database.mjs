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

import { optionsRegistry } from "./options_registry.mjs";
import "./register_base_options.mjs";
import "../../../site/all/core/register_site_options.mjs";

function getDefaultOptions() {
  // build the options structure from the optionsRegistry

  let defaultOptions = {};

  defaultOptions.options_version = 5;

  for (let optionsGroup of optionsRegistry.optionsGroups) {
    let optionNamePrefix =
      optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;
      defaultOptions[fullOptionName] = option.defaultValue;
    }
  }

  return defaultOptions;
}

function getUnitTestOptions() {
  // build the options structure from the optionsRegistry

  let unitTestOptions = {};

  unitTestOptions.options_version = 5;

  for (let optionsGroup of optionsRegistry.optionsGroups) {
    let optionNamePrefix =
      optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;
      let value = undefined;
      if (typeof option.unitTestValue === "undefined") {
        value = option.defaultValue;
      } else {
        value = option.unitTestValue;
      }
      unitTestOptions[fullOptionName] = value;
    }
  }

  return unitTestOptions;
}

export { getDefaultOptions, getUnitTestOptions, optionsRegistry };
