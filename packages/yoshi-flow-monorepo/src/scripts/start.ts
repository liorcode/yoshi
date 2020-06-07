import arg from 'arg';
import chalk from 'chalk';
import DevEnvironment from 'yoshi-common/build/dev-environment';
import { getServerStartFile } from 'yoshi-helpers/build/server-start-file';
import { stripOrganization } from 'yoshi-helpers/build/utils';
import { cliCommand } from '../bin/yoshi-monorepo';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
  createWebWorkerServerWebpackConfig,
  createSiteAssetsWebpackConfig,
} from '../webpack.config';
import { isSiteAssetsModule } from '../utils';

const start: cliCommand = async function (argv, rootConfig, { apps, libs }) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--server': String,
      '--url': String,
      '--production': Boolean,
      '--debug': Boolean,
      '--debug-brk': Boolean,

      // Aliases
      '--entry-point': '--server',
      '-e': '--server',
    },
    { argv },
  );

  if (args['--help']) {
    console.log(
      `
      Description
        Starts the application in development mode

      Usage
        $ yoshi-monorepo start

      Options
        --help, -h      Displays this message
        --server        (Deprecated!) The main file to start your server
        --url           Opens the browser with the supplied URL
        --production    Start using unminified production build
        --debug         Allow app-server debugging
        --debug-brk     Allow app-server debugging, process won't start until debugger will be attached
    `,
    );

    process.exit(0);
  }

  const [appName] = args._;

  if (!appName) {
    console.log(
      chalk.red(
        `Please choose which app to start by running \`npx yoshi start <appName>\``,
      ),
    );
    console.log();
    console.log(chalk.red('Aborting'));

    return process.exit(1);
  }

  const pkg = apps.find((pkg) => pkg.name === appName);

  if (!pkg) {
    console.log(
      `Could not find an app with the name of ${chalk.cyan(appName)}!\n`,
    );
    console.log('Apps found:');
    console.log(
      `  ${apps
        .map(({ name }) => name)
        .map(stripOrganization)
        .map((name) => chalk.cyanBright(name))
        .join(', ')}`,
    );
    console.log();
    console.log(chalk.red('Aborting...'));

    return process.exit(1);
  }

  const {
    '--server': serverStartFileCLI,
    '--url': url,
    // '--production': shouldRunAsProduction,
  } = args;

  let serverStartFile;
  try {
    serverStartFile = getServerStartFile({ serverStartFileCLI });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  let clientConfig;
  let siteAssetConfigNode;
  let siteAssetConfigWeb;

  if (isSiteAssetsModule(pkg)) {
    siteAssetConfigNode = createSiteAssetsWebpackConfig(
      rootConfig,
      pkg,
      libs,
      apps,
      {
        isDev: true,
        target: 'node',
      },
    );

    siteAssetConfigWeb = createSiteAssetsWebpackConfig(
      rootConfig,
      pkg,
      libs,
      apps,
      {
        isDev: true,
        target: 'web',
      },
    );
  } else {
    clientConfig = createClientWebpackConfig(rootConfig, pkg, libs, apps, {
      isDev: true,
      isHot: pkg.config.hmr as boolean,
      suricate: pkg.config.suricate,
    });
  }

  const serverConfig = createServerWebpackConfig(rootConfig, pkg, libs, apps, {
    isDev: true,
    isHot: true,
  });

  let webWorkerConfig;

  if (pkg.config.webWorkerEntry) {
    webWorkerConfig = createWebWorkerWebpackConfig(
      rootConfig,
      pkg,
      libs,
      apps,
      {
        isDev: true,
        isHot: true,
      },
    );
  }

  let webWorkerServerConfig;

  if (pkg.config.webWorkerServerEntry) {
    webWorkerServerConfig = createWebWorkerServerWebpackConfig(
      rootConfig,
      pkg,
      libs,
      apps,
      {
        isDev: true,
      },
    );
  }

  const devEnvironment = await DevEnvironment.create({
    webpackConfigs: [
      clientConfig,
      serverConfig,
      webWorkerConfig,
      webWorkerServerConfig,
      siteAssetConfigNode,
      siteAssetConfigWeb,
    ],
    https: pkg.config.servers.cdn.ssl,
    webpackDevServerPort: pkg.config.servers.cdn.port,
    appServerPort: pkg.config.servers.app.port,
    serverFilePath: serverStartFile,
    appName: pkg.config.name,
    suricate: pkg.config.suricate,
    enableClientHotUpdates: Boolean(pkg.config.hmr),
    startUrl: url || pkg.config.startUrl,
    cwd: pkg.location,
    createEjsTemplates: pkg.config.experimentalBuildHtml,
  });

  await devEnvironment.start();
};

export default start;
