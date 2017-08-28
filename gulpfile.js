// Global variable
var DIST_DIRECTORY = './dist';
var STYLES_DIRECTORY = DIST_DIRECTORY + '/styles';
var SCRIPTS_DIRECTORY = DIST_DIRECTORY + '/scripts';
var IMAGES_DIRECTORY = DIST_DIRECTORY + '/images';
var SCRIPTS_FILE = "scripts.js";

// Create 'dist' directory if doesn't exist
var fs = require('fs');
if (!fs.existsSync(DIST_DIRECTORY)){
	fs.mkdirSync(DIST_DIRECTORY);
	fs.mkdirSync(STYLES_DIRECTORY);
	fs.mkdirSync(SCRIPTS_DIRECTORY);
	fs.mkdirSync(IMAGES_DIRECTORY);
}

// gulp plugins
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['watch', 'serve'], function() {
	// init browser-sync server
	browserSync.init({
		server: DIST_DIRECTORY
	});
});

gulp.task('watch', function () {
	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch('app/scripts/**/*.js', ['lint', 'scripts']);
	gulp.watch('app/**/*.html', ['copy-html']);
});

gulp.task('serve', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts']);

gulp.task('dist', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts-dist']);

gulp.task('scripts', function(){
	gulp.src('app/scripts/**/*.js')
		.pipe(concat(SCRIPTS_FILE))
		.pipe(gulp.dest(SCRIPTS_DIRECTORY))
		.pipe(browserSync.stream());
});

// Same as 'scripts' + Uglify
gulp.task('scripts-dist', function(){
	gulp.src('app/scripts/**/*.js')
		.pipe(concat(SCRIPTS_FILE))
		.pipe(uglify())
		.pipe(gulp.dest(SCRIPTS_DIRECTORY));
});

gulp.task('styles', function(){
	gulp.src('app/styles/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest(STYLES_DIRECTORY))
		.pipe(browserSync.stream());
});

gulp.task('copy-html', function(){
	gulp.src('app/**/*.html')
		.pipe(gulp.dest(DIST_DIRECTORY))
		.pipe(browserSync.stream());
});

gulp.task('copy-images', function(){
	gulp.src('./app/images/*')
		.pipe(gulp.dest(IMAGES_DIRECTORY));
});

gulp.task('lint', function(){
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src(['./app/scripts/**/*.js','!node_modules/**'])
	// eslint() attaches the lint output to the "eslint" property
	// of the file object so it can be used by other modules.
		.pipe(eslint())
	// eslint.format() outputs the lint results to the console.
	// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
	// To have the process exit with an error code (1) on
	// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});
