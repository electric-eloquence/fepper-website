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

const Requerio = require('requerio/dist/requerio-node');
const requerio = new Requerio($, Redux, $organisms, actionsGet);

// Need to init before defining organisms.
requerio.init();

// Organism property defs for testing.
requerio.$window.height = () => {
  return 1000;
}
requerio.$orgs['#html'].height = () => {
  return 2000;
}
requerio.$orgs['#branding'].height = () => {
  return 220;
}
requerio.$window.scrollTop = () => {
  const num = (1 - Math.random()) * 1000;
  requerio.$orgs['#html'].dispatchAction('scrollTop', num);
  return num;
}
requerio.$orgs['#videoHead'].height = () => {
  return 400;
}

module.exports = requerio;
