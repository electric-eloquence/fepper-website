/**
 * Put tasks defined in ~extend.js appended files within the more general tasks listed below.
 */
'use strict';

const gulp = global.gulp;

gulp.task('custom:data', [
]);

gulp.task('custom:frontend-copy', [
]);

gulp.task('custom:once', [
  'rollup'
]);

gulp.task('custom:static', [
]);

gulp.task('custom:syncback', [
]);

gulp.task('custom:tcp-ip', [
]);

gulp.task('custom:template', [
]);

gulp.task('custom:watch', [
  'rollup:watch'
]);
