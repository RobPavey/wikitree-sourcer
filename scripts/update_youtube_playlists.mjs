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

// Regenerates the playlist table used by the YouTube site from the source of the WikiTree
// YouTube template (https://www.wikitree.com/wiki/Template:YouTube).
//
// Usage:
//   1. Copy the source of the template from its WikiTree edit page into a file
//   2. node scripts/update_youtube_playlists.mjs <file>        (or pipe the source in on stdin)
//
// This rewrites the wikiTreePlaylists array in extension/site/youtube/core/youtube_playlists.mjs.
// The rest of that file is left alone. Use "git diff" to see what changed.
//
// The table is read from the first #switch that follows "&list=" in the template, which maps
// playlist=<key> to a playlist ID. Lines in it look like:
//   |Hacktoberfest2026=PLEqK4ICkQWXRBBVI7xaL0AIIPck_x0TcC
// The #default line is ignored. If a key appears twice the first one is used, since that is what
// the template's #switch does.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const playlistsFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../extension/site/youtube/core/youtube_playlists.mjs"
);

const switchStartMarker = /&list=\{\{#switch:\s*\{\{\{playlist\|\}\}\}/;

function fail(message) {
  console.error("Error: " + message);
  process.exit(1);
}

function readTemplateSource() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    if (process.stdin.isTTY) {
      fail("Pass the path of a file containing the template source, or pipe the source in on stdin.");
    }
    return fs.readFileSync(0, "utf8");
  }
  if (!fs.existsSync(inputPath)) {
    fail("File not found: " + inputPath);
  }
  return fs.readFileSync(inputPath, "utf8");
}

// Returns the part of the template source containing the playlist key to ID switch
function extractIdSwitch(source) {
  const startMatch = source.match(switchStartMarker);
  if (!startMatch) {
    fail('Could not find "&list={{#switch:{{{playlist|}}}" in the template source.');
  }
  const afterStart = source.substring(startMatch.index + startMatch[0].length);

  // the switch ends at its #default line, or failing that at the closing braces
  const endMatch = afterStart.match(/\|\s*#default|\}\}/);
  return endMatch ? afterStart.substring(0, endMatch.index) : afterStart;
}

function parsePlaylists(switchText) {
  const playlists = [];
  const seenKeys = new Set();
  const keysByNewId = new Map();

  // Cases are separated by "|" at the start of a line (the first one may follow the opening braces)
  for (const line of switchText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const match = trimmed.match(/^\|\s*([^=|]+?)\s*=\s*(\S+)$/);
    if (!match) {
      console.warn("Skipping line that is not a playlist case: " + trimmed);
      continue;
    }
    const key = match[1];
    const id = match[2];

    if (!/^PL[\w-]+$/.test(id)) {
      console.warn("Skipping " + key + ": '" + id + "' does not look like a playlist ID");
      continue;
    }
    if (seenKeys.has(key)) {
      console.warn("Skipping duplicate key " + key + " (the template uses the first one)");
      continue;
    }
    seenKeys.add(key);

    if (keysByNewId.has(id)) {
      console.warn(
        "Note: " + key + " has the same ID as " + keysByNewId.get(id) + ", so " + keysByNewId.get(id) + " will be used"
      );
    } else {
      keysByNewId.set(id, key);
    }

    playlists.push({ key: key, id: id });
  }

  return playlists;
}

function buildArrayText(playlists) {
  let text = "const wikiTreePlaylists = [\n";
  for (const playlist of playlists) {
    text += "  { key: " + JSON.stringify(playlist.key) + ", id: " + JSON.stringify(playlist.id) + " },\n";
  }
  text += "];";
  return text;
}

function summarizeChanges(oldText, newPlaylists) {
  const oldPlaylists = new Map();
  for (const match of oldText.matchAll(/\{ key: "([^"]*)", id: "([^"]*)" \}/g)) {
    oldPlaylists.set(match[1], match[2]);
  }

  let added = 0;
  let changed = 0;
  for (const playlist of newPlaylists) {
    if (!oldPlaylists.has(playlist.key)) {
      console.log("  added   " + playlist.key);
      added++;
    } else if (oldPlaylists.get(playlist.key) != playlist.id) {
      console.log("  changed " + playlist.key + " (" + oldPlaylists.get(playlist.key) + " -> " + playlist.id + ")");
      changed++;
    }
    oldPlaylists.delete(playlist.key);
  }
  for (const key of oldPlaylists.keys()) {
    console.log("  removed " + key);
  }
  console.log(
    "Playlists: " +
      newPlaylists.length +
      " (" +
      added +
      " added, " +
      changed +
      " changed, " +
      oldPlaylists.size +
      " removed)"
  );
}

function updatePlaylistsFile(playlists) {
  const oldText = fs.readFileSync(playlistsFile, "utf8");
  const arrayMatch = oldText.match(/const wikiTreePlaylists = \[[\s\S]*?\n\];/);
  if (!arrayMatch) {
    fail("Could not find the wikiTreePlaylists array in " + playlistsFile);
  }

  summarizeChanges(oldText, playlists);

  const newText = oldText.replace(arrayMatch[0], () => buildArrayText(playlists));
  if (newText == oldText) {
    console.log("No changes needed.");
    return;
  }
  fs.writeFileSync(playlistsFile, newText);
  console.log("Updated " + path.relative(process.cwd(), playlistsFile));
}

const switchText = extractIdSwitch(readTemplateSource());
const playlists = parsePlaylists(switchText);
if (playlists.length == 0) {
  fail("No playlists found in the template source.");
}
updatePlaylistsFile(playlists);
