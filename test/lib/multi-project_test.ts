import * as mocha from 'mocha';
import * as should from 'should';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import GulpTypescriptMultiProject = require('../../index');
require('should');

describe('GulpTypescriptMultiProject', () => {

  const pathToTestJs = path.join(__dirname, '../compiling/success/test.js')

  describe('build', () => {

    it('should error with no tsconfig files found', (callback) => {
      let tsProject = new GulpTypescriptMultiProject(gulp, []);

      let build = tsProject.build();

      build()
        .on('error', function(e: Error) {
          callback(null);
        });

    });

    it('should compile test/test.ts with test/tsconfig.json', function (callback) {
      this.timeout(5000);
      let tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../*/success/tsconfig.json')]);

      if (fs.existsSync(pathToTestJs)) {
        fs.unlinkSync(pathToTestJs);
      }

      tsProject.build()()
        .on('error', callback)
        .on('finish', function() {
          if (!fs.existsSync(pathToTestJs)) {
            callback(new Error('Unable to locate compiled file ' + pathToTestJs))
          } else {
            callback(null);
          }
        });

    });

    it('should error with any compilation fails for any tsconfig.json files', function (callback) {
      this.timeout(5000);
      let tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../**/tsconfig.json')]);
      let hasErrored = false;

      tsProject.build()()
        .on('finish', function() {
          if (!hasErrored) {
            callback(new Error('Project did not report any errors'));
          } else {
            callback();
          }
        })
        .on('error', function(err: Error) {
          if (!hasErrored) {
            hasErrored = true;
          }
        });


    });

  });

  describe('clean', () => {
    it('should error clean with no tsconfig files found', (callback) => {
      let tsProject = new GulpTypescriptMultiProject(gulp, []);

      let clean = tsProject.clean();

      clean()
        .on('error', function() {
          callback(null);
        });
    });

    it('should complete clean with after a successful build', function (callback) {
      this.timeout(10000);
      let tsProject = new GulpTypescriptMultiProject(gulp, [path.join(__dirname, '../*/success/tsconfig.json')]);

      tsProject.build()().on('finish', () => {

        fs.existsSync(pathToTestJs).should.be.true();
        tsProject.clean()()
          .on('error', function(err: Error) {
            console.log('Hit error', err);
          })
          .on('finish', function (err: Error) {
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
