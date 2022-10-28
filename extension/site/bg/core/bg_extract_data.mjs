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

function convertDateString(text) {
  const monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  // Does it look like a date - usually yyyy-mm-dd?
  if (/^(\d{4}|-)(?:-?)([0-1]?[0-9]|-?)(?:-?)([0-3]?[0-9]|-)?$/.test(text)) {
    const dateSplit = /^(\d{4}|-)(?:-?)([0-1]?[0-9]|-?)(?:-?)([0-3]?[0-9]|-)?$/.exec(text);
    let dateString = "";
    if (dateSplit[3]) {
      dateString = dateSplit[3] + " ";
    }
    if (dateSplit[2]) {
      dateString += monthArray[+dateSplit[2] - 1] + " ";
    }
        if (dateSplit[1] && dateSplit[1] !== "-") {
      dateString += dateSplit[1];
    }
    return dateString.trim();
  }
  return text;
}

function setFromNodeWithAttribute(result, dataNode, attributeText, fieldName){
  const node = dataNode.querySelector(attributeText);
  if (node && node.textContent) {
    result[fieldName] = cleanText(node.textContent);
  }
}

function setFromJsonWithKey(result, dataJson, itemKey, fieldName) {
  const value = dataJson[itemKey];
  if (value && value !== "Not Available" ) {
    result[fieldName] = value;
  }
}

function getElementByTextContent(document, element, text) {
  const elements = document.querySelectorAll(element);
  for (let i = 0; i < elements.length; i+=1) {
    if (elements[i].innerText && elements[i].innerText === text) {
      return elements[i];
    }
  }
}

function appendWithComma(text, appendText) {
  if (appendText && appendText.length > 0) {
    if (text && text.length > 0) {
      return (text + ", " + appendText);
    } else {
     return appendText;
    }
  }
  return text;
}

function buildFullAddress(cemetery) {
  let address = "";
  address = appendWithComma(address, cemetery.addressStreet);
  address = appendWithComma(address, cemetery.addressLocality);
  address = appendWithComma(address, cemetery.addressRegion);
  address = appendWithComma(address, cemetery.addressCountry);

  return address;
}

function extractFromJson(document, result, dataScript) {
  const dataJson = JSON.parse(dataScript.innerHTML);
  // Either the main person on memorial or some inscribed
  let personData = null;
  if (dataJson["@type"] && dataJson["@type"] === "Person") {
  personData = dataJson;
  } else if (dataJson.mainEntity && dataJson.mainEntity["@type"] && dataJson.mainEntity["@type"] === "Person") {
    personData = dataJson.mainEntity;
  } else {
    console.log("bg extract not a person record");
    return result;
  }

  setFromJsonWithKey(result, personData, "name", "fullName");
  setFromJsonWithKey(result, personData, "familyName", "lastName");
  setFromJsonWithKey(result, personData, "givenName", "givenName");

  setFromJsonWithKey(result, personData, "birthDate", "birthDate");
  if (result.birthDate) {
    result.birthDate = convertDateString(result.birthDate);
  }

  setFromJsonWithKey(result, personData, "deathDate", "deathDate");
  if (result.deathDate) {
    result.deathDate = convertDateString(result.deathDate);
  }

  if (personData["relatedTo"]) {
    const relations  = personData["relatedTo"];
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
}

function extractData(document, url) {
  var result = {};
  
  if (url) {
    result.url = url;
  }
  
  result.success = false;
  result.hasImage = false;

  // On old style record page (pre Oct 2022)
  const vitalInformationNode = document.querySelector("div#VitalInformation");
  // new style record page (Oct 2022)
  const recordPageHeaderNode = document.querySelector("[class^='RecordPage_header__']");

  
  const dataScript = document.querySelector("script[type='application/ld+json']");
  // extract from script tag JSON in head
  if (dataScript) {    
    extractFromJson(document, result, dataScript);
  }

  if (vitalInformationNode) {
    const infoNode = document.querySelector('#VitalInformation');

    // Cemetery Pre Oct 2022 pages
    let cemeteryLinkNode = infoNode.querySelector('[data-vars-link-name="VitalInformationCemetery"]');
    if (cemeteryLinkNode) {
      const cemeteryVitalNode = cemeteryLinkNode.parentNode;
      if (cemeteryVitalNode) {
        let cemeteryAddress = {};
        setFromNodeWithAttribute(result, cemeteryVitalNode, 'h2[itemprop="name"]', "cemeteryName");
        setFromNodeWithAttribute(cemeteryAddress, cemeteryVitalNode,  'div[itemprop="streetAddress"]', "addressStreet");
        setFromNodeWithAttribute(cemeteryAddress, cemeteryVitalNode, 'span[itemprop="addressLocality"]', "addressLocality");
        setFromNodeWithAttribute(cemeteryAddress, cemeteryVitalNode,  'span[itemprop="addressDistrict"]', "addressDistrict");
        setFromNodeWithAttribute(cemeteryAddress, cemeteryVitalNode, 'div[itemprop="addressCountry"]', "addressCountry");
        
        result.cemeteryFullAddress = buildFullAddress(cemeteryAddress);
      }
    }

    
    // transcriber pre Oct 2022 pages
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

    // photographer pre Oct 2022 pages
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

    // Epitaph pre Oct 2022 pages
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

    // Has image
    const imageLink = document.querySelector("div.record-image-wrapper img[src]");
    if (imageLink) {
      result.hasImage = true;
    }
  } else {
    // post Oct 2022 pages
    
    // Cemetery
    // Logged On
    
    const cemeteryLinkNode = document.querySelector('[href^="/cemetery/"]');
    if (cemeteryLinkNode) {
      setFromNodeWithAttribute(result, cemeteryLinkNode, "h2", "cemeteryName");
      const cemeteryNode = cemeteryLinkNode.parentNode;
      const cemeteryAddressNodes = cemeteryNode.querySelectorAll("div");
      
      let cemeteryAddress = {};
      setFromNodeWithAttribute(result, cemeteryNode, "h2", "cemeteryName");
      for (let i = 0; i < cemeteryAddressNodes.length; i+=1) {
        cemeteryAddress = appendWithComma(cemeteryAddress, cleanText(cemeteryAddressNodes[i].textContent));
      }
      result.cemeteryFullAddress = cemeteryAddress;
    }

    const dataTableNode = document.querySelector("table");
    if (dataTableNode) {
      const dataRowNodes = dataTable.querySelectorAll("tr");
      if(dataRowNodes.length > 0) {
        const cemeteryRowNode = dataRowNodes[dataRowNodes.length - 1];
        let cemetery = cleanText(cemeteryRowNode.querySelector("td").textContent);
        let indexOfComma = cemetery.indexOf(",");
        result.cemeteryName = cemetery.slice(0,indexOfComma-1);
        result.cemeteryFullAddress = cemetery.slice(indexOfComma +2);
      }
    }

    const cemeteryNameNode = getElementByTextContent(document, "h2", result.cemeteryName);
    if (cemeteryNameNode) {
      const cemeteryAddressNode = cemeteryNameNode.parentNode;
      if (cemeteryAddressNode) {
        const cemeteryFirstAddressNode = cemeteryAddressNode.nextElementSibling;
        if (cemeteryFirstAddressNode) {
          const firstAddressLine = cleanText(cemeteryFirstAddressNode.textContent);
          if (firstAddressLine && firstAddressLine !== result.addressLocality) {
            result.streetAddress = firstAddressLine;
            result.cemeteryFullAddress = appendWithComma(firstAddressLine, result.cemeteryFullAddress);
          }
        }
      }
    }
    
    // Get transcriber from Oct 2022 pages
    const transcriberCaptionNode = getElementByTextContent(document, "span", "Transcriber");
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

    // Get photographer from Oct 2022 pages
    const photographerCaptionNode = getElementByTextContent(document, "span", "Photographer");
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
    
    // Get epitaph from Oct 2022 pages
    const epitaphHeading = getElementByTextContent(document, "h4", "Epitaph");
    if (epitaphHeading) {
      const epitaphNode = epitaphHeading.nextElementSibling;
      if(epitaphNode) {
        if (epitaphNode && epitaphNode.innerText) {
          // using innerText as epitaph can contain markup which textContent ignores
          result.epitaph = cleanText(epitaphNode.innerText.replace(/\n/g," "));
        }
      }
    }

    //Has Image
    const imageLink = document.querySelector("div[class^='RecordPage_ImageWrapper__'] a");
    if (imageLink) {
      result.hasImage = true;
    }
  } 
  
  if (result.fullName && result.cemeteryName) {
    result.success = true;
  }
  
  //console.log("Extracted - ");
  //console.log(result);

  return result;
}

export { extractData };
