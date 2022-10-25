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

function setFromJsonWithKey(result, dataJson, itemKey, fieldName) {
  const value = dataJson[itemKey];
  if (value && value !== "Not Available" ) {
    result[fieldName] = value;
  }
}

function getElementByTextContent(element, text) {
  const elements = document.querySelectorAll(element);
  for (let i = 0; i < elements.length; i+=1) {
    if (elements[i].innerText && elements[i].innerText === text) {
      return elements[i];
    }
  }
}

function appendWithComma(text, appendText) {
  if (appendText && appendText.length > 0) {
    if (text.length > 0) {
      return (text + ", " + appendText);
    } else {
     return appendText;
    }
  }
  return text;
}

function buildFullAddress(street, locality, region, country) {
  let address = (street || "");

  address = appendWithComma(address, locality);
  address = appendWithComma(address, region);
  address = appendWithComma(address,country);

  return address;
}

function extractFromHtml(result, infoNode){
  // Code for existing style pages (Oct 2022)
  
  const fullNameNode = infoNode.querySelector("h2.bg-list-title");
  if (!fullNameNode) {
    console.log ("bg extractData No fullName found");
    return result; 
  }
  result.fullName = cleanText(fullNameNode.textContent.replace(/<br>/g," "));
  
  setFromLabelWithItemProp(result, infoNode, "birthDate", "birthDate");
  setFromLabelWithItemProp(result, infoNode, "deathDate", "deathDate");
  setFromLabelWithItemProp(result, infoNode, "name", "cemeteryName");
  setFromLabelWithItemProp(result, infoNode, "streetAddress", "streetAddress");
  setFromLabelWithItemProp(result, infoNode, "addressLocality", "addressLocality");
  setFromLabelWithItemProp(result, infoNode, "addressRegion", "addressRegion");
  setFromLabelWithItemProp(result, infoNode, "addressCountry", "addressCountry");

  result.cemeteryFullAddress = buildFullAddress(result.streetAddress, result.addressLocality, result.addressRegion, result.addressCountry);
  
  // Epitaph
  const epitaphHeading = infoNode.querySelector("[alt='Epitaph']");
  if (epitaphHeading) {
    const epitaphNode = epitaphHeading.nextElementSibling;
    if(epitaphNode) {
      const epitaphDiv = epitaphNode.querySelector("div");
      if (epitaphDiv && epitaphDiv.innerText) {
        // using innerText as epitaph can contain markup which textContent ignores
        result.epitaph = cleanText(epitaphDiv.innerText.replace(/\n/g," "));
      }
    }
  }

  // photographer + <newline> + date
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
}

function extractFromJson(result, dataScript) {
  // extract from new style pages (Oct 2022)
  const dataJson = JSON.parse(dataScript.innerText);

  if (!(dataJson["@type"] && dataJson["@type"] === "Person")) {
    console.log("bg extract not a person record");
    return result;
  }

  setFromJsonWithKey(result, dataJson, "name", "fullName");
  setFromJsonWithKey(result, dataJson, "familyName", "lastName");
  setFromJsonWithKey(result, dataJson, "givenName", "givenName");
  setFromJsonWithKey(result, dataJson, "birthDate", "birthDate");
  setFromJsonWithKey(result, dataJson, "deathDate", "deathDate");

  if (dataJson["deathPlace"]) {
    const cemeteryData = dataJson.deathPlace;
    if (cemeteryData["@type"] && cemeteryData["@type"] === "Cemetery") {
      setFromJsonWithKey(result, cemeteryData, "name", "cemeteryName");
      if(cemeteryData.address) {
        const cemeteryAddress = cemeteryData.address;
        if (cemeteryAddress["@type"] && cemeteryAddress["@type"] === "PostalAddress") {
          setFromJsonWithKey(result, cemeteryAddress, "streetAddress", "streetAddress");
          setFromJsonWithKey(result, cemeteryAddress, "addressLocality", "addressLocality");
          setFromJsonWithKey(result, cemeteryAddress, "addressRegion", "addressRegion");
          setFromJsonWithKey(result, cemeteryAddress, "addressCountry", "addressCountry");
          result.cemeteryFullAddress = buildFullAddress(result.streetAddress, result.addressLocality, result.addressRegion, result.addressCountry);
        }
      }  
    }    
  }

  if (dataJson["relatedTo"]) {
    const relations  = dataJson["relatedTo"];
    result.relations = [];
    relations.forEach(relation => {
      if (relation["@type"] && relation["@type"] === "Person") {
        let relative = {};
        setFromJsonWithKey(relative, relation, "name", "name");
        setFromJsonWithKey(relative, relation, "familyName", "lastName");
        setFromJsonWithKey(relative, relation, "givenName", "givenName");
        setFromJsonWithKey(relative, relation, "birthDate", "birthDate");
        setFromJsonWithKey(relative, relation, "deathDate", "deathDate");
        result.relations.push(relative);
      }
    });
  }

  // Get transcriber
  const transcriberCaptionNode = getElementByTextContent("span", "Transcriber");
  if (transcriberCaptionNode) {
    const transcriberNode = transcriberCaptionNode.parentNode.parentNode;
    let transcriberNameNode = transcriberNode.querySelector("h5");
    if (transcriberNameNode && transcriberNameNode.textContent) {
      result.transcriber = cleanText(transcriberNameNode.textContent);
      let transcriberDateNode = transcriberNode.querySelector("div > span");
      if (transcriberDateNode && transcriberDateNode.textContent) {
        result.transcriber += ", " + cleanText(transcriberDateNode.textContent);
      }
    }
  }

  // Get photographer
  const photographerCaptionNode = getElementByTextContent("span", "Photographer");
  if (photographerCaptionNode) {
    const photographerNode = photographerCaptionNode.parentNode.parentNode;
    let photographerNameNode = photographerNode.querySelector("h5");
    if (photographerNameNode && photographerNameNode.textContent) {
      result.photographer = cleanText(photographerNameNode.textContent);
      let photographerDateNode = photographerNode.querySelector("div > span");
      if (photographerDateNode && photographerDateNode.textContent) {
        result.photographer += ", " + cleanText(photographerDateNode.textContent);
      }
    }
  }

  // Get epitaph
  const epitaphHeading = getElementByTextContent("h4", "Epitaph");
  if (epitaphHeading) {
    const epitaphNode = epitaphHeading.nextElementSibling;
    if(epitaphNode) {
      if (epitaphNode && epitaphNode.innerText) {
        // using innerText as epitaph can contain markup which textContent ignores
        result.epitaph = cleanText(epitaphNode.innerText.replace(/\n/g," "));
      }
    }
  }
  

  result.success = true;
}

function extractData(document, url) {
  var result = {};
  
  if (url) {
    result.url = url;
  }
  
  result.success = false;

  // new style pages (Oct 2022)
  const dataScript = document.querySelector("script[type='application/ld+json']");
  // old style web pages
  const infoNode = document.querySelector("div#VitalInformation");

  if (dataScript) {
    extractFromJson(result, dataScript);
  }
  if (infoNode) {
    extractFromHtml(result, infoNode);
  }

  if (!(dataScript || infoNode)) {
    console.log("bg extract data not found")
    return result;
  }

  console.log("Extracted - ");
  console.log(result);

  return result;
}

export { extractData };
