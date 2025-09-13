<?php
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

/*
   How to use this script:
   * On the command line, change to the directory containing this file.
   * Run `php -S localhost:8000`
   * Open http://localhost:8000/show_test_ref_citations.php in a web browser
   
   If you need to install php: https://www.php.net/manual/en/install.php
*/

function getSitesAll() {
    $base = realpath(__DIR__ . '/../unit_tests');
    $dirs = [];
    if (is_dir($base)) {
        foreach (scandir($base) as $d) {
            if ($d !== '.' && $d !== '..' && is_dir("$base/$d")) {
                $dirs[] = $d;
            }
        }
    }
    return $dirs;
}

// AJAX: return sites that have ../unit_tests/<site>/citations/<src>/ with at least one .json
if (isset($_GET['action']) && $_GET['action'] === 'listSites' && isset($_GET['src'])) {
    $src = basename($_GET['src']);
    $base = realpath(__DIR__ . '/../unit_tests');
    $sites = [];
    if ($base && is_dir($base)) {
        foreach (scandir($base) as $d) {
            if ($d === '.' || $d === '..') continue;
            $candidate = realpath(__DIR__ . "/../unit_tests/$d/citations/$src");
            if ($candidate && is_dir($candidate)) {
                // require at least one .json file
                $has = false;
                foreach (glob("$candidate/*.json") as $f) { $has = true; break; }
                if ($has) $sites[] = $d;
            }
        }
    }
    header('Content-Type: application/json');
    echo json_encode($sites);
    exit;
}

// AJAX: list tests for site/src
if (isset($_GET['site'], $_GET['src'], $_GET['action']) && $_GET['action'] === 'listTests') {
    $site = basename($_GET['site']);
    $src = basename($_GET['src']);
    $dir = realpath(__DIR__ . "/../unit_tests/$site/citations/$src");
    error_log("listTests: site=$site, src=$src, dir=$dir");
    $files = [];
    if ($dir && is_dir($dir)) {
        foreach (glob("$dir/*.json") as $f) {
            $files[] = basename($f, ".json");
        }
    }
    header('Content-Type: application/json');
    echo json_encode($files);
    exit;
}

// AJAX: load one test file
if (isset($_GET['site'], $_GET['src'], $_GET['test'], $_GET['action']) && $_GET['action'] === 'loadTest') {
    $site = basename($_GET['site']);
    $src  = basename($_GET['src']);
    $test = basename($_GET['test']);
    $file = realpath(__DIR__ . "/../unit_tests/$site/citations/$src/$test.json");
    if ($file && file_exists($file)) {
        header('Content-Type: application/json');
        echo file_get_contents($file);
    } else {
        header('Content-Type: application/json');
        echo json_encode([]);
    }
    exit;
}

// (Optional) server-side list of all sites (not used by client when listSites is active)
$sitesAll = getSitesAll();
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Citations Unit Test Browser</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    label { margin-right: 8px; display:inline-block; min-width: 60px; }
    select { margin-right: 20px; }
    ul { margin-top: 10px; }
    li { margin-bottom: 5px; }
    h3 { margin-top: 18px; }
    #results p { margin:6px 0 10px 0; }
  </style>
</head>
<body>
  <h1>Citations Unit Test Browser</h1>

  <label for="src">Source:</label>
  <select id="src">
    <option value="ref" selected>ref</option>
    <option value="test">test</option>
  </select>

  Test variants style:
  <label>
    <input type="radio" name="style" value="i" checked>
    <i>Italic</i>
  </label>
  <label>
    <input type="radio" name="style" value="b">
    <b>Bold</b>
  </label>
  <label>
    <input type="radio" name="style" value="">
    None
  </label>
  <br><br>

  <label for="site">Site:</label>
  <select id="site">
    <option value="">-- Select source first --</option>
  </select>

  <label for="test">Test:</label>
  <select id="test" disabled>
    <option value="All">All</option>
  </select>

  <label for="type">Type:</label>
  <select id="type">
    <option value="source">source</option>
    <option value="inline">inline</option>
    <option value="narrative">narrative</option>
  </select>

  <div id="results"></div>

<script>
// --- Wikitext rendering helpers (kept robust) ---
let refs = [];
let refsByName = {};

function renderFormatting(text) {
  if (!text) return '';
  // br
  text = text.replace(/<br\s*\/?>/gi, '<br>');
  // bold ('''...''')
  text = text.replace(/'''([\s\S]*?)'''/g, '<b>$1</b>');
  // italic (''...'')
  text = text.replace(/''([\s\S]*?)''/g, '<i>$1</i>');
  // [url text]
  text = text.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g,
                      '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>');
  // [url]
  text = text.replace(/\[(https?:\/\/[^\s\]]+)\]/g,
                      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

function renderCitation(text) {
  if (!renderCitation.active) {
    refs = [];
    refsByName = {};
    renderCitation.active = true;
  }
  if (!text) return '';

  // 1) full <ref ...>content</ref>  (handles multi-line content)
  text = text.replace(/<ref\b([^>]*)>([\s\S]*?)<\/ref>/gi, function(_, attrStr, note) {
    let nameMatch = attrStr.match(/name\s*=\s*"(.*?)"/i) || attrStr.match(/name\s*=\s*'(.*?)'/i);
    if (nameMatch) {
      let name = nameMatch[1];
      if (name in refsByName) return `<sup>[${refsByName[name]}]</sup>`;
      refs.push(note);
      refsByName[name] = refs.length;
      return `<sup>[${refsByName[name]}]</sup>`;
    } else {
      refs.push(note);
      return `<sup>[${refs.length}]</sup>`;
    }
  });

  // 2) self-closing <ref ... />  (e.g. <ref name="x" />)
  text = text.replace(/<ref\b([^>]*)\/>/gi, function(_, attrStr) {
    let nameMatch = attrStr.match(/name\s*=\s*"(.*?)"/i) || attrStr.match(/name\s*=\s*'(.*?)'/i);
    if (nameMatch) {
      let name = nameMatch[1];
      if (name in refsByName) return `<sup>[${refsByName[name]}]</sup>`;
      refs.push('');
      refsByName[name] = refs.length;
      return `<sup>[${refsByName[name]}]</sup>`;
    } else {
      refs.push('');
      return `<sup>[${refs.length}]</sup>`;
    }
  });

  // 3) Apply other formatting and links on the result
  return renderFormatting(text);
}

function appendReferences(container) {
  if (!refs || refs.length === 0) { renderCitation.active = false; return; }
  let h3 = document.createElement('h3');
  h3.textContent = 'References';
  container.appendChild(h3);
  let ol = document.createElement('ol');
  refs.forEach(r => {
    let li = document.createElement('li');
    // Render formatting inside the reference text (but DON'T process <ref> tags again)
    li.innerHTML = renderFormatting(r || '');
    ol.appendChild(li);
  });
  container.appendChild(ol);

  // Mark render pass finished so next UI update restarts refs.
  renderCitation.active = false;
}

// --- UI flow helpers ---

// Populate Site dropdown based on selected src (calls server action=listSites)
async function populateSites() {
  const src = document.getElementById('src').value;
  const siteSel = document.getElementById('site');
  const testSel = document.getElementById('test');

  const prevSite = siteSel.value;
  const prevTest = testSel.value;

  // reset results
  document.getElementById('results').innerHTML = '';

  if (!src) {
    siteSel.innerHTML = '<option value="">-- Select a site --</option>';
    testSel.innerHTML = '<option value="All">All</option>';
    testSel.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${window.location.pathname}?action=listSites&src=${encodeURIComponent(src)}`);
    const sites = await res.json();

    // build new Site options
    siteSel.innerHTML = '<option value="">-- Select a site --</option>';
    if (Array.isArray(sites) && sites.length) {
      sites.forEach(s => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = s;
        siteSel.appendChild(o);
      });
    } else {
      const o = document.createElement('option');
      o.value = '';
      o.textContent = '-- no sites found for "' + src + '" --';
      siteSel.appendChild(o);
    }

    // restore previous Site if still valid
    if (prevSite && sites.includes(prevSite)) {
      siteSel.value = prevSite;
      // update tests for this site
      await updateTests(); // this will also auto-load results
      // restore previous Test if still valid
      if (prevTest) {
        const testOptions = Array.from(testSel.options).map(opt => opt.value);
        if (testOptions.includes(prevTest)) {
          testSel.value = prevTest;
          await loadResults();
        }
      }
    } else {
      // reset Test if previous Site no longer exists
      testSel.innerHTML = '<option value="All">All</option>';
      testSel.disabled = true;
    }

  } catch (err) {
    console.error('populateSites error', err);
  }
}

// Populate Test dropdown for selected site & src. If a site is selected, automatically load results.
async function updateTests() {
  const site = document.getElementById('site').value;
  const src  = document.getElementById('src').value;
  const testSel = document.getElementById('test');
  testSel.innerHTML = '<option value="All">All</option>';
  document.getElementById('results').innerHTML = '';

  if (!site) {
    testSel.disabled = true;
    return;
  }
  try {
    const res = await fetch(`${window.location.pathname}?action=listTests&site=${encodeURIComponent(site)}&src=${encodeURIComponent(src)}`);
    const tests = await res.json();
    if (Array.isArray(tests) && tests.length) {
      tests.forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t;
        testSel.appendChild(o);
      });
    }
    testSel.disabled = false;
    // Now that a site is selected and tests populated, automatically load results (Test defaults to "All")
    await loadResults();
  } catch (err) {
    console.error('updateTests error', err);
  }
}

function s_em() { 
  const s = document.querySelector('input[name="style"]:checked');
  return s.value ? `<${s.value}>` : ""; 
}
function e_em() { 
  const s = document.querySelector('input[name="style"]:checked');
  return s.value ? `</${s.value}>` : ""; 
}

// Load and render the results based on current selects
async function loadResults() {
  const site = document.getElementById('site').value;
  const src  = document.getElementById('src').value;
  const test = document.getElementById('test').value;
  const type = document.getElementById('type').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  if (!site || !src || !test || !type) return;

  let testsToLoad = [];
  if (test === 'All') {
    try {
      const res = await fetch(`${window.location.pathname}?action=listTests&site=${encodeURIComponent(site)}&src=${encodeURIComponent(src)}`);
      testsToLoad = await res.json();
    } catch (err) {
      console.error('loadResults listTests error', err);
      return;
    }
  } else {
    testsToLoad = [test];
  }

  for (let t of testsToLoad) {
    let data;
    try {
      const res = await fetch(`${window.location.pathname}?action=loadTest&site=${encodeURIComponent(site)}&src=${encodeURIComponent(src)}&test=${encodeURIComponent(t)}`);
      data = await res.json();
    } catch (err) {
      console.error('loadResults loadTest error for', t, err);
      continue;
    }

    const ul = document.createElement('ul');
    for (let key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      const entry = data[key];
      if (!entry || entry.type !== type) continue;

      const li = document.createElement('li');
      if (type === 'inline') {
        li.innerHTML = key + ' ' + renderCitation(entry.citation);
      } else {
        li.innerHTML = s_em() + key + e_em() + "<p>" + renderCitation(entry.citation) + "</p>";
      }
      ul.appendChild(li);
    }

    if (ul.children.length > 0) {
      const h3 = document.createElement('h3');
      h3.textContent = t;
      resultsDiv.appendChild(h3);
      resultsDiv.appendChild(ul);
    }
  }

  appendReferences(resultsDiv);
}

// --- Event wiring ---
document.addEventListener('DOMContentLoaded', function() {
  // populate sites from the default src on load
  populateSites();

  const radios = document.querySelectorAll('input[name="style"]');
  // Add a change listener to each
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      // This runs whenever the user selects a radio
      const site = document.getElementById('site').value;
      if (site) updateTests();
    });
  });


  // when source type changes, populate site list
  document.getElementById('src').addEventListener('change', populateSites);

  // when a site is chosen, populate tests (and auto-load results)
  document.getElementById('site').addEventListener('change', updateTests);

  // when test or type changes, reload results
  document.getElementById('test').addEventListener('change', loadResults);
  document.getElementById('type').addEventListener('change', loadResults);
});
</script>
</body>
</html>
