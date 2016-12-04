declare module "gulp-typescript-multiproject" {
  import * as gulpCore from 'gulp';
  import * as stream from 'stream';

  function e(gulp: typeof gulpCore, srcGlob: string[], dest?: string): any;

  namespace e {


    interface GulpTypescriptMultiProject {
      build: () => () => stream.Transform;
      clean: () => () => stream.Transform;
    }
  }


}