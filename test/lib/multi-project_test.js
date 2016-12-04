"use strict";
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var GulpTypescriptMultiProject = require('../../index');
require('should');
describe('GulpTypescriptMultiProject', function () {
    var pathToTestJs = path.join(__dirname, '../compiling/success/test.js');
    describe('build', function () {
        it('should error with no tsconfig files found', function (callback) {
            var tsProject = new GulpTypescriptMultiProject(gulp, []);
            var build = tsProject.build();
            build()
                .on('error', function (e) {
                callback(null);
            });
        });
        it('should compile test/test.ts with test/tsconfig.json', function (callback) {
            this.timeout(5000);
            var tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../*/success/tsconfig.json')]);
            if (fs.existsSync(pathToTestJs)) {
                fs.unlinkSync(pathToTestJs);
            }
            tsProject.build()()
                .on('error', callback)
                .on('finish', function () {
                if (!fs.existsSync(pathToTestJs)) {
                    callback(new Error('Unable to locate compiled file ' + pathToTestJs));
                }
                else {
                    callback(null);
                }
            });
        });
        it('should error with any compilation fails for any tsconfig.json files', function (callback) {
            this.timeout(5000);
            var tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../**/tsconfig.json')]);
            var hasErrored = false;
            tsProject.build()()
                .on('finish', function () {
                if (!hasErrored) {
                    callback(new Error('Project did not report any errors'));
                }
                else {
                    callback();
                }
            })
                .on('error', function (err) {
                if (!hasErrored) {
                    hasErrored = true;
                }
            });
        });
    });
    describe('clean', function () {
        it('should error clean with no tsconfig files found', function (callback) {
            var tsProject = new GulpTypescriptMultiProject(gulp, []);
            var clean = tsProject.clean();
            clean()
                .on('error', function () {
                callback(null);
            });
        });
        it('should complete clean with after a successful build', function (callback) {
            this.timeout(10000);
            var tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../*/success/tsconfig.json')]);
            tsProject.build()().on('finish', function () {
                fs.existsSync(pathToTestJs).should.be.true();
                tsProject.clean()()
                    .on('error', function (err) {
                    console.log('Hit error', err);
                })
                    .on('finish', function (err) {
                    console.log('Finished clean in test');
                    if (err) {
                        return callback(err);
                    }
                    fs.existsSync(pathToTestJs);
                    callback();
                });
            });
        });
    });
});
