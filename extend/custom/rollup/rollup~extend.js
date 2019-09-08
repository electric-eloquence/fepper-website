'use strict';

const fs = require('fs-extra');
const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

const conf = global.conf;

const jsSrcDir = conf.ui.paths.source.jsSrc;
const patternsPubDir = conf.ui.paths.public.patterns;
const testDir = `${conf.ui.paths.public.root}/test`;

gulp.task('rollup', function () {
  // Copy any changes to the homepage to the test index.html file.
  const testMarkupSrc = `${patternsPubDir}/04-pages-00-homepage/04-pages-00-homepage.html`;

  if (fs.existsSync(testMarkupSrc)) {
    fs.copySync(testMarkupSrc, `${testDir}/fixtures/index.html`);
  }

  const name = 'bundle-node.js';

  return rollup({
    input: `${jsSrcDir}/app/${name}`,
    format: 'cjs'
  })

  /* eslint-disable indent */
  // Rollup-stream requires this extra step. Pass the filename you want to output to.
  .pipe(source(name))

  .pipe(gulp.dest(testDir));
  /* eslint-enable indent */
});

gulp.task('rollup:watch', () => {
  gulp.watch('**/*', {cwd: jsSrcDir}, ['rollup']);
});
