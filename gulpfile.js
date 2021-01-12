const gulp = require("gulp");
const less = require("gulp-less");

/* ----------------------------------------- */
/*  Compile Less
/* ----------------------------------------- */
const YZECORIOLIS_LESS = ["less/**/*.less", "less/*.less"];

function compileLESS() {
  return gulp
    .src(["less/yzecoriolis.less", "less/yzecoriolismce.less"])
    .pipe(less())
    .pipe(gulp.dest("./css"));
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(YZECORIOLIS_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(gulp.parallel(css), watchUpdates);
exports.css = css;
