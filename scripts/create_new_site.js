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

  let lcSiteName = siteName;
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
  const lineToAdd = '\nimport "../unit_tests/' + siteName + "/" + siteName + '_test.mjs";';

  // read file
  let text = readFile(path);
  if (!text) {
    return false;
  }

  if (text.indexOf(lineToAdd) != -1) {
    // already there
    return false;
  }

  // find last of the import lines
  let importLineIndex = text.indexOf('import "../unit_tests/');
  //let endIndex = text.search(/import \"\.\.\/unit_tests\//);
  if (importLineIndex == -1) {
    console.log("cannot find import line in " + path);
    return false;
  }

  let endOfLine = -1;
  while (importLineIndex != -1) {
    endOfLine = text.indexOf("\n", importLineIndex);
    if (endOfLine == -1) {
      console.log("cannot find newline on end of import line in " + path);
      return false;
    }

    importLineIndex = text.indexOf('import "../unit_tests/', endOfLine);
  }

  const indexToAddLine = endOfLine;

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
  // results is an object that builds up the test results
  // it contains an array of objects (allTests), each has a test name and whether it passed
  let results = {
    totalTestsRun: 0,
    numFailedTests: 0,
    allTests: [],
  };

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

createNewSite();
