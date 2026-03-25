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

function getBrowserName() {
  const url = (typeof browser !== "undefined" ? browser : chrome).runtime.getURL("");

  // these checks should succeeded in most cases, but in case they don't
  // we have the userAgent fallback at the end.
  if (url.startsWith("moz-extension://")) return "Firefox";
  if (url.startsWith("safari-web-extension://")) return "Safari";
  if (url.startsWith("chrome-extension://")) return "Chrome"; // Also covers Edge/Brave

  // URL checks did not work, so we will try some other checks.
  // Note that these are not 100% reliable but should work in most cases.
  // We will also check for Safari-specific legacy or global objects first
  // to avoid false positives from userAgent checks.

  // Check for Safari-specific legacy or global objects first
  if (typeof safari !== "undefined") return "Safari";

  // Check for Firefox via the 'browser' namespace
  // and specific internal sources (Chrome/Safari don't use 'moz-extension')
  if (typeof browser !== "undefined" && typeof chrome !== "undefined") {
    if (browser.runtime && chrome.runtime && !navigator.userAgent.includes("Chrome")) {
      return "Firefox";
    }
  }

  // fallback to userAgent checks if the above checks did not work.
  // Note that these are not 100% reliable but should work in most cases.
  if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else if (navigator.userAgent.indexOf("MSIE") != -1 || !!document.documentMode == true) {
    //IF IE > 10
    return "IE";
  } else {
    return "unknown";
  }
}

function isSafari() {
  //console.log("navigator.userAgent is:");
  //console.log(navigator.userAgent);
  let browserName = getBrowserName();
  //console.log("browserName is:");
  //console.log(browserName);
  const isSafariBrowser = browserName == "Safari";
  return isSafariBrowser;
}

function isSafariOnMacOs() {
  const isSafariBrowser = isSafari();

  if (isSafariBrowser) {
    // On my Mac userAgent is:
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15 (options.mjs, line 356)
    // Note that it will be the same in the ios simulator but on an actual iOS device it will be different.
    const isMacOSWebKit = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent);
    if (isMacOSWebKit) {
      return true;
    }
  }

  return false;
}

function isSafariOnIos() {
  const isSafariBrowser = isSafari();

  if (isSafariBrowser) {
    // On iPhone simulator userAgent is:
    // Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1
    // Note that it will be the same in the ios simulator but on an actual iOS device it will be different.
    let userAgent = navigator.userAgent;
    const isIos = /iPhone/.test(userAgent) || /iPad/.test(userAgent);
    if (isIos) {
      return true;
    }
  }

  return false;
}

function isFirefox() {
  let browserName = getBrowserName();
  const isFirefoxBrowser = browserName == "Firefox";
  return isFirefoxBrowser;
}

function isChrome() {
  let browserName = getBrowserName();
  const isChromeBrowser = browserName == "Chrome";
  return isChromeBrowser;
}

export { getBrowserName, isSafari, isSafariOnMacOs, isSafariOnIos, isFirefox, isChrome };
