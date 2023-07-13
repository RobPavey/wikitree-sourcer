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

import { PlaceObj, NameObj, DateObj } from "../../../base/core/generalize_data_utils.mjs";
import { GeneralizedData, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

function getQualifier(status) {
  if (status == undefined || status == "") {
    return dateQualifiers.NONE;
  }

  if (status == "before") {
    return dateQualifiers.BEFORE;
  } else if (status == "after") {
    return dateQualifiers.AFTER;
  } else if (status == "certain") {
    return dateQualifiers.EXACT;
  } else if (status == "guess") {
    return dateQualifiers.ABOUT;
  } else {
    return dateQualifiers.NONE;
  }
}

function removeSuffixes(lastName) {
  let suffixes = [
    "OBE",
    "CBE",
    "DBE",
    "DCVO",
    "GCVO",
    "SSI",
    "GCStJ",
    "KG",
    "KT",
    "PC",
    "GCB",
    "AC",
    "QSO",
    "GCMG",
    "CD",
    "ADC",
    "DL",
    "JP",
  ];

  let name = lastName;
  let lastSpaceIndex = name.lastIndexOf(" ");
  while (lastSpaceIndex != -1) {
    let possibleSuffix = name.substring(lastSpaceIndex).trim();
    let isSuffix = false;
    if (suffixes.includes(possibleSuffix)) {
      isSuffix = true;
    } else if (possibleSuffix.length <= 5 && !/[a-z]/.test(possibleSuffix)) {
      // it is a short name and no lower-case letters
      isSuffix = true;
    }
    if (isSuffix) {
      name = name.substring(0, lastSpaceIndex).trim();
      lastSpaceIndex = name.lastIndexOf(" ");
    } else {
      lastSpaceIndex = -1;
    }
  }

  return name;
}

function getPartsFromWikiTreeName(wikiTreeName, wikiId) {
  // a WikiTree name can contains parentheses like: Amelia Elizabeth (Littlemore) Pavey
  // Also, the wikiId is the most accurate determination of the LNAB
  let name = wikiTreeName;

  // If there is a suffix on the name it can get used as the last name by mistake
  // The wikiId contains the LNAB, perhaps we can use that.
  // Example combinations:
  // wikiTreeName: "Henry Pryor Almand Jr.", wikiId: Almand-77
  // wikiTreeName: "Elizabeth (Ellacott) Pavey", wikiId: Ellacott-59

  let hyphenSuffix = wikiId.lastIndexOf("-");
  let lnabFromId = wikiId;
  if (hyphenSuffix != -1) {
    // this should always be the case
    lnabFromId = wikiId.substring(0, hyphenSuffix);
  }

  let object = {};
  object.nameObj = new NameObj();

  var parenIndex = name.indexOf("(");
  if (parenIndex == -1) {
    // this will be the case for a man or an unmarried woman (or a woman where CLN was not changed)

    object.nameObj.name = name; // full name without parens

    let lastSpaceIndex = name.lastIndexOf(" ");
    if (lastSpaceIndex == -1) {
      // unlikely that there are no spaces at all in the name
      object.nameObj.lastName = name;
      object.lastNameAtBirth = lnabFromId;
      object.lastNameAtDeath = object.lastNameAtBirth;
      return;
    }

    let lastName = name.substring(lastSpaceIndex + 1);
    let spaceBeforeLastNameIndex = lastSpaceIndex;
    if (lastName != lnabFromId) {
      // There is likely a suffix on the name
      let lnabIndex = name.indexOf(" " + lnabFromId);
      if (lnabIndex != -1) {
        lastName = lnabFromId;
        spaceBeforeLastNameIndex = lnabIndex;
        // everything after the lnab is a suffix of some kind
        // NOTE: lnabIndex is the space before the LNAB
        let suffix = name.substring(lnabIndex + lnabFromId.length + 1).trim();
        object.nameObj.suffix = suffix;
      } else {
        // This should never happen, the lnab should always be in the name
      }
    }

    object.nameObj.lastName = lastName;
    object.nameObj.forenames = name.substring(0, spaceBeforeLastNameIndex);
    object.lastNameAtBirth = lastName;
    object.lastNameAtDeath = object.lastNameAtBirth;
  } else {
    object.nameObj.forenames = name.substring(0, parenIndex).trim();

    let closeParenIndex = name.indexOf(")", parenIndex);
    if (closeParenIndex == -1) {
      // error
      return;
    }

    let lnab = name.substring(parenIndex + 1, closeParenIndex).trim();
    if (lnab != lnabFromId) {
      console.log("LNAB in name '" + name + "' does not match LNAB in wikiId '" + wikiId + "'");
    }

    object.lastNameAtBirth = name.substring(parenIndex + 1, closeParenIndex).trim();

    // the part after the close paren could have suffixes. We could in some cases know the
    // spouses LNAB but they are not guaranteed to be the *last* husband
    let lastNameAtDeath = name.substring(closeParenIndex + 1).trim();
    lastNameAtDeath = removeSuffixes(lastNameAtDeath);

    object.lastNameAtDeath = lastNameAtDeath;

    object.nameObj.lastName = object.lastNameAtBirth;
    object.nameObj.name = object.nameObj.forenames + " " + object.nameObj.lastName;
  }

  return object;
}

function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "wikitree";
  // for wikiTree is sourceType always "profile"?
  // What do we do for an FSP or help page?
  result.sourceType = "profile";

  // names
  result.name = new NameObj();
  if (ed.firstNames) {
    result.name.setFirstNames(ed.firstNames);
  }
  if (ed.middleNames) {
    result.name.middleNames = ed.middleNames;
  }
  if (ed.prefNames) {
    result.name.prefNames = ed.prefNames;
  }
  if (ed.nicknames) {
    result.name.nicknames = ed.nicknames;
  }
  if (ed.otherLastNames) {
    result.name.otherLastNames = ed.otherLastNames;
  }
  // WT doesn't have a last name as such but every profile has a LNAB
  result.name.lastName = ed.lnab;

  result.lastNameAtBirth = ed.lnab;
  result.lastNameAtDeath = ed.currentLastName;
  result.mothersMaidenName = ed.mothersMaidenName;

  result.setPersonGender(ed.personGender);

  // Birth date
  if (ed.birthDate || ed.birthYear) {
    result.birthDate = new DateObj();

    if (ed.birthDate) {
      result.birthDate.dateString = ed.birthDate;
    }
    if (ed.birthYear) {
      result.birthDate.yearString = ed.birthYear;
    }
    if (ed.birthDateStatus) {
      result.birthDate.qualifier = getQualifier(ed.birthDateStatus);
    }
  }

  // Death date
  if (ed.deathDate || ed.birthYear) {
    result.deathDate = new DateObj();

    if (ed.deathDate) {
      result.deathDate.dateString = ed.deathDate;
    }
    if (ed.birthYear) {
      result.deathDate.yearString = ed.deathYear;
    }
    if (ed.deathDateStatus) {
      result.deathDate.qualifier = getQualifier(ed.deathDateStatus);
    }
  }

  if (ed.birthLocation) {
    result.setBirthPlace(ed.birthLocation);
  }
  if (ed.deathLocation) {
    result.setDeathPlace(ed.deathLocation);
  }

  // parents
  if (ed.parents) {
    result.parents = {};

    if (ed.parents.father) {
      let name = ed.parents.father.name;
      if (name) {
        let obj = getPartsFromWikiTreeName(name, ed.parents.father.wikiId);
        result.parents.father = {
          name: obj.nameObj,
          lastNameAtBirth: obj.lastNameAtBirth,
          lastNameAtDeath: obj.lastNameAtDeath,
        };
      }
    }
    if (ed.parents.mother) {
      let name = ed.parents.mother.name;
      if (name) {
        let obj = getPartsFromWikiTreeName(name, ed.parents.mother.wikiId);
        result.parents.mother = {
          name: obj.nameObj,
          lastNameAtBirth: obj.lastNameAtBirth,
          lastNameAtDeath: obj.lastNameAtDeath,
        };
      }
    }
  }

  // Spouses/marriages
  if (ed.spouses) {
    result.spouses = [];

    for (let spouse of ed.spouses) {
      let resultSpouse = {};
      if (spouse.name) {
        let obj = getPartsFromWikiTreeName(spouse.name, spouse.wikiId);
        resultSpouse.name = obj.nameObj;
        resultSpouse.lastNameAtBirth = obj.lastNameAtBirth;
        resultSpouse.lastNameAtDeath = obj.lastNameAtDeath;
      }
      if (spouse.marriageDate) {
        resultSpouse.marriageDate = new DateObj();
        resultSpouse.marriageDate.dateString = spouse.marriageDate;
      }
      if (spouse.marriagePlace) {
        resultSpouse.marriagePlace = new PlaceObj();
        resultSpouse.marriagePlace.placeString = spouse.marriagePlace;
      }
      result.spouses.push(resultSpouse);
    }
  }

  result.hasValidData = true;

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
