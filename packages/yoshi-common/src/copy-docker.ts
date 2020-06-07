import path from 'path';
import fs from 'fs-extra';
import { DOCKER_FILE } from 'yoshi-config/build/paths';
import { Config } from 'yoshi-config/build/config';
import { replaceTemplates } from './utils/template-utils';

export default async function (config: Config, cwd = process.cwd()) {
  if (!config.yoshiServer) {
    return;
  }
  const projectDockerExists = fs.existsSync(path.resolve(cwd, DOCKER_FILE));
  if (!projectDockerExists) {
    const dockerFileName = path.resolve(
      __dirname,
      `./templates/${DOCKER_FILE}`,
    );

    const dockerDestinationPath = path.resolve(cwd, DOCKER_FILE);
    fs.copyFileSync(dockerFileName, dockerDestinationPath);
    const dockerFileContent = fs.readFileSync(dockerDestinationPath, 'utf-8');
    const author = config.pkgJson.author;
    let name: string;
    let email: string;
    if (typeof author === 'object') {
      name = author.name;
      email = author.email || '';
    } else {
      name = author || '';
      email = author || '';
    }
    const transformedContent = replaceTemplates(
      dockerFileContent,
      {
        authorEmail: email,
        authorName: name,
      },
      { graceful: false },
    );
    fs.outputFileSync(dockerDestinationPath, transformedContent);
  }
}
