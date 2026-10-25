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

export {
  startNewCollectedCitations,
  addCitationToCollectedCitations,
  removeLastCitationFromCollectedCitations,
  restorePreviousCollectedCitations,
  getCollectedCitations,
  getPreviousCollectedCitations,
  stopCollectingCitations,
  restoreCollectedCitations,
};
