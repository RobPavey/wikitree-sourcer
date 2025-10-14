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
import readline from "node:readline/promises";

const siteFiles = [
  // Extension files

  //   browser
  {
    root: "extension/site",
    mid: "browser",
    end: "_content.js",
    variants: [
      {
        searchUsingLocalStorage: true,
        needsHighlightRow: true,
        templateFileEnd: "_content_sls_hr.js",
      },
      {
        searchUsingLocalStorage: true,
        templateFileEnd: "_content_sls.js",
      },
      {
        needsHighlightRow: true,
        templateFileEnd: "_content_hr.js",
      },
    ],
  },
  {
    root: "extension/site",
    mid: "browser",
    end: "_popup_search.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        templateFileEnd: "_popup_search_sls.mjs",
      },
    ],
  },
  { root: "extension/site", mid: "browser", end: "_popup.html" },
  { root: "extension/site", mid: "browser", end: "_popup.mjs" },

  //   core
  { root: "extension/site", mid: "core", end: "_build_citation.mjs" },
  {
    root: "extension/site",
    mid: "core",
    end: "_build_search_data.mjs",
    variants: [
      {
        searchUsingLocalStorage: false,
        omit: true,
      },
    ],
  },
  {
    root: "extension/site",
    mid: "core",
    end: "_build_search_url.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        omit: true,
      },
    ],
  },
  { root: "extension/site", mid: "core", end: "_ed_reader.mjs" },
  {
    root: "extension/site",
    mid: "core",
    end: "_extract_data.mjs",
    variants: [
      {
        needsHighlightRow: true,
        templateFileEnd: "_extract_data_hr.mjs",
      },
    ],
  },
  { root: "extension/site", mid: "core", end: "_generalize_data.mjs" },
  {
    root: "extension/site",
    mid: "core",
    end: "_options.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        templateFileEnd: "_options_sls.mjs",
      },
    ],
  },
  { root: "extension/site", mid: "core", end: "_site_data.mjs" },
  {
    root: "extension/site",
    mid: "core",
    end: "_uri_builder.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        omit: true,
      },
    ],
  },

  // Unit test files

  {
    root: "unit_tests",
    mid: "",
    end: "_test_build_search_data.mjs",
    variants: [
      {
        searchUsingLocalStorage: false,
        omit: true,
      },
    ],
  },
  {
    root: "unit_tests",
    mid: "",
    end: "_test_build_search_url.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        omit: true,
      },
    ],
  },
  { root: "unit_tests", mid: "", end: "_test_content_and_citation.mjs" },
  {
    root: "unit_tests",
    mid: "",
    end: "_test.mjs",
    variants: [
      {
        searchUsingLocalStorage: true,
        templateFileEnd: "_test_sls.mjs",
      },
    ],
  },
];

function doesFolderExist(path) {
  return fs.existsSync(path);
}

function doesFileExist(path) {
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

  const siteUrlMatch = parameters.siteUrlMatch;
  if (!siteUrlMatch) {
    console.log("Parameter check failed. siteUrlMatch missing.");
    return false;
  }

  return true;
}

function checkForExistingSiteFile(parameters, rootPath, midPath, fileEnd, variants) {
  let sitePath = rootPath + "/" + parameters.siteName + "/";
  if (midPath) {
    sitePath += midPath + "/";
  }
  sitePath += parameters.siteName + fileEnd;

  if (doesFileExist(sitePath)) {
    return true;
  }

  return false;
}

function checkForExistingSite(parameters) {
  // don't check for folders existing since, if they ran the script once
  // and then reverted all files the folders would exist but be empty

  for (let file of siteFiles) {
    if (checkForExistingSiteFile(parameters, file.root, file.mid, file.end, file.variants)) {
      console.log("The site '" + parameters.siteName + "' already exists. Cannot create new site.");
      return true;
    }
  }

  return false;
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

function createSiteFileFromTemplate(parameters, rootPath, midPath, fileEnd, variants) {
  let variant = undefined;
  if (variants) {
    for (let testVariant of variants) {
      if (testVariant.hasOwnProperty("searchUsingLocalStorage")) {
        if (testVariant.searchUsingLocalStorage != parameters.searchUsingLocalStorage) {
          continue;
        }
      }
      if (testVariant.hasOwnProperty("needsHighlightRow")) {
        if (testVariant.needsHighlightRow != parameters.needsHighlightRow) {
          continue;
        }
      }
      variant = testVariant;
      break;
    }
  }

  if (variant && variant.omit) {
    return true;
  }

  let templatePath = "scripts/new_site_template/" + rootPath + "/examplesite/";
  let sitePath = rootPath + "/" + parameters.siteName + "/";
  if (midPath) {
    templatePath += midPath + "/";
    sitePath += midPath + "/";
  }

  let templateFileEnd = fileEnd;
  if (variant && variant.templateFileEnd) {
    templateFileEnd = variant.templateFileEnd;
  }

  templatePath += "examplesite" + templateFileEnd;
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

  replaceAll("exampleSiteUrlMatchString", parameters.siteUrlMatch);
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
  for (let file of siteFiles) {
    if (!createSiteFileFromTemplate(parameters, file.root, file.mid, file.end, file.variants)) {
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

function updateSiteNamesFile(siteName) {
  const path = "extension/site/all/core/site_names.mjs";
  const lineToAdd = '  "' + siteName + '",';

  // read file
  let text = readFile(path);
  if (!text) {
    return false;
  }

  if (text.indexOf(lineToAdd) != -1) {
    // already there
    return false;
  }

  let closeParenIndex = text.indexOf("];");
  if (closeParenIndex == -1) {
    // array not found
    return false;
  }

  let textBeforeInsert = text.substring(0, closeParenIndex);
  let textAfterInsert = text.substring(closeParenIndex);
  let textToInsert = lineToAdd + "\n";

  let newText = textBeforeInsert + textToInsert + textAfterInsert;

  // write site file
  if (!writeFile(path, newText)) {
    return false;
  }

  return true;
}

function updateManifestFile(siteName, urlMatch, path) {
  // read file
  let text = readFile(path);
  if (!text) {
    return false;
  }

  let manifestData = JSON.parse(text);

  // sanity checks
  let contentScripts = manifestData.content_scripts;
  let webAccessibleResources = manifestData.web_accessible_resources;

  if (!(contentScripts && Array.isArray(contentScripts))) {
    return false;
  }

  if (!(webAccessibleResources && Array.isArray(webAccessibleResources))) {
    return false;
  }

  /*
    Example content script entry
    {
      "matches": ["*://www.wiewaswie.nl/*"],
      "run_at": "document_idle",
      "js": ["base/browser/content/content_common.js", "site/wiewaswie/browser/wiewaswie_content.js"]
    },
  */
  const urlMatches = [urlMatch];
  const siteContentPath = "site/" + siteName + "/browser/" + siteName + "_content.js";
  let contentScriptsEntry = {
    matches: urlMatches,
    run_at: "document_idle",
    js: ["base/browser/content/content_common.js", siteContentPath],
  };

  let alreadyExists = false;
  for (let entry of contentScripts) {
    if (entry.matches == urlMatches) {
      alreadyExists = true;
    } else if (entry.js.includes(siteContentPath)) {
      alreadyExists = true;
    }
  }
  if (!alreadyExists) {
    contentScripts.push(contentScriptsEntry);
  }

  /*
    Example web_accessible_resources section:
    {
      "resources": ["site/vicbdm/core/vicbdm_extract_data.mjs"],
      "matches": ["*://*.bdm.vic.gov.au/*"]
    },
  */
  const siteExtractPath = "site/" + siteName + "/core/" + siteName + "_extract_data.mjs";
  let warEntry = {
    resources: [siteExtractPath],
    matches: urlMatches,
  };

  alreadyExists = false;
  for (let entry of webAccessibleResources) {
    if (entry.resources.includes(siteExtractPath)) {
      alreadyExists = true;
    } else if (entry.matches == urlMatches) {
      alreadyExists = true;
    }
  }
  if (!alreadyExists) {
    webAccessibleResources.push(warEntry);
  }

  const newText = JSON.stringify(manifestData, null, 2);

  // write site file
  if (!writeFile(path, newText)) {
    return false;
  }

  return true;
}

function updateManifestFiles(siteName, urlMatch) {
  updateManifestFile(siteName, urlMatch, "extension/manifest.json");
  updateManifestFile(siteName, urlMatch, "browser_variants/firefox/manifest.json");
  updateManifestFile(siteName, urlMatch, "browser_variants/safari/ios/manifest.json");
  updateManifestFile(siteName, urlMatch, "browser_variants/safari/macos/manifest.json");
  return true;
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
    siteUrlMatch: "",
    searchUsingLocalStorage: false,
    needsHighlightRow: false,
  };

  if (process.argv.length > 2) {
    parameters.siteName = process.argv[2];
    if (process.argv.length > 3) {
      parameters.siteDisplayName = process.argv[3];
      if (process.argv.length > 4) {
        parameters.siteUrlMatch = process.argv[4];
      }
    }
  }

  // do some sanity checks
  if (!checkParameters(parameters)) {
    return;
  }

  // first double check that we are running in the correct folder
  if (!checkForRequiredFolders()) {
    return;
  }

  if (checkForExistingSite(parameters)) {
    return;
  }

  // Create a readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask the user about search capabilities of site
  let slsAnswer = await rl.question("Does this site support search using URL query? [y/n]: ");
  //console.log("User entered: " + slsAnswer);
  if (slsAnswer == "n") {
    parameters.searchUsingLocalStorage = true;
  }

  // Ask the user about search capabilities of site
  let hrAnswer = await rl.question(
    "Does this site lack record pages and require selecting a row to cite from search results? [y/n]: "
  );
  //console.log("User entered: " + hrAnswer);
  if (hrAnswer == "y") {
    parameters.needsHighlightRow = true;
  }

  console.log("About to create the new site's folders and files.");
  console.log("  siteName is '" + parameters.siteName + "'");
  console.log("  siteDisplayName is '" + parameters.siteDisplayName + "'");
  console.log("  siteUrlMatch is '" + parameters.siteUrlMatch + "'");
  console.log("  searchUsingLocalStorage is '" + parameters.searchUsingLocalStorage + "'");
  console.log("  needsHighlightRow is '" + parameters.needsHighlightRow + "'");

  // Check with the user before continuing
  let continueAnswer = await rl.question("Continue and create folders and files? [y/n]: ");
  //console.log("User entered: " + continueAnswer);
  if (continueAnswer != "y") {
    rl.close();
    return;
  }

  // Close the readline interface after getting the input
  rl.close();

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

  updateSiteNamesFile(parameters.siteName);
  updateRegisterSiteOptions(parameters.siteName);
  updateRunTest(parameters.siteName);

  updateManifestFiles(parameters.siteName, parameters.siteUrlMatch);
}

createNewSite();
