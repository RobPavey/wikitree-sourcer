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

// The only purpose of this script is to work around a subtle bug in Safari
// When the only script in background.html is of type module then the script
// will not be run unless the extension is installed or re-enabled during
// that run of Safari. Having a script that is not of type module in
// background.html seems to work around the bug, but it needs to install its own
// handler.
// Note that this script is not used on Chrome because that version doesn't
// use background.html at all.

function temporaryBootstrapHandler(request, sender, sendResponse) {
  console.log("background temporaryBootstrapHandler, request is: ");
  console.log(request);

  chrome.runtime.onMessage.removeListener(temporaryBootstrapHandler);
}

chrome.runtime.onMessage.addListener(temporaryBootstrapHandler);

//console.log("background_bootstrap top level");
