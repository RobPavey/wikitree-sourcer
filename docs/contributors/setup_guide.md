# Setup guide for contributors to WikiTreeSourcer

## Initial setup

To get set up with building and running the unit tests locally you will need to clone the repository and install node.js

### Clone the repository

There are some instructions here: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository but they seem somewhat out of date. This all you need to do:

In a terminal window (Mac) or command window (PC) change directory to where you want your development folder. I would call this folder WikiTreeSourcer_Project.

Then do:

`git clone https://github.com/RobPavey/WikiTreeSourcer.git`

The vscode project is not under source control so you will want to open vscode and create a project for this folder.

### Install node.js

It can be downloaded here: https://nodejs.org/en/download/

This will also install "npm" (the package manager) which you will need.

### Install the node packages

This should be done automatically if you are in the project folder and enter this command:

`npm install`

You will probably get a lot of messages about there being newer versions of things but they can usually be ignored.

### Run the unit tests

In the project folder enter this command:

`node runtest.js`

This runs all of the unit tests. There are parameters to limit it by site and type of test. If you get lots of errors try running it on a subset of tests like this:

`node runtest.js fg extract`

