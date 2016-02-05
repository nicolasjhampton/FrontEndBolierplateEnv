'use strict';

var gulp = require('gulp'),
    del = require('del'),
    gulpTsConfig = require('gulp-tsconfig'),
    tsc = require('gulp-typescript'),
    merge = require('merge2'),
    uglify = require('gulp-uglify'),
	compass = require('gulp-compass'),
    concatCss = require('gulp-concat-css'),
    nano = require('gulp-cssnano');
	
	
var options = {
	src: {
		ts: 'source/ts/',
		sass: 'source/sass/',
		html: 'source/'
	},
    dev: {
        js: 'dev/js/',
		css: 'dev/css/',
		html: 'dev/'
    },
	dist: {
        js: 'dist/js/',
		css: 'dist/css/',
		html: 'dist/'
    }
}

gulp.task('createTsconfigFile', function() {
    var tsConfig = gulpTsConfig({
            tsOrder: [
                options.src.ts + '**/*.ts'],
            tsConfig: {            
                "compilerOptions": {
                    "module": "CommonJS",
                    "noImplicitAny": false,
                    "removeComments": false,
                    "preserveConstEnums": false,
                    "outDir": options.dev.js,
                    "target": 'ES5',
                    "declaration": true
                }
            }
        });
        
    return gulp.src([options.src.ts + "**/*.ts"])
        .pipe(tsConfig())
        .pipe(gulp.dest('.'));
});

gulp.task('compileTsScripts', ['createTsconfigFile'], function() {
    var tsProject = tsc.createProject('./tsconfig.json');
	var tsResult = tsProject.src() // instead of gulp.src(...) 
		.pipe(tsc(tsProject));
	
    return merge([
		tsResult.dts.pipe(gulp.dest('./')),
		tsResult.js.pipe(gulp.dest('./'))
	]);
});

gulp.task('copyJavascript',['compileTsScripts'], function() {
	var javascripts = [options.src.ts + '*.js'];
	
	return gulp.src(javascripts)
		.pipe(gulp.dest(options.dev.js));
});

gulp.task('cleanJavascript', ['copyJavascript'], function() {
    var javascripts = [options.src.ts + '*.js'];
    
    del(javascripts); 
});

gulp.task('copyDefinitions',['cleanJavascript'], function() {
	var definitions = [options.src.ts + '*.d.ts'];
	
	return gulp.src(definitions)
		.pipe(gulp.dest(options.src.ts + 'definitions'));
});

gulp.task('cleanDefinitions', ['copyDefinitions'], function() {
    var definitions = [options.src.ts + '*.d.ts'];
    
    del(definitions); 
});

gulp.task('concatJsScripts', ['cleanDefinitions'], function() {
	
	return gulp.src(options.dev.js + "*.js")
        .pipe(uglify())
        .pipe(gulp.dest(options.dist.js));
});


gulp.task('copyHtml', function() {
	var html = [options.src.html + '*.html'];
	
	return gulp.src(html)
		.pipe(gulp.dest(options.dev.html))
});

gulp.task('copyHtmlAgain', ['copyHtml'], function() {
	var html = [options.dev.html + '*.html'];
	
	return gulp.src(html)
		.pipe(gulp.dest(options.dist.html));
});

gulp.task('compileSass', function(){
	return gulp.src(options.src.sass + '*.scss')
		.pipe(compass({
                config_file: './config.rb',
                css: options.dev.css,
                sass: options.src.sass
            }))
		.pipe(concatCss("application.css")) // Path is relative to dest directory
		.pipe(gulp.dest(options.dev.css));
});

gulp.task('copyCss',['compileSass'], function() {
	var css = [options.dev.css + 'application.css'];
	
	return gulp.src(css)
        .pipe(nano())
		.pipe(gulp.dest(options.dist.css));
});



gulp.task('watchSass', function() {
	return gulp.watch([options.src.sass + '*.scss'], ['copyCss']);
});

gulp.task('watchTypescript', function() {
	return gulp.watch([options.src.ts + '**/*.js'], ['concatJsScripts']);
});

gulp.task('watchIndex', function() {
	return gulp.watch([options.src.html + 'index.html'], ['copyHtmlAgain']);
});

gulp.task('watch', ['watchSass','watchTypescript','watchIndex'], function() {
	console.log("Watching project...");
});

gulp.task('default', ['concatJsScripts', 'copyHtmlAgain', 'copyCss'], function() {
	console.log("Tasks completed!");
});
