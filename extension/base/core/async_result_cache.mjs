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

async function setCache(cacheTag, cache) {
  //console.log("setCache, cache is:");
  //console.log(cache);

  if (cacheTag && cache.contents) {
    let items = {};
    items[getLocalStorageKeyForAsyncCache(cacheTag)] = cache.contents;
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

  let cacheContents = cache.contents;

  //console.log("addCachedResult, cacheTag = " + cacheTag + ", key = " + key + ", cacheContents is:");
  //console.log(cacheContents);

  if (cacheContents && Array.isArray(cacheContents)) {
    // remove any items that have the same key
    let timeNow = Date.now();
    let prunedCache = [];
    for (let cacheEntry of cacheContents) {
      if (cacheEntry.key != key) {
        if (timeNow - cacheEntry.timeStamp < cache.expireTime) {
          prunedCache.push(cacheEntry);
        }
      }
    }

    //console.log("addCachedResult, cacheTag = " + cacheTag + ", key = " + key + ", prunedCache is:");
    //console.log(prunedCache);

    if (prunedCache.length >= cache.maxLength) {
      prunedCache.shift(); // remove the first element
    }
    prunedCache.push({ key: key, result: result, timeStamp: Date.now() });
    cache.contents = prunedCache;
  } else {
    cacheContents = [{ key: key, result: result, timeStamp: Date.now() }];
    cache.contents = cacheContents;
  }

  setCache(cacheTag, cache);
}

async function getCachedAsyncResult(cacheTag, key) {
  //console.log("getCachedResult, cacheTag = " + cacheTag + ", key = " + key);
  if (!cacheTag) {
    return undefined;
  }

  let cache = await getCache(cacheTag);
  //console.log(cache);
  if (!cache) {
    return undefined;
  }

  let cacheContents = cache.contents;
  if (cacheContents && Array.isArray(cacheContents) && cacheContents.length > 0) {
    //console.log("getCachedResult, cacheContents.length = " + cacheContents.length);

    //console.log("getCachedResult, caccacheContentshe is:");
    //console.log(cacheContents);

    let timeNow = Date.now();
    for (let index = cacheContents.length - 1; index >= 0; index--) {
      let cacheEntry = cacheContents[index];
      //console.log("getCachedResult, index = " + index + ", cacheEntry is:");
      //console.log(cacheEntry);
      if (cacheEntry.key == key && timeNow - cacheEntry.timeStamp < cache.expireTime) {
        //console.log("getCachedResult, key = " + key + ", found in cache, cacheEntry is:");
        //console.log(cacheEntry);
        return cacheEntry.result;
      }
    }
  }

  //console.log("getCachedResult, key = " + key + ", not found in cache");
  return undefined;
}

async function clearAsyncResultCache(cacheTag) {
  chrome.storage.local.remove(getLocalStorageKeyForAsyncCache(cacheTag));
}

export { registerAsyncCacheTag, getCachedAsyncResult, addCachedAsyncResult, clearAsyncResultCache };
