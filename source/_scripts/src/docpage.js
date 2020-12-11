import $organisms from './app/organisms--docpage.js';

import listen from './app/listen--docpage.js';

import Requerio from '../../node_modules/requerio/src/requerio.js';
const requerio = new Requerio($, Redux, $organisms);

requerio.init();
listen(requerio);
