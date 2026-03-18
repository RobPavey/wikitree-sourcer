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

// this is used because the <site>_extract_data.mjs files are not actually ESM modules
// this is because they are loaded in the content scripts
// This was done as part of the speedy_review refactor
function loadExtractRecordInWrapper(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  // Wrap the code in a function that returns the extractData function
  const wrapper = new Function("document", "url", "result", `${code}; return extractRecord(document, url, result);`);
  return wrapper;
}

// Used by background for extracting a referenced record
function extractRecordWrapper(filePath, document, url, result) {
  let extractRecord = loadExtractRecordInWrapper(filePath);
  return extractRecord(document, url, result);
}

export { extractRecordWrapper };
