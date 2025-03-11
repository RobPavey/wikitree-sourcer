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

class WikiTreeExtractedData {
  constructor() {
    this.hasValidData = false;

    this.firstNames = ""; // everything in the Proper First Name field in Edit mode
    this.prefNames = "";
    this.middleNames = "";

    this.lnab = "";
    this.currentLastName = "";
    this.mothersMaidenName = "";

    this.birthDate = "";
    this.birthDateStatus = "none";

    (this.deathDate = ""), (this.deathDateStatus = "none");

    this.birthLocation = "";
    this.deathLocation = "";

    this.personGender = "";

    this.spouses = [];
  }
}

function getTextBySelector(startNode, selector) {
  let node = startNode.querySelector(selector);
  if (node) {
    return node.textContent.trim();
  }
  return "";
}

function getAttrBySelector(startNode, selector, attributeName) {
  let node = startNode.querySelector(selector);
  if (node) {
    return node.getAttribute(attributeName);
  }
  return "";
}

function getValueBySelector(startNode, selector) {
  let node = startNode.querySelector(selector);
  if (node) {
    return node.value;
  }
  return "";
}

function getParentsFromDocumentInEditMode(document, parents) {
  let parentRows = document.querySelectorAll(".five.columns.omega table tbody tr");

  parentRows.forEach(function (item) {
    var titleText = getTextBySelector(item, "td:nth-child(1)");
    var link = item.querySelector("td:nth-child(2) div a");
    if (link != undefined && titleText != undefined && titleText != "") {
      const name = link.textContent;
      const wikiId = link.pathname.replace("/wiki/", "");
      if (titleText.includes("Father")) {
        parents.father = { name: name, wikiId: wikiId };
      } else if (titleText.includes("Mother")) {
        parents.mother = { name: name, wikiId: wikiId };
      }
    }
  });
}

function getSpousesFromDocumentInEditMode(document, spouses) {
  let rightTableRows = document.querySelectorAll(".five.columns.omega table tbody tr");

  rightTableRows.forEach(function (item) {
    var titleText = getTextBySelector(item, "td:nth-child(1)");
    if (titleText.includes("Spouses")) {
      let spouseNodes = item.querySelectorAll("td:nth-child(2) > ol > li");
      spouseNodes.forEach(function (item) {
        var link = item.querySelector("a");
        // note for private spouses there is no link
        if (link) {
          const name = link.textContent;
          const wikiId = link.pathname.replace("/wiki/", "");

          let spouse = { name: name, wikiId: wikiId };

          var marriageDetails = getAttrBySelector(item, "span.SMALL > a", "title");
          marriageDetails.replace(/\s+/g, " ").trim();
          if (marriageDetails.startsWith("Edit marriage details")) {
            let marriageString = marriageDetails.replace(/Edit marriage details \(([^\)]+)\).*/, "$1");
            spouse.marriageString = marriageString;
            let dateStr = "";
            let placeStr = "";
            if (/^\d\d? \w\w\w \d\d\d\d/.test(marriageString)) {
              dateStr = marriageString.replace(/^(\d\d? \w\w\w \d\d\d\d).*/, "$1");
              placeStr = marriageString.replace(/^\d\d? \w\w\w \d\d\d\d */, "");
            } else if (/^\w\w\w \d\d\d\d/.test(marriageString)) {
              dateStr = marriageString.replace(/^(\w\w\w \d\d\d\d).*/, "$1");
              placeStr = marriageString.replace(/^\w\w\w \d\d\d\d */, "");
            }
            if (/^\d\d\d\d/.test(marriageString)) {
              dateStr = marriageString.replace(/^(\d\d\d\d).*/, "$1");
              placeStr = marriageString.replace(/^\d\d\d\d */, "");
            }
            spouse.marriageDate = dateStr;
            spouse.marriagePlace = placeStr;
          }

          spouses.push(spouse);
        }
      });
    }
  });
}

function extractDataInEditMode(document, result) {
  //console.log("start of extractDataInEditMode");
  //console.log(document);

  result.pageType = "edit";

  let firstNameNode = document.querySelector("#mFirstName");
  let birthDateNode = document.querySelector("#mBirthDate");

  if (!firstNameNode || !birthDateNode) {
    return;
  } else {
    result.hasValidData = true;
  }

  result.firstNames = getValueBySelector(document, "#mFirstName");
  result.prefNames = getValueBySelector(document, "#mRealName");
  result.middleNames = getValueBySelector(document, "#mMiddleName");

  let nickNames = getValueBySelector(document, "#mNicknames");
  if (nickNames) {
    result.nicknames = nickNames;
  }
  let otherLastNames = getValueBySelector(document, "#mLastNameOther");
  if (otherLastNames) {
    result.otherLastNames = otherLastNames;
  }

  result.birthDate = getValueBySelector(document, "#mBirthDate");
  let checkedBirthDateStatus = document.querySelector("input[name=mStatus_BirthDate]:checked");
  if (checkedBirthDateStatus) {
    result.birthDateStatus = checkedBirthDateStatus.value;
  }

  result.deathDate = getValueBySelector(document, "#mDeathDate");
  let checkedDeathDateStatus = document.querySelector("input[name=mStatus_DeathDate]:checked");
  if (checkedDeathDateStatus) {
    result.deathDateStatus = checkedDeathDateStatus.value;
  }

  result.birthLocation = getValueBySelector(document, "#mBirthLocation");
  result.deathLocation = getValueBySelector(document, "#mDeathLocation");

  result.personGender = getValueBySelector(document, "select[name=mGender]");

  var parents = { father: undefined, mother: undefined };
  getParentsFromDocumentInEditMode(document, parents);
  result.parents = parents;

  var spouses = [];
  getSpousesFromDocumentInEditMode(document, spouses);
  result.spouses = spouses;

  result.mothersMaidenName = "";
  if (parents != undefined && parents.mother != undefined) {
    var name = parents.mother.name;
    //console.log("Mother's name is: " + name);
    if (name.indexOf("(") != -1) {
      var maidenName = name.replace(/^[^\(]+\(([^\(]+)\).*$/, "$1");
      if (maidenName != name) {
        result.mothersMaidenName = maidenName;
      }
    } else {
      var maidenName = name.replace(/^.* ([^ ])$/, "$1");
      if (maidenName != name) {
        result.mothersMaidenName = maidenName;
      }
    }
  }
  //console.log("MMN is: " + result.mothersMaidenName);

  // get current last name and last name at birth
  result.currentLastName = getValueBySelector(document, "#mLastNameCurrent");

  // Get Wiki ID from the "person" span item
  const profileWikiId = getTextBySelector(document, ".person");
  result.wikiId = profileWikiId;
  result.lnab = profileWikiId.replace(/^(.+)\-\d+$/, "$1");
}

function getDateStatus(document, selector) {
  let status = "none";
  let dateNode = document.querySelector(selector);
  if (dateNode) {
    let strongNode = dateNode.closest("strong");
    if (strongNode) {
      let text = strongNode.textContent.trim();
      if (text.toLowerCase().startsWith("before")) {
        status = "before";
      } else if (text.toLowerCase().startsWith("after")) {
        status = "after";
      } else if (text.toLowerCase().startsWith("about")) {
        status = "about";
      }
    }
  }

  return status;
}

function getCurrentLastNameInNonEditMode(document, isPrivate) {
  let currentLastName = "";
  let metaNode = document.querySelector(".VITALS meta[itemprop=familyName]");
  if (metaNode) {
    let vitalsNode = metaNode.closest(".VITALS");
    if (vitalsNode) {
      let clnNode = null;
      if (isPrivate) {
        clnNode = vitalsNode.querySelector("a[title='Current Last Name']");
      } else {
        clnNode = vitalsNode.querySelector("a[title='Click here for the surname index page']");
      }
      if (clnNode) {
        currentLastName = clnNode.textContent;
      }
    }
  }

  return currentLastName;
}

function getBirthOrDeathLocation(startNode, selector) {
  let location = "";

  let timeNode = startNode.querySelector(selector);
  if (timeNode) {
    let div = timeNode.closest("div");
    if (div) {
      let text = div.textContent.trim().replace(/\s+/g, " ");

      let inIndex = text.indexOf(" in ");
      if (inIndex != -1) {
        location = text.substring(inIndex + 4);
      }

      let bracketIndex = location.indexOf("[");
      if (bracketIndex != -1) {
        location = location.substring(0, bracketIndex);
      }
    }
  }

  return location.trim();
}

function getParentsFromDocumentInReadOrPrivateMode(document, result) {
  // there is no easy way to distinguish the parents, there could be 0, 1 or 2 and they don't say if they are mother
  // or father. So we have to compare the lnab - if it matches this person then it is the father.
  // Actually this is not safe - there can be only a mother and the lnab can be hers
  // So we look at the text to see if it says
  // "[father unknown]" (public view) or "[father?]" (private view)
  var parentUrls = document.querySelectorAll(".VITALS span[itemprop=parent] a[itemprop=url]");
  for (let index = 0; index < parentUrls.length; ++index) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = parentUrls[index].getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
    var fullName = getTextBySelector(parentUrls[index], "span[itemprop=name]");

    var lastName = wikiId.replace(/^(.+)\-\d+$/, "$1");

    if (parentUrls.length == 2) {
      // if there are 2 parents the assume the first is father and second is mother
      if (index == 0) {
        result.parents.father = { wikiId: wikiId, name: fullName };
      } else {
        result.parents.mother = { wikiId: wikiId, name: fullName };
        if (lastName != result.lnab) {
          result.mothersMaidenName = lastName;
        }
      }
    } else if (parentUrls.length == 1) {
      // Only one parent. There should be some text saying either "[father unknown]" or "[mother unknown]"
      let parentIdentified = false;
      let isFather = true;
      var parentVitals = document.querySelector(".VITALS span[itemprop=parent]").closest("div");
      if (parentVitals) {
        let text = parentVitals.textContent;
        if (text.includes("[father unknown]") || text.includes("[father?]")) {
          parentIdentified = true;
          isFather = false;
        } else if (text.includes("[mother unknown]") || text.includes("[mother?]")) {
          parentIdentified = true;
          isFather = true;
        }
      }

      if (!parentIdentified) {
        // Should never get here but as a backup:
        // if the last name is the same assume it is the father else the mother
        if (lastName != result.lnab) {
          isFather = false;
        } else {
          isFather = true;
        }
      }

      if (isFather) {
        result.parents.father = { wikiId: wikiId, name: fullName };
      } else {
        result.mothersMaidenName = lastName;
        result.parents.mother = { wikiId: wikiId, name: fullName };
      }
    }
  }
}

function getSpousesFromDocumentInNonEditMode(isPrivate, document, result) {
  // read
  // get the spouses (if any)
  var spouseUrls = document.querySelectorAll(".VITALS span[itemprop=spouse] a[itemprop=url]");
  for (let index = 0; index < spouseUrls.length; ++index) {
    let pathName = spouseUrls[index].getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/www\.wikitree\.com)?\/wiki\//, "");
    let fullName = getTextBySelector(spouseUrls[index], "span[itemprop=name]");

    let spouse = { wikiId: wikiId, name: fullName };

    let spouseDiv = spouseUrls[index].closest("div");
    if (spouseDiv) {
      let marriageString = "";

      // The WikiTree BEE extension restructures the marriage section
      let beeMarriageDetails = spouseDiv.querySelector("span.marriageDetails");
      if (beeMarriageDetails) {
        marriageString = beeMarriageDetails.textContent;
      } else {
        let marriageChildNodes = spouseDiv.childNodes;
        if (marriageChildNodes.length >= 3) {
          marriageString = marriageChildNodes[2].textContent;
        }
      }

      // the three child nodes are something like:
      // 1. "Husband of"
      // 2. name
      // 3. "— married 15 Feb 1914 in Lambeth, Surrey, England, United Kingdom"
      if (marriageString) {
        marriageString = marriageString.replace(/\s+/g, " ").trim();

        if (isPrivate) {
          marriageString = marriageString.replace(/^[\-\—] married ?/, ""); // note this is a special dash (em or en)
        } else {
          marriageString = marriageString.replace(/^[\-\—] married /, ""); // note this is a special dash (em or en)
        }
        spouse.marriageString = marriageString;

        //let marriageDate = marriageString.replace(/^\s*\-\s*married\s+((?:\d\d? )?(?:\w\w\w )?\d\d\d\d)\s+in\s+.*$/, "$1");
        let marriageDate = marriageString.replace(/^(.*) in .*$/, "$1");
        if (marriageDate != marriageString) {
          // the marriage date can include a marriage end date in parentheses
          let openParenIndex = marriageDate.indexOf("(");
          if (openParenIndex != -1) {
            marriageDate = marriageDate.substring(0, openParenIndex);
          }
          spouse.marriageDate = marriageDate.trim();
        }
        let marriagePlace = marriageString.replace(/^.* in (.*)$/, "$1");
        if (marriagePlace != marriageString) {
          spouse.marriagePlace = marriagePlace;
        }
      }
    }

    result.spouses.push(spouse);
  }
}

function extractVitalsDataInNonEditMode(document, result, isPrivate) {
  // Get name (includes first, middle, last names)
  result.name = getTextBySelector(document, "#content span[itemProp=name]");
  result.birthDate = getTextBySelector(document, ".VITALS time[itemprop=birthDate]");
  result.birthDateStatus = getDateStatus(document, ".VITALS time[itemprop=birthDate]");
  result.deathDate = getTextBySelector(document, ".VITALS time[itemprop=deathDate]");
  result.deathDateStatus = getDateStatus(document, ".VITALS time[itemprop=deathDate]");

  result.firstNames = getTextBySelector(document, ".VITALS span[itemprop=givenName]");
  result.middleNames = getTextBySelector(document, ".VITALS span[itemprop=additionalName]");

  if (isPrivate) {
    result.birthLocation = getBirthOrDeathLocation(document, ".VITALS time[itemprop=birthDate]");
    result.deathLocation = getBirthOrDeathLocation(document, ".VITALS time[itemprop=deathDate]");
  } else {
    result.birthLocation = getTextBySelector(document, ".VITALS span[itemprop=birthPlace]");
    result.deathLocation = getTextBySelector(document, ".VITALS span[itemprop=deathPlace]");
  }

  result.currentLastName = getCurrentLastNameInNonEditMode(document, isPrivate);

  result.lnab = getAttrBySelector(document, ".VITALS meta[itemprop=familyName]", "content");

  // try to find any preferred name or nicknames
  let beforeSibling = undefined;
  let givenNameChild = document.querySelector(".VITALS span[itemprop=givenName]");
  let middleNameChild = document.querySelector(".VITALS span[itemprop=additionalName]");
  if (middleNameChild) {
    beforeSibling = middleNameChild.parentNode;
  } else if (givenNameChild) {
    beforeSibling = givenNameChild.parentNode;
  }
  if (beforeSibling) {
    let afterSibling = undefined;
    let familyNameChild = document.querySelector(".VITALS meta[itemprop=familyName]");
    if (familyNameChild) {
      afterSibling = familyNameChild;
    } else {
      let lastNameChild = document.querySelector(".VITALS a[href^='/genealogy/]");
      if (lastNameChild) {
        afterSibling = lastNameChild.parentNode;
      }
    }

    if (afterSibling) {
      let prefNames = "";
      let nicknames = "";
      let sibling = beforeSibling.nextSibling;
      while (sibling && sibling != afterSibling) {
        let text = sibling.textContent;
        if (text.startsWith('"') && text.endsWith('"')) {
          nicknames += text.substring(1, text.length - 1);
        } else if (text.startsWith("(") && text.endsWith(")")) {
          prefNames += text.substring(1, text.length - 1);
        }
        sibling = sibling.nextSibling;
      }
      if (sibling) {
        // we found the afterSibling OK
        if (prefNames) {
          result.prefNames = prefNames;
        }
        if (nicknames) {
          result.nicknames = nicknames;
        }
      }

      // look for " aka "
      sibling = afterSibling.nextSibling;
      while (sibling) {
        let text = sibling.textContent;
        if (text == " aka ") {
          sibling = sibling.nextSibling;
          if (sibling && sibling.textContent) {
            result.otherLastNames = sibling.textContent.trim();
          }
          break;
        }
        sibling = sibling.nextSibling;
      }
    }
  }
}

function extractVitalsDataInPrivateToUserMode(document, result, isPrivate) {
  // Get name (includes first, middle, last names)
  result.name = getTextBySelector(document, "#content span[itemProp=name]");

  result.firstNames = getTextBySelector(document, ".VITALS span[itemprop=givenName]");
  result.middleNames = getTextBySelector(document, ".VITALS span[itemprop=additionalName]");

  result.currentLastName = getCurrentLastNameInNonEditMode(document, isPrivate);

  result.lnab = getAttrBySelector(document, ".VITALS meta[itemprop=familyName]", "content");

  function extractMidYearFromDecadeString(string, prefix) {
    let yearString = string.substring(prefix.length);
    yearString = yearString.replace(/s\.$/, "");
    if (/\d\d\d\d/.test(yearString)) {
      // chose the middle year of the decade
      let yearNum = parseInt(yearString);
      if (yearNum != NaN) {
        yearNum += 5;
        yearString = yearNum.toString();
        return yearString;
      }
    }

    return "";
  }

  // to find the birth and death decause have to iterate through VITALS
  let vitalNodes = document.querySelectorAll("div.VITALS");
  for (let vitalNode of vitalNodes) {
    let textContent = vitalNode.textContent;
    if (textContent) {
      const bornPrefix = "Born ";
      const diedPrefix = "Died ";
      const akaText = " aka ";
      if (textContent.startsWith(bornPrefix)) {
        let yearString = extractMidYearFromDecadeString(textContent, bornPrefix);
        if (yearString) {
          result.birthDate = yearString;
          result.birthDateStatus = "about";
        }
      } else if (textContent.startsWith(diedPrefix)) {
        let yearString = extractMidYearFromDecadeString(textContent, diedPrefix);
        if (yearString) {
          result.deathDate = yearString;
          result.deathDateStatus = "about";
        }
      } else if (textContent.includes(akaText)) {
        let akaIndex = textContent.indexOf(akaText);
        if (akaIndex != -1) {
          let otherLastNames = textContent.substring(akaIndex + akaText.length).trim();
          if (otherLastNames) {
            result.otherLastNames = otherLastNames;
          }
        }
      }
    }
  }
}

function extractDataInReadMode(document, result) {
  // we are not in edit mode
  //console.log("start of extractDataInReadMode");
  //console.log(document);

  result.pageType = "read";

  let copyIdSelector = document.querySelector("#content button[aria-label='Copy ID']");
  let genderSelector = document.querySelector(".VITALS meta[itemprop=gender]");

  if (!copyIdSelector || !genderSelector) {
    return;
  } else {
    result.hasValidData = true;
  }

  result.wikiId = copyIdSelector.getAttribute("data-copy-text");

  extractVitalsDataInNonEditMode(document, result, false);

  result.personGender = genderSelector.getAttribute("content");

  getParentsFromDocumentInReadOrPrivateMode(document, result);

  getSpousesFromDocumentInNonEditMode(false, document, result);
}

function extractDataInPrivateMode(document, result) {
  // we are in private view mode, it is similar to read mode but a bit different
  //console.log("start of extractDataInPrivateMode");
  //console.log(document);

  result.pageType = "private";

  let copyIdSelector = document.querySelector("#content button[aria-label='Copy ID']");
  let genderSelector = document.querySelector(".VITALS meta[itemprop=gender]");

  if (!copyIdSelector || !genderSelector) {
    return;
  } else {
    result.hasValidData = true;
  }

  result.wikiId = copyIdSelector.getAttribute("data-copy-text");

  extractVitalsDataInNonEditMode(document, result, true);

  result.personGender = genderSelector.getAttribute("content");

  getParentsFromDocumentInReadOrPrivateMode(document, result);
  getSpousesFromDocumentInNonEditMode(true, document, result);
}

function extractDataInLoggedOutMode(document, result) {
  // we are not in edit mode
  //console.log("start of extractDataInLoggedOutMode");
  //console.log(document);

  result.pageType = "loggedOut";

  // example logged out URL: https://www.wikitree.com/wiki/Kimberlin-117
  // Or also could be of form: https://www.wikitree.com/index.php?title=Pavey-459&public=1
  let wikiId = "";
  let urlPrefix1 = "https://www.wikitree.com/wiki/";
  let urlPrefix2 = "https://www.wikitree.com/index.php?title=";
  if (result.url.startsWith(urlPrefix1)) {
    wikiId = result.url.substring(urlPrefix1.length);
  } else if (result.url.startsWith(urlPrefix2)) {
    let remainder = result.url.substring(urlPrefix2.length);
    let endIndex = remainder.indexOf("&");
    if (endIndex != -1) {
      wikiId = remainder.substring(0, endIndex);
    } else {
      wikiId = remainder;
    }
  }
  if (wikiId) {
    result.wikiId = wikiId;
  } else {
    return;
  }

  let genderSelector = document.querySelector(".VITALS meta[itemprop=gender]");
  if (!genderSelector) {
    return;
  } else {
    result.hasValidData = true;
  }

  extractVitalsDataInNonEditMode(document, result, false);

  result.personGender = genderSelector.getAttribute("content");

  getParentsFromDocumentInReadOrPrivateMode(document, result);
  getSpousesFromDocumentInNonEditMode(false, document, result);
}

function extractDataForPrivateToUserProfile(document, result) {
  // we are not in edit mode
  //console.log("start of extractDataInLoggedOutMode");
  //console.log(document);

  result.pageType = "privateToUser";

  // example private URL: https://www.wikitree.com/wiki/Harrington-1500
  let wikiId = "";
  let urlPrefix1 = "https://www.wikitree.com/wiki/";
  let urlPrefix2 = "https://www.wikitree.com/index.php?title=";
  if (result.url.startsWith(urlPrefix1)) {
    wikiId = result.url.substring(urlPrefix1.length);
  } else if (result.url.startsWith(urlPrefix2)) {
    let remainder = result.url.substring(urlPrefix2.length);
    let endIndex = remainder.indexOf("&");
    if (endIndex != -1) {
      wikiId = remainder.substring(0, endIndex);
    } else {
      wikiId = remainder;
    }
  }
  if (wikiId) {
    result.wikiId = wikiId;
  } else {
    return;
  }

  result.hasValidData = true;

  extractVitalsDataInPrivateToUserMode(document, result, false);

  getParentsFromDocumentInReadOrPrivateMode(document, result);
  getSpousesFromDocumentInNonEditMode(false, document, result);
}

function extractDataForEditFamily(document, result) {
  function getSpouseNameAndWikiId(spouseIsParentNode) {
    let parentNode = spouseIsParentNode.parentNode;

    let nameAndId = {};
    if (result.editFamilyType != "steps") {
      let textNode = spouseIsParentNode.nextSibling;
      if (textNode) {
        let spouseText = textNode.textContent;
        spouseText = spouseText.replace(/\($/, ""); // remove trailing "("
        nameAndId.name = spouseText.trim();

        let linkNode = textNode.nextSibling;
        if (linkNode) {
          let href = linkNode.getAttribute("href");
          if (href) {
            href = href.replace(/^\/wiki\//, "");
            nameAndId.wikiId = href;
          }
        }
      }
    } else if (parentNode) {
      let linkNode = parentNode.querySelector("a");
      if (linkNode) {
        let href = linkNode.getAttribute("href");
        if (href) {
          href = href.replace(/^\/wiki\//, "");
          nameAndId.wikiId = href;
        }

        let spouseText = linkNode.textContent;
        spouseText = spouseText.replace(/\($/, ""); // remove trailing "("
        nameAndId.name = spouseText.trim();
      }
    }

    return nameAndId;
  }

  function getSiblingParentNameAndWikiId(isFather) {
    let selector = isFather
      ? '#content input[name="wpSameFather"]:not([type="hidden"])'
      : '#content input[name="wpSameMother"]:not([type="hidden"])';

    let nameAndId = {};

    let sameParentNode = document.querySelector(selector);
    if (sameParentNode) {
      if (sameParentNode.checked) {
        nameAndId.checked = true;
      }

      if (result.editFamilyType != "steps") {
        let textNode = sameParentNode.nextSibling;
        if (textNode) {
          const regex = isFather ? /^\s*Father of new sibling is\s+/ : /^\s*Mother of new sibling is\s+/;
          let parentText = textNode.textContent;
          parentText = parentText.replace(regex, ""); // leading text
          parentText = parentText.replace(/\($/, ""); // remove trailing "("
          nameAndId.name = parentText.trim();

          let linkNode = textNode.nextSibling;
          if (linkNode) {
            let href = linkNode.getAttribute("href");
            if (href) {
              href = href.replace(/^\/wiki\//, "");
              nameAndId.wikiId = href;
            }
          }
        }
      } else {
        let textNode = sameParentNode.nextSibling;
        if (textNode) {
          let linkNode = textNode.nextSibling;
          if (linkNode && linkNode.type != 3) {
            nameAndId.name = linkNode.textContent;
            let href = linkNode.getAttribute("href");
            if (href) {
              href = href.replace(/^\/wiki\//, "");
              nameAndId.wikiId = href;
            }
          }
        }
      }
    }

    return nameAndId;
  }

  result.pageType = "editFamily";

  // check the end of the URL. Examples are:
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=sibling
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=child
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=spouse
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=father
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=35832502&who=sibling
  let url = result.url;
  let relationship = "unrelated";
  const whoString = "&who=";
  let whoIndex = url.indexOf(whoString);
  if (whoIndex != -1) {
    relationship = url.substring(whoIndex + whoString.length);
  }
  result.relationshipToFamilyMember = relationship;

  // check for the new "steps" form
  let actionSectionNode = document.querySelector("#actionSection");
  if (actionSectionNode) {
    // this is the steps variant
    result.editFamilyType = "steps";
    // check which step we are on:
    let currentTab = document.querySelector("#progressBar > span.current");
    if (currentTab) {
      if (currentTab.id == "basicDataTab") {
        result.editFamilyTypeStep = "basicData";
      } else if (currentTab.id == "validationTab") {
        result.editFamilyTypeStep = "validation";
      } else if (currentTab.id == "potentialMatchesTab") {
        result.editFamilyTypeStep = "potentialMatches";
      } else if (currentTab.id == "connectionsTab") {
        result.editFamilyTypeStep = "connections";
      } else if (currentTab.id == "sourcesTab") {
        result.editFamilyTypeStep = "sources";
      }
    } else {
      result.editFamilyTypeStep = "action";
    }
  } else {
    result.editFamilyType = "oneStage";
  }

  //console.log("extractDataForEditFamily, editFamilyTypeStep = " + result.editFamilyTypeStep);

  let otherPersonName = "";
  let wikiId = "";

  let headingNode = document.querySelector("#addEditHeadline");
  if (!headingNode) {
    headingNode = document.querySelector("#content > div > h1");
    if (!headingNode) {
      return result;
    }
  }

  let heading = headingNode.textContent;

  if (relationship != "unrelated") {
    otherPersonName = "";
    if (result.editFamilyType != "steps") {
      if (heading.indexOf("Edit Family") != -1) {
        otherPersonName = heading.replace("Edit Family of ", "").trim();
      }
    } else {
      // steps page, there can be multiple "a" child nodes, we want the first
      let headingNameNode = headingNode.querySelector("a");
      if (!headingNameNode) {
        return result;
      }
      otherPersonName = headingNameNode.textContent;
    }

    result.familyMemberName = otherPersonName;

    let headingButtonNode = headingNode.querySelector("button.copyWidget");
    if (!headingButtonNode) {
      return result;
    }
    wikiId = headingButtonNode.getAttribute("data-copy-text");
    if (!wikiId) {
      return result;
    }
    result.familyMemberWikiId = wikiId;

    let spouseIsParentNodes = document.querySelectorAll('#content input[name="wpSpouseIsParent"]:not([type="hidden"])');
    if (spouseIsParentNodes.length > 0) {
      result.familyMemberSpouses = [];

      for (let spouseIsParentNode of spouseIsParentNodes) {
        let nameAndId = getSpouseNameAndWikiId(spouseIsParentNode);
        result.familyMemberSpouses.push(nameAndId);

        if (spouseIsParentNode.checked) {
          result.familyMemberSpouseName = nameAndId.name;
          result.familyMemberSpouseWikiId = nameAndId.wikiId;
        }
      }
    } else {
      result.familyMemberFather = getSiblingParentNameAndWikiId(true);
      result.familyMemberMother = getSiblingParentNameAndWikiId(false);
    }
  }

  //console.log("extractDataForEditFamily, otherPersonName is: " + otherPersonName);

  let firstNameNode = document.querySelector("#mFirstName");
  let realNameNode = document.querySelector("#mRealName");
  let lnabNode = document.querySelector("#mLastNameAtBirth");
  let clnNode = document.querySelector("#mLastNameCurrent");
  let birthDateNode = document.querySelector("#mBirthDate");
  let deathDateNode = document.querySelector("#mDeathDate");

  if (!(firstNameNode && realNameNode && lnabNode && clnNode && birthDateNode && deathDateNode)) {
    return result;
  }

  result.hasValidData = true;

  // record if the middle name field is present (there is a WikiTree setting to turn it off)
  let middleNameNode = document.querySelector("#mMiddleName");
  if (middleNameNode) {
    result.hasMiddleNameField = true;
  }

  result.firstNames = getValueBySelector(document, "#mFirstName");
  result.prefNames = getValueBySelector(document, "#mRealName");
  result.middleNames = getValueBySelector(document, "#mMiddleName");
  result.lnab = getValueBySelector(document, "#mLastNameAtBirth");
  result.currentLastName = getValueBySelector(document, "#mLastNameCurrent");

  let nickNames = getValueBySelector(document, "#mNicknames");
  if (nickNames) {
    result.nicknames = nickNames;
  }
  let otherLastNames = getValueBySelector(document, "#mLastNameOther").trim();
  if (otherLastNames) {
    result.otherLastNames = otherLastNames;
  }
  let prefix = getValueBySelector(document, "#mPrefix");
  if (prefix) {
    result.prefix = prefix;
  }
  let suffix = getValueBySelector(document, "#mSuffix");
  if (suffix) {
    result.suffix = suffix;
  }

  result.birthDate = getValueBySelector(document, "#mBirthDate");
  let checkedBirthDateStatus = document.querySelector("input[name=mStatus_BirthDate]:checked");
  if (checkedBirthDateStatus) {
    result.birthDateStatus = checkedBirthDateStatus.value;
  }
  result.deathDate = getValueBySelector(document, "#mDeathDate");
  let checkedDeathDateStatus = document.querySelector("input[name=mStatus_DeathDate]:checked");
  if (checkedDeathDateStatus) {
    result.deathDateStatus = checkedDeathDateStatus.value;
  }

  result.birthLocation = getValueBySelector(document, "#mBirthLocation");
  result.deathLocation = getValueBySelector(document, "#mDeathLocation");

  result.personGender = getValueBySelector(document, "select[name=mGender]");

  if (relationship == "spouse") {
    // when adding a spouse there can be marriage info
    let marriageDateNode = document.querySelector("#mMarrriageDate");
    let marriageLocationNode = document.querySelector("#mMarriageLocation");
    if (marriageDateNode && marriageLocationNode) {
      let spouse = { name: otherPersonName, wikiId: wikiId };

      let marriageDate = marriageDateNode.textContent;
      if (marriageDate) {
        spouse.marriageDate = marriageDate;
      }
      let marriagePlace = marriageLocationNode.textContent;
      if (marriagePlace) {
        spouse.marriagePlace = marriagePlace;
      }
      result.spouses.push(spouse);
    }
  }

  //console.log(result);

  return result;
}

function extractDataForEditFamily2025(document, result) {
  //console.log("extractDataForEditFamily2025");

  function getSpouseNameAndWikiId(spouseIsParentNode) {
    let parentNode = spouseIsParentNode.parentNode;

    let nameAndId = {};
    if (result.editFamilyType != "steps") {
      let textNode = spouseIsParentNode.nextSibling;
      if (textNode) {
        let spouseText = textNode.textContent;
        spouseText = spouseText.replace(/\($/, ""); // remove trailing "("
        nameAndId.name = spouseText.trim();

        let linkNode = textNode.nextSibling;
        if (linkNode) {
          let href = linkNode.getAttribute("href");
          if (href) {
            href = href.replace(/^\/wiki\//, "");
            nameAndId.wikiId = href;
          }
        }
      }
    } else if (parentNode) {
      let linkNode = parentNode.querySelector("a");
      if (linkNode) {
        let href = linkNode.getAttribute("href");
        if (href) {
          href = href.replace(/^\/wiki\//, "");
          nameAndId.wikiId = href;
        }

        let spouseText = linkNode.textContent;
        spouseText = spouseText.replace(/\($/, ""); // remove trailing "("
        nameAndId.name = spouseText.trim();
      }
    }

    return nameAndId;
  }

  function getSiblingParentNameAndWikiId(isFather) {
    let selector = isFather
      ? '#connectionsSection input[name="wpSameFather"]:not([type="hidden"])'
      : '#connectionsSection input[name="wpSameMother"]:not([type="hidden"])';

    let nameAndId = {};

    let sameParentNode = document.querySelector(selector);
    if (sameParentNode) {
      if (sameParentNode.checked) {
        nameAndId.checked = true;
      }

      if (result.editFamilyType != "steps") {
        let textNode = sameParentNode.nextSibling;
        if (textNode) {
          const regex = isFather ? /^\s*Father of new sibling is\s+/ : /^\s*Mother of new sibling is\s+/;
          let parentText = textNode.textContent;
          parentText = parentText.replace(regex, ""); // leading text
          parentText = parentText.replace(/\($/, ""); // remove trailing "("
          nameAndId.name = parentText.trim();

          let linkNode = textNode.nextSibling;
          if (linkNode) {
            let href = linkNode.getAttribute("href");
            if (href) {
              href = href.replace(/^\/wiki\//, "");
              nameAndId.wikiId = href;
            }
          }
        }
      } else {
        let labelNode = sameParentNode.nextElementSibling;
        if (labelNode) {
          let linkNode = labelNode.querySelector("a");
          if (linkNode) {
            nameAndId.name = linkNode.textContent;
            let href = linkNode.getAttribute("href");
            if (href) {
              href = href.replace(/^\/wiki\//, "");
              nameAndId.wikiId = href;
            }
          }
        }
      }
    }

    return nameAndId;
  }

  result.pageType = "editFamily";

  // check the end of the URL. Examples are:
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=sibling
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=child
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=spouse
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=27453632&who=father
  // https://www.wikitree.com/index.php?title=Special:EditFamily&u=35832502&who=sibling
  let url = result.url;
  let relationship = "unrelated";
  const whoString = "&who=";
  let whoIndex = url.indexOf(whoString);
  if (whoIndex != -1) {
    relationship = url.substring(whoIndex + whoString.length);
  }
  result.relationshipToFamilyMember = relationship;

  // check for the new "steps" form, note when adding an unrelated person the actionSection is not there
  let actionSectionNode = document.querySelector("#actionSection");
  let basicDataSectionNode = document.querySelector("#basicDataSection");
  if (actionSectionNode || basicDataSectionNode) {
    // this is the steps variant
    result.editFamilyType = "steps";
    // check which step we are on:
    let currentTab = document.querySelector("#progressBar > span.current");
    if (currentTab) {
      if (currentTab.id == "basicDataTab") {
        result.editFamilyTypeStep = "basicData";
      } else if (currentTab.id == "validationTab") {
        result.editFamilyTypeStep = "validation";
      } else if (currentTab.id == "potentialMatchesTab") {
        result.editFamilyTypeStep = "potentialMatches";
      } else if (currentTab.id == "connectionsTab") {
        result.editFamilyTypeStep = "connections";
      } else if (currentTab.id == "sourcesTab") {
        result.editFamilyTypeStep = "sources";
      }
    } else {
      result.editFamilyTypeStep = "action";
    }
  } else {
    result.editFamilyType = "oneStage";
  }

  //console.log("extractDataForEditFamily, editFamilyTypeStep = " + result.editFamilyTypeStep);

  let otherPersonName = "";
  let wikiId = "";

  let headingNode = document.querySelector("#addEditHeadline");
  if (!headingNode) {
    headingNode = document.querySelector("#heading h1");
    if (!headingNode) {
      return result;
    }
  }

  let heading = headingNode.textContent;

  if (relationship != "unrelated") {
    otherPersonName = "";
    if (result.editFamilyType != "steps") {
      if (heading.indexOf("Edit Family") != -1) {
        otherPersonName = heading.replace("Edit Family of ", "").trim();
      }
    } else {
      // steps page, there can be multiple "a" child nodes, we want the first
      let headingNameNode = headingNode.querySelector("a");
      if (!headingNameNode) {
        return result;
      }
      otherPersonName = headingNameNode.textContent;
    }

    result.familyMemberName = otherPersonName;

    let headingButtonNode = headingNode.querySelector("button.copyWidget");
    if (!headingButtonNode) {
      return result;
    }
    wikiId = headingButtonNode.getAttribute("data-copy-text");
    if (!wikiId) {
      return result;
    }
    result.familyMemberWikiId = wikiId;

    let spouseIsParentNodes = document.querySelectorAll(
      '#connectionsSection input[name="wpSpouseIsParent"]:not([type="hidden"])'
    );
    if (spouseIsParentNodes.length > 0) {
      result.familyMemberSpouses = [];

      for (let spouseIsParentNode of spouseIsParentNodes) {
        let nameAndId = getSpouseNameAndWikiId(spouseIsParentNode);
        result.familyMemberSpouses.push(nameAndId);

        if (spouseIsParentNode.checked) {
          result.familyMemberSpouseName = nameAndId.name;
          result.familyMemberSpouseWikiId = nameAndId.wikiId;
        }
      }
    } else {
      result.familyMemberFather = getSiblingParentNameAndWikiId(true);
      result.familyMemberMother = getSiblingParentNameAndWikiId(false);
    }
  }

  //console.log("extractDataForEditFamily, otherPersonName is: " + otherPersonName);

  let firstNameNode = document.querySelector("#mFirstName");
  let realNameNode = document.querySelector("#mRealName");
  let lnabNode = document.querySelector("#mLastNameAtBirth");
  let clnNode = document.querySelector("#mLastNameCurrent");
  let birthDateNode = document.querySelector("#mBirthDate");
  let deathDateNode = document.querySelector("#mDeathDate");

  if (!(firstNameNode && realNameNode && lnabNode && clnNode && birthDateNode && deathDateNode)) {
    return result;
  }

  result.hasValidData = true;

  // record if the middle name field is present (there is a WikiTree setting to turn it off)
  let middleNameNode = document.querySelector("#mMiddleName");
  if (middleNameNode) {
    result.hasMiddleNameField = true;
  }

  result.firstNames = getValueBySelector(document, "#mFirstName");
  result.prefNames = getValueBySelector(document, "#mRealName");
  result.middleNames = getValueBySelector(document, "#mMiddleName");
  result.lnab = getValueBySelector(document, "#mLastNameAtBirth");
  result.currentLastName = getValueBySelector(document, "#mLastNameCurrent");

  let nickNames = getValueBySelector(document, "#mNicknames");
  if (nickNames) {
    result.nicknames = nickNames;
  }
  let otherLastNames = getValueBySelector(document, "#mLastNameOther").trim();
  if (otherLastNames) {
    result.otherLastNames = otherLastNames;
  }
  let prefix = getValueBySelector(document, "#mPrefix");
  if (prefix) {
    result.prefix = prefix;
  }
  let suffix = getValueBySelector(document, "#mSuffix");
  if (suffix) {
    result.suffix = suffix;
  }

  result.birthDate = getValueBySelector(document, "#mBirthDate");
  let checkedBirthDateStatus = document.querySelector("input[name=mStatus_BirthDate]:checked");
  if (checkedBirthDateStatus) {
    result.birthDateStatus = checkedBirthDateStatus.value;
  }
  result.deathDate = getValueBySelector(document, "#mDeathDate");
  let checkedDeathDateStatus = document.querySelector("input[name=mStatus_DeathDate]:checked");
  if (checkedDeathDateStatus) {
    result.deathDateStatus = checkedDeathDateStatus.value;
  }

  result.birthLocation = getValueBySelector(document, "#mBirthLocation");
  result.deathLocation = getValueBySelector(document, "#mDeathLocation");

  result.personGender = getValueBySelector(document, "select[name=mGender]");

  if (relationship == "spouse") {
    // when adding a spouse there can be marriage info
    let marriageDateNode = document.querySelector("#mMarrriageDate");
    let marriageLocationNode = document.querySelector("#mMarriageLocation");
    if (marriageDateNode && marriageLocationNode) {
      let spouse = { name: otherPersonName, wikiId: wikiId };

      let marriageDate = marriageDateNode.textContent;
      if (marriageDate) {
        spouse.marriageDate = marriageDate;
      }
      let marriagePlace = marriageLocationNode.textContent;
      if (marriagePlace) {
        spouse.marriagePlace = marriagePlace;
      }
      result.spouses.push(spouse);
    }
  }

  //console.log(result);

  return result;
}

function is2025FormatPage(document, url) {
  //console.log("is2025FormatPage");

  let hasNewFooter = document.querySelector("footer#footer");
  //console.log("hasNewFooter is:");
  //console.log(hasNewFooter);
  if (hasNewFooter) {
    return true;
  }

  let hasFamilyContent = document.querySelector("#nav-familyContent");
  //console.log("hasFamilyContent is:");
  //console.log(hasFamilyContent);
  if (hasFamilyContent) {
    return true;
  }

  return false;
}

function extractVitalsDataInNonEditMode2025(document, result, isPrivate) {
  // Get name (includes first, middle, last names)
  result.name = getTextBySelector(document, "#person h1[itemProp=name]");
  result.birthDate = getTextBySelector(document, ".VITALS time[itemprop=birthDate]");
  result.birthDateStatus = getDateStatus(document, ".VITALS time[itemprop=birthDate]");
  result.deathDate = getTextBySelector(document, ".VITALS time[itemprop=deathDate]");
  result.deathDateStatus = getDateStatus(document, ".VITALS time[itemprop=deathDate]");

  result.firstNames = getTextBySelector(document, ".VITALS span[itemprop=givenName]");
  result.middleNames = getTextBySelector(document, ".VITALS span[itemprop=additionalName]");

  if (isPrivate) {
    result.birthLocation = getBirthOrDeathLocation(document, ".VITALS time[itemprop=birthDate]");
    result.deathLocation = getBirthOrDeathLocation(document, ".VITALS time[itemprop=deathDate]");
  } else {
    result.birthLocation = getTextBySelector(document, ".VITALS span[itemprop=birthPlace]");
    result.deathLocation = getTextBySelector(document, ".VITALS span[itemprop=deathPlace]");
  }

  result.currentLastName = getCurrentLastNameInNonEditMode(document, isPrivate);

  result.lnab = getAttrBySelector(document, ".VITALS meta[itemprop=familyName]", "content");

  // try to find any preferred name or nicknames
  let beforeSibling = undefined;
  let givenNameChild = document.querySelector(".VITALS span[itemprop=givenName]");
  let middleNameChild = document.querySelector(".VITALS span[itemprop=additionalName]");
  if (middleNameChild) {
    beforeSibling = middleNameChild.parentNode;
  } else if (givenNameChild) {
    beforeSibling = givenNameChild.parentNode;
  }
  if (beforeSibling) {
    let afterSibling = undefined;
    let familyNameChild = document.querySelector(".VITALS meta[itemprop=familyName]");
    if (familyNameChild) {
      afterSibling = familyNameChild;
    } else {
      let lastNameChild = document.querySelector(".VITALS a[href^='/genealogy/]");
      if (lastNameChild) {
        afterSibling = lastNameChild.parentNode;
      }
    }

    if (afterSibling) {
      let prefNames = "";
      let nicknames = "";
      let sibling = beforeSibling.nextSibling;
      while (sibling && sibling != afterSibling) {
        let text = sibling.textContent;
        if (text.startsWith('"') && text.endsWith('"')) {
          nicknames += text.substring(1, text.length - 1);
        } else if (text.startsWith("(") && text.endsWith(")")) {
          prefNames += text.substring(1, text.length - 1);
        }
        sibling = sibling.nextSibling;
      }
      if (sibling) {
        // we found the afterSibling OK
        if (prefNames) {
          result.prefNames = prefNames;
        }
        if (nicknames) {
          result.nicknames = nicknames;
        }
      }

      // look for " aka "
      sibling = afterSibling.nextSibling;
      while (sibling) {
        let text = sibling.textContent;
        if (text == " aka ") {
          sibling = sibling.nextSibling;
          if (sibling && sibling.textContent) {
            result.otherLastNames = sibling.textContent.trim();
          }
          break;
        }
        sibling = sibling.nextSibling;
      }
    }
  }
}

function getParentsFromDocumentInNonEditMode2025(document, result) {
  // there is no easy way to distinguish the parents, there could be 0, 1 or 2 and they don't say if they are mother
  // or father. So we have to compare the lnab - if it matches this person then it is the father.
  // Actually this is not safe - there can be only a mother and the lnab can be hers
  // So we look at the text to see if it says
  // "[father unknown]" (public view) or "[father?]" (private view)

  let fatherLink = document.querySelector("#Father a[itemprop=url]");
  let motherLink = document.querySelector("#Mother a[itemprop=url]");

  if (fatherLink) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = fatherLink.getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
    var fullName = getTextBySelector(fatherLink, "span[itemprop=name]");
    result.parents.father = { wikiId: wikiId, name: fullName };
  }

  if (motherLink) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = motherLink.getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
    var fullName = getTextBySelector(motherLink, "span[itemprop=name]");
    result.parents.mother = { wikiId: wikiId, name: fullName };

    var lastName = wikiId.replace(/^(.+)\-\d+$/, "$1");
    if (lastName != result.lnab) {
      result.mothersMaidenName = lastName;
    }
  }
}

function getSpousesFromDocumentInNonEditMode2025(isPrivate, document, result) {
  // read
  // get the spouses (if any)
  let spouseElements = document.querySelectorAll("#Spouses span.spouse");
  for (let spouseElement of spouseElements) {
    let spouseLink = spouseElement.querySelector("span[itemprop=spouse] a[itemprop=url]");
    // spouseLink can be null for private spouse
    if (spouseLink) {
      let pathName = spouseLink.getAttribute("href");
      const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
      let fullName = getTextBySelector(spouseLink, "span[itemprop=name]");

      let spouse = { wikiId: wikiId, name: fullName };

      let marriageDateElement = spouseElement.querySelector("span.marriage-date");
      if (marriageDateElement) {
        let marriageDate = marriageDateElement.textContent.trim();
        if (marriageDate) {
          spouse.marriageDate = marriageDate;
        }
      }

      let marriagePlaceElement = spouseElement.querySelector("span.marriage-location");
      if (marriagePlaceElement) {
        let marriagePlace = marriagePlaceElement.textContent.trim();
        if (marriagePlace) {
          spouse.marriagePlace = marriagePlace;
        }
      }

      result.spouses.push(spouse);
    }
  }
}

function extractDataInReadMode2025(document, result) {
  //console.log("start of extractDataInReadMode2025");
  //console.log(document);

  result.pageType = "read";

  let copyIdSelector = document.querySelector("button[aria-label='Copy ID']");
  let genderSelector = document.querySelector(".VITALS meta[itemprop=gender]");

  if (copyIdSelector) {
    result.wikiId = copyIdSelector.getAttribute("data-copy-text");
  } else {
    const profileUrlRegEx = /^https\:\/\/[^\.]+\.wikitree\.com\/wiki\/([^\/\?]+)$/;
    if (profileUrlRegEx.test(result.url)) {
      result.wikiId = result.url.replace(profileUrlRegEx, "$1");
    }
  }

  if (genderSelector) {
    result.personGender = genderSelector.getAttribute("content");
  }

  if (result.wikiId) {
    result.hasValidData = true;
  }

  extractVitalsDataInNonEditMode2025(document, result, false);

  getParentsFromDocumentInNonEditMode2025(document, result);

  getSpousesFromDocumentInNonEditMode2025(false, document, result);
}

function getParentsFromDocumentInEditMode2025(document, result) {
  // there is no easy way to distinguish the parents, there could be 0, 1 or 2 and they don't say if they are mother
  // or father. So we have to compare the lnab - if it matches this person then it is the father.
  // Actually this is not safe - there can be only a mother and the lnab can be hers
  // So we look at the text to see if it says
  // "[father unknown]" (public view) or "[father?]" (private view)

  let fatherLink = document.querySelector("#Father div.tree--person a");
  let motherLink = document.querySelector("#Mother div.tree--person a");

  if (fatherLink) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = fatherLink.getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
    var fullName = fatherLink.textContent.trim();
    result.parents.father = { name: fullName, wikiId: wikiId };
  }

  if (motherLink) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = motherLink.getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/[^\.]+\.wikitree\.com)?\/wiki\//, "");
    var fullName = motherLink.textContent.trim();
    result.parents.mother = { name: fullName, wikiId: wikiId };

    var lastName = wikiId.replace(/^(.+)\-\d+$/, "$1");
    if (lastName != result.lnab) {
      result.mothersMaidenName = lastName;
    }
  }
}

function getSpousesFromDocumentInEditMode2025(document, result) {
  var spouses = [];

  let spousesDiv = document.querySelector("#Spouses");

  if (!spousesDiv) {
    return;
  }

  let spouseDivs = spousesDiv.querySelectorAll("div.tree--person");
  spouseDivs.forEach(function (item) {
    var link = item.querySelector("a[title='']");
    // note for private spouses there is no link
    if (link) {
      const name = link.textContent;
      const wikiId = link.pathname.replace("/wiki/", "");

      let spouse = { name: name, wikiId: wikiId };

      var marriageDetails = getAttrBySelector(item, "a.btn", "title");
      marriageDetails.replace(/\s+/g, " ").trim();
      if (marriageDetails.startsWith("Edit marriage details")) {
        let marriageString = marriageDetails.replace(/Edit marriage details \(([^\)]+)\).*/, "$1");
        spouse.marriageString = marriageString;
        let dateStr = "";
        let placeStr = "";
        if (/^\d\d? \w\w\w \d\d\d\d/.test(marriageString)) {
          dateStr = marriageString.replace(/^(\d\d? \w\w\w \d\d\d\d).*/, "$1");
          placeStr = marriageString.replace(/^\d\d? \w\w\w \d\d\d\d */, "");
        } else if (/^\w\w\w \d\d\d\d/.test(marriageString)) {
          dateStr = marriageString.replace(/^(\w\w\w \d\d\d\d).*/, "$1");
          placeStr = marriageString.replace(/^\w\w\w \d\d\d\d */, "");
        }
        if (/^\d\d\d\d/.test(marriageString)) {
          dateStr = marriageString.replace(/^(\d\d\d\d).*/, "$1");
          placeStr = marriageString.replace(/^\d\d\d\d */, "");
        }
        spouse.marriageDate = dateStr;
        spouse.marriagePlace = placeStr;
      }

      spouses.push(spouse);
    }
  });

  result.spouses = spouses;
}

function extractDataInEditMode2025(document, result) {
  //console.log("start of extractDataInEditMode");
  //console.log(document);

  result.pageType = "edit";

  let firstNameNode = document.querySelector("#mFirstName");
  let birthDateNode = document.querySelector("#mBirthDate");

  if (!firstNameNode || !birthDateNode) {
    return;
  } else {
    result.hasValidData = true;
  }

  result.firstNames = getValueBySelector(document, "#mFirstName");
  result.prefNames = getValueBySelector(document, "#mRealName");
  result.middleNames = getValueBySelector(document, "#mMiddleName");

  let nickNames = getValueBySelector(document, "#mNicknames");
  if (nickNames) {
    result.nicknames = nickNames;
  }
  let otherLastNames = getValueBySelector(document, "#mLastNameOther");
  if (otherLastNames) {
    result.otherLastNames = otherLastNames;
  }

  result.birthDate = getValueBySelector(document, "#mBirthDate");
  let checkedBirthDateStatus = document.querySelector("input[name=mStatus_BirthDate]:checked");
  if (checkedBirthDateStatus) {
    result.birthDateStatus = checkedBirthDateStatus.value;
  }

  result.deathDate = getValueBySelector(document, "#mDeathDate");
  let checkedDeathDateStatus = document.querySelector("input[name=mStatus_DeathDate]:checked");
  if (checkedDeathDateStatus) {
    result.deathDateStatus = checkedDeathDateStatus.value;
  }

  result.birthLocation = getValueBySelector(document, "#mBirthLocation");
  result.deathLocation = getValueBySelector(document, "#mDeathLocation");

  result.personGender = getValueBySelector(document, "select[name=mGender]");

  getParentsFromDocumentInEditMode2025(document, result);

  getSpousesFromDocumentInEditMode2025(document, result);

  // get current last name and last name at birth
  result.currentLastName = getValueBySelector(document, "#mLastNameCurrent");

  // Get Wiki ID from the "Copy ID" button
  let copyIdButton = document.querySelector("button[aria-label='Copy ID']");
  if (copyIdButton) {
    const profileWikiId = copyIdButton.getAttribute("data-copy-text");
    result.wikiId = profileWikiId;
    result.lnab = profileWikiId.replace(/^(.+)\-\d+$/, "$1");
  }
}

function extractDataFor2025FormatPage(result, document, url) {
  //console.log("extractDataFor2025FormatPage");

  // check for the Add Person/Edit Family page
  if (url.includes("Special:EditFamily")) {
    return extractDataForEditFamily2025(document, result);
  }

  // next test whether we are in edit mode or not since the text fields will be different.
  var textbox = document.getElementById("wpTextbox1");

  if (textbox != undefined) {
    extractDataInEditMode2025(document, result);
  } else {
    extractDataInReadMode2025(document, result);
  }

  //console.log(result);

  return result;
}

function extractData(document, url) {
  //console.log("extractData");

  let result = new WikiTreeExtractedData();

  result.url = url;

  if (is2025FormatPage(document, url)) {
    extractDataFor2025FormatPage(result, document, url);
    return result;
  }

  // check for the Add Person/Edit Family page
  let editFamilyNode = document.querySelector("body.page-Special_EditFamily");
  if (editFamilyNode) {
    return extractDataForEditFamily(document, result);
  }
  let editFamilyStepsNode = document.querySelector("body.page-Special_EditFamilySteps");
  if (editFamilyStepsNode) {
    return extractDataForEditFamily(document, result);
  }

  let currentTabNode = document.querySelector("#content > div > ul.profile-tabs > li");

  if (!currentTabNode) {
    // we could be viewing what those outside the trusted list see
    currentTabNode = document.querySelector("#content > div > ul.profile-tabs li.current");
  }

  let currentTabText = currentTabNode ? currentTabNode.textContent : "";

  result.currentTabText = currentTabText; // used for error messages

  // first test whether we are in edit mode or not since the text fields will be different.
  var textbox = document.getElementById("wpTextbox1");

  if (textbox != undefined) {
    extractDataInEditMode(document, result);
  } else {
    if (currentTabText) {
      // see if the "[public view]" link exists - if so this is private view
      let publicViewLink = document.querySelector("#content > div > ul.profile-tabs a.usePublicView");
      // the || currentTabText.includes("private view") is just for backward compat with unit tests
      if (publicViewLink || currentTabText.includes("private view")) {
        extractDataInPrivateMode(document, result);
      } else {
        extractDataInReadMode(document, result);
      }
    } else {
      let privacyIconNode = document.querySelector("#content img[title^='Privacy Level:']");
      let loginNode = document.querySelector("#header div.login");

      if (loginNode) {
        // if user is not logged in to WikiTree there are no tabs
        //console.log("Not logged in");
        extractDataInLoggedOutMode(document, result);
      } else if (privacyIconNode) {
        let privacyTitle = privacyIconNode.getAttribute("title");

        if (privacyTitle) {
          // example titles:
          // "Privacy Level: Private with Public Biography"

          if (privacyTitle.startsWith("Privacy Level: Private")) {
            extractDataForPrivateToUserProfile(document, result);
          }
        }
      }
    }
  }

  //console.log(result);

  return result;
}

//console.log("extract_data_wikitree loaded");

export { extractData };
