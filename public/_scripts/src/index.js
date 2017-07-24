'use strict';

import App from  './app/main.js';
import init from './app/apply/init.js';
import listen from './app/apply/listen.js';

const app = new App(window.$, window.Redux);
init(app);
listen(app);
