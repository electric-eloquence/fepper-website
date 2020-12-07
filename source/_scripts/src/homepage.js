import $organisms from './app/organisms.js';

import stoke from './app/stoke.js';
import listen from './app/listen.js';

import Requerio from '../../node_modules/requerio/src/requerio.js';
const requerio = new Requerio($, Redux, $organisms);

requerio.init();
stoke(requerio);
listen(requerio);
