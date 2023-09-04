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

import { getDefaultOptions } from "../../core/options/options_database.mjs";
import { loadOptions } from "./options_storage.mjs";

var options = undefined; // we cache the current options here

function convertOptionsFrom2To3(loadedOptions) {
  let convertedOptions = { ...loadedOptions };

  //console.log("convertOptionsFrom2To3, before:")
  //console.log(loadedOptions);

  convertedOptions.citation_general_addAccessedDate = convertedOptions.citation_addAccessedDate;
  delete convertedOptions.citation_addAccessedDate;

  convertedOptions.citation_general_addNewlinesWithinRefs = convertedOptions.citation_addNewlinesWithinRefs;
  delete convertedOptions.citation_addNewlinesWithinRefs;

  convertedOptions.citation_general_addNewlinesWithinBody = convertedOptions.citation_addNewlinesWithinBody;
  delete convertedOptions.citation_addNewlinesWithinBody;

  convertedOptions.citation_general_addBreaksWithinBody = convertedOptions.citation_addBreaksWithinBody;
  delete convertedOptions.citation_addBreaksWithinBody;

  convertedOptions.citation_general_meaningfulNames = convertedOptions.citation_meaningfulNames;
  delete convertedOptions.citation_meaningfulNames;

  if (convertedOptions.search_ancestry_domain == "none") {
    convertedOptions.search_ancestry_popup_priorityOnTopMenu = 0;
    convertedOptions.search_ancestry_popup_priorityOnSubMenu = 0;
    convertedOptions.search_ancestry_domain = "ancestry.com";
  }

  if (convertedOptions.search_fmp_domain == "none") {
    convertedOptions.search_fmp_popup_priorityOnTopMenu = 0;
    convertedOptions.search_fmp_popup_priorityOnSubMenu = 0;
    convertedOptions.search_fmp_domain = "findmypast.co.uk";
  }

  convertedOptions.options_version = 3;

  //console.log("convertOptionsFrom2To3, after:")
  //console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom3To4(loadedOptions) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom3To4, before:");
  console.log(loadedOptions);

  let oldAddAccessedDate = convertedOptions.citation_general_addAccessedDate;
  if (oldAddAccessedDate) {
    convertedOptions.citation_general_addAccessedDate = "parenAfterLink";
  } else {
    convertedOptions.citation_general_addAccessedDate = "none";
  }

  let oldmeaningfulNames = convertedOptions.citation_general_meaningfulNames;
  if (oldmeaningfulNames) {
    convertedOptions.citation_general_meaningfulNames = "bold";
  } else {
    convertedOptions.citation_general_meaningfulNames = "none";
  }

  let oldCaption = convertedOptions.table_table_caption;
  if (oldCaption) {
    convertedOptions.table_table_caption = "titlePlace";
  } else {
    convertedOptions.table_table_caption = "none";
  }

  convertedOptions.options_version = 4;

  console.log("convertOptionsFrom3To4, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom4To5(loadedOptions) {
  // Options version 5 was spliting up into multiple items, no conversion required here.

  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom4To5, before:");
  console.log(loadedOptions);

  convertedOptions.options_version = 5;

  console.log("convertOptionsFrom4To5, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom5To6(loadedOptions) {
  // Options version 5 was spliting up into multiple items, no conversion required here.

  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom5To6, before:");
  console.log(loadedOptions);

  convertedOptions.addMerge_general_splitForenames = convertedOptions.addPerson_general_splitForenames;

  convertedOptions.addMerge_addPerson_includeCitation = convertedOptions.addPerson_general_includeCitation;
  convertedOptions.addMerge_addPerson_includeProfileLink = convertedOptions.addPerson_general_includeProfileLink;
  convertedOptions.addMerge_addPerson_generateIntro = convertedOptions.addPerson_general_generateIntro;
  convertedOptions.addMerge_addPerson_includeLinks = convertedOptions.addPerson_general_includeLinks;
  convertedOptions.addMerge_addPerson_addDiedYoung = convertedOptions.addPerson_general_addDiedYoung;

  convertedOptions.options_version = 6;

  console.log("convertOptionsFrom5To6, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom6To7(loadedOptions) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom6To7, before:");
  console.log(loadedOptions);

  if (convertedOptions.search_general_new_window) {
    convertedOptions.search_general_newTabPos = "newWindow";
  } else {
    convertedOptions.search_general_newTabPos = "rightMost";
  }
  convertedOptions.options_version = 7;

  console.log("convertOptionsFrom6To7, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptions(loadedOptions, defaultOptions) {
  let loadedVersion = loadedOptions.options_version;
  let currentVersion = defaultOptions.options_version;

  //console.log("convertOptions, loadedVersion is : " + loadedVersion + ", currentVersion is : " + currentVersion);

  //console.log("convertOptions, loadedOptions is : ");
  //console.log(loadedOptions);

  if (loadedVersion >= currentVersion) {
    return loadedOptions;
  }

  if (loadedVersion < 3) {
    loadedOptions = convertOptionsFrom2To3(loadedOptions);
  }
  if (loadedVersion < 4) {
    loadedOptions = convertOptionsFrom3To4(loadedOptions);
  }
  if (loadedVersion < 5) {
    loadedOptions = convertOptionsFrom4To5(loadedOptions);
  }
  if (loadedVersion < 6) {
    loadedOptions = convertOptionsFrom5To6(loadedOptions);
  }
  if (loadedVersion < 7) {
    loadedOptions = convertOptionsFrom6To7(loadedOptions);
  }

  return loadedOptions;
}

function addNewDefaultsAndRemoveOldOptions(loadedOptions, defaultOptions) {
  let newOptions = {};
  const keys = Object.keys(defaultOptions);
  for (let key of keys) {
    if (loadedOptions.hasOwnProperty(key)) {
      newOptions[key] = loadedOptions[key];
    } else {
      console.log("option added from defaultOptions: " + key);
      newOptions[key] = defaultOptions[key];
    }
  }

  return newOptions;
}

async function callFunctionWithStoredOptions(optionsFunction) {
  let defaultOptions = getDefaultOptions();

  let loadedOptions = await loadOptions();

  let optionsObject = undefined;
  if (loadedOptions) {
    if (!loadedOptions.options_version) {
      // just in case the version failed to load
      loadedOptions.options_version = defaultOptions.options_version;
    }

    let convertedOptions = convertOptions(loadedOptions, defaultOptions);
    // We used to use the spread operator to merge the stored options and the ones from defaultOptions with
    // the stored ones taking priority. Out of a concern that no longer used options (that the converter forgot)
    // would build up it was changed to use a function.
    optionsObject = addNewDefaultsAndRemoveOldOptions(convertedOptions, defaultOptions);
  } else {
    optionsObject = defaultOptions;
  }

  options = optionsObject;

  optionsFunction(options);
}

function replaceCachedOptions(newOptions) {
  options = newOptions;
}

export { callFunctionWithStoredOptions, replaceCachedOptions, options };
