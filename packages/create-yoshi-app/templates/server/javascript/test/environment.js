// https://github.com/wix-platform/wix-node-platform/tree/master/bootstrap/wix-bootstrap-testkit
const testkit = require('@wix/wix-bootstrap-testkit');

const TestEnv = require('@wix/wix-test-env');

export const env = TestEnv.builder()
  .withMainAppConfigEmitter((builder) =>
    builder.val('base_domain', 'test.wix.com'),
  )
  .withMainApp(bootstrapServer())
  .build();

function bootstrapServer() {
  return testkit.server('./index', {
    env: {
      NEW_RELIC_LOG_LEVEL: 'warn',
      DEBUG: '',
    },
  });
}
