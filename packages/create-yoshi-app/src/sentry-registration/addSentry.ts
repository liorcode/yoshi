import path from 'path';
import fs from 'fs-extra';
import Listr from 'listr';

// We need to mock pkg.json in current directory, so add-sentry tool will find this file and use for configuration
const PKG_FILE_NAME = path.join(process.cwd(), 'package.json');
const addPackageJSONMock = () => {
  if (fs.existsSync(PKG_FILE_NAME)) {
    return false;
  }
  const tempPkgContent = JSON.stringify({
    devDependencies: {
      typescript: 'latest',
    },
  });
  fs.writeFileSync(PKG_FILE_NAME, tempPkgContent);
  return true;
};

const removePackageJSONMock = () => {
  fs.unlinkSync(PKG_FILE_NAME);
};

export const addSentry = ({
  teamName,
  projectName,
}: {
  teamName: string;
  projectName: string;
}) => {
  const packageMockWasAdded = addPackageJSONMock();
  const tasks = require('@wix/add-sentry/lib/tasks');
  const {
    configureSentry,
    handleError,
  } = require('@wix/add-sentry/lib/sentry');

  if (packageMockWasAdded) {
    removePackageJSONMock();
  }
  configureSentry();

  const tasksToExecute = [
    tasks.createSentryTeam(teamName),
    tasks.createSentryProject(projectName, teamName),
    tasks.getSentryProjectDSNKeys,
  ];

  const taskRunner = new Listr(tasksToExecute);

  return taskRunner
    .run()
    .then((ctx) => {
      tasks.printProjectLink(ctx);
      return ctx;
    })
    .catch(handleError);
};
