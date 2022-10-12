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

function handleContentLoadedMessage(request, sender, sendResponse, setPopup, setIcon) {
  //console.log("WikiTree Sourcer, background script, received contentLoaded message");

  //console.log("WikiTree Sourcer, background script, sender.tab.id is: " + sender.tab.id + ", siteName is: " + request.siteName);

  let tab = sender.tab.id;

  let siteName = request.siteName;
  let popupName = "/site/" + siteName + "/browser/" + siteName + "_popup.html";
  setPopup(tab, popupName);

  if (request.prefersDark) {
    setIcon(tab, {
      16: "/images/wts_active_dark_16.png",
      32: "/images/wts_active_dark_32.png",
      48: "/images/wts_active_dark_48.png",
    });
  } else {
    setIcon(tab, {
      16: "/images/wts_active_light_16.png",
      32: "/images/wts_active_light_32.png",
      48: "/images/wts_active_light_48.png",
    });
  }

  //chrome.action.setBadgeText({ tabId: tab, text: "WT"});
  //chrome.action.setBadgeBackgroundColor({ tabId: tab, color: "#8FC642"});

  let response = { success: true, popupName: popupName, tab: tab };
  //console.log("WikiTree Sourcer, background script, sending response to contentLoaded message:");
  //console.log(response);
  sendResponse(response);
}

export { handleContentLoadedMessage };
