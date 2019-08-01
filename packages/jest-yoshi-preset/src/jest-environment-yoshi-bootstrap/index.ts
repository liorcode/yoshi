import NodeEnvironment from 'jest-environment-node';
import projectConfig from 'yoshi-config';
import { getEnvVars } from 'yoshi-helpers/bootstrap-utils';
import { getPort, appConfDir, appLogDir, appPersistentDir } from './constants';

class BootstrapEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    // create sensible defaults for bootstrap environment's process.env
    const appPort = getPort();

    const bootstrapEnvironmentParams = getEnvVars({
      port: appPort,
      appConfDir,
      appLogDir,
      appPersistentDir,
    });

    Object.assign(this.global.process.env, {
      PORT: appPort,
      ...bootstrapEnvironmentParams,
    });

    // errors from environment setup/teardown are caught silently
    try {
      if (this.global.__setup__) {
        await this.global.__setup__({
          globalObject: this.global,
          getPort,
          staticsUrl: projectConfig.servers.cdn.url,
          appConfDir,
          appLogDir,
          appPersistentDir,
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async teardown() {
    await super.teardown();

    try {
      if (this.global.__teardown__) {
        await this.global.__teardown__({
          globalObject: this.global,
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export = BootstrapEnvironment;