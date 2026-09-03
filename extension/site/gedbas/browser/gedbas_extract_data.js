/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function extractData(document, url) {
  let result = { url: url, success: false };

  if (!url.match("/person/show/")) return result;

  result.primaryPerson = {};

  const characteristics = document.querySelector("table[id=\"characteristics\"] > tbody");
  for (let characteristic of characteristics.children) {
    let key = characteristic.children[0].textContent.trim();
    let value = characteristic.children[1].textContent.trim();
    let date = characteristic.children[2].textContent.trim();
    let place = characteristic.children[3].textContent.replaceAll("Personen in diesem Ort suchen", "").trim();
    let sources = characteristic.children[4];

    if (key && value) {
      let entry = {value: value};

      if (date) {
        entry.date = date;
      }
      if (place) {
        entry.place = place;
      }

      if (sources) {
        let soure_list = [];
        for (let source of sources.querySelectorAll("span")) {
          soure_list.push(source.textContent.trim());
        }

        if (soure_list.length > 0) {
          entry.sources = soure_list;
        }
      }

      result.primaryPerson[key] = entry;
    }
  }

  const events = document.querySelector("table[id=\"events\"] > tbody");
  for (let event of events.children) {
    let key = event.children[0].textContent.trim();
    let date = event.children[1].textContent.trim();
    let place = event.children[2].textContent.replaceAll("Personen in diesem Ort suchen", "").trim();
    let sources = event.children[3];

    if (key) {
      let entry = {};

      if (date) {
        entry.date = date;
      }
      if (place) {
        entry.place = place;
      }

      if (sources) {
        let soure_list = [];
        for (let source of sources.querySelectorAll("span")) {
          soure_list.push(source.textContent.trim());
        }

        if (soure_list.length > 0) {
          entry.sources = soure_list;
        }
      }

      result.primaryPerson[key] = entry;
    }
  }

  result.parents = [];
  const parents = document.querySelector("div[id=\"gedbas-parents\"] > table > tbody");
  for (let parent_data of parents.children) {
    result.parents.push({
      father: {
        name: parent_data.children[0].children[0].textContent.trim(),
        url: parent_data.children[0].children[0].href,
      },
      mother: {
        name: parent_data.children[1].children[0].textContent.trim(),
        url: parent_data.children[1].children[0].href,
      },
    });
  }

  result.families = [];
  const families = document.querySelector("div[id=\"gedbas-families\"] > table > tbody");
  for (let familyIdx = 1; familyIdx < families.children.length; familyIdx++) {
    const familyData = families.children[familyIdx];

    let family = {};
    const marriageDate = familyData.children[0].children[0].textContent.trim();
    if (marriageDate) family.marriageDate = marriageDate;
    const marriagePlace = familyData.children[0].children[2].textContent.trim();
    if (marriagePlace) family.marriagePlace = marriagePlace;

    family.partner = {
      name: familyData.children[1].children[0].textContent.trim(),
      url: familyData.children[1].children[0].href,
    }

    family.children = [];
    for (let childData of familyData.children[2].children[0].children) {
      let child = {};
      const birthDate = childData.querySelector("span").textContent.trim();
      if (birthDate) child.birthDate = birthDate;
      child.name = childData.querySelector("a").textContent.trim();
      child.link = childData.querySelector("a").href;
      family.children.push(child);
    }

    result.families.push(family);
  }

  const sources = document.querySelector("div[id=\"gedbas-sources\"] > table > tbody");
  result.sources = {};
  for (let source of sources.children) {
    let key = source.children[0].textContent.trim();
    if (!key) continue;

    let data = {};
    const source_data = source.children[1];
    data.title = source_data.children[0].textContent.trim();
    for (let i = 1; i < source_data.children.length; i++) {
      const entry = source_data.children[i];
      if (entry.children.length == 0) continue;
      
      const key = entry.childNodes[1].textContent.trim();
      const value = entry.childNodes[3].textContent.trim();
      if (!key && !value) continue;
      data[key] = value;
    }

    result.sources[key] = data;
  }

  result.dbInfo = {};
  const gedbasInfo = document.querySelector("div[id=\"gedbas-database\"] > table > tbody");
  for (let entry of gedbasInfo.children) {
    if (entry.children.length != 2) continue;

    const key = entry.children[0].textContent.trim();
    const value = entry.children[1].textContent.replace("Profilseite besuchen", "").trim();
    if (!key && !value) continue;
    result.dbInfo[key] = value;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
