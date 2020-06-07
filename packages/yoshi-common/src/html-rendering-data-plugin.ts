import webpack from 'webpack';

export default class implements webpack.Plugin {
  private outputFileName: string;

  constructor({ outputFileName }: { outputFileName: string }) {
    this.outputFileName = outputFileName;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tapPromise(
      'HtmlRenderingDataPlugin',
      async (compilation) => {
        const entryNames: Array<string> = Array.from(
          compilation.entrypoints.keys(),
        );

        const jsonResult = JSON.stringify({
          entries: entryNames.reduce((acc, entryName) => {
            const filesNames: Array<string> = compilation.entrypoints
              .get(entryName)
              .getFiles();

            return {
              ...acc,
              [entryName]: filesNames,
            };
          }, {}),
          publicPath: compiler.options.output?.publicPath,
        });

        compilation.assets[this.outputFileName] = {
          source: () => jsonResult,
          size: () => jsonResult.length,
        };
      },
    );
  }
}
