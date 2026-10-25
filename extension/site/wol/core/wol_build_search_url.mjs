/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { WolUriBuilder } from "./wol_uri_builder.mjs";
import { buildNameVariants } from "./wol_name_variants.mjs";

function quote(name) {
  return '"' + name.replace(/"/g, "") + '"';
}

// The typeOfSearch can be "name:<name to search for>" to search for one of the variants of the name.
// Otherwise the search is for the first name and current last name. If the option is set, and the last name at birth
// is different, then the first name and last name at birth is also searched for.
// Each name is searched for as an exact phrase. The library has the operator "|" for "or".
function buildQuery(gd, typeOfSearch, options) {
  if (typeOfSearch && typeOfSearch.startsWith("name:")) {
    return quote(typeOfSearch.substring(5));
  }

  const variants = buildNameVariants(gd);
  if (variants.length == 0) {
    const fullName = gd.inferFullName();
    return fullName ? quote(fullName) : "";
  }

  let names = [variants[0].name];
  if (options && options.search_wol_includeBirthName) {
    const birthVariant = variants.find((variant) => variant.label == "last name at birth");
    if (birthVariant) {
      names.push(birthVariant.name);
    }
  }
  return names.map(quote).join(" | ");
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  const language = options && options.search_wol_language ? options.search_wol_language : "en";
  var builder = new WolUriBuilder(language);

  builder.addQuery(buildQuery(gd, buildUrlInput.typeOfSearch, options));
  builder.addProximity("par");
  builder.addSort("occ");
  builder.addScope("a");

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
