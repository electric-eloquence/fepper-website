import Requerio from '../../node_modules/requerio/src/requerio.js';

import Fpw3 from './app/fpw3--docpage.js';
import $organisms from './app/organisms--docpage.js';

const requerio = new Requerio($, Redux, $organisms);

requerio.init();

const fpw3 = new Fpw3(requerio, window);

fpw3.stoke();
fpw3.listen();
