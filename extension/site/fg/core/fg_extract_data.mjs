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
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
    text = text.replace(/\u{2013}/gu, "-"); // En dash
  }
  return text;
}

function setFromLabelWithId(result, parentNode, labelId, fieldName) {
  const label = parentNode.querySelector(labelId);
  if (label) {
    result[fieldName] = cleanText(label.textContent);
  }
}

function extractInscription(result, document) {
  const paragraph = document.querySelector("#inscriptionValue");
  if (paragraph) {
    let text = paragraph.innerHTML;
    if (text) {
      text = text.trim();
      text = text.replace(/&lt;/g, "<");
      text = text.replace(/&gt;/g, ">");
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/&#39;/g, "'");
      text = text.replace(/&amp;/g, "&");
      text = text.replace(/\s+/g, " ");
      text = text.replace(/\s([,;.])/g, "$1");
      text = text.trim();
      if (text) {
        result.inscription = text;
      }
    }
  }
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  // There can be other text like "famous memorial" in the children of the nameNode
  // also save the innerHTML for the name because the maiden name can be in italics
  const nameNode = document.querySelector("#bio-name");
  if (nameNode) {
    let html = "";
    let text = "";
    for (let child of nameNode.childNodes) {
      if (child.nodeType == 3) {
        // Node.TEXT_NODE
        html += child.nodeValue;
        text += child.nodeValue;
      } else if (child.tagName == "I") {
        html += "<i>" + child.innerHTML + "</i>";
        text += child.textContent;
      }
      html += " ";
      text += " ";
    }
    result.name = cleanText(text);
    result.nameHtml = cleanText(html);
  }

  let memEvents = document.querySelector("dl.mem-events");
  //console.log("memEvents is: ");
  //console.log(memEvents);
  if (!memEvents) {
    // old page format
    memEvents = document.querySelector("table.mem-events");
  }

  if (!memEvents) {
    console.log("fg extractData, no memEvents found");
    return result;
  }

  setFromLabelWithId(result, memEvents, "#birthDateLabel", "birthDate");
  setFromLabelWithId(result, memEvents, "#birthLocationLabel", "birthPlace");

  // the death date string actually includes the age also
  const deathDatelabel = memEvents.querySelector("#deathDateLabel");
  if (deathDatelabel) {
    let text = deathDatelabel.textContent;
    let deathDate = text;
    let openParenIndex = text.indexOf("(");
    if (openParenIndex != -1) {
      deathDate = cleanText(text.substring(0, openParenIndex));

      let closeParenIndex = text.indexOf(")", openParenIndex + 1);
      if (closeParenIndex != -1) {
        let parenContents = text.substring(openParenIndex + 1, closeParenIndex).trim();
        const prefix = "aged";
        if (parenContents.startsWith(prefix)) {
          parenContents = parenContents.substring(prefix.length).trim();
        }
        result.ageAtDeath = cleanText(parenContents);
      }
    }
    result.deathDate = cleanText(deathDate);
  }

  setFromLabelWithId(result, memEvents, "#deathLocationLabel", "deathPlace");

  setFromLabelWithId(result, memEvents, "#cemeteryNameLabel", "cemeteryName");

  setFromLabelWithId(result, memEvents, "#cemeteryCityName", "cemeteryCity");
  setFromLabelWithId(result, memEvents, "#cemeteryCountyName", "cemeteryCounty");
  setFromLabelWithId(result, memEvents, "#cemeteryStateName", "cemeteryState");
  setFromLabelWithId(result, memEvents, "#cemeteryCountryName", "cemeteryCountry");

  // also get the whole address string
  const placeSpan = memEvents.querySelector("span.place[itemprop=address");
  if (placeSpan) {
    result.cemeteryFullAddress = cleanText(placeSpan.textContent);
  }

  setFromLabelWithId(result, memEvents, "#plotValueLabel", "plot");
  setFromLabelWithId(result, memEvents, "#memNumberLabel", "memorialId");

  extractInscription(result, document);

  // get the source citation string - it includes markup - should we just ignore that and get textContent?
  setFromLabelWithId(result, document, "#citationInfo", "citation");

  // check to see if there is an image
  const mainPhoto = document.querySelector("#main-photo");
  if (mainPhoto) {
    result.hasImage = true;
  } else {
    result.hasImage = false;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
