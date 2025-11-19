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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.replace(/\s+/g, " ");
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    text = text.trim();
  }
  return text;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  const repository = document.querySelector("meta[property='og:site_name']");
  if (repository) {
    result.repository = repository.content;
  } else {
    result.repository = "Archives d'Alsace Site de Strasbourg";
  }

  const ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle) {
    result.ogTitle = cleanText(ogTitle.content);
  }

  const description = document.querySelector("meta[name='Description']");
  if (description) {
    result.description = cleanText(description.content);
  }

  const imageNumPhrase = document.querySelector(".monocle-isActive");
  if (imageNumPhrase) {
    result.imageNumPhrase = imageNumPhrase.title;
  }
  const imageNumInput = document.querySelector("input#rea11y-0");
  if (imageNumInput) {
    result.imageNumNow = imageNumInput.getAttribute("aria-valuenow");
    result.imageNumMax = imageNumInput.getAttribute("aria-valuemax");
  }

  let keyValueData = {};
  const metadataKeys = document.querySelectorAll(".monocle-Metadata-key");
  const metadataValues = document.querySelectorAll(".monocle-Metadata-value");
  const childP = document.querySelector(".arc_firstp");
  if (metadataKeys && metadataValues) {
    for (let i = 0; i < metadataKeys.length; i++) {
      //console.log("metadataKeys["+i+"].textContent="+metadataKeys[i].textContent);
      //console.log("metadataValues["+i+"].textContent="+metadataValues[i].textContent);
      if (metadataValues[i].textContent == "") {
        //console.log("using childP.textContent: "+childP.textContent);
        if (childP) {
          keyValueData[metadataKeys[i].textContent] = cleanText(childP.textContent);
          //console.log("using childP.textContent: "+childP.textContent);
        }
      } else {
        //console.log("not using childP");
        keyValueData[metadataKeys[i].textContent] = cleanText(metadataValues[i].textContent);
      }
    }
    result.keyValueData = keyValueData;
  }

  result.success = true;

  // console.log(result);

  return result;
}

export { extractData };
