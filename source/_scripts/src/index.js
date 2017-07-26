'use strict';

import AppMain from  './app/main.js'; // Edge bug prevents using same varname as classname "App".
import apply from './app/apply/apply.js';
import listen from './app/apply/listen.js';

const app = new AppMain(window.$, window.Redux);

app.init();
apply(app);
listen(app);
