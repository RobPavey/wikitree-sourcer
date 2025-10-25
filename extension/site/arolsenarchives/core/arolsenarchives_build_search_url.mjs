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

import { ArolsenarchivesUriBuilder } from "./arolsenarchives_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new ArolsenarchivesUriBuilder();

  // call methods on builder here

  let text = "";
  if (gd.name && gd.name.forenames) {
    text += " " + gd.name.forenames;
  }
  if (gd.name && gd.name.firstNames) {
    text += " " + gd.name.firstNames;
  }
  if (gd.name && gd.name.lastName) {
    text += " " + gd.name.lastName;
  }
  if (gd.birthDate && gd.birthDate.dateString) {
    text += " " + gd.birthDate.dateString.substring(gd.birthDate.dateString.lastIndexOf(" ") + 1);
  }

  if (text) {
    builder.addSearchTerm("s=" + text.substring(1));
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
