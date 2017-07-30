'use strict';

const path = require('path');

const fs = require('fs-extra');
const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

const appDir = global.appDir;
const conf = global.conf;

const utils = require(`${appDir}/core/lib/utils`);

const jsSrcDir = utils.pathResolve(conf.ui.paths.source.jsSrc);
const patternsPubDir = utils.pathResolve(conf.ui.paths.public.patterns);
const testDir = path.resolve(utils.pathResolve(conf.ui.paths.public.root), 'test');

gulp.task('rollup', function () {
  // Copy any changes to the homepage to the test index.html file.
  const testMarkupSrc = `${patternsPubDir}/04-pages-00-homepage/04-pages-00-homepage.html`;

  if (fs.existsSync(testMarkupSrc)) {
    fs.copySync(testMarkupSrc, `${testDir}/files/index.html`);
  }

  const name = 'bundle-node.js';

  return rollup({
    entry: `${jsSrcDir}/app/${name}`,
    format: 'cjs'
  })

  // Rollup-stream requires this extra step. Pass the filename you want to output to.
  .pipe(source(name))

  .pipe(gulp.dest(testDir));
});

gulp.task('rollup:watch', function () {
  gulp.watch('**', {cwd: jsSrcDir}, ['rollup']);
});
