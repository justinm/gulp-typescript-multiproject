"use strict";
var typescript = require('gulp-typescript');
var gulpUtil = require('gulp-util');
var newer = require('gulp-newer');
var through = require('through2');
var path = require('path');
var fs = require('fs');
var merge = require('merge2');
var debug = require('gulp-debug');
var GulpTypescriptMultiProject = (function () {
    function GulpTypescriptMultiProject(gulp, srcGlob, dest) {
        var _this = this;
        this.gulp = gulp;
        this.srcGlob = srcGlob;
        this.dest = dest;
        this.clean = function () {
            return function () {
                var errors = [];
                return _this.getProjectsStream()
                    .on('error', function (err) {
                    gulpUtil.log(gulpUtil.colors.red(err.message));
                    errors.push(err);
                })
                    .pipe(through.obj(function (file, enc, callback) {
                    var _this = this;
                    var tsProject = typescript.createProject(file.path);
                    var tsSrc = tsProject.src();
                    gulpUtil.log('Cleaning project: ' + file.path);
                    return tsSrc.pipe(through.obj(function (tsFile, enc, callback) {
                        if (tsFile.path.substr(tsFile.path.length - 3) !== '.ts') {
                            return callback();
                        }
                        var jsPath = tsFile.path.substr(0, tsFile.path.length - 3) + '.js';
                        if (fs.existsSync(jsPath)) {
                            fs.unlinkSync(jsPath);
                        }
                        else {
                            _this.push(tsFile);
                        }
                        callback();
                    }))
                        .on('error', function (err) { return errors.push(err); })
                        .on('finish', function () {
                        var self = this;
                        errors.forEach(function (err) {
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
            };
        };
    }
    GulpTypescriptMultiProject.prototype.getProjectsStream = function () {
        var foundProject = false;
        return this.gulp.src(this.srcGlob, { read: false })
            .pipe(through.obj(function (file, enc, callback) {
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
                }));
            }
        });
    };
    GulpTypescriptMultiProject.prototype.build = function () {
        var _this = this;
        return function () {
            var errors = [];
            var self = _this;
            return _this.getProjectsStream()
                .on('error', function (err) {
                gulpUtil.log(gulpUtil.colors.red(err.message));
                errors.push(err);
            })
                .pipe(through.obj(function (file, enc, pipeCallback) {
                var tlPipe = this;
                gulpUtil.log('Building project: ' + file.path);
                // The build path must be relative to the tsconfig.json path or the compiled results
                var destPath = self.dest || path.dirname(file.path);
                var tsProject = typescript.createProject(file.path);
                var tsSrc = tsProject.src();
                var tsResult = tsSrc
                    .pipe(newer({ dest: destPath, ext: '.js' }))
                    .pipe(tsProject())
                    .on('error', function (err) {
                    errors.push(err);
                });
                return merge([
                    tsResult.js
                        .pipe(self.gulp.dest(destPath)),
                    tsResult.dts
                        .pipe(self.gulp.dest(destPath))
                ])
                    .on('finish', function () {
                    if (errors.length) {
                        errors.forEach(function (err) {
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
    ;
    return GulpTypescriptMultiProject;
}());
exports.GulpTypescriptMultiProject = GulpTypescriptMultiProject;
