// @ts-nocheck
import FetchCompileWasmTemplatePlugin from 'webpack/lib/web/FetchCompileWasmTemplatePlugin';
import NodeSourcePlugin from 'webpack/lib/node/NodeSourcePlugin';
import FunctionModulePlugin from 'webpack/lib/FunctionModulePlugin';
import LoaderTargetPlugin from 'webpack/lib/LoaderTargetPlugin';
import { AsyncWebWorkerPlugin } from './AsyncWebWorkerPlugin';

export const asyncWebWorkerTarget = (options) => (compiler) => {
  new AsyncWebWorkerPlugin().apply(compiler);
  new FetchCompileWasmTemplatePlugin({
    mangleImports: options.optimization.mangleWasmImports,
  }).apply(compiler);
  new FunctionModulePlugin().apply(compiler);
  new NodeSourcePlugin(options.node).apply(compiler);
  new LoaderTargetPlugin(options.target).apply(compiler);
};
