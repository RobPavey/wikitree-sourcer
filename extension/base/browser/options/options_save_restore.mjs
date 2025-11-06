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
import { getDefaultOptions, getOptionsRegistry } from "../../core/options/options_database.mjs";
import { saveOptions } from "./options_storage.mjs";

function restoreSiteListDraggable(element, fullOptionName, optionsRegistry) {
  let currentOptionsSiteList = options[fullOptionName];

  let siteNameToSiteLabel = {};
  let tab = undefined;
  for (let thisTab of optionsRegistry.tabs) {
    if (thisTab.name == "search") {
      tab = thisTab;
    }
  }
  if (tab) {
    for (let subsection of tab.subsections) {
      let name = subsection.name;
      let label = subsection.label;
      if (name != "general") {
        siteNameToSiteLabel[name] = { label: label, added: false };
      }
    }
  }

  let siteList = [];
  for (let siteName of currentOptionsSiteList) {
    let site = siteNameToSiteLabel[siteName];
    if (site) {
      siteList.push({ name: siteName, label: site.label });
      site.added = true;
    }
  }
  // if there are sites not stored in the options list yet then add them at the end
  for (let siteName of Object.keys(siteNameToSiteLabel)) {
    let site = siteNameToSiteLabel[siteName];
    if (site) {
      if (!site.added) {
        siteList.push({ name: siteName, label: site.label });
      }
    }
  }

  // empty the existing list - there can be children if we are doing reset to defauls
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  for (let site of siteList) {
    let listItem = document.createElement("li");
    listItem.draggable = true;
    listItem.className = "draggableListItem";
    listItem.setAttribute("siteName", site.name);
    let label = document.createElement("label");
    let labelTextNode = document.createTextNode(site.label);
    label.appendChild(labelTextNode);
    listItem.appendChild(label);

    // add a draggable icon
    let draggableIconDiv = document.createElement("div");
    draggableIconDiv.className = "draggableIcon";
    for (let i = 0; i < 3; i++) {
      let draggableIconBar = document.createElement("span");
      draggableIconBar.className = "draggableIconBar";
      draggableIconDiv.appendChild(draggableIconBar);
    }
    listItem.appendChild(draggableIconDiv);

    element.appendChild(listItem);
  }
}

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
      } else if (option.type == "siteListDraggable") {
        restoreSiteListDraggable(element, fullOptionName, optionsRegistry);
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
  //console.log("saveOptionsFromPage called");

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
      } else if (option.type == "siteListDraggable") {
        let value = [];
        let listItems = element.querySelectorAll("li");
        for (let listItem of listItems) {
          let siteName = listItem.getAttribute("siteName");
          if (siteName) {
            value.push(siteName);
          }
        }
        pageOptions[fullOptionName] = value;
      } else {
        pageOptions[fullOptionName] = element.value;
      }
    }
  }

  replaceCachedOptions(pageOptions);
  saveOptions(options);
}

export { restoreOptions, restoreOptionsGivenOptions, saveOptionsFromPage };
