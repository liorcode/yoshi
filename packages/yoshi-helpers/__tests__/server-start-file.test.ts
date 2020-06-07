import * as path from 'path';
import * as queries from '../src/queries';
import { getServerStartFile } from '../src/server-start-file';

const mockFs = (files: Array<string>) =>
  jest
    .spyOn(queries, 'existsSync')
    .mockImplementation((arg) => files.includes(arg));

describe('GetServerStarFile', () => {
  const log = jest.spyOn(global.console, 'log').mockImplementation();

  beforeEach(() => {
    jest.mock('../src/queries');
    jest.spyOn(queries, 'isTypescriptProject').mockReturnValue(false);
    log.mockClear();
  });

  it('should return cli entry if one is used and notify about deprecation', () => {
    expect(getServerStartFile({ serverStartFileCLI: 'cliPath' })).toEqual(
      'cliPath',
    );

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Deprecation warning: --server and --entry-point',
      ),
    );
  });

  describe('Client Project', () => {
    it('should try to look for dev/server.ts file', () => {
      mockFs(
        ['dev/server.js', 'dev/server.ts', 'index.js'].map((p) =>
          path.resolve(p),
        ),
      );

      expect(getServerStartFile({})).toMatch('dev/server.ts');
    });

    it('should fall back to dev/server.js when dev/server.ts is missing', () => {
      mockFs(['dev/server.js'].map((p) => path.resolve(p)));

      expect(getServerStartFile({})).toMatch('dev/server.js');
    });
  });

  describe('Fullstack Project', () => {
    it('should try to look for index-dev.ts file', () => {
      mockFs(['index-dev.ts', 'index.ts'].map((p) => path.resolve(p)));

      expect(getServerStartFile({})).toMatch('index-dev.ts');
    });

    it('should fall back to index-dev.js file when index-dev.ts is missing', () => {
      mockFs(['index-dev.js'].map((p) => path.resolve(p)));

      expect(getServerStartFile({})).toMatch('index-dev.js');
    });

    it('should notify about deprecation when using index.js', () => {
      mockFs(['index.js'].map((p) => path.resolve(p)));

      getServerStartFile({});

      expect(log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Deprecation warning: index.js is not going to be started',
        ),
      );
    });

    it('should try to look for index.ts file when index-dev is missing', () => {
      mockFs(['index.ts'].map((p) => path.resolve(p)));

      expect(getServerStartFile({})).toMatch('index.ts');
    });

    it('should fall back to index.js file when index.ts is missing', () => {
      mockFs(['index.js'].map((p) => path.resolve(p)));

      expect(getServerStartFile({})).toMatch('index.js');
    });
  });

  describe('Missing entry / Legacy Project', () => {
    it('should throw up if no entry is found', () => {
      expect.assertions(1);

      jest.spyOn(queries, 'existsSync').mockReturnValue(false);

      try {
        getServerStartFile({});
      } catch (e) {
        expect(e.message).toEqual(
          expect.stringContaining('Entry point is missing!'),
        );
      }
    });
  });
});
