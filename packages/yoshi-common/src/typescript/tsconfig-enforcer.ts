import path from 'path';
import os from 'os';
import chalk from 'chalk';
import isEqual from 'lodash/isEqual';
import { SRC_DIR, ES_DIR, TYPES_DIR } from 'yoshi-config/build/paths';
import { TsConfigJson } from 'type-fest';
import writeJson from '../write-json';
import ensureTypescriptInstalled from './ensure-typescript-installed';

type CustomTSConfigOption = {
  suggested?: any;
  value?: any;
  reason?: string;
};

type CustomCompilerOptions = {
  [P in keyof TsConfigJson.CompilerOptions]: CustomTSConfigOption;
};

const compilerOptions: CustomCompilerOptions = {
  // These are suggested values and will be set when not present in tsconfig.json
  lib: { suggested: ['dom', 'dom.iterable', 'esnext'] },
  skipLibCheck: { suggested: true },
  esModuleInterop: { suggested: true },
  allowSyntheticDefaultImports: { suggested: true },
  strict: { suggested: true },
  noEmit: { suggested: false },
  importHelpers: { suggested: true },
  jsx: { suggested: 'react' },
  forceConsistentCasingInFileNames: { suggested: true },
  noFallthroughCasesInSwitch: { suggested: true },

  // These values are required and cannot be changed by the user
  // Keep this in sync with babel transpilation and the webpack config
  target: {
    value: 'ES5',
    reason: 'this is needed to support IE 11',
  },
  module: {
    value: 'ESNext',
    reason: 'for import() and import/export',
  },
  rootDir: {
    value: SRC_DIR,
    reason: 'to match babel & webpack',
  },
  outDir: {
    value: ES_DIR,
    reason: 'to always output into `esm` directory',
  },
  declarationDir: {
    value: TYPES_DIR,
    reason: 'to always d.ts files into `types` directory',
  },
  declaration: {
    value: true,
    reason: 'to always emit declarations',
  },
  moduleResolution: {
    value: 'node',
    reason: 'to match webpack module resolution',
  },
  resolveJsonModule: { value: true, reason: 'to match webpack ts loader' },
};

export const enforceTsconfig = ({ cwd }: { cwd: string }) => {
  const ts = ensureTypescriptInstalled();
  const userTsconfigPath = path.join(cwd, `tsconfig.json`);

  const {
    config: userTsConfig,
    error,
  }: { config: TsConfigJson; error: Error } = ts.readConfigFile(
    userTsconfigPath,
    ts.sys.readFile,
  );

  if (error) {
    const formatDiagnosticHost = {
      getCanonicalFileName: (fileName: string) => fileName,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => os.EOL,
    };

    throw new Error(ts.formatDiagnostic(error, formatDiagnosticHost));
  }

  const messages = [];

  Object.keys(compilerOptions).forEach((option) => {
    // @ts-ignore
    const { value, suggested, reason }: CustomTSConfigOption = compilerOptions[
      option
    ];

    const coloredOption = chalk.cyan('compilerOptions.' + option);

    if (
      suggested != null &&
      // @ts-ignore
      userTsConfig.compilerOptions[option] === undefined
    ) {
      // @ts-ignore
      userTsConfig.compilerOptions[option] = suggested;

      messages.push(
        `${coloredOption} to be ${chalk.bold(
          'suggested',
        )} value: ${chalk.cyan.bold(suggested)} (this can be changed)`,
      );
      // @ts-ignore
    } else if (value && !isEqual(userTsConfig.compilerOptions[option], value)) {
      // @ts-ignore
      userTsConfig.compilerOptions[option] = value;

      messages.push(
        `${coloredOption} ${chalk.bold(
          value == null ? 'must not' : 'must',
        )} be ${value == null ? 'set' : chalk.cyan.bold(value)}` +
          (reason != null ? ` (${reason})` : ''),
      );
    }
  });

  if (userTsConfig.include == null) {
    userTsConfig.include = ['src'];
    messages.push(
      `${chalk.cyan('include')} should be ${chalk.cyan.bold('src')}`,
    );
  }

  if (messages.length > 0) {
    console.warn(
      chalk.bold(
        'The following changes are being made to your',
        chalk.cyan('tsconfig.json'),
        'file:',
      ),
    );
    messages.forEach((message) => {
      console.warn('  - ' + message);
    });
    console.warn();
    writeJson(userTsconfigPath, userTsConfig);
  }
};
