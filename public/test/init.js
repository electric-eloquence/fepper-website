'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const Redux = global.Redux = require('redux');

const html = fs.readFileSync(path.resolve(__dirname, 'files', 'index.html'), 'utf8');
const $ = global.$ = cheerio.load(html);

const app = new (require('./app'))($, Redux);

// Need to init before defining organisms.
app.init();

// Organism property defs for testing.
app.$window.height = () => {
  return 1000;
}
app.$orgs['#html'].height = () => {
  return 2000;
}
app.$orgs['#branding'].height = () => {
  return 220;
}
app.$window.scrollTop = () => {
  const num = (1 - Math.random()) * 1000;
  app.$orgs['#html'].dispatchAction('scrollTop', num);
  return num;
}
app.$orgs['#videoHead'].height = () => {
  return 400;
}

module.exports = app;
