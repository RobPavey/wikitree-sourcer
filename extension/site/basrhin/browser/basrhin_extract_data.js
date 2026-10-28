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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function checkForDuplicatedText(inputText) {
  // sometimes the commune name is duplicated separated by a comma
  let text = inputText;
  if (text) {
    let textLength = text.length;
    if (textLength && text.substring((textLength - 1) / 2, (textLength - 1) / 2 + 1) == ",") {
      // if there's a comma in the center of the text, remove duplicated info, if any
      //  1. Split by comma, 2. Filter duplicates using Set, 3. Join back
      let uniqueString = [...new Set(text.split(","))].join(", ");
      return uniqueString;
    }
  }
  return text;
}

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.replace(/\s+/g, " ");
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    text = text.trim();
  }
  return checkForDuplicatedText(text);
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

  const permalinkInput = document.querySelector("input#monocle-PermalinkField");
  if (permalinkInput) {
    const permalinkInputValue = permalinkInput.value;
    if (permalinkInputValue) {
      result.permalink = permalinkInputValue;
      // } else {  result.permalink = "no permalinkInputValue";
    }
    // } else{  result.permalink = "no permalinkInput";
  }

  if (imageNumPhrase) {
    const imgElement = imageNumPhrase.querySelector("img");
    if (imgElement) {
      let imgElementUrl = "";
      if (imgElement.dataset.src) {
        imgElementUrl = imgElement.dataset.src;
      } else if (imgElement.src) {
        imgElementUrl = imgElement.src;
        // } else {  result.lastFifParamItem = "no imgElementUrl";
      }
      if (imgElementUrl !== "") {
        // Parse the URL string using the URL API
        const ImgElementUrlObj = new URL(imgElementUrl);
        // if (urlObj) {  result.urlObj = urlObj;  }
        // Extract the 'FIF' parameter value (/data/files/.../filename.jpg)
        const imgElementFifParam = ImgElementUrlObj.searchParams.get("FIF");

        if (imgElementFifParam) {
          // Split by the forward slash and grab the last item
          const lastFifParamItem = imgElementFifParam.split("/").pop();
          const index = lastFifParamItem.indexOf(".jpg");
          if (index !== -1) {
            //strip off .jpg if exists
            result.lastFifParamItem = lastFifParamItem.slice(0, index);
          } else {
            result.lastFifParamItem = lastFifParamItem;
          }
          // console.log(result.lastFifParamItem);
          // Output: FRAD067_xxxxNUMyyyzzzzz_ppp.jpg, where xxxx is collection#, yyy is commune INSEE#, zzzzz is volume#, ppp is page/image#
          // } else {  result.lastFifParamItem = "no fifParam";
        }
      }
      // } else {  result.lastFifParamItem = "no imgElement";
    }
    // } else {  result.lastFifParamItem = "no imageNumPhrase";
  }

  result.success = true;

  // console.log(result);

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
