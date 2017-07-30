'use strict';

// MS Edge bug prevents same varname as classname.
import RequerioClass from  '../../node_modules/requerio/src/requerio.js';

import actionsGet from './app/actions-get.js';
import $organisms from './app/organisms.js';

import apply from './app/apply.js';
import listen from './app/listen.js';

const requerio = new RequerioClass($, Redux, $organisms, actionsGet);

requerio.init();
apply(requerio);
listen(requerio);
