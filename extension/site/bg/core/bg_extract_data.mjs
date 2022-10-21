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
  }
  return text;
}

function setFromLabelWithItemProp(result, parentNode, labelId, fieldName) {
  const label = parentNode.querySelector('[itemprop="' + labelId + '"]');
  if (label) {
    result[fieldName] = cleanText(label.textContent);
  }
}

function extractData(document, url) {
  var result = {};
  
  if (url) {
    result.url = url;
  }
  result.success = false;

  const infoNode = document.querySelector("div#VitalInformation")
  if (!infoNode) {
    console.log ("bg extractData No infoNode found");
    return result;
  }

  const fullNameNode = infoNode.querySelector("h2.bg-list-title");
  if (!fullNameNode) {
    console.log ("bg extractData No fullName found");
    return result; 
  } else {
     result.fullName = cleanText(fullNameNode.textContent);
  }
  
  setFromLabelWithItemProp(result, infoNode, "birthDate", "birthDate");
  setFromLabelWithItemProp(result, infoNode, "deathDate", "deathDate");
  setFromLabelWithItemProp(result, infoNode, "name", "cemeteryName");
  setFromLabelWithItemProp(result, infoNode, "streetAddress", "streetAddress");
  setFromLabelWithItemProp(result, infoNode, "addressLocality", "addressLocality");
  setFromLabelWithItemProp(result, infoNode, "addressRegion", "addressRegion");
  setFromLabelWithItemProp(result, infoNode, "addressCountry", "addressCountry");
  
  // Build the full address
  let cemeteryFullAddress = "";
  if (result.streetAddress.length > 0) {
    cemeteryFullAddress = result.streetAddress;
  }
  if (result.addressLocality.length > 0) {
    if (cemeteryFullAddress.length) {
      cemeteryFullAddress += ", ";
    }
    cemeteryFullAddress += result.addressLocality;
  }
  if (result.addressRegion.length > 0) {
    cemeteryFullAddress += ", " + result.addressRegion;
  }
  if (result.addressCountry.length > 0) {
    if (cemeteryFullAddress.length) {
      cemeteryFullAddress += ", ";
    }
    cemeteryFullAddress += result.addressCountry;
  }
  if (cemeteryFullAddress.length > 0) {
    result.cemeteryFullAddress = cemeteryFullAddress;
  }
  // Epitaph
  const epitaphHeading = infoNode.querySelector("[alt='Epitaph']");
  if (epitaphHeading) {
    const epitaphNode = epitaphHeading.nextElementSibling;
    if(epitaphNode) {
      const epitaphDiv = epitaphNode.querySelector("div");
      if (epitaphDiv) {
        result.epitaph = cleanText(epitaphDiv.textContent);
      }
    }
  }

  // transcriber + <newline> + date
  const transcriberHeading = infoNode.querySelector("[alt='Transcriber']");
  if (transcriberHeading) {
    const transcriberNode = transcriberHeading.nextElementSibling;
    const transcriberNameNode = transcriberNode.querySelector("h2");
    const transcriberDateNode = transcriberNode.querySelector("div");
    if (transcriberNameNode) {
      result.transcriber = cleanText(transcriberNameNode.textContent);
      if (transcriberDateNode) {
        result.transcriber += ", " + cleanText(transcriberDateNode.textContent);
      }
    }
  }  

  // photographer + <newline> + date
  const photographerHeading = infoNode.querySelector("[alt='Photographer']");
  if (photographerHeading) {
    const photographerNode = photographerHeading.nextElementSibling;
    const photographerNameNode = photographerNode.querySelector("h2");
    const photographerDateNode = photographerNode.querySelector("div");
    if (photographerNameNode) {
      result.photographer = cleanText(photographerNameNode.textContent);
      if (photographerDateNode) {
        result.photographer += ", " + cleanText(photographerDateNode.textContent);
      }
    }
  }  

  const relatedToNodes = document.querySelectorAll('[itemprop="relatedTo"]');
  if (relatedToNodes.length > 0) {
    result.relations = [];
    relatedToNodes.forEach(relatedToNode => {
      const relation = {};
      setFromLabelWithItemProp(relation, relatedToNode, "name", "name");
      const birthDateNode = relatedToNode.querySelector("[itemprop='birthDate']");
      if (birthDateNode && cleanText(birthDateNode.textContent) !== "Not Available") {
        relation.birthDate = cleanText(birthDateNode.textContent);
      }
      const deathDateNode = relatedToNode.querySelector("[itemprop='deathDate']");
      if (deathDateNode && cleanText(deathDateNode.textContent) !== "Not Available") {
        relation.deathDate = cleanText(deathDateNode.textContent);
      }      
      result.relations.push(relation);
    });
  }


  const imageNode = infoNode.querySelector("#record-image-carousel");
  if (imageNode) {
    result.hasImage = true;
  } else {
    result.hasImage = false
  }
 
  result.success = true;
  //console.log("Extracted - ");
  //console.log(result);

  return result;
}

export { extractData };
