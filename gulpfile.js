const gulp = require('gulp');
const rename = require('gulp-rename');

// Define a task to move env.json to src/features/config.json and rename it
gulp.task('move-env',  ()=> {
    return gulp.src('./env.json')
        .pipe(rename('config.json'))  // Rename the file to config.json
        .pipe(gulp.dest('./src/features/'));  // Move to the destination
});

// Define the default task
gulp.task('default', gulp.series('move-env'));