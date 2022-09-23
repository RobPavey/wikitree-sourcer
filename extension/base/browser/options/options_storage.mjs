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

import { getSyncStorageItems } from "/base/browser/common/browser_compat.mjs";

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

async function loadOptions() {

  let loadedOptions = undefined;

  chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
    console.log("loadOptions: total sync storage in use is : " + bytesInUse);
  });

  let itemsNew = await getSyncStorageItems(
    ["options_search", "options_citation", "options_narrative", "options_table", "options_addPerson", "options_version"]);

  if (itemsNew.options_search) {
    loadedOptions = {};
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_search, "search");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_citation, "citation");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_narrative, "narrative");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_table, "table");
    putNewLoadedOptionsSetInOptions(loadedOptions, itemsNew.options_addPerson, "addPerson");
    if (itemsNew.options) {
      loadedOptions.options_version = itemsNew.options.options_version;
    }
    else if (itemsNew.options_version) {
      // this is a temporary format for during development of 1.3.4 can be removed once options updated
      loadedOptions.options_version = itemsNew.options_version;
    }
  }
  else {
    let itemsOld = await getSyncStorageItems(["options", ]);
    if (itemsOld.options) {
      loadedOptions = itemsOld.options;
    }
  }

  //console.log("loadOptions: loadedOptions is");
  //console.log(loadedOptions);

  return loadedOptions;
}

function convertOptionsObjectToSaveFormat(options) {

  const prefixes = [ "search", "citation", "narrative", "table", "addPerson", "options"];

  let newOptions = {};

  for (let prefix of prefixes) {
    newOptions[prefix] = {};
  }

  const keys = Object.keys(options);
  for (let key of keys) {
    let underscoreIndex = key.indexOf("_");
    if (underscoreIndex != -1) {
      let prefix = key.substring(0, underscoreIndex);
      if (prefixes.includes(prefix)) {
        let remainder = key.substring(underscoreIndex+1);
        newOptions[prefix][remainder] = options[key];
      }
      else {
        newOptions[key] = options[key];
      }
    }
    else {
      newOptions[key] = options[key];
    }
  }
 
  return newOptions;
}

// Saves options to chrome.storage
async function saveOptions(options) {

  let saveFormatOptions = convertOptionsObjectToSaveFormat(options);

  // set the values in the stored user options
  try {
    chrome.storage.sync.set(
      {
        options_search: saveFormatOptions.search,
        options_citation: saveFormatOptions.citation,
        options_narrative: saveFormatOptions.narrative,
        options_table: saveFormatOptions.table,
        options_addPerson: saveFormatOptions.addPerson,
        options: saveFormatOptions.options,
      },
      function() {
        if (!chrome.runtime.lastError) {
          // Update status to let user know options were saved.
          var status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 750);
        }
        else {
          console.log("saveOptions: Runtime error is:");
          console.log(chrome.runtime.lastError);

          chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
            console.log("saveOptions: total sync storage in use is : " + bytesInUse);
          });
        
          // This fixed the issue in iPad simulator. But it seems a bit drastic...
          // The saved failed, clear all sync storage and try again.
          // Since this extension ONLY uses the sync storage area for user options it should not lose
          // data unless the second save fails also.
          chrome.storage.sync.clear(function () {
            chrome.storage.sync.set(
              {
                options_search: saveFormatOptions.search,
                options_citation: saveFormatOptions.citation,
                options_narrative: saveFormatOptions.narrative,
                options_table: saveFormatOptions.table,
                options_addPerson: saveFormatOptions.addPerson,
                options: saveFormatOptions.options,
              },
              function() {
                if (!chrome.runtime.lastError) {
                  // Update status to let user know options were saved.
                  var status = document.getElementById('status');
                  status.textContent = 'Options saved.';
                  setTimeout(function() {
                    status.textContent = '';
                  }, 750);
                }
                else {
                  console.log("saveOptions, after clear: Runtime error is:");
                  console.log(chrome.runtime.lastError);
        
                  chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
                    console.log("saveOptions, after clear: total sync storage in use is : " + bytesInUse);
                  });
                
                  var status = document.getElementById('status');
                  status.textContent = 'Options could not be saved.';
                  setTimeout(function() {
                    status.textContent = '';
                  }, 5000);
                }
              }
            );            
          });
        }
      }
    );
  }
  catch (e) {
    console.log("saveOptions: caught error is:");
    console.log(e);

    chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
      console.log("saveOptions: total sync storage in use is : " + bytesInUse);
    });

    var status = document.getElementById('status');
    status.textContent = 'Options could not be saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 5000);
  }
}

export { loadOptions, saveOptions };
