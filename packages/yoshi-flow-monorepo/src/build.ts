import path from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import chalk from 'chalk';
import globby from 'globby';
import { BUILD_DIR } from 'yoshi-config/build/paths';
import { PackageGraphNode } from './load-package-graph';

export default async function build(pkgs: Array<PackageGraphNode>) {
  const pkgsLocations = pkgs.map((pkg) => pkg.location);

  try {
    await execa(`npx tsc -b ${pkgsLocations.join(' ')}`, {
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.log(chalk.red('Failed to compile.\n'));
    console.error(error.stack);

    process.exit(1);
  }

  pkgs.forEach((pkg) => {
    const assets = globby.sync('src/**/*', {
      cwd: pkg.location,
      ignore: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.json', '**/*.snap'],
    });

    assets.forEach((assetPath) => {
      const dirname = path.join(pkg.location, BUILD_DIR, assetPath);

      fs.ensureDirSync(path.dirname(dirname));
      fs.copyFileSync(path.join(pkg.location, assetPath), dirname);
    });
  });
}
