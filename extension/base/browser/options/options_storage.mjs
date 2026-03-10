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

// This module contains code to work around the size quota's on chrome.storage.sync
// the chrome limit QUOTA_BYTES_PER_ITEM is 8192
// As of 1 Sep 2022 the defaultOptions size was 8177 and it then went over
//
// To work around this we now save the options for the 5 categories as separate items but still
// save/load them in a single call to chrome.storage.sync.
//
// Also, to reduce the overall size some of the option names have been abbreviated. This was in
// version 1.3.4 and the only ones abbreviated were new options in that release.
//
// New sizes after the change
// search size = 1779
// citation size = 1314
// narrative size = 2768
// table size = 296
// size = 165
// combinedLength = 6322
//
// The options version was bumped to 5 as part of this change.

async function displayStatusMessage(message, ms) {
  var status = document.getElementById("status");
  status.textContent = message;
  setTimeout(function () {
    status.textContent = "";
  }, ms);
}

function putNewLoadedOptionsSetInOptions(options, optionsSet, prefix) {
  if (!optionsSet || !options || !prefix) {
    return;
  }

  const keys = Object.keys(optionsSet);
  for (let key of keys) {
    let optionsKeyName = prefix + "_" + key;
    options[optionsKeyName] = optionsSet[key];
  }
}

function loadCompressedOptions(items) {
  let loadedOptions = {};

  let keyLookupTable = items.options_keyLUT;
  let valueLookupTable = items.options_valueLUT;
  if (!keyLookupTable || !valueLookupTable) {
    console.log("ERROR: loadCompressedOptions, lookup table missing");
    return;
  }

  const prefixes = ["options", "search", "citation", "narrative", "table", "buildAll", "addMerge", "context"];

  for (let prefix of prefixes) {
    let itemKey = "options_" + prefix;
    let item = items[itemKey];
    if (!item) {
      continue;
    }

    for (let compressedKey of Object.keys(item)) {
      let compressedValue = item[compressedKey];
      let compressedKeyParts = compressedKey.split("_");
      let key = prefix;
      for (let compressedPart of compressedKeyParts) {
        let keyLookupIndex = parseInt(compressedPart, 16);
        let part = keyLookupTable[keyLookupIndex];
        if (part === undefined) {
          console.log("ERROR: key part not found in lookup table: " + compressedValue);
        } else {
          key += "_" + part;
        }
      }
      let valueLookupIndex = parseInt(compressedValue, 16);
      let jsonValue = valueLookupTable[valueLookupIndex];
      if (jsonValue === undefined) {
        console.log("ERROR: value not found in lookup table: " + compressedValue);
      } else {
        let value = JSON.parse(jsonValue);
        loadedOptions[key] = value;
      }
    }
  }

  //console.log("decompressed options are:");
  //console.log(loadedOptions);

  return loadedOptions;
}

async function loadOptions() {
  let loadedOptions = undefined;

  chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
    console.log("loadOptions: total sync storage in use is : " + bytesInUse);
  });

  let itemsNew = await chrome.storage.sync.get([
    "options_search",
    "options_citation",
    "options_narrative",
    "options_table",
    "options_buildAll",
    "options_addPerson", // legacy
    "options_addMerge", // replaced addPerson in options version 6
    "options_context",
    "options_version",
    // new in compressed form
    "options_options",
    "options_keyLUT",
    "options_valueLUT",
  ]);

  //console.log("loadOptions: itemsNew is");
  //console.log(itemsNew);

  if (itemsNew && itemsNew.options_keyLUT) {
    // options are compressed
    loadedOptions = loadCompressedOptions(itemsNew);
  } else if (itemsNew && itemsNew.options_search) {
    loadedOptions = {};
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_search, "search");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_citation, "citation");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_narrative, "narrative");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_table, "table");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_buildAll, "buildAll");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_addPerson, "addPerson");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_addMerge, "addMerge");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_context, "context");
    if (itemsNew.options) {
      loadedOptions.options_version = itemsNew.options.options_version;
    } else if (itemsNew.options_version) {
      // this is a temporary format for during development of 1.3.4 can be removed once options updated
      loadedOptions.options_version = itemsNew.options_version;
    } else {
      loadedOptions.options_version = 5; // there was a bug in versions 4/5 where options_version wasn't saved
    }
  } else {
    let itemsOld = await chrome.storage.sync.get(["options"]);
    if (itemsOld.options) {
      loadedOptions = itemsOld.options;
    }
  }

  //console.log("loadOptions: loadedOptions is");
  //console.log(loadedOptions);

  return loadedOptions;
}

function convertOptionsObjectToSaveFormatCompressed(options) {
  //console.log("convertOptionsObjectToSaveFormat, options is:");
  //console.log(options);

  const prefixes = ["options", "search", "citation", "narrative", "table", "buildAll", "addMerge", "context"];

  let newOptions = {};

  for (let prefix of prefixes) {
    newOptions[prefix] = {};
  }

  let keyLookupTable = [];
  let valueLookupTable = [];
  valueLookupTable.push("false");
  valueLookupTable.push("true");
  valueLookupTable.push('"none"');
  valueLookupTable.push('"auto"');

  function compressKey(value) {
    let parts = value.split("_");
    let newKey = "";
    for (let part of parts) {
      let partNum = 0;
      let index = keyLookupTable.indexOf(part);
      if (index != -1) {
        partNum = index;
      } else {
        partNum = keyLookupTable.length;
        keyLookupTable.push(part);
      }
      if (newKey) {
        newKey += "_";
      }
      newKey += partNum.toString(16);
    }
    return newKey;
  }

  function compressValue(value) {
    let lookupIndex = 0;
    let index = valueLookupTable.indexOf(value);
    if (index != -1) {
      lookupIndex = index;
    } else {
      lookupIndex = valueLookupTable.length;
      valueLookupTable.push(value);
    }
    let newValue = lookupIndex.toString(16);
    return newValue;
  }

  const keys = Object.keys(options);
  for (let key of keys) {
    let value = options[key];
    let stringValue = JSON.stringify(value);
    let compressedValue = compressValue(stringValue);
    let underscoreIndex = key.indexOf("_");
    if (underscoreIndex != -1) {
      let prefix = key.substring(0, underscoreIndex);
      if (prefixes.includes(prefix)) {
        let remainder = key.substring(underscoreIndex + 1);
        let newKey = compressKey(remainder);
        newOptions[prefix][newKey] = compressedValue;
      } else {
        let newKey = compressKey(key);
        newOptions[newKey] = compressedValue;
      }
    } else {
      newOptions[key] = compressedValue;
    }
  }

  newOptions.keyLUT = keyLookupTable;
  newOptions.valueLUT = valueLookupTable;

  //console.log("convertOptionsObjectToSaveFormat, newOptions is:");
  //console.log(newOptions);

  return newOptions;
}

// Saves options to chrome.storage
async function saveOptions(options) {
  //console.log("saveOptions: options is:");
  //console.log(options);

  //let saveFormatOptions = convertOptionsObjectToSaveFormat(options);
  let saveFormatOptions = convertOptionsObjectToSaveFormatCompressed(options);

  /*
  let textEncoder = new TextEncoder();
  let totalSize = 0;
  let totalBytes = 0;
  for (let key of Object.keys(saveFormatOptions)) {
    let value = saveFormatOptions[key];
    let string = JSON.stringify(value);
    console.log("saveFormatOptions." + key + " length is: " + string.length);
    totalSize += string.length;
    const estimatedBytes = key.length + textEncoder.encode(string).length;
    console.log("saveFormatOptions." + key + " estimatedBytes is: " + estimatedBytes);
    totalBytes += estimatedBytes;
  }
  console.log("total length is: " + totalSize + ", max total is: " + chrome.storage.sync.QUOTA_BYTES);
  console.log("total estimatedBytes is: " + totalBytes + ", max total is: " + chrome.storage.sync.QUOTA_BYTES);

  chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
    console.log("saveOptions: total sync storage in use is : " + bytesInUse);
  });
  */

  //console.log("saveOptions: saveFormatOptions is:");
  //console.log(saveFormatOptions);

  // set the values in the stored user options
  try {
    chrome.storage.sync.set(
      {
        options_search: saveFormatOptions.search,
        options_citation: saveFormatOptions.citation,
        options_narrative: saveFormatOptions.narrative,
        options_table: saveFormatOptions.table,
        options_buildAll: saveFormatOptions.buildAll,
        options_addMerge: saveFormatOptions.addMerge,
        options_context: saveFormatOptions.context,
        options_options: saveFormatOptions.options,
        options_keyLUT: saveFormatOptions.keyLUT,
        options_valueLUT: saveFormatOptions.valueLUT,
      },
      function () {
        if (!chrome.runtime.lastError) {
          // Update status to let user know options were saved.
          displayStatusMessage("Options saved.", 750);
        } else {
          console.log("saveOptions: Runtime error is:");
          console.log(chrome.runtime.lastError);

          if (chrome.runtime.lastError.message == "Resource::kQuotaBytesPerItem quota exceeded") {
            for (let key of Object.keys(saveFormatOptions)) {
              let value = saveFormatOptions[key];
              let string = JSON.stringify(value);
              console.log("saveFormatOptions." + key + " length is: " + string.length);
            }
          }

          chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
            console.log("saveOptions: total sync storage in use is : " + bytesInUse);
          });

          // This fixed the issue in iPad simulator. But it seems a bit drastic...
          // The saved failed, clear all sync storage and try again.
          // Since this extension ONLY uses the sync storage area for user options it should not lose
          // data unless the second save fails also.
          // NOTE: this caused an issue when I exceeded the quota for one item. The required fix was to
          // change the code but this bit of code deleted all my options!
          if (chrome.runtime.lastError.message == "Resource::kQuotaBytes quota exceeded") {
            chrome.storage.sync.clear(function () {
              chrome.storage.sync.set(
                {
                  options_search: saveFormatOptions.search,
                  options_citation: saveFormatOptions.citation,
                  options_narrative: saveFormatOptions.narrative,
                  options_table: saveFormatOptions.table,
                  options_buildAll: saveFormatOptions.buildAll,
                  options_addMerge: saveFormatOptions.addMerge,
                  options_context: saveFormatOptions.context,
                  options_options: saveFormatOptions.options,
                  options_keyLUT: saveFormatOptions.keyLUT,
                  options_valueLUT: saveFormatOptions.valueLUT,
                },
                function () {
                  if (!chrome.runtime.lastError) {
                    // Update status to let user know options were saved.
                    var status = document.getElementById("status", 750);
                  } else {
                    console.log("saveOptions, after clear: Runtime error is:");
                    console.log(chrome.runtime.lastError);

                    chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
                      console.log("saveOptions, after clear: total sync storage in use is : " + bytesInUse);
                    });

                    displayStatusMessage("Options could not be saved.", 5000);
                  }
                }
              );
            });
          } else {
            displayStatusMessage("Options could not be saved.", 5000);
          }
        }
      }
    );
  } catch (e) {
    console.log("saveOptions: caught error is:");
    console.log(e);

    chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
      console.log("saveOptions: total sync storage in use is : " + bytesInUse);
    });

    displayStatusMessage("Options could not be saved.", 5000);
  }
}

export { loadOptions, saveOptions };
