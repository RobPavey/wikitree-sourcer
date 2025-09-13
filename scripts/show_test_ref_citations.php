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
   * On the command line, change to the directory of this file.
   * Run `php -S localhost:8000`
   * Open http://localhost:8000/show_test_ref_citations.php in a web browser
*/

function getSites() {
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

// Handle AJAX request for listing tests (JSON files in citations/ref/)
if (isset($_GET['site']) && isset($_GET['action']) && $_GET['action'] === 'listTests') {
    $site = basename($_GET['site']);
    $dir = realpath(__DIR__ . "/../unit_tests/$site/citations/ref");
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

// Handle AJAX request to load a JSON file
if (isset($_GET['site'], $_GET['test'], $_GET['action']) && $_GET['action'] === 'loadTest') {
    $site = basename($_GET['site']);
    $test = basename($_GET['test']);
    $file = realpath(__DIR__ . "/../unit_tests/$site/citations/ref/$test.json");
    if ($file && file_exists($file)) {
        header('Content-Type: application/json');
        echo file_get_contents($file);
    } else {
        header('Content-Type: application/json');
        echo json_encode([]);
    }
    exit;
}

$sites = getSites();
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Citations Unit Test Browser</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    label { margin-right: 8px; }
    select { margin-right: 20px; }
    ul { margin-top: 10px; }
    li { margin-bottom: 5px; }
  </style>
</head>
<body>
  <h1>Citations Unit Test Browser</h1>
  <label for="site">Site:</label>
  <select id="site">
    <option value="">-- Select a site --</option>
    <?php foreach ($sites as $s): ?>
      <option value="<?= htmlspecialchars($s) ?>"><?= htmlspecialchars($s) ?></option>
    <?php endforeach; ?>
  </select>

  <label for="test">Test:</label>
  <select id="test">
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
document.getElementById('site').addEventListener('change', async function() {
    let site = this.value;
    let testSel = document.getElementById('test');
    testSel.innerHTML = '<option value="All">All</option>'; // reset

    if (site) {
        let res = await fetch(`?action=listTests&site=${encodeURIComponent(site)}`);
        let tests = await res.json();
        tests.forEach(t => {
            let opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            testSel.appendChild(opt);
        });
    }
    document.getElementById('results').innerHTML = '';
});

['site','test','type'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadResults);
});

// --- robust wikitext renderer (replace your previous renderCitation/appendReferences) ---

let refs = [];         // array of ref contents, in order
let refsByName = {};   // map name -> index

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
  // Start a fresh refs collection the first time we're called during a render pass.
  if (!renderCitation.active) {
    refs = [];
    refsByName = {};
    renderCitation.active = true;
  }
  if (!text) return '';

  // 1) full <ref ...>content</ref>  (handles multi-line content)
  text = text.replace(/<ref\b([^>]*)>([\s\S]*?)<\/ref>/gi, function(_, attrStr, note) {
    // find name="..." if present
    let nameMatch = attrStr.match(/name\s*=\s*"(.*?)"/i) || attrStr.match(/name\s*=\s*'(.*?)'/i);
    if (nameMatch) {
      let name = nameMatch[1];
      if (name in refsByName) {
        return `<sup>[${refsByName[name]}]</sup>`;
      } else {
        refs.push(note);
        refsByName[name] = refs.length;
        return `<sup>[${refsByName[name]}]</sup>`;
      }
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
      if (name in refsByName) {
        return `<sup>[${refsByName[name]}]</sup>`;
      } else {
        refs.push('');                     // empty placeholder
        refsByName[name] = refs.length;
        return `<sup>[${refsByName[name]}]</sup>`;
      }
    } else {
      refs.push('');
      return `<sup>[${refs.length}]</sup>`;
    }
  });

  // 3) Apply other formatting and links on the result
  return renderFormatting(text);
}

function appendReferences(container) {
  if (!refs || refs.length === 0) {
    renderCitation.active = false;
    return;
  }

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

async function loadResults() {
    let site = document.getElementById('site').value;
    let test = document.getElementById('test').value;
    let type = document.getElementById('type').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!site || !test || !type) return;

    let testsToLoad = [];
    if (test === 'All') {
        let res = await fetch(`?action=listTests&site=${encodeURIComponent(site)}`);
        testsToLoad = await res.json();
    } else {
        testsToLoad = [test];
    }

    let output = '';

    for (let t of testsToLoad) {
        let res = await fetch(`?action=loadTest&site=${encodeURIComponent(site)}&test=${encodeURIComponent(t)}`);
        let data = await res.json();

        let ul = document.createElement('ul');
        for (let key in data) {
            if (data[key].type === type) {
                let li = document.createElement('li');
                if (type === 'inline') {
                    li.innerHTML = key + ' ' + renderCitation(data[key].citation);
                } else {
                    li.innerHTML = key + "<p>" + renderCitation(data[key].citation) + "</p>";
                }
                ul.appendChild(li);
            }
        }
        if (ul.children.length > 0) {
            let h3 = document.createElement('h3');
            h3.textContent = t;
            resultsDiv.appendChild(h3);
            resultsDiv.appendChild(ul);
        }
    }
    appendReferences(resultsDiv);
}
</script>
</body>
</html>
