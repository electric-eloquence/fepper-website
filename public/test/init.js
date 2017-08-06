'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const JSON5 = require('JSON5');
const Redux = global.Redux = require('redux');

const html = fs.readFileSync(path.resolve(__dirname, 'files', 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

const bundle = require('./bundle-node.js');
const actionsGet = bundle.actionsGet;
const $organisms = bundle.$organisms;

// Read variables.style for global defs for testing.
require('../_scripts/src/variables.styl');

const Requerio = require('requerio/dist/requerio-node');
const requerio = new Requerio($, Redux, $organisms, actionsGet);

// Need to init before defining organisms.
requerio.init();

// Organism state defs for testing.
requerio.$orgs.window.getState = () => {
  const $window = requerio.$orgs.window;
  let scrollTop;

  if (typeof $window._scrollTop === 'undefined') {
    scrollTop = $window.scrollTop((1 - Math.random()) * 1000);
  }
  else {
    scrollTop = $window._scrollTop;
  }

  return {
    scrollTop: scrollTop,
    width: 1000,
    height: 1000
  };
};
requerio.$orgs.window.height = () => {
  return 1000;
};
requerio.$orgs['#html'].height = () => {
  return 2000;
};
requerio.$orgs['#branding'].height = () => {
  return 220;
};
requerio.$orgs['#videoHead'].height = () => {
  return 400;
};

module.exports = requerio;
