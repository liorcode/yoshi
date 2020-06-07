// @ts-nocheck
import WebWorkerChunkTemplatePlugin from 'webpack/lib/webworker/WebWorkerChunkTemplatePlugin';
import WebWorkerHotUpdateChunkTemplatePlugin from 'webpack/lib/webworker/WebWorkerHotUpdateChunkTemplatePlugin';
import { WebWorkerMainTemplatePlugin } from './WebWorkerMainTemplatePlugin';

export class AsyncWebWorkerPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'AsyncWebWorkerTemplatePlugin',
      (compilation) => {
        new WebWorkerMainTemplatePlugin().apply(compilation.mainTemplate);
        new WebWorkerChunkTemplatePlugin().apply(compilation.chunkTemplate);
        new WebWorkerHotUpdateChunkTemplatePlugin().apply(
          compilation.hotUpdateChunkTemplate,
        );
      },
    );
  }
}
