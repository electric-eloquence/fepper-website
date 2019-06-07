import $organisms from './app/organisms.js';

import apply from './app/apply.js';
import listen from './app/listen.js';

import Requerio from '../../node_modules/requerio/src/requerio.js';
const requerio = new Requerio($, Redux, $organisms);

requerio.init();
apply(requerio);
listen(requerio);
