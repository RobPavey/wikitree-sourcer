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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

function buildMatriculaUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let title = "";
  const components = ed.path_components;
  for (let i = components.length - 1; i >= 0; i--) {
    title += ", " + components[i];
  }

  builder.sourceTitle += title.substring(2);
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = ed.book;
  if (ed.page) {
    builder.sourceReference += ", Page " + ed.page;
  }
}

function buildRecordLink(ed, gd, builder) {
  var matriculaUrl = buildMatriculaUrl(ed, builder);

  let recordLink = "[" + matriculaUrl + " Matricula Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function customRecordTypeFunction(ed, gd) {
  if (ed.type_set) {
    return ed.type_set;
  }
  return "Churchbook";
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, customRecordTypeFunction);
}

export { buildCitation };
