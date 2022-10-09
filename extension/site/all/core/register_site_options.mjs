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

// Importing each of these site modules causes them to register their search menu items

// Currently the order that they are imported is the order that they appear in the menu
// We may have options at some point to control which items appear
import "../../ancestry/core/ancestry_options.mjs";
import "../../fmp/core/fmp_options.mjs";
import "../../fs/core/fs_options.mjs";
import "../../fg/core/fg_options.mjs";
import "../../freebmd/core/freebmd_options.mjs";
import "../../freecen/core/freecen_options.mjs";
import "../../freereg/core/freereg_options.mjs";
import "../../gro/core/gro_options.mjs";
import "../../scotp/core/scotp_options.mjs";
import "../../wikitree/core/wikitree_options.mjs";
import "../../np/core/np_options.mjs"