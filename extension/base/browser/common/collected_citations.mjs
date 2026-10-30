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

async function startNewCollectedCitations() {
  let collectedCitations = {
    citations: [],
  };

  let items = { collectedCitations: collectedCitations };
  await chrome.storage.local.set(items);
}

async function getCollectedCitationsByKey(key) {
  //console.log("getCollectedCitations");

  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([key], function (value) {
        //console.log("getPendingSearch resolve");
        resolve(value[key]);
      });
    } catch (ex) {
      console.log("getCollectedCitations catch");
      reject(ex);
    }
  });
}

async function getCollectedCitations() {
  return await getCollectedCitationsByKey("collectedCitations");
}

async function getPreviousCollectedCitations() {
  return await getCollectedCitationsByKey("previousCollectedCitations");
}

async function checkIfCollectingCitations() {
  // if we are collecting citations save to the collected citations
  let items = await chrome.storage.local.get(["collectedCitations"]);
  if (items && items.collectedCitations && items.collectedCitations.citations) {
    return true;
  }

  return false;
}

async function addCitationToCollectedCitations(citationObject) {
  // if we are collecting citations save to the collected citations
  let items = await chrome.storage.local.get(["collectedCitations"]);
  if (items && items.collectedCitations && items.collectedCitations.citations) {
    // check that this is not a duplicate
    for (let existingCitationObject of items.collectedCitations.citations) {
      if (existingCitationObject.url == citationObject.url) {
        if (existingCitationObject.sourceReference == citationObject.sourceReference) {
          if (existingCitationObject.sourceTitle == citationObject.sourceTitle) {
            if (existingCitationObject.sourceNameWithinRepository == citationObject.sourceNameWithinRepository) {
              if (existingCitationObject.referenceWithinRepository == citationObject.referenceWithinRepository) {
                return;
              }
            }
          }
        }
      }
    }

    items.collectedCitations.citations.push(citationObject);
    chrome.storage.local.set(items);
  }
}

async function removeLastCitationFromCollectedCitations() {
  let items = await chrome.storage.local.get(["collectedCitations"]);
  if (items && items.collectedCitations && items.collectedCitations.citations) {
    items.collectedCitations.citations.pop();
    chrome.storage.local.set(items);
  }
}

async function restorePreviousCollectedCitations() {
  let collectedCitations = await getPreviousCollectedCitations();
  if (collectedCitations && collectedCitations.citations && collectedCitations.citations.length) {
    let items = { collectedCitations: collectedCitations };
    await chrome.storage.local.set(items);

    await chrome.storage.local.remove("previousCollectedCitations");
  }
}

async function stopCollectingCitations() {
  let collectedCitations = await getCollectedCitations();
  if (collectedCitations && collectedCitations.citations && collectedCitations.citations.length) {
    let items = { previousCollectedCitations: collectedCitations };
    await chrome.storage.local.set(items);
  }

  await chrome.storage.local.remove("collectedCitations");
}

async function restoreCollectedCitations() {
  let collectedCitations = await getPreviousCollectedCitations();
  if (collectedCitations && collectedCitations.citations && collectedCitations.citations.length) {
    let items = { collectedCitations: collectedCitations };
    await chrome.storage.local.set(items);

    await chrome.storage.local.remove("previousCollectedCitations");
  }
}

function isDeepEqual(obj1, obj2, keysToIgnore) {
  // 1. Primitive comparison or exact reference match
  if (obj1 === obj2) {
    return true;
  }

  // 2. Check for null or non-object types
  if (obj1 === null || obj2 === null || typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  // 3. Ensure both are arrays or both are non-arrays
  const isArray1 = Array.isArray(obj1);
  const isArray2 = Array.isArray(obj2);
  if (isArray1 !== isArray2) {
    return false;
  }

  // 4. Handle arrays separately with a clean index loop
  if (isArray1 && isArray2) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i], keysToIgnore)) {
        return false;
      }
    }
    return true;
  }

  // 5. Handle plain objects using keys and hasOwnProperty
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const prunedKeys1 = keys1.filter((key) => !keysToIgnore.includes(key));
  const prunedKeys2 = keys2.filter((key) => !keysToIgnore.includes(key));

  if (prunedKeys1.length !== prunedKeys2.length) {
    return false;
  }

  for (const key of prunedKeys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || !isDeepEqual(obj1[key], obj2[key], keysToIgnore)) {
      return false;
    }
  }

  return true;
}

function doesCitationObjMatchData(citationObject, ed, gd) {
  if (citationObject.url && citationObject.url != ed.url) {
    return false;
  }

  let citationGd = citationObject.generalizedData;
  if (!citationGd) {
    return false;
  }

  // a problem with comparing the GDs is the the GD can get modified from when the menu
  // comes up to when it is stored in the citationObject. Prticulalry this happens with
  // household tables on Ancestry when we fetch records.
  // So ignore the household tables.
  const keysToIgnore = ["householdArray", "householdArrayFields"];
  return isDeepEqual(citationGd, gd, keysToIgnore);
}

async function isRecordInCollectedCitations(ed, gd) {
  let collectedCitations = await getCollectedCitations();

  if (collectedCitations && collectedCitations.citations) {
    // check that this is not a duplicate
    for (let existingCitationObject of collectedCitations.citations) {
      if (doesCitationObjMatchData(existingCitationObject, ed, gd)) {
        return true;
      }
    }
  }

  return false;
}

export {
  startNewCollectedCitations,
  checkIfCollectingCitations,
  addCitationToCollectedCitations,
  removeLastCitationFromCollectedCitations,
  restorePreviousCollectedCitations,
  getCollectedCitations,
  getPreviousCollectedCitations,
  stopCollectingCitations,
  restoreCollectedCitations,
  isRecordInCollectedCitations,
};
