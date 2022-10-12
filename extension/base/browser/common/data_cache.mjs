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

//////////////////////////////////////////////////////////////////////////////////////////
// Data cache
//////////////////////////////////////////////////////////////////////////////////////////

async function readDataCache() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["dataCache"], function (value) {
        resolve(value.dataCache);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function storeDataCache(dataCache) {
  try {
    chrome.storage.local.set({ dataCache: dataCache }, function () {
      //console.log('saved dataCache, dataCache is:');
      //console.log(dataCache);
    });
  } catch (ex) {
    console.log("storeDataCache failed");
  }
}

async function updateDataCacheWithWikiTreeExtract(extractedData, generalizedData) {
  let dateToday = new Date();
  let timeStamp = dateToday.getTime();

  let wikiTreeEntry = {
    timeStamp: timeStamp,
    extractedData: extractedData,
    generalizedData: generalizedData,
  };

  const maxEntries = 20;

  let dataCache = await readDataCache();

  if (!dataCache) {
    dataCache = { wikiTreeProfileCache: { items: [wikiTreeEntry] } };
  } else {
    let wikiTreeProfileCache = dataCache.wikiTreeProfileCache;
    if (!wikiTreeProfileCache) {
      dataCache.wikiTreeProfileCache = { items: [wikiTreeEntry] };
    } else {
      // the wikiTreeProfileCache already exists
      let existingEntry = undefined;

      // see if there is already an entry for this item, also find oldest entry
      let oldestEntry = undefined;
      let oldestTimeStamp = timeStamp;
      for (let entry of dataCache.wikiTreeProfileCache.items) {
        if (extractedData.wikiId == entry.extractedData.wikiId) {
          existingEntry = entry;
          break;
        } else {
          if (entry.timeStamp < oldestTimeStamp) {
            oldestTimeStamp = entry.timeStamp;
            oldestEntry = entry;
          }
        }
      }

      if (existingEntry) {
        existingEntry.timeStamp = timeStamp;
        existingEntry.extractedData = extractedData;
        existingEntry.generalizedData = generalizedData;
      } else {
        if (dataCache.wikiTreeProfileCache.items.length < maxEntries) {
          dataCache.wikiTreeProfileCache.items.push(wikiTreeEntry);
        } else if (oldestEntry) {
          oldestEntry.timeStamp = timeStamp;
          oldestEntry.extractedData = extractedData;
          oldestEntry.generalizedData = generalizedData;
        }
      }
    }
  }

  storeDataCache(dataCache);

  // it may not have finished being stored yet but it is up to date in memory
  cachedDataCache = dataCache;
  isCachedDataCacheReady = true;
}

// The cachedDataCache (confusing name) is a value that we try to prefetch as soon as
// the popup menu comes up.

var isCachedDataCacheReady = false;
var cachedDataCache;

async function loadDataCache(listenerFunction) {
  // this test is mostly so that back function back to main popup doesn't load again
  if (!isCachedDataCacheReady) {
    cachedDataCache = await readDataCache();
    isCachedDataCacheReady = true;
    if (listenerFunction) {
      listenerFunction();
    }
  }
}

export { updateDataCacheWithWikiTreeExtract, loadDataCache, cachedDataCache, isCachedDataCacheReady };
