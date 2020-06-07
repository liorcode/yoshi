import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import resolveCwd from 'resolve-cwd';
import readPkg from 'read-pkg';
import { isTruthy } from './utils/helpers';

const { version: yoshiVersion } = require('../package.json');

async function verifyDependenciesVersions() {
  const relatedPackages = [
    'jest-yoshi-preset',
    'yoshi-style-dependencies',
    'yoshi-angular-dependencies',
  ];

  const outdatedPackages = relatedPackages
    .map((packageName) => path.join(packageName, 'package.json'))
    .map((packageJsonPath) => resolveCwd.silent(packageJsonPath))
    .filter(isTruthy)
    .map((packageJsonFullPath) => {
      const pkg = require(packageJsonFullPath);

      return {
        packageJsonFullPath,
        packageName: pkg.name,
        packageVersion: pkg.version,
      };
    })
    .filter(({ packageVersion }) => {
      const diff = semver.diff(packageVersion, yoshiVersion);

      return diff && diff.includes('major');
    });

  if (outdatedPackages.length > 0) {
    console.log(chalk.red('Command failed.\n'));
    console.log(
      chalk.red(
        'Packages related to Yoshi should be installed with the same major version as Yoshi:\n',
      ),
    );
    outdatedPackages.forEach(
      ({ packageJsonFullPath, packageName, packageVersion }) => {
        console.log(
          `  - ${chalk.bold.red(
            `${packageName} (${packageVersion}) at ${packageJsonFullPath}`,
          )}`,
        );
      },
    );
    console.log(
      chalk.red(
        `Please install them in the version ${chalk.bold(yoshiVersion)}.\n`,
      ),
    );

    process.exit(1);
  }
}

async function verifyDevDependencies() {
  const devOnlyDependencies = ['yoshi'];
  const { dependencies } = readPkg.sync({ cwd: process.cwd() });
  if (dependencies) {
    const depNames = Object.keys(dependencies);
    devOnlyDependencies.forEach((devOnlyDep) => {
      if (depNames.includes(devOnlyDep)) {
        console.warn(
          chalk.yellow(
            `You have stated ${devOnlyDep} in 'dependencies', this may cause issues with consumers. please move ${devOnlyDep} to devDependencies`,
          ),
        );
      }
    });
  }
}

export default async () => {
  return Promise.all([
    await verifyDependenciesVersions(),
    await verifyDevDependencies(),
  ]);
};
