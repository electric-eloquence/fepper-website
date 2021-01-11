'use strict';

import Behaviors from '../_scripts/src/app/behaviors--homepage';
import $organisms from '../_scripts/src/app/organisms--homepage.js';

const fs = require('fs');
const path = require('path');

const Fepper = require('fepper');
const {JSDOM} = require('jsdom');
const Redux = global.Redux = require('redux');

const cwd = process.cwd();
const fepper = new Fepper(`${cwd}/..`);
const indexSrc = path.resolve(__dirname, '..', 'static', 'index.html');
const indexDest = path.resolve(__dirname, 'fixtures', 'index.html');

fs.copyFileSync(indexSrc, indexDest);
fepper.ui.copyScripts();

/* eslint-disable no-console */
console.log('Copied scripts to public directory.');
console.log('Running tests...');
/* eslint-enable no-console */

const html = fs.readFileSync(indexDest, 'utf8');
const {window} = new JSDOM(html);
global.window = window;
global.document = window.document;
const $ = global.$ = require('jquery');
global.requestAnimationFrame = fn => setImmediate(() => fn());

// Read variables.style for global defs for testing.
require('../_scripts/src/variables.styl');

const Requerio = require('requerio');
const requerio = new Requerio($, Redux, $organisms);

requerio.init();

const behaviors = new Behaviors(requerio, global);

// Prep for $window.scrollTop override
const panesOrg = requerio.$orgs['.content__pane'];
const panesCount = panesOrg.getState().$members.length;

const beforePanesHeight = 600;
const paneHeight = 200;
const windowWidth = 1000;

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

// More setup.
requerio.behaviors = behaviors;
requerio.$orgs['#html'].dispatchAction('height', 2000);
requerio.$orgs['#html'].dispatchAction('innerHeight', 2000);
requerio.$orgs['.video'].dispatchAction('innerHeight', 400);
requerio.$orgs['#branding'].dispatchAction('innerHeight', 200);

module.exports = requerio;
