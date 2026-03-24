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

import "../../../site/all/core/register_site_data.mjs";
import { getSites, storeSiteRegistry } from "../common/site_registry_storage.mjs";
import { isChrome, isFirefox, isSafari } from "../common/browser_check.mjs";
import { logDebug } from "/base/core/log_debug.mjs";

async function injectContentScriptsIntoExistingTab(tab, contentScriptJs) {
  logDebug("injectContentScriptsIntoExistingTab, tab is:", tab);
  logDebug("injectContentScriptsIntoExistingTab, contentScriptJs is:", contentScriptJs);

  try {
    // First, check if content script is already there to avoid double-loading
    await chrome.tabs.sendMessage(tab.id, { ping: true });
  } catch (e) {
    // If the ping fails, the script isn't there, so inject it!
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: contentScriptJs,
      });
    } catch (error) {
      if (error.message.includes("error page")) {
        console.warn(`Tab ${tab.id} is showing a browser error/resubmit page. Skipping injection.`);
        logDebug("tab is:", tab);
      } else {
        console.error(`Actual injection error on tab ${tab.id}:`, error);
        logDebug("tab is:", tab);
      }
      // We don't need to do anything else; just move to the next tab.
    }
  }
}

async function injectContentScriptsIntoTabsThatMatch(matches) {
  let contentScripts = await chrome.scripting.getRegisteredContentScripts();

  for (const origin of matches) {
    // Convert origin pattern (e.g., *://*.wikitree.com/*) to a query-friendly pattern

    // Find ALL tabs matching this site, NOTE: this will only get tabs that we have permission
    // to access, so if the user has not yet granted permission for a site then tabs on the site
    // will not be returned by the query.
    const tabs = await chrome.tabs.query({
      url: origin,
      status: "complete", // Only target fully loaded pages
      discarded: false, // Skip tabs suspended by Chrome's memory saver
    });

    if (tabs.length) {
      logDebug("injectContentScriptsIntoTabsThatMatch, found " + tabs.length + " tabs, matching " + origin);

      // Find the content scripts for that site
      let contentScriptJs = undefined;
      for (let contentScript of contentScripts) {
        logDebug("contentScript.matches is:", contentScript.matches);

        for (let match of contentScript.matches) {
          if (match == origin) {
            contentScriptJs = contentScript.js;
          }
        }
      }

      logDebug("contentScriptJs is:", contentScriptJs);

      if (contentScriptJs) {
        // Inject the script into every matching tab
        for (const tab of tabs) {
          await injectContentScriptsIntoExistingTab(tab, contentScriptJs);
        }
      }
    }
  }
}

async function injectContentScriptsIntoExistingTabs(contentScripts) {
  // this is only needed on Chrome and FireFox as Safari seems to do it automatically
  if (isSafari()) {
    return;
  }

  for (let contentScript of contentScripts) {
    logDebug("contentScript.matches is:", contentScript.matches);

    for (let match of contentScript.matches) {
      // Find ALL tabs matching this site, NOTE: this will only get tabs that we have permission
      // to access, so if the user has not yet granted permission for a site then tabs on the site
      // will not be returned by the query.
      const tabs = await chrome.tabs.query({
        url: match,
        status: "complete", // Only target fully loaded pages
        discarded: false, // Skip tabs suspended by Chrome's memory saver
      });

      if (tabs.length) {
        logDebug("injectContentScriptsIntoExistingTabs, found " + tabs.length + " tabs, matching " + match);

        let contentScriptJs = contentScript.js;

        if (contentScriptJs) {
          logDebug("contentScriptJs is:", contentScriptJs);

          // Inject the scripts into every matching tab
          for (const tab of tabs) {
            await injectContentScriptsIntoExistingTab(tab, contentScriptJs);
          }
        }
      }
    }
  }
}

async function registerContentScripts() {
  // including register_site_data.mjs above will have registered the site data in
  // a siteRegistry var in site_registry.mjs. But this is only in the background context.
  // To make it available to other contexts we put the site registry in local storage.
  await storeSiteRegistry();

  let commonPath = "base/browser/content/content_common.js";

  let scripts = [];

  let sites = await getSites();
  for (const siteName of Object.keys(sites)) {
    let siteData = sites[siteName];
    if (siteData) {
      let matches = siteData.matches;
      if (matches) {
        let id = siteName;
        let extractPath = "site/" + id + "/browser/" + id + "_extract_data.js";
        let contentScriptPath = "site/" + id + "/browser/" + id + "_content.js";
        let js = [extractPath, commonPath, contentScriptPath];
        let runAt = "document_idle";
        if (siteData.runAt) {
          runAt = siteData.runAt;
        }

        let script = { id: id, matches: matches, js: js, runAt: runAt };
        scripts.push(script);

        if (siteData.additionalContentScripts) {
          for (let contentScript of siteData.additionalContentScripts) {
            let runAt = "document_idle";
            if (contentScript.runAt) {
              runAt = contentScript.runAt;
            }
            let script = {
              id: contentScript.id,
              matches: contentScript.matches,
              js: contentScript.js,
              runAt: contentScript.runAt,
              allFrames: contentScript.allFrames,
            };
            scripts.push(script);
          }
        }
      }
    }
  }

  logDebug("registerContentScripts: about to call chrome.scripting.registerContentScripts, scripts is:", scripts);

  try {
    await chrome.scripting.registerContentScripts(scripts);
  } catch (error) {
    console.error(
      "registerContentScripts: chrome.scripting.registerContentScripts, caught exception. error is:",
      error
    );
  }

  // There may be existing tabs open and the extension has just been installed so we want to load the
  // content scripts into existing tabs that match
  await injectContentScriptsIntoExistingTabs(scripts);

  // if permissions are later granted by the user we want to inject the content script into existing tabs
  // that got the new permission
  chrome.permissions.onAdded.addListener(async (permissions) => {});
}

async function injectContentScriptsIntoTabsOnPermissionsChange(permissions) {
  // this is only needed on Chrome and Firefox as Safari seems to do it automatically
  if (isChrome() || isFirefox()) {
    // Identify which site was just granted
    const grantedOrigins = permissions.origins || [];

    if (grantedOrigins.length === 0) return;

    // Double-check if the browser ACTUALLY has these permissions now
    // Sometime on Firefox it will grant temporary permissions when you click the
    // extension icon and do not grant permissions
    const actuallyHasPermissions = await chrome.permissions.contains({
      origins: grantedOrigins,
    });

    if (!actuallyHasPermissions) {
      console.warn("Browser fired onAdded, but user did not grant permission. Aborting injection.");
      return;
    }

    logDebug("permissions added, permissions is:", permissions);

    await injectContentScriptsIntoTabsThatMatch(grantedOrigins);
  }
}

export { registerContentScripts, injectContentScriptsIntoTabsOnPermissionsChange };
