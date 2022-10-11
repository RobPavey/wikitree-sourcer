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

import { NpUriBuilder } from "./np_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const options = buildUrlInput.options;

  var builder = new NpUriBuilder();

  console.log(data.inferLastName());
  builder.addSearchParameter(
    "query",
    (data.inferFirstName() ?? "") +
      " " +
      (data.inferMiddleName() ?? "") +
      " " +
      (data.inferLastName() ?? "")
  );

  let birthYear = data.inferBirthYear();
  let deathYear = data.inferDeathYear();
  if (birthYear && deathYear) {
    builder.addSearchParameter("dr_year", birthYear + "-" + deathYear);
  } else if (birthYear) {
    builder.addSearchParameter("dr_year", birthYear + "-" + (birthYear + 80));
  } else if (deathYear) {
    builder.addSearchParameter("dr_year", deathYear - 80 + "-" + deathYear);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
