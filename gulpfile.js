import gulp, { parallel } from 'gulp'

import dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

import autoprefixer from 'gulp-autoprefixer'
import browsersync from 'browser-sync'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import imagemin, {mozjpeg} from 'gulp-imagemin'
import {deleteAsync as del} from 'del'
import fileinclude from 'gulp-file-include'
import ttf2woff2 from 'gulp-ttf2woff2'

const path = {
    build: {
        js: './dist/js/',
        css: './dist/css/',
        html: './dist/',
        image: './dist/image/',
        fonts: './dist/fonts/',
        libs: './dist/libs/'
    },
    src: {
        js: './src/js/*.js',
        css: './src/scss/*.scss',
        html: './src/*.html',
        img: './src/image/**/*.{jpg,jpeg,png,webp}',
        fonts: './src/fonts/*.ttf',
        libs: './src/libs/**/*.*'
    },
    watch: {
        js: './src/js/**/*.js',
        css: './src/scss/**/*.scss',
        html: './src/**/*.html',
        image: './src/image/**/*.*',
        fonts: './src/fonts/**/*.*',
        libs: './src/libs/**/*.*'
    }
}

function js() {
    return gulp.src(path.src.js)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.stream())
}

function style() {
    return gulp.src(path.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.build.css))
    .pipe(browsersync.stream())
}

function libs() {
    return gulp.src(path.src.libs)
    .pipe(gulp.dest(path.build.libs))
    .pipe(browsersync.stream())
}

function html() {
    return gulp.src(path.src.html)
    .pipe(fileinclude())
    .pipe(gulp.dest(path.build.html))
    .pipe(browsersync.stream())
}

async function image() {
    return gulp.src(path.src.img)
    .pipe(imagemin())
    .pipe(gulp.dest(path.build.image))
    .pipe(gulp.src('./src/image/**/*.svg'))
    .pipe(gulp.dest(path.build.image))
    .pipe(browsersync.stream())
}

function clean() {
    return del('./dist')
}

function server() {
    browsersync.init({
        server: {
            baseDir: './dist/'
        },
        notify: false,
        port: 3000
    })
}

function font() {
    return gulp.src(path.src.fonts, {encoding: false})
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.build.fonts))
}

function watchFile() {
    gulp.watch(path.watch.libs, libs)
    gulp.watch(path.watch.html, html)
    gulp.watch(path.watch.fonts, font)
    gulp.watch(path.watch.css, style)
    gulp.watch(path.watch.js, js)
    gulp.watch(path.watch.image, image)
}

const mainTasks = gulp.series(clean, gulp.parallel(html, font, libs, style, js, image))
const dev = gulp.series(mainTasks, gulp.parallel(watchFile, server))
const build = gulp.series(clean, gulp.parallel(html, libs, style, js, image, font))

gulp.task('default', dev)
gulp.task('font', font)
gulp.task('clean', clean)
gulp.task('build', build)