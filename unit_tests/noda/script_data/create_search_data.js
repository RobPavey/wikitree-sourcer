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

import fs from "fs";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

function doesFolderExist(path) {
  return fs.existsSync(path);
}

function createFolderPathIfNeeded(path) {
  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path);
    } catch (error) {
      console.log("createFolderPathIfNeeded: error creating: " + path);
      console.log(error);
      return false;
    }
  }

  return true;
}

function readFile(path) {
  let inputText = "";
  try {
    inputText = fs.readFileSync(path, "utf8");
  } catch (e) {
    console.log("Failed to read input file: " + path);
    console.log("Error:", e.stack);
    return "";
  }

  return inputText;
}

function writeFile(path, text) {
  try {
    fs.writeFileSync(path, text, { mode: 0o644 });
  } catch (err) {
    // An error occurred
    console.log("Failed to write output file: " + path);
    console.error(err);
    return false;
  }
  return true;
}

function checkParameters(parameters) {
  const siteName = parameters.siteName;
  if (!siteName) {
    console.log("Parameter check failed. siteName missing.");
    return false;
  }

  let lcSiteName = siteName.toLowerCase();
  if (lcSiteName != siteName) {
    console.log("Parameter check failed. siteName must be all lowercase.");
    return false;
  }

  if (siteName.search(/[^a-z]/) != -1) {
    console.log("Parameter check failed. siteName must only contain letters.");
    return false;
  }

  if (siteName.length < 2) {
    console.log("Parameter check failed. siteName must be at least two letters long.");
    return false;
  }

  const siteDisplayName = parameters.siteDisplayName;
  if (!siteDisplayName) {
    console.log("Parameter check failed. siteDisplayName missing.");
    return false;
  }

  return true;
}

function checkForRequiredFolders() {
  const requiredFolders = ["extension", "unit_tests", "scripts", "extension/site", "scripts/new_site_template"];

  for (let folder of requiredFolders) {
    if (!doesFolderExist(folder)) {
      console.log("Not running in correct folder. Missing path: " + folder);
      return false;
    }
  }

  return true;
}

function createSiteFolders(siteName) {
  const extensionSite = "extension/site/" + siteName;
  if (!createFolderPathIfNeeded(extensionSite)) return false;
  if (!createFolderPathIfNeeded(extensionSite + "/browser")) return false;
  if (!createFolderPathIfNeeded(extensionSite + "/core")) return false;

  const testSite = "unit_tests/" + siteName;
  if (!createFolderPathIfNeeded(testSite)) return false;
  if (!createFolderPathIfNeeded(testSite + "/citations")) return false;
  if (!createFolderPathIfNeeded(testSite + "/extracted_data/")) return false;
  if (!createFolderPathIfNeeded(testSite + "/generalized_data/")) return false;
  if (!createFolderPathIfNeeded(testSite + "/saved_pages/")) return false;
  if (!createFolderPathIfNeeded(testSite + "/search_url/")) return false;

  return true;
}

function createSiteFileFromTemplate(parameters, rootPath, midPath, fileEnd) {
  let templatePath = "scripts/new_site_template/" + rootPath + "/examplesite/";
  let sitePath = rootPath + "/" + parameters.siteName + "/";
  if (midPath) {
    templatePath += midPath + "/";
    sitePath += midPath + "/";
  }
  templatePath += "examplesite" + fileEnd;
  sitePath += parameters.siteName + fileEnd;

  // read template file
  let inputText = readFile(templatePath);
  if (!inputText) {
    return false;
  }

  const siteNameIc = parameters.siteName[0].toUpperCase() + parameters.siteName.substring(1);

  // make text substitutions
  let outputText = inputText;

  function replaceAll(fromString, toString) {
    let regexString = fromString;
    let regex = new RegExp(regexString, "g");
    outputText = outputText.replace(regex, toString);
  }

  let regexString = "examplesite";
  let regex = new RegExp(regexString, "g");
  outputText = outputText.replace(regex, parameters.siteName);

  replaceAll("examplesite", parameters.siteName);
  replaceAll("Examplesite", siteNameIc);
  replaceAll("ExampleSite", parameters.siteDisplayName);

  // write site file
  if (!writeFile(sitePath, outputText)) {
    return false;
  }

  return true;
}

function createSiteFilesFromTemplates(parameters) {
  const files = [
    { root: "extension/site", mid: "browser", end: "_content.js" },
    { root: "extension/site", mid: "browser", end: "_popup_search.mjs" },
    { root: "extension/site", mid: "browser", end: "_popup.html" },
    { root: "extension/site", mid: "browser", end: "_popup.mjs" },

    { root: "extension/site", mid: "core", end: "_build_citation.mjs" },
    { root: "extension/site", mid: "core", end: "_build_search_url.mjs" },
    { root: "extension/site", mid: "core", end: "_ed_reader.mjs" },
    { root: "extension/site", mid: "core", end: "_extract_data.mjs" },
    { root: "extension/site", mid: "core", end: "_generalize_data.mjs" },
    { root: "extension/site", mid: "core", end: "_options.mjs" },
    { root: "extension/site", mid: "core", end: "_uri_builder.mjs" },

    { root: "unit_tests", mid: "", end: "_test_build_search_url.mjs" },
    { root: "unit_tests", mid: "", end: "_test_content_and_citation.mjs" },
    { root: "unit_tests", mid: "", end: "_test.mjs" },
  ];

  for (let file of files) {
    if (!createSiteFileFromTemplate(parameters, file.root, file.mid, file.end)) {
      return false;
    }
  }

  return true;
}

function addLineToFile(path, lineToAdd) {
  // read file
  let text = readFile(path);
  if (!text) {
    return false;
  }

  if (text.indexOf(lineToAdd) != -1) {
    // already there
    return false;
  }

  if (!text.endsWith("\n")) {
    text += "\n";
  }

  text += lineToAdd + "\n";

  // write site file
  if (!writeFile(path, text)) {
    return false;
  }

  return true;
}

function updatePopupRegisterSearchSites(siteName) {
  const path = "extension/site/all/browser/popup_register_search_sites.mjs";
  const lineToAdd = 'import "/site/' + siteName + "/browser/" + siteName + '_popup_search.mjs";';

  return addLineToFile(path, lineToAdd);
}

function updateRegisterSiteOptions(siteName) {
  const path = "extension/site/all/core/register_site_options.mjs";
  const lineToAdd = 'import "../../' + siteName + "/core/" + siteName + '_options.mjs";';

  return addLineToFile(path, lineToAdd);
}

function updateRunTest(siteName) {
  const path = "scripts/run_test.js";
  const lineToAdd = '  "' + siteName + '",\n';

  // read file
  let text = readFile(path);
  if (!text) {
    return false;
  }

  if (text.indexOf(lineToAdd) != -1) {
    // already there
    return false;
  }

  // find start of the siteNames array
  let siteNamesIndex = text.indexOf("const siteNames = [");
  //let endIndex = text.search(/import \"\.\.\/unit_tests\//);
  if (siteNamesIndex == -1) {
    console.log("cannot find siteNames line in " + path);
    return false;
  }

  // find the end of the siteNames array
  let endOfArrayIndex = text.indexOf("];", siteNamesIndex);

  if (endOfArrayIndex == -1) {
    console.log("cannot find end of siteNames array " + path);
    return false;
  }

  const indexToAddLine = endOfArrayIndex;

  const textBefore = text.substring(0, indexToAddLine);
  const textAfter = text.substring(indexToAddLine);

  text = textBefore + lineToAdd + textAfter;

  // write site file
  if (!writeFile(path, text)) {
    return false;
  }

  return true;
}

async function createNewSite() {
  let parameters = {
    siteName: "",
    siteDisplayName: "",
    siteUrl: "",
  };

  if (process.argv.length > 2) {
    parameters.siteName = process.argv[2];
    if (process.argv.length > 3) {
      parameters.siteDisplayName = process.argv[3];
      if (process.argv.length > 4) {
        parameters.siteUrl = process.argv[4];
      }
    }
  }

  console.log("Creating new site folders/files.");
  console.log("  siteName is '" + parameters.siteName + "'");
  console.log("  siteDisplayName is '" + parameters.siteDisplayName + "'");

  // do some sanity checks
  if (!checkParameters(parameters)) {
    return;
  }

  // first double check that we are running in the correct folder
  if (!checkForRequiredFolders()) {
    return;
  }

  // Now create all the folders for the new site
  if (!createSiteFolders(parameters.siteName)) {
    console.log("Falied to created site folders");
    return;
  }

  // Now create all the files from the template files
  if (!createSiteFilesFromTemplates(parameters)) {
    console.log("Falied to created site files from templates");
    return;
  }

  updatePopupRegisterSearchSites(parameters.siteName);
  updateRegisterSiteOptions(parameters.siteName);
  updateRunTest(parameters.siteName);
}

async function createSearchData() {
  let dirPath = "unit_tests/noda/script_data/";
  const htmlPath = dirPath + "detailed_search_page.html";

  let dom = undefined;
  try {
    dom = await JSDOM.fromFile(htmlPath);
  } catch (e) {
    console.log("Error:", e.stack);
    console.log("Failed to read input file");
    return;
  }
  const doc = dom.window.document;

  let categoryRoot = doc.querySelector("#accordion-category");
  if (!categoryRoot) {
    console.log("Failed to find categoryRoot");
    return;
  }

  let categoryListItems = categoryRoot.querySelectorAll("ul.nested-filters > li");

  let categories = [{ value: "all", text: "All Categories" }];
  let collections = [{ value: "all", text: "All Collections" }];

  for (let listItem of categoryListItems) {
    let categoryLink = listItem.querySelector("a");
    if (!categoryLink) {
      console.log("Failed to find categoryLink");
      continue;
    }

    let category = {};
    let categoryId = categoryLink.id;
    const idPrefix = "cat-";
    if (!categoryId.startsWith(idPrefix)) {
      console.log("Failed to parse categoryId");
      continue;
    }

    let categoryText = "";
    for (let childNode of categoryLink.childNodes) {
      if (childNode.nodeType === 3) {
        let text = childNode.textContent.trim();
        if (text) {
          categoryText += text;
        }
      }
    }

    let categoryValue = categoryId.substring(idPrefix.length);

    category.value = categoryValue;
    category.text = categoryText;

    categories.push(category);

    // now go through the collections in the category
    let tagsId = "tags-" + category.value;
    let collectionListItems = listItem.querySelectorAll("#" + tagsId + " > ul > li");
    if (collectionListItems.length == 0) {
      collectionListItems = listItem.querySelectorAll("ul > li");
    }

    for (let collectionListItem of collectionListItems) {
      let input = collectionListItem.querySelector("label > input");
      let span = collectionListItem.querySelector("label > span");
      if (!input) {
        console.log("Failed to find collectionListItem input");
        continue;
      }
      if (!span) {
        console.log("Failed to find collectionListItem span");
        continue;
      }

      let collection = {};
      collections.push(collection);

      let collectionName = input.getAttribute("name").trim();
      let collectionValue = input.value;
      let collectionDataName = input.getAttribute("data-name").trim();

      if (collectionName.endsWith("[]")) {
        collectionName = collectionName.substring(0, collectionName.length - 2);
      }

      collection.value = collectionName + "_" + collectionValue;
      collection.text = collectionDataName;
      collection.category = category.value;
    }
  }

  //console.log(categories);
  //console.log(collections);

  // write out result file.
  const resultPath = dirPath + "generated_search_data.js";

  let categoriesJsonString = JSON.stringify(categories, null, 2);
  let collectionsJsonString = JSON.stringify(collections, null, 2);

  let outputString = "const categories = " + categoriesJsonString + ";\n\n";
  outputString += "const collections = " + collectionsJsonString + ";\n\n";

  try {
    fs.writeFileSync(resultPath, outputString, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    console.log("Failed to write output test file: " + resultPath);
  }
}

createSearchData();
