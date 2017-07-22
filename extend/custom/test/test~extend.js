'use strict';

const path = require('path');

const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

const appDir = global.appDir;
const conf = global.conf;

const utils = require(`${appDir}/core/lib/utils`);

const jsSrcDir = utils.pathResolve(conf.ui.paths.source.jsSrc);
const testDir = path.resolve(utils.pathResolve(conf.ui.paths.public.root), 'test');

gulp.task('rollup', function() {
  return rollup({
    entry: `${jsSrcDir}/app/main.js`,
    format: 'cjs'
  })

  // give the file the name you want to output with
  .pipe(source('app.js'))

  // and output to ./dist/app.js as normal.
  .pipe(gulp.dest(testDir));
});
