import path from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import { PackageJson } from 'type-fest';

const getYoshiPackages = () => {
  const { stdout: rawPackages } = execa.sync('npx lerna list --all --json', {
    shell: true,
  });

  return JSON.parse(rawPackages);
};

export const getYoshiModulesList = () =>
  getYoshiPackages().map((x: { name: string }) => x.name);

export const symlinkModules = (repoDirectory: string) => {
  const parentDirectory = path.dirname(repoDirectory);

  // Link yoshi's node_modules to the parent directory of the tested module
  const yoshiNodeModulesDir = path.join(__dirname, '../../node_modules');
  const parentNodeModulesDir = path.join(parentDirectory, 'node_modules');

  const modulesList = getYoshiPackages().map(
    (x: { location: string }) => x.location,
  );

  // Those are the direct types that yoshi modules specify in their dependencies
  const typesToSymlink: Array<string> = [];

  modulesList.forEach((modulePath: string) => {
    const pkg: PackageJson = require(path.join(modulePath, 'package.json'));

    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach((depName: string) => {
        if (depName.startsWith('@types/')) {
          typesToSymlink.push(depName.replace('@types/', ''));
        }
      });
    }
  });

  fs.readdirSync(yoshiNodeModulesDir).forEach((nodeModule) => {
    // There is a clash between devDependency @types of yoshi and the @types
    // That we install in generated project
    // This happens only because we are symlinking everything (include the dev depenencies)
    // This strategy only symlinks that things that our direct module requires
    if (nodeModule === '@types') {
      fs.readdirSync(path.join(yoshiNodeModulesDir, nodeModule)).forEach(
        (typesModule) => {
          if (!typesToSymlink.includes(typesModule)) {
            return;
          }

          fs.ensureSymlinkSync(
            path.join(yoshiNodeModulesDir, nodeModule, typesModule),
            path.join(parentNodeModulesDir, nodeModule, typesModule),
          );
        },
      );

      return;
    }

    fs.ensureSymlinkSync(
      path.join(yoshiNodeModulesDir, nodeModule),
      path.join(parentNodeModulesDir, nodeModule),
    );
  });

  const symlinkPackage = (packageName: string) => {
    fs.removeSync(path.join(repoDirectory, 'node_modules', packageName));
    fs.ensureSymlinkSync(
      path.join(__dirname, '../../packages', packageName),
      path.join(repoDirectory, 'node_modules', packageName),
    );
  };

  const symlinkPackageBins = (packageDir: string) => {
    const { bin: bins = {} } = fs.readJSONSync(
      path.join(packageDir, 'package.json'),
    );

    Object.keys(bins).forEach((bin) =>
      fs.ensureSymlinkSync(
        path.join(packageDir, bins[bin]),
        path.join(repoDirectory, `node_modules/.bin/${bin}`),
      ),
    );
  };

  getYoshiPackages().forEach(
    ({ name, location }: { name: string; location: string }) => {
      const pkg = fs.readJsonSync(path.join(repoDirectory, 'package.json'));
      const { dependencies = {}, devDependencies = {} } = pkg;

      if (devDependencies[name] || dependencies[name]) {
        symlinkPackage(name);

        if (devDependencies[name]) {
          symlinkPackageBins(location);
        }
      }
    },
  );
};
