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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktcHJvamVjdF90ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibXVsdGktcHJvamVjdF90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFZLEVBQUUsV0FBTSxJQUFJLENBQUMsQ0FBQTtBQUN6QixJQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUM3QixJQUFZLElBQUksV0FBTSxNQUFNLENBQUMsQ0FBQTtBQUM3QixJQUFPLDBCQUEwQixXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBQzNELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVsQixRQUFRLENBQUMsNEJBQTRCLEVBQUU7SUFFckMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsOEJBQThCLENBQUMsQ0FBQTtJQUV6RSxRQUFRLENBQUMsT0FBTyxFQUFFO1FBRWhCLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxVQUFDLFFBQVE7WUFDdkQsSUFBSSxTQUFTLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFekQsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTlCLEtBQUssRUFBRTtpQkFDSixFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVMsQ0FBUTtnQkFDNUIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRVAsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMscURBQXFELEVBQUUsVUFBVSxRQUFRO1lBQzFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkIsSUFBSSxTQUFTLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzRyxFQUFFLENBQUMsQ0FBQyxF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