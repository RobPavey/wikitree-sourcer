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
      if (collectionListItem.classList.contains("select-all")) {
        continue;
      }

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
