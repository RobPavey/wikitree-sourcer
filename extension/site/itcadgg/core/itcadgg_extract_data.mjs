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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;
  try {
    // Main container for the data
    const dataArea = document.querySelector("#Pnldati");
    if (!dataArea) return result;

    // Extract all label/value pairs
    const rows = dataArea.querySelectorAll("tr");
    const data = {};

    rows.forEach((row) => {
      const labelNode = row.querySelector("span[id^='Label']");
      const valueNode = row.querySelector("span[id^='lbl']");
      if (labelNode && valueNode) {
        const label = labelNode.textContent.replace(":", "").trim();
        const value = valueNode.textContent.trim();
        if (label && value) data[label] = value;
      }
    });

    // Optional link to the image (“Mostra pagina”)
    const pageLink = dataArea.querySelector("a#HlnkAlbo");
    if (pageLink) {
      result.imageLink = pageLink.getAttribute("href");
    }

    // Save the raw extracted data
    result.data = data;

    // Optional — simplified structure for consistency across sites
    result.extracted_data = {
      name: data["Nominativo e paternità"],
      birth_date: data["Data nascita"],
      birth_place: data["Comune nascita"],
      birth_region: data["Regione nascita"],
      birth_province: data["Provincia nascita"],
      birth_place_current: data["Comune nascita attuale"],
      birth_region_current: data["Regione nascita attuale"],
      birth_province_current: data["Provincia nascita attuale"],
      death_date: data["Data Morte"],
      death_place: data["Luogo Morte"],
      rank: data["Grado Uniformato"],
      unit: data["Reparto Uniformato"],
      cause_of_death: data["Causa Morte Uniformata"],
      rank_albo: data["Grado in Albo"],
      unit_albo: data["Reparto in Albo"],
      cause_of_death_albo: data["Causa Morte in Albo"],
      casualita: data["Casualità"],
      image_link: result.imageLink,
    };

    // Mark success *after* building the data
    result.success = true;
  } catch (err) {
    console.error("Error extracting data:", err);
  }
  // This will print the full result object
  //console.log("Extracted result:", result);
  return result;
}

export { extractData };
