//= ::::::::::::: DECLARATIONS::::::::::::::::::: =//

const gulp = require('gulp');

//= STYLES ==========================================
const nodeSass = require('node-sass');
const gulpSass = require('gulp-sass');
const sass = gulpSass(nodeSass);
const autoPrefixer = require('gulp-autoprefixer');
const replace = require('gulp-replace');

//= JAVASCRIPT ======================================
const webpack = require('webpack-stream');

//= HTML ============================================
const include = require('gulp-file-include');
const beautify = require('gulp-html-beautify');
const sync = require('browser-sync').init({
	server: {
		baseDir: './release/'
	}
	// proxy: "https://aqua-gorod.ru"
});


//= ::::::::::::::::::: TASKS :::::::::::::::::::: =//
//= Styles ===========================================
gulp.task('scss', () => {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(sass({
			includePaths: ['node_modules']
		}))
		.pipe(autoPrefixer())
		.pipe(replace('/img', '../img'))
		.pipe(gulp.dest('./release/css'))
		.pipe(sync.stream());
})

//= HTML =============================================
gulp.task('html', () => {
	return gulp.src('./src/html/*.html')
		.pipe(include())
		.pipe(beautify({
			indentSize: 4,
			indent_with_tabs: 1
		}))
		.pipe(gulp.dest('./release/'))
		.pipe(sync.stream())
})

//= JAVASCRIPT =======================================
gulp.task('java', () => {
	return gulp.src('./src/ts/master.ts')
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest('release/js/'))
		.pipe(sync.stream())
});

//= WATCH ============================================
gulp.task('watch', () => {
	gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
	gulp.watch('./src/html/**/*.html', gulp.series('html'));
	gulp.watch('./src/ts/**/*.*', gulp.series('java'));
})