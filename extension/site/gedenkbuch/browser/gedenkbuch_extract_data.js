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

  result.name = document.querySelector('span[id=\"fieldset_gedenkbuch_data:personName:personName\"]').textContent.trim();

  result.birth_date = document.querySelector('span[id=\"fieldset_gedenkbuch_data:geborenAmDate\"]').textContent.trim();
  result.birth_place = (" " + document.querySelector('span[id=\"fieldset_gedenkbuch_data:geborenIn:text\"]').textContent).replaceAll(" in ", "").trim();

  result.death_date = document.querySelector('span[id=\"fieldset_gedenkbuch_data:j_idt415:todesdatum\"]').textContent.trim();
  result.death_place = (" " + document.querySelector('span[id=\"fieldset_gedenkbuch_data:j_idt485:todesort\"]').textContent).replaceAll(" in ", "").trim();

  let residence = document.querySelector('span[id=\"fieldset_gedenkbuch_data:wohnort\"]').textContent.trim();
  residence = (" " + residence.replace("wohnhaft", "").replace("residing", "")).replaceAll(" in ", "").replaceAll("  ", " ").trim();
  result.residence = residence;

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
