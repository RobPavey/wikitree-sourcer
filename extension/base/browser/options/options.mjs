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
import { optionsRegistry } from "../../core/options/options_database.mjs";
import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";
import { getDefaultOptions } from "../../core/options/options_database.mjs";
import { saveOptions } from "./options_storage.mjs";

// keeps track of the elements for tabs an subsections
var tabElements = {};

function getBrowserName() {
  if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else if (navigator.userAgent.indexOf("MSIE") != -1 || !!document.documentMode == true) {
    //IF IE > 10
    return "IE";
  } else {
    return "unknown";
  }
}

function isSafariOnMacOs() {
  let browserName = getBrowserName();
  const isSafariBrowser = browserName == "Safari";

  if (isSafariBrowser) {
    // On my Mac userAgent is:
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15 (options.mjs, line 356)
    // Note that it will be the same in the ios simulator but on an actual iOS device it will be different.
    const isMacOSWebKit = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent);
    if (isMacOSWebKit) {
      return true;
    }
  }

  return false;
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // get the values from the stored user options
  callFunctionWithStoredOptions(function (storedOptions) {
    replaceCachedOptions(storedOptions);
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
  });
}

function setActiveTab(tabName) {
  //console.log("setActiveTab called: tabName is: " + tabName);

  for (let tab in tabElements) {
    let tabElement = tabElements[tab];
    if (!tabElement) {
      console.log("setActiveTab: No tab element found for '" + tab + "'");
      continue;
    }
    let tabButtonElement = tabElement.buttonElement;
    let tabPanelElement = tabElement.panelElement;

    if (tabName == tab) {
      tabPanelElement.style.display = "block";
      if (!tabButtonElement.className.includes(" active")) {
        tabButtonElement.className += " active";
      }
    } else {
      tabPanelElement.style.display = "none";
      tabButtonElement.className = tabButtonElement.className.replace(" active", "");
    }
  }
}

function setActiveSubsection(tabName, subsectionName) {
  //console.log("setActiveSubsection called: tabName is: " + tabName + " subsectionName is " + subsectionName);

  let tabElement = tabElements[tabName];
  if (!tabElement) {
    console.log("setActiveSubsection: No tab element found for '" + tabName + "'");
    return;
  }

  for (let subsectionKey in tabElement.subsections) {
    let subsection = tabElement.subsections[subsectionKey];
    let panelElement = subsection.panelElement;

    if (subsectionName == subsectionKey) {
      panelElement.style.display = "block";
    } else {
      panelElement.style.display = "none";
    }
  }

  if (tabElement.selectElement) {
    tabElement.selectElement.value = subsectionName;
  }
}

var uiState = {
  activeTab: "search",
  activeSubsectionForTab: {
    search: "general",
    citation: "general",
    narrative: "general",
    table: "general",
    addMerge: "general",
    context: "general",
  },
};

async function saveOptionsUiState() {
  let items = { options_uiState: uiState };
  chrome.storage.local.set(items);
}

async function restoreOptionsUiState() {
  let savedUiState = await getLocalStorageItem("options_uiState");
  if (savedUiState) {
    uiState = savedUiState;

    // conversion for change of tab name from addPerson to addMerge
    if (uiState.activeTab == "addPerson") {
      uiState.activeTab = "addMerge";
    }
    if (uiState.activeSubsectionForTab["addPerson"]) {
      uiState.activeSubsectionForTab["addMerge"] = uiState.activeSubsectionForTab["addPerson"];
      delete uiState.activeSubsectionForTab["addPerson"];
    }
  }
}

async function updateAndSaveOptionsUiState(tabName, subsectionName) {
  if (tabName) {
    uiState.activeTab = tabName;

    if (subsectionName) {
      uiState.activeSubsectionForTab[tabName] = subsectionName;
    }
  }
  saveOptionsUiState();
}

async function restoreOptionsUiStateAndSetState() {
  await restoreOptionsUiState();

  setActiveTab(uiState.activeTab);
  for (let tab in uiState.activeSubsectionForTab) {
    setActiveSubsection(tab, uiState.activeSubsectionForTab[tab]);
  }
}

async function saveOptionsFromPage() {
  // get the values from the options page

  let pageOptions = getDefaultOptions();
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

function resetOptions() {
  replaceCachedOptions(getDefaultOptions());
  saveOptions(options);
  restoreOptions();

  let dialogElement = document.getElementById("dialog");
  if (dialogElement) {
    dialogElement.close();
  }
}

function wrapOptionsToSaveToFile() {
  let now = new Date();

  // sv-SE uses ISO format
  let dateFormatter = Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "medium" });

  let datePart = dateFormatter.format(now);
  datePart = datePart.replace(/:/g, "").replace(/ /g, "_");

  let filename = "Sourcer_options_" + datePart;
  const type = "Options Export";

  //console.log("wrapOptionsToSaveToFile, options is:");
  //console.log(options);

  const manifest = chrome.runtime.getManifest();
  let wrappedOptions = {
    filename: filename,
    extension: manifest.name,
    version: manifest.version,
    type: type,
    browser: navigator.userAgent,
    timestamp: now.toISOString(),
    options: options,
  };
  return wrappedOptions;
}

function saveOptionsToFile() {
  let wrappedOptions = wrapOptionsToSaveToFile();

  //console.log("wrappedOptions:");
  //console.log(wrappedOptions);

  let json = JSON.stringify(wrappedOptions, null, 2);

  if (isSafariOnMacOs()) {
    downloadFileForMacOsSafari(json);
  } else {
    downloadFile(json, wrappedOptions.filename);
  }
  closeDialog();
}

function doLoadOptionsFromFile() {
  return new Promise((resolve, reject) => {
    if (window.FileReader) {
      let chooser = document.createElement("input");
      chooser.type = "file";
      chooser.addEventListener("change", function (e) {
        //console.log("doLoadOptionsFromFile, got change event from chooser");
        //console.log(chooser);

        if (chooser.files && chooser.files.length > 0) {
          let reader = new FileReader();
          reader.addEventListener("loadend", async function (e) {
            if (!this.result) {
              reject({ error: "empty", errorMessage: "Selected file was empty." });
            } else {
              let isValid = false;
              try {
                let json = JSON.parse(this.result);
                if (
                  json.extension &&
                  json.extension.indexOf("WikiTree Sourcer") === 0 &&
                  json.type &&
                  json.type.indexOf("Options Export") === 0 &&
                  json.options
                ) {
                  isValid = true;
                  let importedOptions = json.options;

                  //console.log("doLoadOptionsFromFile, loaded options are:");
                  //console.log(importedOptions);

                  let mergedOptions = { ...options, ...importedOptions };

                  //console.log("doLoadOptionsFromFile, merged options are:");
                  //console.log(mergedOptions);

                  try {
                    saveOptions(mergedOptions);
                    restoreOptions();

                    let dialogElement = document.getElementById("dialog");
                    if (dialogElement) {
                      dialogElement.close();
                    }
                    resolve();
                  } catch (error) {
                    reject({ error: "setting", errorMessage: "Error restoring options", content: this.result });
                  }
                }
                if (!isValid) {
                  reject({
                    error: "invalid",
                    errorMessage: "File does not look like Sourcer options",
                    content: this.result,
                  });
                }
              } catch (error) {
                let errorMessage = "Parse error.";
                if (error.message) {
                  errorMessage += "\n" + error.message;
                }
                reject({ error: "parseError", errorMessage: errorMessage, content: this.result });
              }
            }
          });
          reader.readAsText(this.files[0]);
        }
      });
      chooser.click();
    }
  });
}

function loadOptionsFromFile() {
  doLoadOptionsFromFile()
    .then(closeDialog)
    .catch((result) => {
      let message = "The options file was not valid. The current options were not changed.";
      let reason = result.errorMessage;
      if (reason) {
        message += "\n\nThis error occurred:\n" + reason;
      }
      alert(message);
      console.log(result);
    });
}

function openDialog() {
  let dialogElement = document.getElementById("dialog");
  if (dialogElement) {
    dialogElement.showModal();

    document.getElementById("resetOptions").addEventListener("click", resetOptions);
    document.getElementById("saveOptions").addEventListener("click", saveOptionsToFile);
    document.getElementById("loadOptions").addEventListener("click", loadOptionsFromFile);
    document.getElementById("closeDialog").addEventListener("click", closeDialog);

    // The HTML Dialog element doesn't automatically close if the use clicks outside the dialog.
    // The below implements that. It works because the full window dimming background of the dialog
    // is a child of the dialog element
    dialogElement.addEventListener("click", (e) => {
      const dialogDimensions = dialogElement.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        dialogElement.close();
      }
    });
  }
}

function closeDialog() {
  let dialogElement = document.getElementById("dialog");
  if (dialogElement) {
    dialogElement.close();
  }
}

function downloadFileForMacOsSafari(json) {
  // We need to open a new tab, otherwise the options page will end up getting closed
  let popup = open("", "_blank");
  if (popup) {
    popup.document.title = popup.document.body.innerText =
      "Downloading options...\n\n" +
      "They will be saved to a numbered file in the Downloads folder.\n" +
      "The filename will start with 'Unknown'\n\n" +
      "This tab/window can be closed once the download is done.";
  }

  let blob = new Blob([json], { type: "text/plain" });

  var reader = new FileReader();
  reader.onloadend = function () {
    if (true) {
      var url = reader.result;

      //console.log("reader result is:");
      //console.log(url);

      // url will be something like:
      // data:text/plain;base64,ewogICJmaWxlTmFtZSI6ICJTb3VyY2VyX29wdGlvbnNfMjAyMy0wOC0zMV8xODU4MzMiLAogICJleHRlbnNpb24iOiAiV2lraVRyZWUgU291cmNlciIsCiAgInZlcnNpb24iOiAiMS45LjEiLAogICJicm93c2VyIjogIk1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xNi40IFNhZmFyaS82MDUuMS4xNSIsCiAgInRpbWVzdGFtcCI6ICIyMDIzLTA5LTAxVDAxOjU4OjMzLjAxNVoiLAogICJvcHRpb25zIjogewogICAgIm9wdGlvbnNfdmVyc2lvbiI6IDcsCiAgICAic2VhcmNoX2dlbmVyYWxfbmV3VGFiUG9zIjogInJpZ2h0TW9zdCIsCiAgICAic2VhcmNoX2dlbmVyYWxfcG9wdXBfc2hvd1NhbWVTaXRlIjogdHJ1ZSwKICAgICJzZWFyY2hfZ2VuZXJhbF9wb3B1cF9tYXhTZWFyY2hJdGVtc0luVG9wTWVudSI6ICIxNiIsCiAgICAic2VhcmNoX2dlbmVyYWxfbWF4TGlmZXNwYW4iOiAiMTIwIiwKICAgICJjaXRhdGlvbl9nZW5lcmFsX21lYW5pbmdmdWxOYW1lcyI6ICJib2xkIiwKICAgICJjaXRhdGlvbl9nZW5lcmFsX2NvbW1hSW5zaWRlUXVvdGVzIjogZmFsc2UsCiAgICAiY2l0YXRpb25fZ2VuZXJhbF9hZGRFZUl0ZW1UeXBlIjogZmFsc2UsCiAgICAiY2l0YXRpb25fZ2VuZXJhbF9yZWZlcmVuY2VQb3NpdGlvbiI6ICJhZnRlclNvdXJjZVRpdGxlIiwKICAgICJjaXRhdGlvbl9nZW5lcmFsX2FkZEFjY2Vzc2VkRGF0ZSI6ICJwYXJlbkFmdGVyTGluayIsCiAgICAiY2l0YXRpb25fZ2VuZXJhbF9zb3VyY2VSZWZlcmVuY2VTZXBhcmF0b3IiOiAic2VtaWNvbG9uIiwKICAgICJjaXRhdGlvbl9nZW5lcmFsX2RhdGFMaXN0U2VwYXJhdG9yIjogInNlbWljb2xvbiIsCiAgICAiY2l0YXRpb25fZ2VuZXJhbF9hZGROZXdsaW5lc1dpdGhpblJlZnMiOiB0cnVlLAogICAgImNpdGF0aW9uX2dlbmVyYWxfYWRkTmV3bGluZXNXaXRoaW5Cb2R5IjogdHJ1ZSwKICAgICJjaXRhdGlvbl9nZW5lcmFsX2FkZEJyZWFrc1dpdGhpbkJvZHkiOiB0cnVlLAogICAgImNpdGF0aW9uX2dlbmVyYWxfZGF0YVN0cmluZ0luSXRhbGljcyI6IGZhbHNlLAogICAgImNpdGF0aW9uX2dlbmVyYWxfZGF0YVN0cmluZ0luZGVudGVkIjogZmFsc2UsCiAgICAibmFycmF0aXZlX2dlbmVyYWxfc3BlbGxpbmciOiAiZW5fdWsiLAogICAgIm5hcnJhdGl2ZV9nZW5lcmFsX25hbWVPclByb25vdW4iOiAiZmlyc3ROYW1lIiwKICAgICJuYXJyYXRpdmVfZ2VuZXJhbF9jb3VudHJ5IjogInN0YW5kYXJkIiwKICAgICJuYXJyYXRpdmVfZ2VuZXJhbF9kYXRlRm9ybWF0IjogImxvbmciLAogICAgIm5hcnJhdGl2ZV9nZW5lcmFsX2RhdGVIaWdobGlnaHQiOiAibm9uZSIsCiAgICAibmFycmF0aXZlX2dlbmVyYWxfcGFyZW50c1VzZUFtcE9yQW5kIjogImFtcCIsCiAgICAibmFycmF0aXZlX2dlbmVyYWxfb2NjdXBhdGlvbkZvcm1hdCI6ICJrZWVwQ2FzZSIsCiAgICAibmFycmF0aXZlX2dlbmVyYWxfcGxhY2VDaHVyY2hGaXJzdCI6ICJubyIsCiAgICAibmFycmF0aXZlX2JhcHRpc21fbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfYmFwdGlzbV9zZW50ZW5jZVN0cnVjdHVyZSI6ICJwYXJlbnRzQm9ybkFuZEJhcCIsCiAgICAibmFycmF0aXZlX2JhcHRpc21faW5jbHVkZVBhcmVudGFnZSI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX2JhcHRpc21fcGFyZW50YWdlRm9ybWF0IjogInR3b0NvbW1hcyIsCiAgICAibmFycmF0aXZlX2JhcHRpc21faW5jbHVkZUJpcnRoRGF0ZSI6IHRydWUsCiAgICAibmFycmF0aXZlX2JhcHRpc21faW5jbHVkZURlYXRoRGF0ZSI6IHRydWUsCiAgICAibmFycmF0aXZlX2JpcnRoX25hbWVPclByb25vdW4iOiAiZGVmYXVsdCIsCiAgICAibmFycmF0aXZlX2JpcnRoX2luY2x1ZGVQYXJlbnRhZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9iaXJ0aF9wYXJlbnRhZ2VGb3JtYXQiOiAidHdvQ29tbWFzIiwKICAgICJuYXJyYXRpdmVfYmlydGhPckJhcHRpc21fbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfYmlydGhPckJhcHRpc21faW5jbHVkZVBhcmVudGFnZSI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX2JpcnRoT3JCYXB0aXNtX3BhcmVudGFnZUZvcm1hdCI6ICJ0d29Db21tYXMiLAogICAgIm5hcnJhdGl2ZV9iaXJ0aFJlZ19uYW1lT3JQcm9ub3VuIjogImRlZmF1bHQiLAogICAgIm5hcnJhdGl2ZV9iaXJ0aFJlZ0V2dF9zZW50ZW5jZVN0cnVjdHVyZSI6ICJvbmVTZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX2JpcnRoUmVnRXZ0X2luY2x1ZGVQYXJlbnRhZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9iaXJ0aFJlZ0V2dF9wYXJlbnRhZ2VGb3JtYXQiOiAidHdvQ29tbWFzIiwKICAgICJuYXJyYXRpdmVfYmlydGhSZWdSZWdfc2VudGVuY2VTdHJ1Y3R1cmUiOiAib25lU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9iaXJ0aFJlZ1JlZ19pbmNsdWRlTW1uIjogIm5vIiwKICAgICJuYXJyYXRpdmVfYmlydGhSZWdSZWdfcmVnRGlzdHJpY3RGb3JtYXQiOiAidGhlRGlzdHJpY3QiLAogICAgIm5hcnJhdGl2ZV9idXJpYWxfbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfYnVyaWFsX2luY2x1ZGVQYXJlbnRhZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9idXJpYWxfcGFyZW50YWdlRm9ybWF0IjogInR3b0NvbW1hcyIsCiAgICAibmFycmF0aXZlX2J1cmlhbF9pbmNsdWRlQWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfYnVyaWFsX2FnZUZvcm1hdCI6ICJwYXJlbnNBZ2UiLAogICAgIm5hcnJhdGl2ZV9jZW5zdXNfbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfY2Vuc3VzX3NlbnRlbmNlU3RydWN0dXJlIjogIm5vQ29tbWEiLAogICAgIm5hcnJhdGl2ZV9jZW5zdXNfY2Vuc3VzRGF0ZVBhcnRGb3JtYXQiOiAiaW5ZZWFyQ2Vuc3VzIiwKICAgICJuYXJyYXRpdmVfY2Vuc3VzX2luY2x1ZGVBZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9jZW5zdXNfYWdlRm9ybWF0IjogInBhcmVuc0FnZSIsCiAgICAibmFycmF0aXZlX2NlbnN1c19pbmNsdWRlT2NjdXBhdGlvbiI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX2NlbnN1c193YXNQYXJ0Rm9ybWF0IjogIndhcyIsCiAgICAibmFycmF0aXZlX2NlbnN1c19pbmNsdWRlSG91c2Vob2xkIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfY2Vuc3VzX2hvdXNlaG9sZFBhcnRGb3JtYXQiOiAicmVsYXRpb25zaGlwIiwKICAgICJuYXJyYXRpdmVfZGVhdGhfbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfZGVhdGhfaW5jbHVkZVBhcmVudGFnZSI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX2RlYXRoX3BhcmVudGFnZUZvcm1hdCI6ICJ0d29Db21tYXMiLAogICAgIm5hcnJhdGl2ZV9kZWF0aF9pbmNsdWRlQWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfZGVhdGhfYWdlRm9ybWF0IjogInBhcmVuc0FnZSIsCiAgICAibmFycmF0aXZlX2RlYXRoUmVnX25hbWVPclByb25vdW4iOiAiZGVmYXVsdCIsCiAgICAibmFycmF0aXZlX2RlYXRoUmVnX2luY2x1ZGVBZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9kZWF0aFJlZ19hZ2VGb3JtYXQiOiAicGFyZW5zQWdlIiwKICAgICJuYXJyYXRpdmVfZGVhdGhSZWdFdnRfc2VudGVuY2VTdHJ1Y3R1cmUiOiAib25lU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9kZWF0aFJlZ0V2dF9pbmNsdWRlUGFyZW50YWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfZGVhdGhSZWdFdnRfcGFyZW50YWdlRm9ybWF0IjogInR3b0NvbW1hcyIsCiAgICAibmFycmF0aXZlX2RlYXRoUmVnUmVnX3NlbnRlbmNlU3RydWN0dXJlIjogIm9uZVNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfZGVhdGhSZWdSZWdfaW5jbHVkZU1tbiI6ICJubyIsCiAgICAibmFycmF0aXZlX2RlYXRoUmVnUmVnX3JlZ0Rpc3RyaWN0Rm9ybWF0IjogInRoZURpc3RyaWN0IiwKICAgICJuYXJyYXRpdmVfbWFycmlhZ2VfbmFtZU9yUHJvbm91biI6ICJkZWZhdWx0IiwKICAgICJuYXJyYXRpdmVfbWFycmlhZ2VfaW5jbHVkZVBhcmVudGFnZSI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX21hcnJpYWdlX3BhcmVudGFnZUZvcm1hdCI6ICJ0d29Db21tYXMiLAogICAgIm5hcnJhdGl2ZV9tYXJyaWFnZV9pbmNsdWRlQWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfbWFycmlhZ2VfYWdlRm9ybWF0IjogInBhcmVuc0FnZSIsCiAgICAibmFycmF0aXZlX21hcnJpYWdlUmVnX25hbWVPclByb25vdW4iOiAiZGVmYXVsdCIsCiAgICAibmFycmF0aXZlX21hcnJpYWdlUmVnX2luY2x1ZGVQYXJlbnRhZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9tYXJyaWFnZVJlZ19wYXJlbnRhZ2VGb3JtYXQiOiAidHdvQ29tbWFzIiwKICAgICJuYXJyYXRpdmVfbWFycmlhZ2VSZWdfaW5jbHVkZUFnZSI6ICJpbk1haW5TZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX21hcnJpYWdlUmVnX2FnZUZvcm1hdCI6ICJwYXJlbnNBZ2UiLAogICAgIm5hcnJhdGl2ZV9tYXJyaWFnZVJlZ0V2dF9zZW50ZW5jZVN0cnVjdHVyZSI6ICJvbmVTZW50ZW5jZSIsCiAgICAibmFycmF0aXZlX21hcnJpYWdlUmVnUmVnX3NlbnRlbmNlU3RydWN0dXJlIjogIm9uZVNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfbWFycmlhZ2VSZWdSZWdfcmVnRGlzdHJpY3RGb3JtYXQiOiAidGhlRGlzdHJpY3QiLAogICAgIm5hcnJhdGl2ZV9vYml0dWFyeV9uYW1lT3JQcm9ub3VuIjogImRlZmF1bHQiLAogICAgIm5hcnJhdGl2ZV9vYml0dWFyeV9pbmNsdWRlUGFyZW50YWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfb2JpdHVhcnlfcGFyZW50YWdlRm9ybWF0IjogInR3b0NvbW1hcyIsCiAgICAibmFycmF0aXZlX29iaXR1YXJ5X2luY2x1ZGVBZ2UiOiAiaW5NYWluU2VudGVuY2UiLAogICAgIm5hcnJhdGl2ZV9vYml0dWFyeV9hZ2VGb3JtYXQiOiAicGFyZW5zQWdlIiwKICAgICJuYXJyYXRpdmVfc2xhdmVTY2hlZHVsZV9pbmNsdWRlQWdlIjogImluTWFpblNlbnRlbmNlIiwKICAgICJuYXJyYXRpdmVfc2xhdmVTY2hlZHVsZV9hZ2VGb3JtYXQiOiAicGFyZW5zQWdlIiwKICAgICJ0YWJsZV9nZW5lcmFsX2F1dG9HZW5lcmF0ZSI6ICJjaXRhdGlvbkluVGFibGVDYXB0aW9uIiwKICAgICJ0YWJsZV9nZW5lcmFsX2Zvcm1hdCI6ICJ0YWJsZSIsCiAgICAidGFibGVfdGFibGVfaGVhZGluZyI6ICJiZ0dyZWVuIiwKICAgICJ0YWJsZV90YWJsZV9zZWxlY3RlZFBlcnNvbiI6ICJib2xkUm93IiwKICAgICJ0YWJsZV90YWJsZV9oZWFkaW5nQ29sb3IiOiAiI2UxZjBiNCIsCiAgICAidGFibGVfdGFibGVfc2VsZWN0ZWRDb2xvciI6ICIjZmZmZmIzIiwKICAgICJ0YWJsZV90YWJsZV9jbG9zZWRDb2xvciI6ICIjZDBkMGQwIiwKICAgICJ0YWJsZV90YWJsZV9ib3JkZXIiOiB0cnVlLAogICAgInRhYmxlX3RhYmxlX3BhZGRpbmciOiB0cnVlLAogICAgInRhYmxlX3RhYmxlX2Z1bGxXaWR0aCI6IGZhbHNlLAogICAgInRhYmxlX3RhYmxlX2NhcHRpb24iOiAibm9uZSIsCiAgICAidGFibGVfbGlzdF90eXBlIjogImluZGVudGVkMiIsCiAgICAidGFibGVfc2VudGVuY2VfcHJlYW1ibGUiOiAibm9uZSIsCiAgICAidGFibGVfc2VudGVuY2VfaW5jbHVkZVJlbGF0aW9uc2hpcCI6IHRydWUsCiAgICAidGFibGVfc2VudGVuY2VfaW5jbHVkZUFnZSI6IHRydWUsCiAgICAidGFibGVfc2VudGVuY2VfbGFzdEl0ZW1QdW5jdHVhdGlvbiI6ICJjb21tYSIsCiAgICAiYWRkTWVyZ2VfZ2VuZXJhbF9zcGxpdEZvcmVuYW1lcyI6ICJjb3VudHJ5U3BlY2lmaWMiLAogICAgImFkZE1lcmdlX2dlbmVyYWxfc3RhbmRhcmRpemVDb3VudHJ5TmFtZUZvclVzYSI6ICJVbml0ZWQgU3RhdGVzIiwKICAgICJhZGRNZXJnZV9nZW5lcmFsX3N0YW5kYXJkaXplQ291bnRyeU5hbWVGb3JPdGhlciI6IGZhbHNlLAogICAgImFkZE1lcmdlX2FkZFBlcnNvbl9pbmNsdWRlQ2l0YXRpb24iOiBmYWxzZSwKICAgICJhZGRNZXJnZV9hZGRQZXJzb25faW5jbHVkZUFsbENpdGF0aW9ucyI6IHRydWUsCiAgICAiYWRkTWVyZ2VfYWRkUGVyc29uX2luY2x1ZGVQcm9maWxlTGluayI6IGZhbHNlLAogICAgImFkZE1lcmdlX2FkZFBlcnNvbl9hZGREaWVkWW91bmciOiBmYWxzZSwKICAgICJhZGRNZXJnZV9hZGRQZXJzb25fZGllZFlvdW5nSW1hZ2UiOiAiIiwKICAgICJhZGRNZXJnZV9hZGRQZXJzb25fZ2VuZXJhdGVJbnRybyI6ICJub25lIiwKICAgICJhZGRNZXJnZV9hZGRQZXJzb25faW5jbHVkZUxpbmtzIjogZmFsc2UsCiAgICAiYWRkTWVyZ2VfYWRkUGVyc29uX2luY2x1ZGVNYXJyaWFnZUxpbmVzIjogZmFsc2UsCiAgICAiYWRkTWVyZ2VfYWRkUGVyc29uX2luY2x1ZGVEZWF0aExpbmUiOiBmYWxzZSwKICAgICJhZGRNZXJnZV9tZXJnZUVkaXRfaW5jbHVkZUNpdGF0aW9uIjogZmFsc2UsCiAgICAiYWRkTWVyZ2VfbWVyZ2VFZGl0X2luY2x1ZGVBbGxDaXRhdGlvbnMiOiBmYWxzZSwKICAgICJhZGRNZXJnZV9tZXJnZUVkaXRfaW5jbHVkZVByb2ZpbGVMaW5rIjogZmFsc2UsCiAgICAiY29udGV4dF9nZW5lcmFsX25ld1RhYlBvcyI6ICJuZXdXaW5kb3ciLAogICAgInNlYXJjaF9hbmNlc3RyeV9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICIxIiwKICAgICJzZWFyY2hfYW5jZXN0cnlfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMSIsCiAgICAic2VhcmNoX2FuY2VzdHJ5X2RvbWFpbiI6ICJhbmNlc3RyeS5jb20iLAogICAgImNpdGF0aW9uX2FuY2VzdHJ5X2RhdGFTdHlsZSI6ICJzdHJpbmciLAogICAgImNpdGF0aW9uX2FuY2VzdHJ5X3JlY29yZFRlbXBsYXRlRG9tYWluIjogImZyb21SZWNvcmQiLAogICAgImNpdGF0aW9uX2FuY2VzdHJ5X3N1YnNjcmlwdGlvblJlcXVpcmVkIjogIm5vbmUiLAogICAgImNpdGF0aW9uX2FuY2VzdHJ5X2luY2x1ZGVTaGFyaW5nVGVtcGxhdGUiOiB0cnVlLAogICAgImNpdGF0aW9uX2FuY2VzdHJ5X2FkZEVkaXRDaXRhdGlvbkJ1dHRvbiI6IHRydWUsCiAgICAic2VhcmNoX2JnX3BvcHVwX3ByaW9yaXR5T25Ub3BNZW51IjogIjEwIiwKICAgICJzZWFyY2hfYmdfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMTAiLAogICAgInNlYXJjaF9iZ19leGFjdExhc3ROYW1lIjogZmFsc2UsCiAgICAic2VhcmNoX2JnX2luY2x1ZGVGaXJzdE5hbWUiOiB0cnVlLAogICAgInNlYXJjaF9iZ19leGFjdEZpcnN0TmFtZXMiOiBmYWxzZSwKICAgICJzZWFyY2hfYmdfaW5jbHVkZU1pZGRsZU5hbWUiOiB0cnVlLAogICAgInNlYXJjaF9iZ19pbmNsdWRlTWFpZGVuTmFtZSI6IHRydWUsCiAgICAic2VhcmNoX2JnX2V4YWN0TWFpZGVuTmFtZSI6IGZhbHNlLAogICAgInNlYXJjaF9iZ19iaXJ0aFllYXJFeGFjdG5lc3MiOiAiNSIsCiAgICAic2VhcmNoX2JnX2RlYXRoWWVhckV4YWN0bmVzcyI6ICI1IiwKICAgICJjaXRhdGlvbl9iZ19pbmNsdWRlVHJhbnNjcmliZXIiOiB0cnVlLAogICAgImNpdGF0aW9uX2JnX2luY2x1ZGVQaG90b2dyYXBoZXIiOiB0cnVlLAogICAgImNpdGF0aW9uX2JnX2luY2x1ZGVSZWxhdGl2ZXMiOiBmYWxzZSwKICAgICJjaXRhdGlvbl9iZ19pbmNsdWRlRXBpdGFwaCI6IHRydWUsCiAgICAiY2l0YXRpb25fYmdfYnJhY2tldHNSb3VuZE5hbWUiOiAiaW5zZXJ0IiwKICAgICJzZWFyY2hfb3BjY29ybl9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICIxMCIsCiAgICAic2VhcmNoX29wY2Nvcm5fcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMTAiLAogICAgImNpdGF0aW9uX29wY2Nvcm5fbGlua1N0eWxlIjogImRhdGFiYXNlIiwKICAgICJzZWFyY2hfY3dnY19wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICIxMCIsCiAgICAic2VhcmNoX2N3Z2NfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMTAiLAogICAgInNlYXJjaF9jd2djX2V4YWN0TGFzdE5hbWUiOiBmYWxzZSwKICAgICJzZWFyY2hfY3dnY191c2VGaXJzdG5hbWVPckluaXRpYWwiOiAiZmlyc3RuYW1lIiwKICAgICJzZWFyY2hfY3dnY19leGFjdEZpcnN0TmFtZSI6IGZhbHNlLAogICAgInNlYXJjaF9jd2djX2RlYXRoWWVhckV4YWN0bmVzcyI6ICJhdXRvIiwKICAgICJjaXRhdGlvbl9jd2djX2NoYW5nZU5hbWVzVG9Jbml0aWFsQ2FwcyI6IHRydWUsCiAgICAiY2l0YXRpb25fY3dnY19pbmNsdWRlU2VydmljZU51bWJlciI6IHRydWUsCiAgICAiY2l0YXRpb25fY3dnY19pbmNsdWRlVW5pdCI6IHRydWUsCiAgICAiY2l0YXRpb25fY3dnY19pbmNsdWRlQWRkaXRpb25hbEluZm8iOiB0cnVlLAogICAgInNlYXJjaF9mbXBfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiMiIsCiAgICAic2VhcmNoX2ZtcF9wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICIyIiwKICAgICJzZWFyY2hfZm1wX2RvbWFpbiI6ICJmaW5kbXlwYXN0LmNvLnVrIiwKICAgICJzZWFyY2hfZm1wX2xhc3ROYW1lVmFyaWFudHMiOiB0cnVlLAogICAgImNpdGF0aW9uX2ZtcF9kYXRhU3R5bGUiOiAic3RyaW5nIiwKICAgICJjaXRhdGlvbl9mbXBfc3Vic2NyaXB0aW9uUmVxdWlyZWQiOiAibm9uZSIsCiAgICAiY2l0YXRpb25fZm1wX2luY2x1ZGVJbWFnZUxpbmsiOiB0cnVlLAogICAgInNlYXJjaF9mc19wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICIzIiwKICAgICJzZWFyY2hfZnNfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMyIsCiAgICAic2VhcmNoX2ZzX2JpcnRoWWVhckV4YWN0bmVzcyI6ICJhdXRvIiwKICAgICJzZWFyY2hfZnNfZGVhdGhZZWFyRXhhY3RuZXNzIjogImF1dG8iLAogICAgInNlYXJjaF9mc19tYXJyaWFnZVllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAic2VhcmNoX2ZzX3Jlc2lkZW5jZVllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAiY2l0YXRpb25fZnNfc291cmNlUmVmIjogImZzQ2l0YXRpb25TaG9ydCIsCiAgICAiY2l0YXRpb25fZnNfZGF0YVN0eWxlIjogInN0cmluZyIsCiAgICAiY2l0YXRpb25fZnNfaW5jbHVkZUV4dGVybmFsSW1hZ2VMaW5rIjogdHJ1ZSwKICAgICJjaXRhdGlvbl9mc19zdWJzY3JpcHRpb25SZXF1aXJlZCI6ICJub25lIiwKICAgICJhZGRNZXJnZV9mc0FsbENpdGF0aW9uc19jaXRhdGlvblR5cGUiOiAibmFycmF0aXZlIiwKICAgICJhZGRNZXJnZV9mc0FsbENpdGF0aW9uc19ncm91cENpdGF0aW9ucyI6IHRydWUsCiAgICAiYWRkTWVyZ2VfZnNBbGxDaXRhdGlvbnNfaW5jbHVkZU5vdGVzIjogdHJ1ZSwKICAgICJhZGRNZXJnZV9mc0FsbENpdGF0aW9uc19leGNsdWRlTm9uRnNTb3VyY2VzIjogZmFsc2UsCiAgICAiYWRkTWVyZ2VfZnNBbGxDaXRhdGlvbnNfZXhjbHVkZU90aGVyUm9sZVNvdXJjZXMiOiBmYWxzZSwKICAgICJhZGRNZXJnZV9mc0FsbENpdGF0aW9uc19leGNsdWRlUmV0aXJlZFNvdXJjZXMiOiAiaWZEdXBsaWNhdGUiLAogICAgInNlYXJjaF9mZ19wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICI5IiwKICAgICJzZWFyY2hfZmdfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiOSIsCiAgICAic2VhcmNoX2ZnX2luY2x1ZGVGaXJzdE5hbWUiOiB0cnVlLAogICAgInNlYXJjaF9mZ19pbmNsdWRlTWlkZGxlTmFtZSI6IHRydWUsCiAgICAic2VhcmNoX2ZnX2luY2x1ZGVNYWlkZW5OYW1lIjogdHJ1ZSwKICAgICJzZWFyY2hfZmdfaW5jbHVkZUNlbWV0ZXJ5TG9jYXRpb24iOiBmYWxzZSwKICAgICJzZWFyY2hfZmdfYmlydGhZZWFyRXhhY3RuZXNzIjogImF1dG8iLAogICAgInNlYXJjaF9mZ19kZWF0aFllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAiY2l0YXRpb25fZmdfaW5jbHVkZUltYWdlU3RhdHVzIjogdHJ1ZSwKICAgICJjaXRhdGlvbl9mZ19pbmNsdWRlUGxvdCI6IHRydWUsCiAgICAiY2l0YXRpb25fZmdfaW5jbHVkZU1haW50YWluZXIiOiB0cnVlLAogICAgImNpdGF0aW9uX2ZnX2luY2x1ZGVJbnNjcmlwdGlvbiI6IGZhbHNlLAogICAgImNpdGF0aW9uX2ZnX2l0YWxpY3NJbk5hbWUiOiAiaXRhbGljIiwKICAgICJzZWFyY2hfZnJlZWJtZF9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICI3IiwKICAgICJzZWFyY2hfZnJlZWJtZF9wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICI3IiwKICAgICJjaXRhdGlvbl9mcmVlYm1kX2NoYW5nZU5hbWVzVG9Jbml0aWFsQ2FwcyI6IHRydWUsCiAgICAiY2l0YXRpb25fZnJlZWJtZF9yZWZlcmVuY2VJbkl0YWxpY3MiOiB0cnVlLAogICAgImNpdGF0aW9uX2ZyZWVibWRfdXNlRGlzdHJpY3RVcmwiOiB0cnVlLAogICAgInNlYXJjaF9mcmVlY2VuX3BvcHVwX3ByaW9yaXR5T25Ub3BNZW51IjogIjYiLAogICAgInNlYXJjaF9mcmVlY2VuX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjYiLAogICAgInNlYXJjaF9mcmVlY2VuX2Z1enp5SW5EZWZhdWx0IjogdHJ1ZSwKICAgICJzZWFyY2hfZnJlZWNlbl9mdXp6eUluU2FtZUNvbGxlY3Rpb24iOiB0cnVlLAogICAgInNlYXJjaF9mcmVlY2VuX2JpcnRoWWVhclJhbmdlRGVmYXVsdCI6ICJhdXRvIiwKICAgICJzZWFyY2hfZnJlZWNlbl9iaXJ0aFllYXJSYW5nZVNhbWVDb2xsZWN0aW9uIjogImV4YWN0IiwKICAgICJzZWFyY2hfZnJlZWNlbl9pbmNsdWRlQmlydGhDb3VudHkiOiB0cnVlLAogICAgInNlYXJjaF9mcmVlY2VuX2luY2x1ZGVDZW5zdXNDb3VudHkiOiB0cnVlLAogICAgImNpdGF0aW9uX2ZyZWVjZW5fZGF0YVN0eWxlIjogInN0cmluZyIsCiAgICAiY2l0YXRpb25fZnJlZWNlbl9pbmNsdWRlTmF0aW9uYWxBcmNoaXZlc0xpbmsiOiB0cnVlLAogICAgInNlYXJjaF9mcmVlcmVnX3BvcHVwX3ByaW9yaXR5T25Ub3BNZW51IjogIjgiLAogICAgInNlYXJjaF9mcmVlcmVnX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjgiLAogICAgInNlYXJjaF9mcmVlcmVnX2Z1enp5IjogdHJ1ZSwKICAgICJzZWFyY2hfZnJlZXJlZ195ZWFyUmFuZ2UiOiAiYXV0byIsCiAgICAic2VhcmNoX2ZyZWVyZWdfaW5jbHVkZUNvdW50eSI6IHRydWUsCiAgICAiY2l0YXRpb25fZnJlZXJlZ19kYXRhU3R5bGUiOiAic3RyaW5nIiwKICAgICJzZWFyY2hfZ2VuZXRla2FfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX2dlbmV0ZWthX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjciLAogICAgInNlYXJjaF9ncm9fcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNSIsCiAgICAic2VhcmNoX2dyb19wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICI1IiwKICAgICJjaXRhdGlvbl9ncm9fY2hhbmdlTmFtZXNUb0luaXRpYWxDYXBzIjogdHJ1ZSwKICAgICJjaXRhdGlvbl9ncm9fcmVmZXJlbmNlSW5JdGFsaWNzIjogdHJ1ZSwKICAgICJjaXRhdGlvbl9ncm9fbGlua1N0eWxlIjogInNlYXJjaCIsCiAgICAiY2l0YXRpb25fZ3JvX3VzZURpc3RyaWN0VXJsIjogdHJ1ZSwKICAgICJzZWFyY2hfaXJpc2hnX3BvcHVwX3ByaW9yaXR5T25Ub3BNZW51IjogIjciLAogICAgInNlYXJjaF9pcmlzaGdfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiNyIsCiAgICAic2VhcmNoX2lyaXNoZ19iaXJ0aFllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAic2VhcmNoX2lyaXNoZ19kZWF0aFllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAic2VhcmNoX2lyaXNoZ19tYXJyaWFnZVllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAiY2l0YXRpb25faXJpc2hnX2RhdGFTdHJpbmdGb3JtYXQiOiAiZGF0YVN0cmluZyIsCiAgICAic2VhcmNoX25haWVfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX25haWVfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiNyIsCiAgICAiY2l0YXRpb25fbmFpZV9jaGFuZ2VOYW1lc1RvSW5pdGlhbENhcHMiOiB0cnVlLAogICAgInNlYXJjaF9ubGlfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX25saV9wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICI3IiwKICAgICJjaXRhdGlvbl9ubGlfY2hhbmdlTmFtZXNUb0luaXRpYWxDYXBzIjogdHJ1ZSwKICAgICJzZWFyY2hfbnBfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiMTEiLAogICAgInNlYXJjaF9ucF9wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICIxMSIsCiAgICAiY2l0YXRpb25fbnBfaW5jbHVkZUxvY2F0aW9uIjogdHJ1ZSwKICAgICJzZWFyY2hfb3BlbmFyY2hfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX29wZW5hcmNoX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjciLAogICAgImNpdGF0aW9uX29wZW5hcmNoX3NvdXJjZVJlZlR5cGUiOiAicGFnZVdpdGhMaW5rcyIsCiAgICAiY2l0YXRpb25fb3BlbmFyY2hfaW5jbHVkZUFyY2hpdmVOdW1JblNvdXJjZVJlZiI6IHRydWUsCiAgICAiY2l0YXRpb25fb3BlbmFyY2hfaW5jbHVkZVJlZ051bUluU291cmNlUmVmIjogdHJ1ZSwKICAgICJjaXRhdGlvbl9vcGVuYXJjaF9pbmNsdWRlRG9jTnVtSW5Tb3VyY2VSZWYiOiB0cnVlLAogICAgImNpdGF0aW9uX29wZW5hcmNoX2luY2x1ZGVGb2xpb051bUluU291cmNlUmVmIjogdHJ1ZSwKICAgICJzZWFyY2hfcHBuel9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICIxMiIsCiAgICAic2VhcmNoX3BwbnpfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiMTIiLAogICAgInNlYXJjaF9wcG56X2FkZFRvRGF0ZVJhbmdlIjogIjIiLAogICAgImNpdGF0aW9uX3BwbnpfaW5jbHVkZVNlYXJjaFF1ZXJ5IjogZmFsc2UsCiAgICAic2VhcmNoX3BzdWtfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX3BzdWtfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiNyIsCiAgICAiY2l0YXRpb25fcHN1a19kYXRhU3R5bGUiOiAiZnVsbFNlbnRlbmNlIiwKICAgICJzZWFyY2hfc2NvdHBfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiNyIsCiAgICAic2VhcmNoX3Njb3RwX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjciLAogICAgInNlYXJjaF9zY290cF9zdXJuYW1lU291bmRleCI6IHRydWUsCiAgICAic2VhcmNoX3Njb3RwX2ZvcmVuYW1lU291bmRleCI6IHRydWUsCiAgICAic2VhcmNoX3Njb3RwX3BhcmVudE5hbWVTb3VuZGV4IjogdHJ1ZSwKICAgICJzZWFyY2hfc2NvdHBfYmlydGhZZWFyRXhhY3RuZXNzIjogImF1dG8iLAogICAgInNlYXJjaF9zY290cF9kZWF0aFllYXJFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAic2VhcmNoX3Njb3RwX21hcnJpYWdlWWVhckV4YWN0bmVzcyI6ICJhdXRvIiwKICAgICJzZWFyY2hfc2NvdHBfYWdlRXhhY3RuZXNzIjogImF1dG8iLAogICAgImNpdGF0aW9uX3Njb3RwX2RhdGFTdHlsZSI6ICJzdHJpbmciLAogICAgImNpdGF0aW9uX3Njb3RwX3VybFN0eWxlIjogImJhc2UiLAogICAgImNpdGF0aW9uX3Njb3RwX2RhdGFiYXNlVGl0bGUiOiAibnJzIiwKICAgICJzZWFyY2hfdHJvdmVfcG9wdXBfcHJpb3JpdHlPblRvcE1lbnUiOiAiMTIiLAogICAgInNlYXJjaF90cm92ZV9wb3B1cF9wcmlvcml0eU9uU3ViTWVudSI6ICIxMiIsCiAgICAic2VhcmNoX3Ryb3ZlX2luY2x1ZGVTdGF0ZVF1ZXJ5IjogdHJ1ZSwKICAgICJzZWFyY2hfdHJvdmVfYWRkVG9EYXRlUmFuZ2UiOiAiMiIsCiAgICAiY2l0YXRpb25fdHJvdmVfaW5jbHVkZVNlYXJjaFF1ZXJ5IjogZmFsc2UsCiAgICAic2VhcmNoX3dpZXdhc3dpZV9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICI3IiwKICAgICJzZWFyY2hfd2lld2Fzd2llX3BvcHVwX3ByaW9yaXR5T25TdWJNZW51IjogIjciLAogICAgInNlYXJjaF93aWV3YXN3aWVfc2VhcmNoTGFuZyI6ICJlbiIsCiAgICAiY2l0YXRpb25fd2lld2Fzd2llX2xhbmd1YWdlVmVyc2lvblRvQ2l0ZSI6ICJwYWdlIiwKICAgICJjaXRhdGlvbl93aWV3YXN3aWVfaW5jbHVkZUFyY2hpdmVOdW1JblNvdXJjZVJlZiI6IHRydWUsCiAgICAiY2l0YXRpb25fd2lld2Fzd2llX2luY2x1ZGVSZWdOdW1JblNvdXJjZVJlZiI6IHRydWUsCiAgICAiY2l0YXRpb25fd2lld2Fzd2llX2luY2x1ZGVQYWdlTnVtSW5Tb3VyY2VSZWYiOiB0cnVlLAogICAgInNlYXJjaF93aWtpdHJlZV9wb3B1cF9wcmlvcml0eU9uVG9wTWVudSI6ICI0IiwKICAgICJzZWFyY2hfd2lraXRyZWVfcG9wdXBfcHJpb3JpdHlPblN1Yk1lbnUiOiAiNCIsCiAgICAic2VhcmNoX3dpa2l0cmVlX2RhdGVFeGFjdG5lc3MiOiAiYXV0byIsCiAgICAic2VhcmNoX3dpa2l0cmVlX25hbWVFeGFjdG5lc3MiOiAiYm90aFZhcmlhbnQiCiAgfQp9 (options.mjs, line 391)

      url = url.replace(/^data:[^;]*;/, "data:attachment/file;");
      if (popup) {
        popup.location.href = url;
      } else {
        location = url;
      }
      popup = null; // reverse-tabnabbing #460
    }
  };
  reader.readAsDataURL(blob);
}

function downloadFile(json, filename) {
  let downloadButton = document.createElement("a");

  if (downloadButton) {
    let blob = new Blob([json], { type: "text/plain" });
    if (blob) {
      downloadButton.href = window.URL.createObjectURL(blob);
      downloadButton.download = filename + ".txt";
      downloadButton.click();
    }
  }
}

var lastSubsectionSelected = undefined;

function activeTabChanged(tabName) {
  setActiveTab(tabName);

  // try to keep the same subsection as the last one specifically selected by the user
  // if this subsection exists on this tab
  let subsectionToSet = undefined;
  let tabElement = tabElements[tabName];
  if (lastSubsectionSelected && tabElement) {
    let matchingSubsection = tabElement.subsections[lastSubsectionSelected];
    if (matchingSubsection) {
      subsectionToSet = lastSubsectionSelected;
      setActiveSubsection(tabName, lastSubsectionSelected);
    }
  }

  updateAndSaveOptionsUiState(tabName, subsectionToSet);
}

function activeSubsectionChanged(tabName, subsectionName) {
  setActiveSubsection(tabName, subsectionName);
  updateAndSaveOptionsUiState(tabName, subsectionName);
  lastSubsectionSelected = subsectionName;
}

function getRegistryTab(tabName) {
  for (let tab of optionsRegistry.tabs) {
    if (tab.name == tabName) {
      return tab;
    }
  }

  console.log("getRegistryTab: not found: " + tabName);
}

function getRegistrySubsection(tabName, subsectionName) {
  let tab = getRegistryTab(tabName);

  if (tab) {
    for (let subsection of tab.subsections) {
      if (subsection.name == subsectionName) {
        return subsection;
      }
    }
  }
  console.log("getRegistrySubsection: not found: " + tabName + ", " + subsectionName);
}

function getRegistrySubheading(tabName, subsectionName, subheadingName) {
  let subsection = getRegistrySubsection(tabName, subsectionName);

  if (subsection) {
    for (let subheading of subsection.subheadings) {
      if (subheading.name == subheadingName) {
        return subheading;
      }
    }
  }
  console.log("getRegistrySubheading: not found: " + tabName + ", " + subsectionName + ", " + subheadingName);
}

function buildPage() {
  // these refer to names in the .html. These elements could be constructed programatically but
  // are not yet for historical reasons
  const tabMapping = {
    search: { panelElement: "search-panel", buttonElement: "search-tab" },
    citation: { panelElement: "citation-panel", buttonElement: "citation-tab" },
    narrative: {
      panelElement: "narrative-panel",
      buttonElement: "narrative-tab",
    },
    table: { panelElement: "table-panel", buttonElement: "table-tab" },
    addMerge: {
      panelElement: "addMerge-panel",
      buttonElement: "addMerge-tab",
    },
    context: {
      panelElement: "context-panel",
      buttonElement: "context-tab",
    },
  };

  tabElements = {};
  for (let tab in tabMapping) {
    let tabElementData = tabMapping[tab];
    if (!tabElementData) {
      console.log("buildPage: no tabElementData found for name: " + tab);
      continue;
    }

    let tabPanelElement = document.getElementById(tabElementData.panelElement);
    let tabButtonElement = document.getElementById(tabElementData.buttonElement);

    if (!tabPanelElement) {
      console.log("buildPage: no tabPanelElement found for name: " + tab);
      continue;
    }
    if (!tabButtonElement) {
      console.log("buildPage: no tabButtonElement found for name: " + tab);
      continue;
    }

    tabElements[tab] = {
      panelElement: tabPanelElement,
      buttonElement: tabButtonElement,
      subsections: {},
    };
  }

  // Link up the tab panels and buttons and create all the subsection elements
  for (let tab of optionsRegistry.tabs) {
    let tabButtonElement = tabElements[tab.name].buttonElement;
    tabButtonElement.onclick = function (event) {
      activeTabChanged(tab.name);
    };

    let tabPanelElement = tabElements[tab.name].panelElement;

    // this is currently empty
    let elementSubsections = tabElements[tab.name].subsections;

    if (tab.comment) {
      let commentElement = document.createElement("label");
      commentElement.innerText = tab.comment;
      commentElement.className = "tabComment";
      tabPanelElement.appendChild(commentElement);

      let breakElement = document.createElement("br");
      tabPanelElement.appendChild(breakElement);
      let breakElement2 = document.createElement("br");
      tabPanelElement.appendChild(breakElement2);
    }

    // Add select for the subsections, we do this even if there is only one subsection
    // for consistency of appearance
    {
      let subsectionSelectElement = document.createElement("select");
      for (let subsection of tab.subsections) {
        let selectOptionElement = document.createElement("option");
        selectOptionElement.value = subsection.name;
        selectOptionElement.innerText = subsection.label;
        subsectionSelectElement.appendChild(selectOptionElement);
      }
      let labelTextNode = document.createTextNode("Subsection: ");
      let labelElement = document.createElement("label");

      labelElement.appendChild(labelTextNode);
      labelElement.appendChild(subsectionSelectElement);
      labelElement.className = "subsectionSelector";
      tabPanelElement.appendChild(labelElement);

      subsectionSelectElement.onchange = function () {
        activeSubsectionChanged(tab.name, this.value);
      };

      tabElements[tab.name].selectElement = subsectionSelectElement;
    }

    let tabPanelInnerDiv = document.createElement("div");
    tabPanelInnerDiv.className = "subsectionsContainer";
    tabPanelElement.appendChild(tabPanelInnerDiv);

    // add subsections for tab
    for (let subsection of tab.subsections) {
      let divElement = document.createElement("div");
      divElement.className = "subsectionPanel";

      // We used to hae a heading element for the option group but it was just the same
      // as the selector text so there seems no need
      //let headingElement = document.createElement("h3");
      //headingElement.innerText = subsection.label + ":";
      //divElement.appendChild(headingElement);

      if (subsection.comment) {
        let commentElement = document.createElement("label");
        commentElement.innerText = subsection.comment;
        commentElement.className = "subsectionComment";
        divElement.appendChild(commentElement);

        let breakElement = document.createElement("br");
        divElement.appendChild(breakElement);
        let breakElement2 = document.createElement("br");
        divElement.appendChild(breakElement2);
      }

      tabPanelInnerDiv.appendChild(divElement);

      elementSubsections[subsection.name] = { panelElement: divElement };
    }
  }

  // create all the individual option elements (and subheading elements)
  for (let optionsGroup of optionsRegistry.optionsGroups) {
    if (!optionsGroup.tab) {
      console.log("buildPage: optionsGroup has no tab, optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    if (!optionsGroup.subsection) {
      console.log("buildPage: optionsGroup has no subsection, optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    let tabName = optionsGroup.tab;
    let subsectionName = optionsGroup.subsection;

    let tabElementObj = tabElements[tabName];
    if (!tabElementObj) {
      console.log("buildPage: no element found for tab: " + tabName);
      continue;
    }

    let subSection = tabElementObj.subsections[subsectionName];
    if (!subSection) {
      console.log("buildPage: no subSection found for name: " + subsectionName + ", for tab: " + tabName);
      console.log(tabElements);
      console.log("optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    let subsectionPanelElement = subSection.panelElement;

    if (!subsectionPanelElement) {
      console.log("buildPage: no subsectionElement found for name: " + subsectionName);
      console.log(tabElements);
      console.log("optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    // if this group has a subheading then create a heading element
    if (optionsGroup.subheading) {
      let subheading = getRegistrySubheading(tabName, subsectionName, optionsGroup.subheading);
      if (subheading) {
        let label = subheading.label;
        let subheadingElement = document.createElement("h4");
        subheadingElement.innerText = label + ":";
        subsectionPanelElement.appendChild(subheadingElement);
      }
    }

    let optionNamePrefix = optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;

      let optionDivElement = document.createElement("div");

      let optionElement = undefined;
      if (option.type == "checkbox") {
        optionElement = document.createElement("input");
        optionElement.type = "checkbox";
        optionElement.className = "optionCheckbox";

        let labelTextNode = document.createTextNode(" " + option.label);

        let labelElement = document.createElement("label");

        labelElement.appendChild(optionElement);
        labelElement.appendChild(labelTextNode);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "select") {
        optionElement = document.createElement("select");
        optionElement.className = "optionSelect";

        for (let value of option.values) {
          let selectOptionElement = document.createElement("option");
          selectOptionElement.value = value.value;
          selectOptionElement.innerText = value.text;
          optionElement.appendChild(selectOptionElement);
        }

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "number") {
        optionElement = document.createElement("input");
        optionElement.type = "number";
        optionElement.className = "optionNumber";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "text") {
        optionElement = document.createElement("input");
        optionElement.type = "text";
        optionElement.className = "optionText";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "color") {
        optionElement = document.createElement("input");
        optionElement.type = "color";
        optionElement.className = "optionNumber";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      }
      optionElement.id = fullOptionName;

      if (option.comment) {
        let breakElement = document.createElement("br");
        optionDivElement.appendChild(breakElement);

        let commentElement = document.createElement("label");
        commentElement.innerText = option.comment;
        commentElement.className = "optionComment";
        optionDivElement.appendChild(commentElement);
      }

      let breakElement = document.createElement("br");
      optionDivElement.appendChild(breakElement);

      subsectionPanelElement.appendChild(optionDivElement);
    }
  }

  restoreOptionsUiStateAndSetState();

  restoreOptions();

  document.getElementById("tabArea").addEventListener("change", saveOptionsFromPage);
  document.getElementById("dialogButton").addEventListener("click", openDialog);
}

document.addEventListener("DOMContentLoaded", buildPage);

// Listen for messages (from the popup script mostly)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //console.log("options page received message request");
  //console.log(request);
  if (request.type == "isOptionsPage") {
    sendResponse({ success: true }); // do this to let the caller we received message
  } else if (request.type == "resetOptions") {
    //console.log("reset options request");
    let options = getDefaultOptions();
    saveOptions(options);
    restoreOptions();
    //console.log("sending response");
    sendResponse({ success: true }); // do this to let the caller we received message
  }
});
