import net from 'net';
import http from 'http';
import path from 'path';
import { promisify } from 'util';
import retry from 'async-retry';
import waitPort from 'wait-port';
// @ts-ignore missing types
import terminate from 'terminate';
import execa from 'execa';
import chalk from 'chalk';
import boxen from 'boxen';
import { parastorageCdnUrl, localCdnUrl } from './constants';

const boxenOptions = { padding: 1, margin: 1, borderColor: 'magenta' };

export const terminateAsync = promisify(terminate);

export const tmpDirectory = path.join(__dirname, '../.tmp');

const makeRequest = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => resolve(rawData));
    });
  });
};

export const request = (url: string): Promise<string> => {
  if (url.startsWith(parastorageCdnUrl)) {
    return makeRequest(url.replace(parastorageCdnUrl, localCdnUrl));
  }

  return makeRequest(url);
};

export const matchCSS = async (
  chunkName: string,
  regexes: Array<RegExp>,
): Promise<void> => {
  const url = await page.$$eval(
    'link',
    (links, name) => {
      return links
        .filter((link: any): link is HTMLLinkElement => {
          return link.rel === 'stylesheet';
        })
        .map((link) => link.href)
        .find((href) => href.includes(name));
    },
    chunkName,
  );

  if (!url) {
    throw new Error(`Couldn't find stylesheet with the name "${chunkName}"`);
  }

  const content = (await request(url)).replace(/\s/g, '');

  for (const regex of regexes) {
    expect(content).toMatch(regex);
  }
};

export const matchJS = async (
  chunkName: string,
  regexes: Array<RegExp>,
): Promise<void> => {
  const content = await getChunkContentFromScriptTag(chunkName);

  for (const regex of regexes) {
    expect(content).toMatch(regex);
  }
};

export const notToMatchJS = async (
  chunkName: string,
  regexes: Array<RegExp>,
): Promise<void> => {
  const content = await getChunkContentFromScriptTag(chunkName);

  for (const regex of regexes) {
    expect(content).not.toMatch(regex);
  }
};

async function getChunkContentFromScriptTag(
  chunkName: string,
): Promise<string> {
  const url = await page.$$eval(
    'script',
    (scripts, name) => {
      return (scripts as Array<HTMLScriptElement>)
        .map((script) => script.src)
        .find((src) => src.includes(name));
    },
    chunkName,
  );

  if (!url) {
    throw new Error(`Couldn't find script with the name "${chunkName}"`);
  }

  const content = (await request(url)).replace(/\s/g, '');

  return content;
}

export async function waitForPort(
  port: number,
  { timeout = 20000 } = {},
): Promise<void> {
  const portFound = await waitPort({
    port,
    timeout,
    output: 'silent',
  });

  if (!portFound) {
    throw new Error(`Timed out waiting for "${port}".`);
  }
}

function isPortTaken(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once('error', (err) => {
        // @ts-ignore
        err.code !== 'EADDRINUSE' ? reject(err) : resolve(true);
      })
      .once('listening', () => {
        tester
          .once('close', () => {
            resolve(false);
          })
          .close();
      })
      .listen(port);
  });
}

export function waitForPortToFree(port: number): Promise<void> {
  return retry(async () => {
    expect(await isPortTaken(port)).toEqual(false);
  });
}

function throttleFunc(
  method: Function & { _tId?: NodeJS.Timeout },
  scope: any,
  ...args: Array<any>
) {
  method._tId && clearTimeout(method._tId);
  method._tId = setTimeout(function () {
    method.call(scope, ...args);
  }, 100);
}

export function waitForStdout(
  spawnedProcess: execa.ExecaChildProcess<string>,
  stringToMatch: string,
  options = { throttle: false },
): Promise<string> {
  let data = '';

  return new Promise((resolve) => {
    spawnedProcess.stdout &&
      spawnedProcess.stdout.on('data', function listener(buffer) {
        data += buffer.toString();
        if (buffer.toString().includes(stringToMatch)) {
          spawnedProcess.stdout && spawnedProcess.stdout.off('data', listener);
          if (options.throttle) {
            throttleFunc(resolve, null, data);
          } else {
            resolve(data);
          }
        }
      });
  });
}

export async function terminateAsyncSafe(pid: number): Promise<void> {
  try {
    await terminateAsync(pid);
  } catch (e) {
    if (!e.message.includes('kill ESRCH')) {
      throw new Error(e);
    }
  }
}

const templateRegex = /{%\w+%}/g;

export const replaceTemplates = (
  content: string,
  map: Record<string, string>,
): string =>
  content.replace(templateRegex, (match) => {
    const key = match.slice(2, -2);

    if (!map.hasOwnProperty(key)) {
      throw new Error(
        `the key ${key} suppose to be one of the following: ${Object.keys(
          map,
        )}`,
      );
    }

    return map[key];
  });

export const logMessage = (title: string, message: string) =>
  console.log(
    boxen(`${chalk.bold.bgBlue(title)} \n\n ${message}`, boxenOptions),
  );
