# Running and debugging via the run_test script

## Reason for the unit tests

The unit tests are more properly regression tests. The main reason for having them is to be able to test that a code change has not changed existing functionality in a negative way.

They also provide a way of running and debugging much of the code outside of the browser.

Note that the unit tests only test code in the `core` subfolders and not the code in the `browser` subfolders.

## The run_test script

From a terminal window with the current director set to the root wikitree-sourcer folder enter this command:

`node scripts/run_test.js`

This will run all of the unit tests. This involves testing using all of the test cases in each site's unit tests. If all is good the output will end with `+++ All tests passed +++`

You can also fun just the tests for one site. For example to run all the tests for FamilySearch (fs) enter this:

`node scripts/run_test.js fs`

To focus it more narrowly you can run just one phase of the tests. The phases are `extract, `generalize`, `citation`, `table`, `build_all_citations` and `search`.
So for example to run just the `extract` phase for FamilySearch enter this:

`node scripts/run_test.js fs extract`

You can narrow it down to one specific unit test. So to run the extract phase on the FamilySearch unit test case named `england_baptism_1838_george_newberry` enter this:

`node scripts/run_test.js fs extract england_baptism_1838_george_newberry`

This last example is useful for debugging a specific error.

## Using the Visual Studio Code debugger with the run_test script

To run one specific test case in the debugger edit the launch.json file to look like this:

```
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/scripts/run_test.js",
      "args": ["fs", "extract", "england_baptism_1838_george_newberry"]
    }
  ]
}
```

