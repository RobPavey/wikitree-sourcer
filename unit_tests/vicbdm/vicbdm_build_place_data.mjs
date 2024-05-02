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

import { vicbdmPlaceAbbreviationTable } from "./vicbdm_place_abbreviations.mjs";
import { vicbdmPlaceAbbreviationTable2 } from "./vicbdm_place_abbreviations2.mjs";
import { vicbdmPlaceVariations } from "./vicbdm_place_variations.mjs";

import { writeTestOutputTextFile } from "../test_utils/ref_file_utils.mjs";
import { LocalErrorLogger } from "../test_utils/error_log_utils.mjs";

function buildNewTable() {
  let placeTable = [];

  function findExistingPlace(placeName) {
    for (let place of placeTable) {
      if (place.name && place.name == placeName) {
        return place;
      }
    }
  }

  function findExistingVariation(variations, name) {
    for (let variation of variations) {
      if (variation.name && variation.name == name) {
        return variation;
      }
    }
  }

  function parseNotes(notes) {
    // examples:
    // "Births 1858 for Storey",
    // "Births 1859 for Nowlan (Nolan)"
    // "Gold rush at White Hills. Births 1858-59"
    // "Gold rush at White Hills. Births 1858 for Davis"
    // "Births 1860, 1884-87. Deaths 1958-85"
    // "(Fryers Creek area) Births 1873 for Elliot"
    // "Births 1856 for Stanley. Also registered in SA"
    // "Births 1858 for Gouldthorp. Deaths 1898 for Hamilton"
    // "Births 1893 for Howie and Hughes"
    // "(Allendale) Births 1876, 1878, 1882, 1893"
    // "Births 1878 for Balding. (but could be Elmore mispelling)"
    // "Bendigo area. Births 1860, 1862, 1864"
    // "Births 1902-10. Deaths 1890-1900. Marriages 1886-1911"
    // "Deaths 1895, 1904. Marriages 1884"
    // "Births 1894-1905. (Marriages 1896-1912, Emerald Hill)"
    // "Abbr error (Ardp) Cooma area. Deaths 1848 for Cowper"
    // "West Strathdownie area. Births 1860, 1864 for McCallum, Newell"
    // "Births 1893 for Ahlston (Residence at Armadale)""
    // Leading name in parens seems to mean an alternate spelling of real place name
    // <name> area. is a description of location of place name
  }

  for (let key of Object.keys(vicbdmPlaceAbbreviationTable)) {
    let placeName = vicbdmPlaceAbbreviationTable[key];
    let abbrev = key;
    let place = findExistingPlace(placeName);
    if (place) {
      place.variations.push({ name: abbrev });
    } else {
      place = { name: placeName, variations: [{ name: abbrev }] };
      placeTable.push(place);
    }
  }

  for (let row of vicbdmPlaceAbbreviationTable2) {
    let abbrev = row.abbrev;
    let placeName = row.name;
    let notes = row.notes;

    if (abbrev && placeName) {
      let ucAbbrev = abbrev.toUpperCase();

      let noteData = parseNotes(notes);

      let place = findExistingPlace(placeName);
      if (place) {
        let variation = findExistingVariation(place.variations, ucAbbrev);
        if (variation) {
          // maybe modify data
        } else {
          place.variations.push({ name: ucAbbrev });
        }
      } else {
        place = { name: placeName, variations: [{ name: ucAbbrev }] };
        placeTable.push(place);
      }
    }
  }

  for (let key of Object.keys(vicbdmPlaceVariations)) {
    let variations = vicbdmPlaceVariations[key];
    let placeName = key;

    if (placeName && variations) {
      let place = findExistingPlace(placeName);
      if (!place) {
        place = { name: placeName, variations: [] };
        placeTable.push(place);
      }

      for (let variation of variations) {
        let ucVariation = variation.toUpperCase();
        let existingVariation = findExistingVariation(place.variations, ucVariation);
        if (!existingVariation) {
          place.variations.push({ name: ucVariation });
        }
      }
    }
  }

  return placeTable;
}

function writeTableToFile(testManager, placeTable) {
  // write out result file.

  let resultJsonString = JSON.stringify(placeTable, null, 2);

  let testData = { caseName: "build_place_table" };
  let logger = new LocalErrorLogger(testManager.results, "build_place_data");

  writeTestOutputTextFile(resultJsonString, "vicbdm", "buildOutput", testData, "", logger);
}

function writeReport(placeTable) {
  let abbrevToPlace = {};

  function addPlace(abbrev, place) {
    let entry = abbrevToPlace[abbrev];
    if (!entry) {
      abbrevToPlace[abbrev] = [place];
    } else {
      if (!entry.includes(place)) {
        entry.push(place);
      }
    }
  }
  for (let place of placeTable) {
    for (let variation of place.variations) {
      addPlace(variation.name, place);
    }
  }

  console.log("abbrevToPlace is:");
  console.log(abbrevToPlace);

  let abbrevMostUsed = undefined;
  let maxTimesUsed = 0;
  for (let key of Object.keys(abbrevToPlace)) {
    let entry = abbrevToPlace[key];
    let numPlaces = entry.length;
    if (numPlaces > maxTimesUsed) {
      abbrevMostUsed = key;
      maxTimesUsed = numPlaces;
    }
  }

  console.log("The abbrevation used for the most places is: " + abbrevMostUsed + ", used " + maxTimesUsed + " times.");
}

async function build(testManager) {
  console.log("build place data");

  let placeTable = buildNewTable();
  writeTableToFile(testManager, placeTable);

  writeReport(placeTable);
}

export { build };
