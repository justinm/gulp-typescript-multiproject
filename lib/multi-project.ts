import * as typescript from 'gulp-typescript';
import * as stream from 'stream';
import * as gulpUtil from 'gulp-util';
import * as newer from 'gulp-newer';
import * as through from 'through2';
import * as gulpLib from 'gulp';
import * as path from 'path';
import * as fs from 'fs';
import * as merge from 'merge2';
let debug = require('gulp-debug');

export class GulpTypescriptMultiProject {

  constructor(private gulp: typeof gulpLib, private srcGlob: string[], private dest?: string) {
  }

  private getProjectsStream(): stream.Transform {
    let foundProject = false;

    return this.gulp.src(this.srcGlob, { read: false })
      .pipe(through.obj(function(file, enc, callback) {

        if (file.isDirectory() || path.basename(file.path) !== 'tsconfig.json') {
          return callback();
        }

        if (file.isStream()) {
          return callback(new gulpUtil.PluginError({
            plugin: 'gulp-typescript-multi-project',
            message: 'Streams are not supported.'
          }));
        }

        foundProject = true;

        this.push(file);

        return callback();

      }))
      .on('finish', function () {
        if (!foundProject) {
          this.emit('error', new gulpUtil.PluginError({
            plugin: 'gulp-typescript-multiproject',
            message: 'Unable to locate any tsconfig.json files'
          }))
        }
      })
  }

  build(): () => stream.Transform {
    return (): stream.Transform => {
      let errors: Error[] = [];

      let self = this;

      return this.getProjectsStream()
        .on('error', function (err: Error) {
          gulpUtil.log(gulpUtil.colors.red(err.message));
          errors.push(err);
        })
        .pipe(through.obj(function(file, enc, pipeCallback) {

          let tlPipe = this;

          gulpUtil.log('Building project: ' + file.path);

          // The build path must be relative to the tsconfig.json path or the compiled results
          let destPath = self.dest || path.dirname(file.path);
          let tsProject = typescript.createProject(file.path);
          let tsSrc = tsProject.src();
          let tsResult = tsSrc
            .pipe(newer({ dest: destPath, ext: '.js' }))
            .pipe(tsProject())
            .on('error', function (err: Error) {
              errors.push(err);
            });

          return merge([
            tsResult.js
              .pipe(self.gulp.dest(destPath)),
            tsResult.dts
              // .pipe(debug())
              .pipe(self.gulp.dest(destPath))
          ])
            .on('finish', function () {
              if (errors.length) {
                errors.forEach((err) => {
                  tlPipe.emit('error', new gulpUtil.PluginError({
                    plugin: 'gulp-typescript-multiproject',
                    message: err.message
                  }));
                });
              }
              pipeCallback();
            });

        }))
        .on('finish', function () {
          errors.forEach(function (err) {
            this.emit('error', err);
          }, this);
        });

    };
  };

  clean = () => {
    return (): stream.Transform => {
      let errors: Error[] = [];

      return this.getProjectsStream()
        .on('error', function(err: any) {
          gulpUtil.log(gulpUtil.colors.red(err.message));
          errors.push(err);
        })
        .pipe(through.obj(function (file, enc, callback) {

          let tsProject = typescript.createProject(file.path);
          let tsSrc = tsProject.src();

          gulpUtil.log('Cleaning project: ' + file.path);

          return tsSrc.pipe(through.obj((tsFile, enc, callback) => {
            if (tsFile.path.substr(tsFile.path.length - 3) !== '.ts') {
              return callback();
            }

            let jsPath = tsFile.path.substr(0, tsFile.path.length - 3) + '.js';

            if (fs.existsSync(jsPath)) {
              fs.unlinkSync(jsPath);
            } else {
              this.push(tsFile);
            }

            callback();

          }))
            .on('error', (err: Error) => errors.push(err))
            .on('finish', function () {
              let self = this;
              errors.forEach((err) => {
                self.emit('error', err);
              });
              callback();
            });

        }))
        .on('finish', function () {
          errors.forEach(function (err) {
            this.emit('error', err);
          }, this);
        });

    }
  }

}