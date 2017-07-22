'use strict';

function helperMethod() {
    console.info(`I'm helping!`);
}

let $;
let Redux;

if (typeof window === 'object') {
  $ = window.jQuery;
  Redux = window.Redux;
}
else if (typeof require === 'function') {
  $ = require('cheerio');
  Redux = require('redux');
}

console.warn(Redux);
helperMethod();
