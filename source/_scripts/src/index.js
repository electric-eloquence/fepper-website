import $organisms from './app/organisms.js';

import apply from './app/apply.js';
import listen from './app/listen.js';

const requerio = new window.Requerio($, Redux, $organisms);

requerio.init();
apply(requerio);
listen(requerio);
