'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');

const html = fs.readFileSync(path.resolve(__dirname, 'files', 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

const app = new (require('./app'))($, Redux);

// Organism property defs for testing.
app.$window.height = () => {
  return 1000;
}
app.$orgs.html.height = () => {
  return 2000;
}
app.$window.scrollTop = () => {
  const num = Math.random() * 1000;
  app.$orgs.html.dispatchAction('scrollTop', num);
  return num;
}
app.$orgs.videoHead.height = () => {
  return 400;
}

module.exports = app;
