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

import { RT } from "../../../base/core/record_type.mjs";

// One definition drives classification, fields, headings and attributed narratives.
const noticeTypes = [
  { key: "mention", label: "General mention", heading: "Newspaper Mention", phrase: "was mentioned", event: "" },
  {
    key: "engagement",
    label: "Engagement notice",
    heading: "Engagement Notice",
    phrase: "was named in an engagement notice",
    event: "engagement",
    couple: true,
  },
  {
    key: "marriage",
    label: "Marriage notice",
    heading: "Marriage Notice",
    phrase: "was named in a marriage notice",
    event: "marriage",
    couple: true,
  },
  {
    key: "deathNotice",
    label: "Death notice",
    heading: "Death Notice",
    phrase: "was named in a death notice",
    event: "death",
  },
  {
    key: "deathListing",
    label: "Death listing",
    heading: "Death Listing",
    phrase: "was listed among the deaths reported",
    event: "death",
  },
  { key: "obituary", label: "Obituary", heading: "Obituary", phrase: "was the subject of an obituary", event: "death" },
];
const bookType = {
  key: "book",
  label: "Book",
  heading: "Book",
  phrase: "was mentioned",
  event: "",
  recordType: RT.Book,
};
function getNoticeType(materialType, key) {
  if (materialType === "book") return bookType;
  return { ...(noticeTypes.find((type) => type.key === key) || noticeTypes[0]), recordType: RT.Newspaper };
}
function normalizeName(name) {
  return (name || "").normalize("NFC").replace(/\s+/g, " ").trim().toLocaleLowerCase("nb");
}
function cleanText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}
function escapeText(value) {
  return cleanText(value).replace(/[&<>\[\]{}|]/g, (char) => "&#" + char.charCodeAt(0) + ";");
}
export { noticeTypes, getNoticeType, normalizeName, cleanText, escapeText };
