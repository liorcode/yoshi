// eslint-disable-next-line import/no-extraneous-dependencies
import { Entry, EntryFunc, ExternalsElement, Options } from 'webpack';
import { PackageJson } from 'read-pkg';

type ProjectType = 'app' | 'library';

type PetriOptions = {
  onlyForLoggedInUsers?: boolean;
  scopes?: Array<string>;
};

type CdnConfig = {
  url: string;
  port: number;
  dir: string;
  ssl: boolean;
};

type AppServerConfig = {
  port: number;
};

export type StartUrl = string | Array<string> | null;

type HooksConfig = {
  prelint?: string;
};

type SpecsConfig = {
  browser?: string;
  node?: string;
};

type featuresConfig = {
  externalizeRelativeLodash?: boolean;
};

type WebpackEntry = string | Array<string> | Entry | EntryFunc;

type WebpackExternals = ExternalsElement | Array<ExternalsElement>;

type WebpackResolveAlias = { [key: string]: string };

export type InitialConfig = {
  extends?: string;
  separateCss?: boolean | 'prod';
  splitChunks?: Options.SplitChunksOptions | false;
  cssModules?: boolean;
  tpaStyle?: boolean;
  enhancedTpaStyle?: boolean;
  separateStylableCss?: boolean;
  features?: featuresConfig;
  clientProjectName?: string;
  keepFunctionNames?: boolean;
  entry?: WebpackEntry;
  servers?: {
    cdn?: Partial<CdnConfig>;
    app?: Partial<AppServerConfig>;
  };
  externals?: WebpackExternals;
  specs?: SpecsConfig;
  petriSpecs?: PetriOptions;
  transpileTests?: boolean;
  externalUnprocessedModules?: Array<string>;
  exports?: string;
  hmr?: boolean | 'auto';
  liveReload?: boolean;
  performance?: Options.Performance | false;
  resolveAlias?: WebpackResolveAlias;
  hooks?: HooksConfig;
  umdNamedDefine?: boolean;
  projectType?: ProjectType;
  experimentalBuildHtml?: boolean;
  experimentalMonorepo?: boolean;
  experimentalMinimalPRBuild?: boolean;
  experimentalRtlCss?: boolean;
  experimentalUseAssetRelocator?: boolean;
  yoshiServer: boolean;
  startUrl?: string | Array<string>;
  server?: {
    externals?: WebpackExternals;
  };
  webWorker?: {
    entry?: WebpackEntry;
    externals?: WebpackExternals;
    resolveAlias?: WebpackResolveAlias;
  };
  webWorkerServer?: {
    entry?: WebpackEntry;
  };
  suricate?: boolean;
  experimentalStorybook?: boolean;
};

export type Config = {
  name: string;
  unpkg: string | unknown;
  pkgJson: PackageJson;
  specs: SpecsConfig;
  hmr: boolean | 'auto';
  hooks: HooksConfig;
  liveReload: boolean;
  exports?: string;
  clientProjectName?: string;
  clientFilesPath: string;
  isAngularProject: boolean;
  isReactProject: boolean;
  servers: {
    cdn: Omit<CdnConfig, 'dir'>;
    app: AppServerConfig;
  };
  entry?: WebpackEntry;
  splitChunks: Options.SplitChunksOptions | false;
  separateCss: boolean | 'prod';
  cssModules: boolean;
  tpaStyle: boolean;
  enhancedTpaStyle: boolean;
  separateStylableCss: boolean;
  features: featuresConfig;
  externals: WebpackExternals;
  transpileTests: boolean;
  jestConfig: unknown;
  externalUnprocessedModules: Array<string>;
  externalizeRelativeLodash: boolean;
  petriSpecsConfig: PetriOptions;
  performanceBudget: Options.Performance | false;
  resolveAlias: { [key: string]: string };
  startUrl: StartUrl;
  keepFunctionNames: boolean;
  umdNamedDefine: boolean;
  experimentalBuildHtml: boolean;
  experimentalMonorepo: boolean;
  experimentalMinimalPRBuild: boolean;
  experimentalRtlCss: boolean;
  experimentalUseAssetRelocator: boolean;
  yoshiServer: boolean;
  projectType: ProjectType | null;
  serverExternals?: WebpackExternals;
  webWorkerEntry?: WebpackEntry;
  webWorkerResolveAlias?: WebpackResolveAlias;
  webWorkerExternals?: WebpackExternals;
  webWorkerServerEntry?: WebpackEntry;
  suricate: boolean;
  experimentalStorybook: boolean;
};
