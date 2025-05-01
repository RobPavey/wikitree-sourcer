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

import { getDefaultOptions, getOptionsRegistry } from "../../core/options/options_database.mjs";
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

function convertOptionsFrom7To8(loadedOptions) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom7To8, before:");
  console.log(loadedOptions);

  // we want to move all options of the form "addMerge_fsAllCitations*"
  // to "buildAll_fs_"

  function moveOption(oldName, newName) {
    convertedOptions[newName] = convertedOptions[oldName];
    delete convertedOptions[oldName];
  }

  function moveOptionLeaf(oldLeafName, newLeafName) {
    let oldName = "addMerge_fsAllCitations_" + oldLeafName;
    let newName = "buildAll_fs_" + newLeafName;
    moveOption(oldName, newName);
  }

  moveOptionLeaf("citationType", "citationType");
  moveOptionLeaf("groupCitations", "groupCitations");
  moveOptionLeaf("includeNotes", "includeNotes");
  moveOptionLeaf("excludeNonFsSources", "excludeNonFsSources");
  moveOptionLeaf("excludeOtherRoleSources", "excludeOtherRoleSources");
  moveOptionLeaf("excludeRetiredSources", "excludeRetiredSources");

  convertedOptions.options_version = 8;

  console.log("convertOptionsFrom7To8, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom8To9(loadedOptions) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom8To9, before:");
  console.log(loadedOptions);

  if (convertedOptions["search_wikitree_birthLocationExactness"] === undefined) {
    convertedOptions["search_wikitree_birthLocationExactness"] = convertedOptions["search_wikitree_locationExactness"];
    convertedOptions["search_wikitree_deathLocationExactness"] = convertedOptions["search_wikitree_locationExactness"];
    delete convertedOptions["search_wikitree_locationExactness"];
  }

  convertedOptions.options_version = 9;

  console.log("convertOptionsFrom8To9, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom9To10(loadedOptions, optionsRegistry) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom9To10, before:");
  console.log(loadedOptions);

  // change is to the search menu item priorities.
  // In version 9 they are in options of the form
  //    search_<sitename>_popup_priorityOnTopMenu
  //    search_<sitename>_popup_priorityOnSubMenu
  // In version 10 there is one option for the order:
  //    search_general_priorityOrder
  // and separate options when whether to include a site:
  //    search_<sitename>_popup_includeOnTopMenu
  //    search_<sitename>_popup_includeOnSubmenu
  //

  // build a siteNameToSiteLabel object  because we use the label to sort
  // siteNames if their priorities are the same
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
        siteNameToSiteLabel[name] = label;
      }
    }
  }

  let oldPriorityOrder = [];
  for (let optionName of Object.keys(convertedOptions)) {
    const topRegex = /^search_([a-z]+)_popup_priorityOnTopMenu$/i;
    const subRegex = /^search_([a-z]+)_popup_priorityOnSubMenu$/i;
    let isTop = topRegex.test(optionName);
    let isSub = subRegex.test(optionName);
    if (isTop || isSub) {
      let siteName = "";
      let newOptionName = "";
      if (isTop) {
        siteName = optionName.replace(topRegex, "$1");
        newOptionName = "search_" + siteName + "_popup_includeOnTopMenu";
      } else {
        siteName = optionName.replace(subRegex, "$1");
        newOptionName = "search_" + siteName + "_popup_includeOnSubmenu";
      }
      if (siteName) {
        let oldValue = convertedOptions[optionName];
        let priority = Number(oldValue);
        if (isNaN(priority)) {
          priority = 0;
        }

        console.log(optionName + " : " + oldValue);

        let includeSite = priority > 0 ? true : false;
        console.log("setting " + newOptionName + " to " + includeSite);
        convertedOptions[newOptionName] = includeSite;
        delete convertedOptions[optionName];

        // we don't want to put in list twice so use the top value only
        if (includeSite && isTop) {
          let label = siteNameToSiteLabel[siteName];
          oldPriorityOrder.push({ name: siteName, priority: priority, label: label });
        }
      }
    }
  }

  let sortedList = oldPriorityOrder.sort(function (a, b) {
    if (a.priority == b.priority) {
      // if priority is same then sort alphabetically by site title
      return a.label.localeCompare(b.label);
    }
    if (a.priority < b.priority) {
      return -1;
    }
    return +1;
  });

  let priorityOrder = [];
  for (let item of sortedList) {
    priorityOrder.push(item.name);
  }

  convertedOptions["search_general_priorityOrder"] = priorityOrder;

  convertedOptions.options_version = 10;

  console.log("convertOptionsFrom9To10, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptionsFrom10To11(loadedOptions, optionsRegistry) {
  let convertedOptions = { ...loadedOptions };

  console.log("convertOptionsFrom10To11, before:");
  console.log(loadedOptions);

  if (convertedOptions.search_ancestry_restrictToRecords !== undefined) {
    if (convertedOptions.search_ancestry_restrictToRecords) {
      convertedOptions.search_ancestry_includeFamilyTrees = false;
      convertedOptions.search_ancestry_includeStoriesAndPublications = false;
      convertedOptions.search_ancestry_includePhotosAndMaps = false;
    }
    delete convertedOptions.search_ancestry_restrictToRecords;
  }

  convertedOptions.options_version = 11;

  console.log("convertOptionsFrom10To11, after:");
  console.log(convertedOptions);

  return convertedOptions;
}

function convertOptions(loadedOptions, defaultOptions, optionsRegistry) {
  let loadedVersion = loadedOptions.options_version;
  let currentVersion = defaultOptions.options_version;

  //console.log("convertOptions, loadedVersion is : " + loadedVersion + ", currentVersion is : " + currentVersion);

  //console.log("convertOptions, loadedOptions is : ");
  //console.log(loadedOptions);
  console.log("convertOptions, optionsRegistry is : ");
  console.log(optionsRegistry);

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
  if (loadedVersion < 8) {
    loadedOptions = convertOptionsFrom7To8(loadedOptions);
  }
  if (loadedVersion < 9) {
    loadedOptions = convertOptionsFrom8To9(loadedOptions);
  }
  if (loadedVersion < 10) {
    loadedOptions = convertOptionsFrom9To10(loadedOptions, optionsRegistry);
  }
  if (loadedVersion < 11) {
    loadedOptions = convertOptionsFrom10To11(loadedOptions, optionsRegistry);
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

function updateOptionsToLatestVersion(loadedOptions, defaultOptions, optionsRegistry) {
  let optionsObject = undefined;
  if (loadedOptions) {
    if (!loadedOptions.options_version) {
      // just in case the version failed to load
      loadedOptions.options_version = defaultOptions.options_version;
    }

    let convertedOptions = convertOptions(loadedOptions, defaultOptions, optionsRegistry);
    // We used to use the spread operator to merge the stored options and the ones from defaultOptions with
    // the stored ones taking priority. Out of a concern that no longer used options (that the converter forgot)
    // would build up it was changed to use a function.
    optionsObject = addNewDefaultsAndRemoveOldOptions(convertedOptions, defaultOptions);
  } else {
    optionsObject = defaultOptions;
  }

  return optionsObject;
}

async function callFunctionWithStoredOptions(optionsFunction) {
  let loadedOptions = await loadOptions();

  let defaultOptions = await getDefaultOptions();
  let optionsRegistry = await getOptionsRegistry();

  options = updateOptionsToLatestVersion(loadedOptions, defaultOptions, optionsRegistry);

  optionsFunction(options);
}

function replaceCachedOptions(newOptions) {
  options = newOptions;
}

export { callFunctionWithStoredOptions, replaceCachedOptions, updateOptionsToLatestVersion, options };
