/*
MIT License

Copyright (c) 2023 Robert M Pavey

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

import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";

var cacheRegistry = {};

function registerAsyncCacheTag(cacheTag, maxLength = 10, expireTime = 1000 * 60 * 60) {
  if (!cacheTag) {
    return;
  }
  // we allow calling the register function multiple times.
  if (!cacheRegistry[cacheTag]) {
    let cache = { maxLength: maxLength, expireTime: expireTime };
    cacheRegistry[cacheTag] = cache;
  }
}

function getLocalStorageKeyForAsyncCache(cacheTag) {
  return "AsyncCache_" + cacheTag;
}

async function getCache(cacheTag) {
  let cache = cacheRegistry[cacheTag];
  //console.log("getCache, cacheTag is " + cacheTag + " cache is:");
  //console.log(cache);

  if (!cache) {
    //console.log("getCache, ERROR, cache not registered for " + cacheTag);
    return undefined;
  }

  let cacheContents = cache.contents;
  if (!cacheContents) {
    cacheContents = await getLocalStorageItem(getLocalStorageKeyForAsyncCache(cacheTag));
    //console.log("getCache, getLocalStorageItem returned:");
    //console.log(cacheContents);
    if (cacheContents) {
      cache.contents = cacheContents;
    }
  }
  return cache;
}

async function setCache(cacheTag, contentsToSave) {
  //console.log("setCache, cache is:");
  //console.log(cache);

  if (cacheTag && contentsToSave) {
    let items = {};
    items[getLocalStorageKeyForAsyncCache(cacheTag)] = contentsToSave;
    chrome.storage.local.set(items);
  }
}

async function addCachedAsyncResult(cacheTag, key, result) {
  //console.log("addCachedResult, cacheTag = " + cacheTag + ", key = " + key + ", result is:");
  //console.log(result);
  if (!cacheTag) {
    return;
  }

  let cache = await getCache(cacheTag);
  if (!cache) {
    return;
  }

  // This is a bit of a hack but when we save extractedData to the cache the property order
  // changes. This is only an issue for recordData (households are an array)
  // So we save the keys as a separate array
  if (result.recordData) {
    let keys = Object.keys(result.recordData);
    result.recordDataKeys = keys;
  }

  let cacheContents = cache.contents;

  //console.log("addCachedResult, cacheTag = " + cacheTag + ", key = " + key + ", cacheContents is:");
  //console.log(cacheContents);

  let contentsToSave = undefined;

  if (cacheContents && Array.isArray(cacheContents)) {
    // remove any items that have the same key
    let newCache = [];
    for (let cacheEntry of cacheContents) {
      if (cacheEntry.key != key) {
        newCache.push(cacheEntry);
      }
    }

    let timeNow = Date.now();
    let version = chrome.runtime.getManifest().version;

    newCache.push({ key: key, result: result, timeStamp: timeNow, version: version });

    cache.contents = newCache;

    // remove any items that have an expired date before saving
    // NOTE: we do not prune the in-memory cache, just the one we write to local storage.
    // The in memory one only stays around for the lifetime of the popup.
    // The advantage of this is that if we were doing an operation that needs 200 fetches
    // and the cache store 100 we would be missing the first 100 at the start of the repeat operation
    // and if we set cache.contents to prunedContents here, as we filled in the first 100 the
    // second 100 would be pruned out of the cache. So we would end up fetching all 200 again.

    let prunedCache = [];
    for (let cacheEntry of newCache) {
      if (timeNow - cacheEntry.timeStamp < cache.expireTime) {
        prunedCache.push(cacheEntry);
      }
    }

    //console.log("addCachedResult, cacheTag = " + cacheTag + ", key = " + key + ", prunedCache is:");
    //console.log(prunedCache);

    while (prunedCache.length >= cache.maxLength) {
      prunedCache.shift(); // remove the first element
    }
    contentsToSave = prunedCache;
  } else {
    let version = chrome.runtime.getManifest().version;
    cacheContents = [{ key: key, result: result, timeStamp: Date.now(), version: version }];
    cache.contents = cacheContents;
    contentsToSave = cacheContents;
  }

  if (contentsToSave) {
    setCache(cacheTag, contentsToSave);
  }
}

async function getCachedAsyncResult(cacheTag, key) {
  //console.log("getCachedAsyncResult, cacheTag = " + cacheTag + ", key = " + key);
  if (!cacheTag) {
    return undefined;
  }

  let cache = await getCache(cacheTag);
  //console.log(cache);
  if (!cache) {
    console.log("getCachedAsyncResult, cache not found for cacheTag");
    return undefined;
  }

  let cacheContents = cache.contents;
  if (cacheContents && Array.isArray(cacheContents) && cacheContents.length > 0) {
    //console.log("getCachedAsyncResult, cacheContents.length = " + cacheContents.length);

    //console.log("getCachedAsyncResult, cacheContents is:");
    //console.log(cacheContents);

    let version = chrome.runtime.getManifest().version;

    let timeNow = Date.now();
    for (let index = cacheContents.length - 1; index >= 0; index--) {
      let cacheEntry = cacheContents[index];
      //console.log("getCachedAsyncResult, index = " + index + ", cacheEntry is:");
      //console.log(cacheEntry);
      if (cacheEntry.key == key && timeNow - cacheEntry.timeStamp < cache.expireTime && version == cacheEntry.version) {
        //console.log("getCachedAsyncResult, key = " + key + ", found in cache, cacheEntry is:");
        //console.log(cacheEntry);

        let result = cacheEntry.result;

        // This is a bit of a hack but when we save extractedData to the cache the property order
        // changes. This is only an issue for recordData (households are an array)
        // So we save the keys as a separate array
        if (result.recordData && result.recordDataKeys) {
          let orderedRecordData = {};
          for (let key of result.recordDataKeys) {
            orderedRecordData[key] = result.recordData[key];
          }
          result.recordData = orderedRecordData;
        }

        return result;
      }
    }
  }

  //console.log("getCachedAsyncResult, key = " + key + ", not found in cache");
  return undefined;
}

async function clearAsyncResultCache(cacheTag) {
  chrome.storage.local.remove(getLocalStorageKeyForAsyncCache(cacheTag));
}

export { registerAsyncCacheTag, getCachedAsyncResult, addCachedAsyncResult, clearAsyncResultCache };
