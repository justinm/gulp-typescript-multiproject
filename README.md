gulp-typescript-multiproject
============================

Easily compile projects made up of multiple tsconfig.json with a simple configuration. This project
works for projects that contain a mix of commonJS and AMD wrapped code.

[![Build Status](https://travis-ci.org/justinm/gulp-typescript-multiproject.svg?branch=master)](https://travis-ci.org/justinm/gulp-typescript-multiproject)
  [![Code Climate](https://codeclimate.com/github/justinm/gulp-typescript-multiproject/badges/gpa.svg)](https://codeclimate.com/github/justinm/gulp-typescript-multiproject)
  [![Test Coverage](https://codeclimate.com/github/justinm/gulp-typescript-multiproject/badges/coverage.svg)](https://codeclimate.com/github/justinm/gulp-typescript-multiproject/coverage)
  
Example
-------

gulp-typescript-multiproject exposes easy to use gulp tasks that can simply the build and cleaning process.

```es6

import * as rsMultiProject from 'gulp-typescript-multiproject';
import * as gulp from 'gulp';

let tsProject = rsMultiProject([
  './**/tsconfig.json',
  '!**/node_modules',
  '!**/bower_components'
]);

gulp.task('build', tsProject.build());
gulp.task('clean', tsProject.clean());

```

After starting a "gulp build", each tsconfig.json will be compiled as it's on independent
project. Using options in tsconfig.json, files can be easily included/excluded as needed, allowing
separation between two different types of applications (e.g. frontend, backend) while in the same project. 