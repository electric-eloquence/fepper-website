import $organisms from './app/organisms--homepage.js';

import stoke from './app/stoke--homepage.js';
import listen from './app/listen--homepage.js';

import Requerio from '../../node_modules/requerio/src/requerio.js';
const requerio = new Requerio($, Redux, $organisms);

requerio.init();
stoke(requerio);
listen(requerio);
