'use strict';

import {helperMethod} from  './export-test.js';

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

  console.warn($('body').height());
$(window).scroll(function () {
  console.warn($('body').scrollTop());
  
  if ($('body').scrollTop() > 0) {
    $('.logo__background').css('right', `-${$('body').scrollTop() * 2}px`);
  }
});
helperMethod();
