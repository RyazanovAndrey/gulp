const { src, dest, series, parallel, watch } = require('gulp')

const panini = require('panini')
const scss = require('gulp-sass')(require('sass'))
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const sassglob = require('gulp-sass-glob')
const autoprefixer = require('gulp-autoprefixer')
const cleancss = require('gulp-clean-css')
const rename = require('gulp-rename')

const rigger = require('gulp-rigger')
const uglify = require('gulp-uglify')

const browsersync = require('browser-sync').create()

const del = require('del')

const imagemin = require('gulp-imagemin')
const changed = require('gulp-changed')

function html() {

    panini.refresh()

    return src('./src/index.html')
        .pipe(panini({
            root: 'src/html',
            layouts: 'src/html/layouts',
            partials: 'src/html/partials'
        }))
        .pipe(dest('./dist'))
        .pipe(browsersync.stream())
}

function style() {
    return src('./src/scss/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError({
                title: 'SCSS Error',
                message: 'Error: <%= error.message %>',
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sassglob())
        .pipe(scss())
        .pipe(autoprefixer({
            cascade: false,
        }))
        .pipe(cleancss({
            level: 2
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/css'))
        .pipe(browsersync.stream())
}

function scripts (){
    return src('./src/js/*js')
    .pipe(plumber({
        errorHandler: notify.onError({
            title: 'JS Error',
            message: 'Error: <%= error.message %>',
        })
    }))
    .pipe(rigger())
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(dest('./dist/js'))
    .pipe(browsersync.stream())
}

function image (){
    return src('./src/img/**/*')
    .pipe(changed('./dist/img'))
    .pipe(imagemin({
        verbose: true
    }))
    .pipe(dest('./dist/image'))
}

function server (){
    browsersync.init({
        server: {
            baseDir: "./dist"
        }
    });
}

function watching (){
    watch(['./src/index.html', './src/html/**/*'], html)
    watch('./src/scss/**/*', style)
    watch('./src/js/*.js', scripts)
    watch('.src/img/**/*', image)
}

function clean (){
    return del('dist')
}

exports.default = series(clean, parallel(html, style, scripts, image), parallel(server, watching))

exports.html = html
exports.style = style
exports.scripts = scripts
exports.image = image
exports.server = server
exports.clean = clean
exports.watching = watching
