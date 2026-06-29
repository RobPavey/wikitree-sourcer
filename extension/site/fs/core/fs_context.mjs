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

function transformTemplateToLink(text, options) {
  const templateRegex = /FamilySearch/i;
  if (!templateRegex.test(text)) {
    return "";
  }

  if (text.includes("FamilySearch Record")) {
    // {{FamilySearch Record|XWLT-M8X}}
    let id = text.replace(/\{\{FamilySearch Record\|([^}|]+)[^}]*\}\}/, "$1");
    if (id && id != text) {
      // https://www.familysearch.org/ark:/61903/1:1:XHLN-69H
      return "https://www.familysearch.org/ark:/61903/1:1:" + id;
    }
  } else if (text.includes("FamilySearch Image")) {
    // {{FamilySearch Image|33S7-9BSH-9W9B}}
    if (/\{\{FamilySearch Image\|[^}|]+[^}|]*\}\}/.test(text)) {
      let id = text.replace(/\{\{FamilySearch Image\|([^}|]+)[^}|]*\}\}/, "$1");
      if (id && id != text) {
        // https://www.familysearch.org/ark:/61903/3:1:33S7-9BSH-9W9B
        return "https://www.familysearch.org/ark:/61903/3:1:" + id;
      }
    } else if (/\{\{FamilySearch Image\|[^}|]+\|[^}|]+\}\}/.test(text)) {
      let id = text.replace(/\{\{FamilySearch Image\|([^}|]+)[^}]*\}\}/, "$1");
      let param3 = text.replace(/\{\{FamilySearch Image\|[^}|]+\|([^}]+)\}\}/, "$1");
      if (id && id != text && param3 && param3 != text) {
        // https://www.familysearch.org/ark:/61903/3:1:33S7-9BSH-9W9B
        return "https://www.familysearch.org/ark:/61903/3:" + param3 + ":" + id;
      }
    }
  }

  return "";
}

export { transformTemplateToLink };
