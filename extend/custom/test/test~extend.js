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
  fs.copySync(`${patternsPubDir}/04-pages-00-homepage/04-pages-00-homepage.html`, `${testDir}/files/index.html`);

  return rollup({
    entry: `${jsSrcDir}/app/main.js`,
    format: 'cjs'
  })

  // give the file the name you want to output with
  .pipe(source('app.js'))

  // and output to ./dist/app.js as normal.
  .pipe(gulp.dest(testDir));
});

gulp.task('rollup:watch', function () {
  gulp.watch('**', {cwd: jsSrcDir}, ['rollup']);
});
