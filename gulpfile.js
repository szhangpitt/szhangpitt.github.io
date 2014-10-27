var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');


var jsSource = ['./assets/scripts/linkedin.js',
                './assets/scripts/app.js', 
                './assets/scripts/service.js', 
                './assets/scripts/helper.js'];

var libJSSource = ['./assets/libs/jquery/jquery.min.js',
                    './assets/libs/bootstrap/js/bootstrap.min.js', 
                    './assets/libs/angular/angular.min.js', 
                    './assets/libs/angular/angular-route.min.js', 
                    './assets/libs/angular/angular-touch.min.js', 
                    ];

var sassSource = ['./assets/styles/main.scss'];


//Concat lib js and css task
gulp.task('concatlib', function() {
    gulp.src(libJSSource)
        .pipe(sourcemaps.init())
        .pipe(concat('libs.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./assets/libs'));
});

//Concat task
gulp.task('concatjs', function() {
    gulp.src(jsSource)
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./assets/scripts'));
  
});

//Sass Task
gulp.task('sass', function() {
    return gulp.src(sassSource)
        .pipe(sass({errLogToConsole: true}))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./assets/styles'));
});

//Watch task
gulp.task('watch', function(){
    gulp.watch(jsSource, ['concatjs']);
    gulp.watch(sassSource, ['sass']);
});


gulp.task('default', ['concatlib', 'concatjs', 'sass', 'watch']);