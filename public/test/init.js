'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');

const html = fs.readFileSync(path.resolve(__dirname, 'files', 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

const bundle = require('./bundle-node.js');
const actionsGet = bundle.actionsGet;
const $organisms = bundle.$organisms;

// Read variables.style for global defs for testing.
require('../_scripts/src/variables.styl');

const Requerio = require('requerio/dist/requerio.module');
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

requerio.$orgs['#videoHead'].dispatchAction('innerHeight', 400);
requerio.$orgs['#branding'].dispatchAction('innerHeight', 220);

const numBlocks = requerio.$orgs['.main__content__block'].getState().$items.length;

for (let i = 0; i < numBlocks; i++) {
  requerio.$orgs['.main__content__slid'].dispatchAction('innerHeight', 200, i);
}

// Global vars for testing.
global.fepper_green_r = 2;
global.fepper_green_g = 125;
global.fepper_green_b = 21;
global.fepper_yellow_r = 240;
global.fepper_yellow_g = 192;
global.fepper_yellow_b = 0;
global.fepper_red_r = 208;
global.fepper_red_g = 0;
global.fepper_red_b = 0;

module.exports = requerio;
