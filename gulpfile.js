var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var mocha = require('gulp-mocha');

var pkg = require('./package.json');
var banner = '/* <%= name %> v<%= version %> by <%= author %> - <%= repository.url %> (<%= license %> licensed) */\n';

gulp.task('clean', function (done) {
    del(['dist/*'], done);
});

gulp.task('build', function () {
    gulp.src('src/gard.js')
        .pipe(gulp.dest('dist'))
        .pipe(rename('gard.min.js'))
        .pipe(uglify())
        .pipe(header(banner, pkg))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
    gulp.src('test/*.js')
        .pipe(mocha({
            reporte: 'spec'
        }));
});

gulp.task('default', ['test', 'clean', 'build']);
