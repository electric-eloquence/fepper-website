import actionsGet from './app/actions-get.js';
import $organisms from './app/organisms.js';

import apply from './app/apply.js';
import listen from './app/listen.js';

const requerio = new window.Requerio($, Redux, $organisms, actionsGet);

requerio.init();
apply(requerio);
listen(requerio);
