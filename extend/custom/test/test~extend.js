'use strict';

const path = require('path');

const fs = require('fs-extra');
const gulp = require('gulp');
const rollup = require('rollup-stream');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const utils = require('fepper-utils');

const appDir = global.appDir;
const conf = global.conf;


const jsSrcDir = conf.ui.paths.source.jsSrc;
const packageJson = path.resolve(conf.extend_dir, 'package.json');
const patternsPubDir = conf.ui.paths.public.patterns;
const testDir = path.resolve(conf.ui.paths.public.root, 'test');

const plugins = require('gulp-load-plugins')({config: packageJson});

gulp.task('test:public:eslint', () => {
  return gulp.src(testDir + '/**/*.js')
    .pipe(plugins.eslint({
      parserOptions: {
        sourceType: 'script'
      }
    }))
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('test:public:mocha', () => {
  return gulp.src(testDir + '/**/*.js')
    .pipe(plugins.mocha());
});

gulp.task('test:public', cb => {
  runSequence(
    'test:public:eslint',
    'test:public:mocha',
    cb
  );
});

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

gulp.task('rollup:watch', () => {
  gulp.watch('**', {cwd: jsSrcDir}, ['rollup']);
});
