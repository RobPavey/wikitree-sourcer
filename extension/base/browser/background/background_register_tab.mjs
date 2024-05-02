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

var siteRegistry = {};

function handleRegisterTabMessage(request, sender, sendResponse) {
  console.log("WikiTree Sourcer, background script, received registerTab message");

  console.log(
    "WikiTree Sourcer, background script, sender.tab.id is: " + sender.tab.id + ", siteName is: " + request.siteName
  );

  let tab = sender.tab.id;

  let siteName = request.siteName;

  siteRegistry[siteName] = tab;

  let response = { success: true, tab: tab };
  console.log("WikiTree Sourcer, background script, sending response to registerTab message:");
  console.log(response);
  sendResponse(response);
}

function handleGetRegisteredTabMessage(request, sender, sendResponse) {
  console.log("WikiTree Sourcer, background script, received getRegisteredTab message");

  console.log("WikiTree Sourcer, background script, siteName is: " + request.siteName);

  let siteName = request.siteName;

  let tab = siteRegistry[siteName];

  let response = { success: false };

  if (tab) {
    response = { success: true, tab: tab };
  }

  console.log("WikiTree Sourcer, background script, sending response to getRegisteredTab message:");
  console.log(response);
  sendResponse(response);
}

export { handleRegisterTabMessage, handleGetRegisteredTabMessage };
