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

const debugConfig = {
  enabled: false,

  // List function names here to only see their logs. Keep empty [] to show all.
  allowedFunctions: ["getApiPersonFromGetRelatives", "setupFsPopupMenu", "determineSiteNameForTab", "anonymous"],
  // List file names like 'freebmd_ed_reader.mjs" here to only see their logs. Keep empty [] to show all.
  allowedFiles: ["popup_init.mjs", "popup.mjs", "popup_permissions.mjs", "background_context_menu.mjs"],

  showTimestamp: false,
  showDebugText: false,
  showFunctionOrFileName: true,
};

function logDebug(...args) {
  if (!debugConfig.enabled) return;

  // check if we are in a production environment in the browser.
  // (if not in browser we are NOT in production)
  // NOTE: This is just a safety catch in case we forget to turn off debugConfig.enabled
  if (typeof chrome === "object") {
    // we are in browser
    var manifest = chrome.runtime.getManifest();
    if (!manifest) {
      return; // not sure assume production
    }

    let isDev = typeof manifest.key == "undefined" && typeof manifest.update_url == "undefined";
    if (!isDev) {
      return;
    }
  }

  // 1. Capture stack trace
  const stack = new Error().stack;
  if (!stack) return;

  // 2. Parse caller name (works for standard function declarations)
  // Most engines put the caller on the 3rd line of the stack trace
  const lines = stack.split("\n");
  const callerLine = lines[2] || lines[1] || "";

  //console.log("logDebug, callerLine = " + callerLine);

  // Regex to extract function name from "at FunctionName (file.js:0:0)"
  // or "FunctionName@file.js:0:0"
  const match = callerLine.match(/at\s+([^(\s]+)\s+\(/) || callerLine.match(/([^@]+)@/);
  const callerName = match ? match[1] : "anonymous";

  //console.log("logDebug, callerName = " + callerName);

  // Regex to extract file name from callerLine
  const lineRegexForBrowser = /-extension\:.+\/([a-z_]+\.m?js)\:(\d+)\:\d+/;
  const lineRegexForNodeJs = /file\:.+\/([a-z_]+\.m?js)\:(\d+)\:\d+/;
  let callerFile = "unknown";
  let callerLineNumber = "0";

  if (lineRegexForBrowser.test(callerLine)) {
    const fileMatch = callerLine.match(lineRegexForBrowser);
    if (fileMatch.length == 3) {
      callerFile = fileMatch[1];
      callerLineNumber = fileMatch[2];
    }
  } else if (lineRegexForNodeJs.test(callerLine)) {
    const fileMatch = callerLine.match(lineRegexForNodeJs);
    if (fileMatch.length == 3) {
      callerFile = fileMatch[1];
      callerLineNumber = fileMatch[2];
    }
  }

  //console.log("logDebug, callerFile = " + callerFile);
  //console.log("logDebug, callerLineNumber = " + callerLineNumber);

  if (callerFile == "unknown") {
    // console.log("unknown caller file, stack is:", stack);
  }

  // 3. Filter and Log
  let isAllowed = debugConfig.allowedFunctions.length === 0 || debugConfig.allowedFunctions.includes(callerName);

  if (!isAllowed) {
    isAllowed = debugConfig.allowedFiles.length === 0 || debugConfig.allowedFiles.includes(callerFile);
  }

  const nameToDisplay = callerName != "anonymous" ? callerName : callerFile + ":" + callerLineNumber;

  if (isAllowed) {
    let textString = debugConfig.showTimestamp ? `[${new Date().toISOString()}]` : "";
    if (debugConfig.showDebugText) {
      textString += " [DEBUG]";
      textString.trim();
    }
    if (debugConfig.showFunctionOrFileName) {
      textString += ` [${nameToDisplay}]`;
      textString.trim();
    }

    console.log(textString, ...args);
  }
}

export { logDebug };
