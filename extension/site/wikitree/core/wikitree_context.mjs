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

function transformPlainText(plainText, phase, options) {
  let text = plainText;

  if (!text) {
    return undefined;
  }

  if (phase != 1) {
    return undefined;
  }

  const wikiTreeIdRegex = /^\p{L}[\p{L}0-9_]*-[0-9]+$/u;
  if (wikiTreeIdRegex.test(text)) {
    //console.log("looks like a Wiki-Id");
    let wikiId = text.trim();

    // Want something like this: https://www.wikitree.com/wiki/Pavey-451
    let link = "https://www.wikitree.com/wiki/" + wikiId;

    return {
      link: link,
    };
  }

  return undefined;
}

export { transformPlainText };
