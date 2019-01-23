'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');

const html = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

global.Image = class {
  constructor() {
    this.src = null;
  }
};

const bundle = require('./bundle-node.js');
const $organisms = bundle.$organisms;

// Read variables.style for global defs for testing.
require('../_scripts/src/variables.styl');

const Requerio = require('requerio');
const requerio = new Requerio($, Redux, $organisms);

requerio.init();

import behaviorsGet from '../_scripts/src/app/behaviors-get.js';
const behaviors = behaviorsGet(requerio, global);

// Prep for $window.scrollTop override
const panesOrg = requerio.$orgs['.content__pane'];
const panesCount = panesOrg.getState().$members.length;

const beforePanesHeight = 600;
const paneHeight = 200;
const windowWidth = 1000;
const windowHeight = 800;

let paneTopDistance = beforePanesHeight;
let paneBottomDistance = paneTopDistance;

for (let i = 0; i < panesCount; i++) {
  paneBottomDistance += paneHeight;

  panesOrg.dispatchAction('innerHeight', paneHeight, i);
  panesOrg.dispatchAction(
    'setBoundingClientRect',
    {
      width: windowWidth,
      height: paneHeight,
      top: paneTopDistance,
      right: windowWidth,
      bottom: paneBottomDistance,
      left: 0
    },
    i
  );

  paneTopDistance += paneHeight;
}

// $window method overrides for testing.
const $window = requerio.$orgs.window;
const $windowScrollTopOrig = $window.scrollTop;

$window.scrollTop = (...args) => {
  const retVal = $windowScrollTopOrig(...args);

  if (typeof args[0] === 'number') {
    paneTopDistance = beforePanesHeight - args[0];
    paneBottomDistance = paneTopDistance;

    for (let i = 0; i < panesCount; i++) {
      paneBottomDistance += paneHeight;

      panesOrg.dispatchAction(
        'setBoundingClientRect',
        {
          width: windowWidth,
          height: paneHeight,
          top: paneTopDistance,
          right: windowWidth,
          bottom: paneBottomDistance,
          left: 0
        },
        i
      );

      paneTopDistance += paneHeight;
    }
  }

  return retVal;
};

$window.getState = () => {
  let scrollTop;

  if (typeof $window._scrollTop !== 'undefined') {
    scrollTop = $window._scrollTop;
  }
  else {
    scrollTop = 0;
  }

  return {
    scrollTop: scrollTop,
    width: windowWidth,
    height: windowHeight
  };
};

// Create mock Cheerio .animate() method.
requerio.$orgs['#html'].animate = function () {
  const {scrollTop} = arguments[0];

  $window.scrollTop(scrollTop);
};
requerio.$orgs['#body'].animate = () => {};

// More setup.
requerio.behaviors = behaviors;
requerio.$orgs['#html'].dispatchAction('height', 2000);
requerio.$orgs['#html'].dispatchAction('innerHeight', 2000);
requerio.$orgs['.video'].dispatchAction('innerHeight', 400);
requerio.$orgs['#branding'].dispatchAction('innerHeight', 200);

module.exports = requerio;
