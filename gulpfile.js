const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const csso = require('gulp-csso');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

gulp.task('sass', function () {
    return gulp.src('./frontend/css/main.scss')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulpIf(!isDevelopment, autoprefixer({
            browsers:[
                'last 2 versions',
                'Firefox ESR',
                'not ie < 9'
            ]
        })))
        .pipe(gulpIf(isDevelopment, csso()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public'));
});

gulp.task('babel', function () {
    return gulp.src('frontend/js/*.js')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('main.js'))
        .pipe(gulpIf(!isDevelopment, uglify()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('clean', function () {
    return del('public');
});

gulp.task('pug', function() {
    return gulp.src('frontend/html/**')
    .pipe(pug({
      // Your options in here. 
    }))
    .pipe(gulp.dest('public'));
})

gulp.task('assets', function () {
    return gulp.src('frontend/assets/**', {since: gulp.lastRun('assets')})
        .pipe(newer('public'))
        .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('sass', 'babel', 'assets', 'pug'))
);

gulp.task('watch', function () {
    gulp.watch('frontend/css/**/*.*', gulp.series('sass'));
    gulp.watch('frontend/js/**/*.*', gulp.series('babel'));
    gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
    gulp.watch('frontend/html/**/*.*', gulp.series('pug'));
});

gulp.task('server', function () {
    browserSync.init({
        server: 'public'
    });

    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));