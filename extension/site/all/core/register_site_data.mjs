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

// Importing each of these site modules causes them to register their options

// Currently the order that they are imported is the order that they appear in the
// options page subsection drop down
// Therefore this list is ordered by the visible string in the options dropdown
// rather than by sitename.

// Importing each of these site modules causes them to register their site data
// The order of these lines does not matter, it affects the order that things like
// dynamic content scripts are registered in but that is not important

import "../../ameranc/core/ameranc_site_data.mjs";
import "../../ancestry/core/ancestry_site_data.mjs";
import "../../archion/core/archion_site_data.mjs";
import "../../archive/core/archive_site_data.mjs";
import "../../baclac/core/baclac_site_data.mjs";
import "../../bg/core/bg_site_data.mjs";
import "../../cwgc/core/cwgc_site_data.mjs";
import "../../eggsabdm/core/eggsabdm_site_data.mjs";
import "../../eggsagrvs/core/eggsagrvs_site_data.mjs";
import "../../fmp/core/fmp_site_data.mjs";
import "../../fs/core/fs_site_data.mjs";
import "../../fg/core/fg_site_data.mjs";
import "../../freebmd/core/freebmd_site_data.mjs";
import "../../freecen/core/freecen_site_data.mjs";
import "../../freereg/core/freereg_site_data.mjs";
import "../../geneteka/core/geneteka_site_data.mjs";
import "../../gro/core/gro_site_data.mjs";
import "../../gbooks/core/gbooks_site_data.mjs";
import "../../hathi/core/hathi_site_data.mjs";
import "../../irishg/core/irishg_site_data.mjs";
import "../../jstor/core/jstor_site_data.mjs";
import "../../matricula/core/matricula_site_data.mjs";
import "../../mh/core/mh_site_data.mjs";
import "../../naie/core/naie_site_data.mjs";
import "../../nli/core/nli_site_data.mjs";
import "../../noda/core/noda_site_data.mjs";
import "../../np/core/np_site_data.mjs";
import "../../npa/core/npa_site_data.mjs";
import "../../nsvr/core/nsvr_site_data.mjs";
import "../../nswbdm/core/nswbdm_site_data.mjs";
import "../../nzash/core/nzash_site_data.mjs";
import "../../nzbdm/core/nzbdm_site_data.mjs";
import "../../opccorn/core/opccorn_site_data.mjs";
import "../../openarch/core/openarch_site_data.mjs";
import "../../ppnz/core/ppnz_site_data.mjs";
import "../../psuk/core/psuk_site_data.mjs";
import "../../scotp/core/scotp_site_data.mjs";
import "../../taslib/core/taslib_site_data.mjs";
import "../../thegen/core/thegen_site_data.mjs";
import "../../trove/core/trove_site_data.mjs";
import "../../vicbdm/core/vicbdm_site_data.mjs";
import "../../wiewaswie/core/wiewaswie_site_data.mjs";
import "../../wikitree/core/wikitree_site_data.mjs";
import "../../wikipedia/core/wikipedia_site_data.mjs";
import "../../mdz/core/mdz_site_data.mjs";
import "../../basrhin/core/basrhin_site_data.mjs";
import "../../dfgviewer/core/dfgviewer_site_data.mjs";
import "../../arolsenarchives/core/arolsenarchives_site_data.mjs";
import "../../sosmogov/core/sosmogov_site_data.mjs";
import "../../doew/core/doew_site_data.mjs";
import "../../yadvashem/core/yadvashem_site_data.mjs";
import "../../ushmm/core/ushmm_site_data.mjs";
import "../../ecpp/core/ecpp_site_data.mjs";
import "../../panb/core/panb_site_data.mjs";
import "../../ausmem/core/ausmem_site_data.mjs";
import "../../morbihan/core/morbihan_site_data.mjs";
import "../../szukaj/core/szukaj_site_data.mjs";
