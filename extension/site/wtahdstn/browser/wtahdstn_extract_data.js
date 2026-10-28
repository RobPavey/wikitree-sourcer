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

// The Headstone Photo Tool person page embeds everything about the person as JSON in
// <script type="application/json" id="headstone-person-data">. See sourcerData() in lib/routes.js of https://github.com/robinson27225/wikitree-headstone-tool.
function extractData(document, url) {
  let result = { url: url, success: false };

  const script = document.querySelector("script#headstone-person-data");
  if (!script || !script.textContent) {
    return result;
  }

  let data = undefined;
  try {
    data = JSON.parse(script.textContent);
  } catch (e) {
    return result;
  }
  if (!data || data.recordType != "MonumentalInscription" || !data.name) {
    return result;
  }

  result.givenNames = data.name.given || "";
  result.lastName = data.name.surname || "";
  result.maidenName = data.name.maiden || "";
  result.suffix = data.name.suffix || "";
  result.birthDate = data.birthDate || "";
  result.deathDate = data.deathDate || "";
  result.cemetery = data.cemetery || {};
  result.gps = data.gps || undefined;
  result.photographer = data.photographed ? data.photographed.by : undefined;
  result.takenAt = data.photographed ? data.photographed.takenAt : "";
  result.inscription = data.inscription || "";
  result.ids = data.ids || {};
  result.citation = data.citation || "";

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
