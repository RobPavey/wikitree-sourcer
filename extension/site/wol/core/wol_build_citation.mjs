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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { formatIssueDate, getPublicationTitle } from "./wol_ed_utils.mjs";

// A citation looks like this, e.g. for an article in The Watchtower:
//  "Deliverance! Proving Ourselves Grateful" (as told by Max Liebster)
//  ''The Watchtower Announcing Jehovah’s Kingdom''; 1 October 1978; pp. 20-24
//  [https://www.jw.org/finder?wtlocale=E&docid=1978726&srctype=wol&srcid=share Watchtower Online Library] (accessed 25 October 2026).

function buildWolUrl(ed, builder) {
  const options = builder.getOptions();
  if (options.citation_wol_linkType == "page" && ed.pageUrl) {
    return ed.pageUrl;
  }
  // The share link is the link that the library gives for the document. If it is not on the page then
  // the link that the library uses for a document in the library of the page is the best that can be done.
  if (ed.shareUrl) {
    return ed.shareUrl;
  }
  if (ed.pageUrl) {
    return ed.pageUrl;
  }
  return ed.url;
}

// e.g. "Deliverance! Proving Ourselves Grateful" (as told by Max Liebster)
// or   “A Beam of Light in a Dark Age” (by Awake! correspondent in Germany)
// The byline is not always a person so it is in parentheses, as it is on the page, rather than in front as an author.
function buildSourceTitle(ed, gd, builder) {
  // Some titles are a quotation and already have the quotation marks, e.g. “Oh, Jehovah, Keep My Young Girl Faithful!”
  const titleHasQuotes = /^[\u201c"\u00ab]/.test(ed.title);
  let sourceTitle = titleHasQuotes ? ed.title : '"' + ed.title + '"';

  if (ed.bylineName) {
    sourceTitle += (ed.bylineType == "told by" ? " (as told by " : " (by ") + ed.bylineName + ")";
  }

  builder.sourceTitle = sourceTitle;
  builder.putSourceTitleInQuotes = false;
}

// e.g. ''The Watchtower Announcing Jehovah’s Kingdom''; 1 October 1978; pp. 20-24
// or   ''Jehovah’s Witnesses—Proclaimers of God’s Kingdom''; chap. 22; pp. 444-461
function buildSourceReference(ed, gd, builder) {
  const publicationTitle = getPublicationTitle(ed);
  if (publicationTitle && publicationTitle != ed.title) {
    builder.addSourceReferenceText("''" + publicationTitle + "''");
  }

  builder.addSourceReferenceText(formatIssueDate(ed.issue));

  // The reference on the page has "chap." if the document is a chapter, otherwise the number is something else,
  // e.g. an article number. The word is only recognized in English.
  if (ed.chapterNumber && ed.pubReference && /\bchap\./.test(ed.pubReference)) {
    builder.addSourceReferenceText("chap. " + ed.chapterNumber);
  }

  if (ed.firstPage) {
    if (ed.lastPage && ed.lastPage != ed.firstPage) {
      builder.addSourceReferenceText("pp. " + ed.firstPage + "-" + ed.lastPage);
    } else {
      builder.addSourceReferenceText("p. " + ed.firstPage);
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  const wolUrl = buildWolUrl(ed, builder);
  builder.recordLinkOrTemplate = "[" + wolUrl + " Watchtower Online Library]";
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
