const gulp = require('gulp');
const rename = require('gulp-rename');

// Define a task to move env.json to src/features/config.json and rename it
gulp.task('move-env',  ()=> {
    return gulp.src('./env/secret.local.json')
        .pipe(rename('secret.json'))  // Rename the file to config.json
        .pipe(gulp.dest('./src/assets/'));  // Move to the destination
});

// Define the default task
gulp.task('default', gulp.series('move-env'));