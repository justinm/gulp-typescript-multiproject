"use strict";
var fs = require('fs');
var gulp = require('gulp');
var multi_project_1 = require('../../lib/multi-project');
var tsConfig = {
    "parent": true,
    "compilerOptions": {
        "rootDir": "./",
        "noImplicitAny": true,
        "inlineSourceMap": true,
        "noEmitOnError": true,
        "target": "ES5",
        "module": "commonjs"
    },
    "include": [
        "**/*.ts"
    ]
};
describe('GulpTypescriptMultiProject', function () {
    describe('build', function () {
        it('should complete with no tsconfig files found', function (callback) {
            var tsProject = new multi_project_1.GulpTypescriptMultiProject(gulp, []);
            tsProject.build()().on('finish', callback);
        });
        it('should compile test/test.ts with test/tsconfig.json', function (callback) {
            var tsProject = new multi_project_1.GulpTypescriptMultiProject(gulp, ['../']);
            tsProject.build()().on('finish', callback);
            fs.existsSync('../test.js').should.be.true;
        });
    });
    describe('clean', function () {
        it('should complete clean with no tsconfig files found', function (callback) {
            var tsProject = new multi_project_1.GulpTypescriptMultiProject(gulp, []);
            tsProject.clean()().on('finish', callback);
        });
    });
});
