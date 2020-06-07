import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

class HtmlInlinePlugin implements webpack.Plugin {
  private htmlWebpackPlugin: HtmlWebpackPlugin;
  private tests: Array<RegExp>;

  constructor(htmlWebpackPlugin: HtmlWebpackPlugin, tests: Array<RegExp>) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.tests = tests;
  }

  private findAsset(
    publicPath: string,
    assets: any,
    tag: HtmlWebpackPlugin.HtmlTagObject,
    attributeName: string,
  ) {
    if (!(tag.attributes && tag.attributes[attributeName])) {
      return null;
    }

    const scriptName = publicPath
      ? (tag.attributes[attributeName] as string).replace(publicPath, '')
      : (tag.attributes[attributeName] as string);

    const asset = assets[scriptName];

    if (asset === null) {
      return null;
    }

    if (!this.tests.some((test) => scriptName.match(test))) {
      return null;
    }

    return asset;
  }

  private getInlinedTag(
    publicPath: string,
    assets: any,
    tag: HtmlWebpackPlugin.HtmlTagObject,
  ): HtmlWebpackPlugin.HtmlTagObject {
    switch (tag.tagName) {
      case 'script': {
        const asset = this.findAsset(publicPath, assets, tag, 'src');

        if (!asset) {
          return tag;
        }

        return {
          tagName: 'script',
          innerHTML: asset.source(),
          attributes: {},
          voidTag: false,
        };
      }
      case 'link': {
        const asset = this.findAsset(publicPath, assets, tag, 'href');

        if (!asset) {
          return tag;
        }

        return {
          tagName: 'style',
          innerHTML: asset.source(),
          attributes: {},
          voidTag: false,
        };
      }
      default: {
        return tag;
      }
    }
  }

  apply(compiler: webpack.Compiler) {
    let publicPath = compiler.options?.output?.publicPath ?? '';

    if (publicPath && !publicPath.endsWith('/')) {
      publicPath += '/';
    }

    compiler.hooks.compilation.tap('HtmlInlinePlugin', (compilation) => {
      const tagFunction = (tag: HtmlWebpackPlugin.HtmlTagObject) =>
        this.getInlinedTag(publicPath, compilation.assets, tag);

      // @ts-ignore
      const hooks = this.htmlWebpackPlugin.getHooks(
        compilation,
      ) as HtmlWebpackPlugin.Hooks;

      hooks.alterAssetTagGroups.tap('HtmlInlinePlugin', (assets) => {
        assets.headTags = assets.headTags.map(tagFunction);
        assets.bodyTags = assets.bodyTags.map(tagFunction);

        return assets;
      });
    });
  }
}

export default HtmlInlinePlugin;
