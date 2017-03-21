var gulp = require('gulp');
var data = require('gulp-data');
var watch = require('gulp-watch');

var stylus = require('gulp-stylus');
var gulpBrowser = require("gulp-browser");
var nunjucks = require('gulp-nunjucks');

gulp.task('default', function() {


	gulp.run (['compile-styl']);
	gulp.run (['compile-js']);
	gulp.run (['compile-html']);


	watch('./dist/css/**/*.styl', function(){
		gulp.run (['compile-styl']);
	});

	watch('./dist/js/**/*.js', function(){
		gulp.run (['compile-js']);
	});

	watch("./dist/templates/**/*.html", function() {
		gulp.run (['compile-html']);
	});

});


gulp.task('compile-styl', function(){
	return gulp.src('./dist/css/style.styl')
		.pipe(stylus())
		.pipe(gulp.dest('./frontend/css/'));
});

gulp.task('compile-js', function(){
	return gulp.src('./dist/js/*.js')
		.pipe(gulpBrowser.browserify())
		.pipe(gulp.dest('./frontend/js/'));
});

gulp.task('compile-html', function(){
	return gulp.src('./dist/templates/index.html')
		.pipe(nunjucks.compile())
		.pipe(gulp.dest('./frontend/templates/'));
});

