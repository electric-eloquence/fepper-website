/**
 * Put tasks defined in ~extend.js appended files within the more general tasks listed below.
 */
'use strict';

const gulp = global.gulp;

gulp.task('contrib:data', [
]);

gulp.task('contrib:frontend-copy', [
  'stylus:frontend-copy'
]);

gulp.task('contrib:once', [
  'stylus:no-comment'
]);

gulp.task('contrib:static', [
]);

gulp.task('contrib:syncback', [
]);

gulp.task('contrib:tcp-ip', [
]);

gulp.task('contrib:template', [
]);

gulp.task('contrib:watch', [
  'stylus:watch-no-comment'
]);
