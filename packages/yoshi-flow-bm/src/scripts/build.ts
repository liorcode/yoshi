import path from 'path';
import arg from 'arg';
import fs from 'fs-extra';
import { runWebpack } from 'yoshi-common/build/webpack-utils';
import {
  printBuildResult,
  printBundleSizeSuggestion,
} from 'yoshi-common/build/print-build-results';
import { BUILD_DIR, TARGET_DIR } from 'yoshi-config/build/paths';
import { inTeamCity } from 'yoshi-helpers/build/queries';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
} from '../webpack.config';
import { CliCommand } from '../bin/yoshi-bm';
import createFlowBMModel from '../model';
import renderModule, { getModuleEntry } from '../renderModule';
import renderModuleConfig from '../renderModuleConfig';

const join = (...dirs: Array<string>) => path.join(process.cwd(), ...dirs);

const build: CliCommand = async function (argv, config) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--analyze': Boolean,
      '--stats': Boolean,
      '--source-map': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv },
  );

  const {
    '--help': help,
    '--analyze': isAnalyze,
    '--stats': forceEmitStats,
    '--source-map': forceEmitSourceMaps,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Compiles the application for production deployment

      Usage
        $ yoshi-bm build

      Options
        --help, -h      Displays this message
        --analyze       Run webpack-bundle-analyzer
        --stats         Emit webpack's stats file on "target/webpack-stats.json"
        --source-map    Emit bundle source maps
    `,
    );

    process.exit(0);
  }

  await Promise.all([
    fs.emptyDir(join(BUILD_DIR)),
    fs.emptyDir(join(TARGET_DIR)),
  ]);

  const model = createFlowBMModel();
  renderModule(model);
  renderModuleConfig(model);

  if (inTeamCity()) {
    const petriSpecs = await import('yoshi-common/build/sync-petri-specs');
    const wixMavenStatics = await import('yoshi-common/build/maven-statics');
    const copyDocker = await import('yoshi-common/build/copy-docker');

    await Promise.all([
      petriSpecs.default({
        config: config.petriSpecsConfig,
      }),
      wixMavenStatics.default({
        clientProjectName: config.clientProjectName,
        staticsDir: config.clientFilesPath,
      }),
      copyDocker.default(config),
    ]);
  }

  const moduleEntry = getModuleEntry(model);

  const clientDebugConfig = createClientWebpackConfig(config, {
    isDev: true,
    forceEmitSourceMaps,
  });
  clientDebugConfig.entry = moduleEntry;

  const clientOptimizedConfig = createClientWebpackConfig(config, {
    isAnalyze,
    forceEmitSourceMaps,
    forceEmitStats,
  });
  clientOptimizedConfig.entry = moduleEntry;

  const serverConfig = createServerWebpackConfig(config, {
    isDev: true,
  });

  const { stats } = await runWebpack([
    clientDebugConfig,
    clientOptimizedConfig,
    serverConfig,
  ]);

  const [, clientOptimizedStats, serverStats] = stats;

  printBuildResult({ webpackStats: [clientOptimizedStats, serverStats] });
  printBundleSizeSuggestion();
};

export default build;
