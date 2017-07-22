'use strict';

import App from  './app/main.js';
import listen from './app/apply/listen.js';

const app = new App(window.$, window.Redux);
listen(app);
