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
    return node.textContent;
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
  result.lnab = profileWikiId.replace(/^([^\-]+)\-.*$/, "$1");
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
        clnNode = vitalsNode.querySelector("a");
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
  var parentUrls = document.querySelectorAll(".VITALS span[itemprop=parent] a[itemprop=url]");
  for (let index = 0; index < parentUrls.length; ++index) {
    if (result.parents == undefined) {
      result.parents = {};
    }

    var pathName = parentUrls[index].getAttribute("href");
    const wikiId = pathName.replace(/(?:https?\:\/\/www\.wikitree\.com)?\/wiki\//, "");
    var fullName = getTextBySelector(parentUrls[index], "span[itemprop=name]");

    var lastName = wikiId.replace(/^([^\-]+)\-\d*$/, "$1");

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
        if (text.includes("[father unknown]")) {
          parentIdentified = true;
          isFather = false;
        } else if (text.includes("[mother unknown]")) {
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
    let sectionDivNodes = document.querySelectorAll("#editform > div");
    for (let sectionDivNode of sectionDivNodes) {
      let style = sectionDivNode.getAttribute("style");
      if (style) {
        let displayBlockIndex = style.search(/display\:\s*block/);
        if (displayBlockIndex != -1) {
          result.editFamilyTypeStep = sectionDivNode.id;
          break;
        }
      } else {
        // sometimes the style attribute is blank - which means visible
        result.editFamilyTypeStep = sectionDivNode.id;
        break;
      }
    }
  } else {
    result.editFamilyType = "oneStage";
  }

  //console.log("extractDataForEditFamily");

  let otherPersonName = "";
  let wikiId = "";

  let headingNode = document.querySelector("#content > div > h1");
  if (!headingNode) {
    return result;
  }
  let heading = headingNode.textContent;

  if (relationship != "unrelated") {
    otherPersonName = "";
    if (result.editFamilyType != "steps") {
      if (heading.indexOf("Edit Family") != -1) {
        otherPersonName = heading.replace("Edit Family of ", "").trim();
      }
    } else {
      // steps page
      let headingNameNode = headingNode.querySelector("a[title]");
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

    let spouseIsParentNodes = document.querySelectorAll('#content input[name="wpSpouseIsParent"]');
    if (spouseIsParentNodes.length > 0) {
      for (let spouseIsParentNode of spouseIsParentNodes) {
        if (spouseIsParentNode.checked) {
          let parentNode = spouseIsParentNode.parentNode;
          let spouseText = parentNode.childNodes[1].textContent;
          spouseText = spouseText.replace(/\($/, ""); // remove trailing "("
          result.familyMemberSpouseName = spouseText.trim();

          let linkNode = parentNode.querySelector("a");
          if (linkNode) {
            let href = linkNode.getAttribute("href");
            href = href.replace(/^\/wiki\//, "");
            result.familyMemberSpouseWikiId = href;
          }
        }
      }
    } else {
      let sameFatherNode = document.querySelector('#content input[name="wpSameFather"]');
      if (sameFatherNode && sameFatherNode.checked) {
        if (result.editFamilyType != "steps") {
          let textNode = sameFatherNode.nextSibling;
          if (textNode) {
            let fatherText = textNode.textContent;
            fatherText = fatherText.replace(/^\s*Father of new sibling is\s+/, ""); // leading text
            fatherText = fatherText.replace(/\($/, ""); // remove trailing "("
            result.familyMemberFatherName = fatherText.trim();

            let linkNode = textNode.nextSibling;
            if (linkNode) {
              let href = linkNode.getAttribute("href");
              href = href.replace(/^\/wiki\//, "");
              result.familyMemberFatherWikiId = href;
            }
          }
        } else {
          let textNode = sameFatherNode.nextSibling;
          if (textNode) {
            let linkNode = textNode.nextSibling;
            if (linkNode && linkNode.type != 3) {
              let href = linkNode.getAttribute("href");
              href = href.replace(/^\/wiki\//, "");
              result.familyMemberFatherName = linkNode.textContent;
              result.familyMemberFatherWikiId = href;
            }
          }
        }
      }
      let sameMotherNode = document.querySelector('#content input[name="wpSameMother"]');
      if (sameMotherNode && sameMotherNode.checked) {
        if (result.editFamilyType != "steps") {
          let textNode = sameMotherNode.nextSibling;
          if (textNode) {
            let motherText = textNode.textContent;
            motherText = motherText.replace(/^\s*Mother of new sibling is\s+/, ""); // leaing text
            motherText = motherText.replace(/\($/, ""); // remove trailing "("
            result.familyMemberMotherName = motherText.trim();

            let linkNode = textNode.nextSibling;
            if (linkNode) {
              let href = linkNode.getAttribute("href");
              href = href.replace(/^\/wiki\//, "");
              result.familyMemberMotherWikiId = href;
            }
          }
        } else {
          let textNode = sameMotherNode.nextSibling;
          if (textNode) {
            let linkNode = textNode.nextSibling;
            if (linkNode && linkNode.type != 3) {
              let href = linkNode.getAttribute("href");
              href = href.replace(/^\/wiki\//, "");
              result.familyMemberMotherName = linkNode.textContent;
              result.familyMemberMotherWikiId = href;
            }
          }
        }
      }
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

  result.firstNames = getValueBySelector(document, "#mFirstName");
  result.prefNames = getValueBySelector(document, "#mRealName");
  result.middleNames = getValueBySelector(document, "#mMiddleName");
  result.lnab = getValueBySelector(document, "#mLastNameAtBirth");
  result.currentLastName = getValueBySelector(document, "#mLastNameCurrent");

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

function extractData(document, url) {
  let result = new WikiTreeExtractedData();

  result.url = url;

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

  let currentTabText = currentTabNode ? currentTabNode.textContent : "";

  result.currentTabText = currentTabText; // used for error messages

  // first test whether we are in edit mode or not since the text fields will be different.
  var textbox = document.getElementById("wpTextbox1");

  if (textbox != undefined) {
    extractDataInEditMode(document, result);
  } else {
    if (currentTabText) {
      if (currentTabText.includes("private view")) {
        extractDataInPrivateMode(document, result);
      } else {
        extractDataInReadMode(document, result);
      }
    } else {
      let privacyIconNode = document.querySelector("#content img[title^='Privacy Level:']");
      let loginNode = document.querySelector("#header div.login");

      if (loginNode) {
        // if user is not logged in to WikiTree there are no tabs
        // console.log("Not logged in");
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
