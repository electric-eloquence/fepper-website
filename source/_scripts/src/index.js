'use strict';

import AppMain from  './app/main.js'; // Edge bug prevents using same varname as classname "App".
import init from './app/apply/init.js';
import listen from './app/apply/listen.js';

const app = new AppMain(window.$, window.Redux);
app.init();
init(app);
listen(app);
