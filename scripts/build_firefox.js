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

import fs from "fs";

import child_process from "child_process";

function deleteFolder(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyFolder(src, dst) {
  fs.cpSync(src, dst, { recursive: true });
}

function createPackage() {
  // from: https://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
  const zipPath = "browser_variants/firefox.zip";
  if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath);
  }
  // child_process.execSync(`zip -r ../firefox.zip * -x "*.DS_Store"`, {
  child_process.execSync(`7z a -r ../firefox.zip * -xr!*.DS_Store`, {
    cwd: "browser_variants/firefox",
  });
}

function buildFirefox() {
  const firefoxPath = "browser_variants/firefox";
  const extensionPath = "extension";

  const ffBasePath = firefoxPath + "/" + "base";
  const ffSitePath = firefoxPath + "/" + "site";

  deleteFolder(ffBasePath);
  deleteFolder(ffSitePath);

  const extBasePath = extensionPath + "/" + "base";
  const extSitePath = extensionPath + "/" + "site";

  copyFolder(extBasePath, ffBasePath);
  copyFolder(extSitePath, ffSitePath);

  createPackage();
}

buildFirefox();
