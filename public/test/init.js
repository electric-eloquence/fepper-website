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
const actionsGet = bundle.actionsGet;
const $organisms = bundle.$organisms;

// Read variables.style for global defs for testing.
require('../_scripts/src/variables.styl');

const Requerio = require('requerio');
const requerio = new Requerio($, Redux, $organisms, actionsGet);

// Need to init before defining organisms.
requerio.init();

// Prep for $window.scrollTop override.
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

// More setup.
requerio.$orgs['#html'].dispatchAction('height', 2000);
requerio.$orgs['#branding'].dispatchAction('innerHeight', 200);

module.exports = requerio;
