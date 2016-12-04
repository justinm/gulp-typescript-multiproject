declare module "gulp-typescript-multiproject" {
  import * as gulpCore from 'gulp';
  import * as stream from 'stream';

  function e(gulp: typeof gulpCore, srcGlob: string[], dest?: string): any;

  namespace e {


    interface GulpTypescriptMultiProject {
      build: () => ((err: Error[]) => stream.Transform);
      clean: () => ((err: Error[]) => stream.Transform;
    }
  }


}