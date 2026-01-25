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
    result.repository = "Patrimoines & Archives départementales du Morbihan";
  }

  const ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle) {
    result.ogTitle = cleanText(ogTitle.content);
  }

  let keyValueData = {};
  let metadataKey = "";
  let metadataValueElement = {};
  const h3sInReactTabs1 = document.querySelectorAll("#react-tabs-1 h3");
  if (h3sInReactTabs1) {
    for (let i = 0; i < h3sInReactTabs1.length; i++) {
      if (i == 0) {
        keyValueData["collectionDescription"] = h3sInReactTabs1[i].textContent;
      } else if (i == 1) {
        keyValueData["imageNumPhrase"] = h3sInReactTabs1[i].textContent;
      } else {
        if (h3sInReactTabs1[i].classList.contains("monocle-Metadata-key")) {
          metadataKey = h3sInReactTabs1[i].textContent;
          metadataValueElement = h3sInReactTabs1[i].parentElement.querySelector("p.monocle-Metadata-value");
          if (metadataValueElement && metadataValueElement.textContent !== "") {
            keyValueData[metadataKey] = cleanText(metadataValueElement.textContent);
          } else {
            metadataValueElement = h3sInReactTabs1[i].parentElement.querySelector("p.arc_firstp");
            if (metadataValueElement) {
              keyValueData[metadataKey] = cleanText(metadataValueElement.textContent);
            } else {
              keyValueData[metadataKey] = "";
              console.log("no expected p.arc_firstp");
            }
          }
        } else if (h3sInReactTabs1[i].textContent) {
          keyValueData["moreInfo"] = h3sInReactTabs1[i].textContent;
        }
      }
    }
    result.keyValueData = keyValueData;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
