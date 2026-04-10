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

import { logDebug } from "../../core/log_debug.mjs";

async function commonCheckPermissionForSites(siteMatches, options, requestFunction) {
  let permissions = { origins: siteMatches };

  logDebug("commonCheckPermissionForSites, permissions is:", permissions);

  let hasPermission = false;

  try {
    hasPermission = await chrome.permissions.contains(permissions);
  } catch (e) {
    logDebug("commonCheckPermissionForSites, chrome.permissions.contains got exception:", e);
  }

  if (hasPermission) {
    return true;
  }

  if (options.checkOnly) {
    return false;
  }

  // request permission from browser
  return await requestFunction(permissions, options);
}

async function commonCheckPermissionForSite(matchString, options, requestFunction) {
  logDebug("checkPermissionForSite");

  let siteMatches = [matchString];
  return await commonCheckPermissionForSites(siteMatches, options, requestFunction);
}

// Helper to convert Chrome Match Patterns to Regex
// This tests whether a match pattern from a registered content script matches
// a URL
function doesUrlMatchChromePattern(pattern, url) {
  if (pattern === "<all_urls>") return true;

  // Prepare the pattern by escaping special regex characters except *
  let regexString = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape all regex specials
    .replace(/\*/g, ".*"); // Convert * to .*

  const regex = new RegExp(`^${regexString}$`);
  return regex.test(url);
}

async function getMatchingOptionalPattern(url) {
  const optionalHosts = chrome.runtime.getManifest().optional_host_permissions;

  if (!optionalHosts) return null;

  // We find the first pattern that matches our current URL
  const matchingPattern = optionalHosts.find((pattern) => {
    return doesUrlMatchChromePattern(pattern, url);
  });

  return matchingPattern || null;
}

async function commonCheckPermissionForSiteFromUrl(url, options, requestFunction) {
  // NOTE: The main reason to call this rather than checkPermissionForSiteMatches
  // is that it will just request permission for the wildcard strings in the
  // registered content scripts that actually match the url rather than
  // all the matches for a registered content script.
  // This looks better for ancestry for example where it seems odd to the user that
  // it is requesting permission for every ancestry domain when they are only using one.
  logDebug("checkPermissionForSiteFromUrl, url is:", url);

  // first check if we have permsion for this url
  const hasPermission = await chrome.permissions.contains({
    origins: [url],
  });

  if (hasPermission) {
    logDebug("checkPermissionForSiteFromUrl, we already have permission");
    return true;
  }

  let matchingPattern = await getMatchingOptionalPattern(url);

  if (!matchingPattern) {
    console.warn("No optional_host_permission matching url:", url);
    return;
  }

  logDebug("checkPermissionForSites, matchingPattern is:", matchingPattern);

  return await commonCheckPermissionForSite(matchingPattern, options, requestFunction);
}

async function commonCheckPermissionForSiteMatches(siteName, options, requestFunction) {
  let contentScripts = await chrome.scripting.getRegisteredContentScripts({
    ids: [siteName],
  });

  if (!contentScripts || !contentScripts.length) {
    return;
  }

  // there should only be one registered content script with this id
  let siteMatches = contentScripts[0].matches;
  return await commonCheckPermissionForSites(siteMatches, options, requestFunction);
}

export {
  commonCheckPermissionForSite,
  commonCheckPermissionForSites,
  commonCheckPermissionForSiteFromUrl,
  commonCheckPermissionForSiteMatches,
  doesUrlMatchChromePattern,
};
