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
import { logDebug } from "../../core/log_debug.mjs";

// Helper to convert Chrome Match Patterns to Regex
// This tests whether a match pattern from a registered content script matches
// a match pattern from a granted permission
function doesContentScriptOriginMatchGrantedOrigin(contentStringOrigin, grantedOrigin) {
  if (grantedOrigin === "<all_urls>") return true;

  let testUrl = contentStringOrigin.replace(/\*/g, "test");

  // Prepare the pattern by escaping special regex characters except *
  let regexString = grantedOrigin
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape all regex specials
    .replace(/\*/g, ".*"); // Convert * to .*

  const regex = new RegExp(`^${regexString}$`);
  return regex.test(testUrl);
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

async function injectContentScriptsIntoExistingTab(tab, contentScriptJs, allFrames) {
  logDebug(`tab.id is: ${tab.id}, tab.url is: ${tab.url}`);
  logDebug("contentScriptJs is:", contentScriptJs);

  let shouldInject = false;

  try {
    // First, check if content script is already there to avoid double-loading
    await chrome.tabs.sendMessage(tab.id, { type: "ping" });

    // it might look like this check make no difference but using the response
    // ensures a "full handshake". Without this check, when there are multiple tabs
    // open on the same page, it can proceed with no error, implying that the
    // script if already loaded when it is not.
    if (response && response.success) {
      logDebug(`Tab ${tab.id} already has the script.`);
      shouldInject = false;
    } else {
      logDebug(`Ping succeeded for tab ${tab.id} may already have the script but no response.`);
      shouldInject = true;
    }
  } catch (e) {
    // If the ping fails, the script isn't there, so inject it!
    logDebug(`Tab ${tab.id} failed SendMessage - should inject`);
    shouldInject = true;
  }

  if (shouldInject) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: allFrames || false },
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

async function injectContentScriptsIntoExistingTabFrame(tab, contentScriptJs, frameId) {
  logDebug("tab is:", tab);
  logDebug("contentScriptJs is:", contentScriptJs);

  let shouldInject = false;

  try {
    // First, check if frame content script is already there to avoid double-loading
    await chrome.tabs.sendMessage(tab.id, { type: "framePing" }, { frameId: frameId });

    // it might look like this check make no difference but using the response
    // ensures a "full handshake". Without this check, when there are multiple tabs
    // open on the same page, it can proceed with no error, implying that the
    // script if already loaded when it is not.
    if (response && response.success) {
      logDebug(`Frame ${frameId} in tab ${tab.id} already has the script.`);
      shouldInject = false;
    } else {
      logDebug(`Ping succeeded for Frame ${frameId} in tab ${tab.id} may already have the script but no response.`);
      shouldInject = true;
    }
  } catch (e) {
    logDebug(`Frame ${frameId} in tab ${tab.id} failed SendMessage - should inject`);
    shouldInject = true;
  }

  if (shouldInject) {
    // If the ping fails, the script isn't there, so inject it!
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, frameIds: [frameId] }, // Target ONLY this frame
        files: contentScriptJs,
      });
      logDebug(`Successfully injected into frame ${frameId} of tab ${tab.id}`);
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

async function injectContentScriptsIntoTabsThatMatch(grantedOrigins) {
  logDebug("grantedOrigins ", grantedOrigins);

  let contentScripts = await chrome.scripting.getRegisteredContentScripts();

  let injectedScripts = new Map();

  for (const originPattern of grantedOrigins) {
    // Find ALL tabs matching this site, NOTE: this will only get tabs that we have permission
    // to access, so if the user has not yet granted permission for a site then tabs on the site
    // will not be returned by the query.
    const tabs = await chrome.tabs.query({
      url: originPattern,
      status: "complete", // Only target fully loaded pages
      discarded: false, // Skip tabs suspended by Chrome's memory saver
    });

    if (tabs.length) {
      logDebug("injectContentScriptsIntoTabsThatMatch, found " + tabs.length + " tabs, matching " + originPattern);

      for (const tab of tabs) {
        // Find the content scripts for that site
        for (let contentScript of contentScripts) {
          if (!injectedScripts.has(tab.id)) {
            injectedScripts.set(tab.id, []);
          }
          let alreadyInjectedScripts = injectedScripts.get(tab.id);
          if (!alreadyInjectedScripts.includes(contentScript)) {
            for (let match of contentScript.matches) {
              if (contentScript.allFrames) {
                // using "allFrames" as an indicator to target only matching frames
                const frameResults = await chrome.scripting.executeScript({
                  target: { tabId: tab.id, allFrames: true },
                  func: () => {
                    return { url: window.location.href };
                  },
                });

                for (const frame of frameResults) {
                  // Check if frame.result exists and has a url property
                  if (frame.result && frame.result.url) {
                    const frameUrl = frame.result.url;
                    const frameId = frame.frameId;

                    // Only inject if this specific frame matches the script's pattern
                    if (doesUrlMatchChromePattern(match, frameUrl)) {
                      logDebug(
                        `Match found: Injecting ${contentScript.id} into frame ${frameId} of tab ${tab.id}: ${tab.url}`
                      );

                      await injectContentScriptsIntoExistingTabFrame(tab, contentScript.js, frameId);
                      alreadyInjectedScripts.push(contentScript.js);
                      break;
                    }
                  }
                }
              } else {
                if (doesUrlMatchChromePattern(match, tab.url)) {
                  logDebug(`Match found: Injecting ${contentScript.id} into tab ${tab.id}: ${tab.url}`);

                  await injectContentScriptsIntoExistingTab(tab, contentScript.js, false);
                  alreadyInjectedScripts.push(contentScript.js);
                  break;
                }
              }
            }
          } else {
            logDebug(`For tab ${tab.id}, this contentScript was alreaded injected`, contentScript);
          }
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

  let siteRegistry = await getSites();

  for (let contentScript of contentScripts) {
    let site = siteRegistry[contentScript.id];

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
            if (contentScript.allFrames) {
              // using "allFrames" as an indicator to target only matching frames
              const frameResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                func: () => {
                  return { url: window.location.href };
                },
              });

              for (const frame of frameResults) {
                // Check if frame.result exists and has a url property
                if (frame.result && frame.result.url) {
                  const frameId = frame.frameId;
                  await injectContentScriptsIntoExistingTabFrame(tab, contentScript.js, frameId);
                }
              }
            } else {
              await injectContentScriptsIntoExistingTab(tab, contentScript.js, false);

              // this site has additionalContentScripts. If they have allFrames set then
              // they are probably to be inserted into iFrames. The iFrame URL
              // will not match the tab URL.
              if (site.additionalContentScripts) {
                for (let additionalScript of site.additionalContentScripts) {
                  if (additionalScript.allFrames) {
                    const frameResults = await chrome.scripting.executeScript({
                      target: { tabId: tab.id, allFrames: true },
                      func: () => {
                        return { url: window.location.href };
                      },
                    });

                    for (const frame of frameResults) {
                      // Check if frame.result exists and has a url property
                      if (frame.result && frame.result.url) {
                        const frameId = frame.frameId;
                        const frameUrl = frame.result.url;
                        for (let additionalMatch of additionalScript.matches) {
                          if (doesUrlMatchChromePattern(additionalMatch, frameUrl)) {
                            await injectContentScriptsIntoExistingTabFrame(tab, additionalScript.js, frameId);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
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
        if (siteData.additionalContentJsFiles) {
          for (let addJs of siteData.additionalContentJsFiles) {
            let addJsPath = "site/" + id + "/browser/" + addJs + ".js";
            js.push(addJsPath);
          }
        }

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
              runAt: runAt,
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
