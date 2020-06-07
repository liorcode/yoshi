const { environment } = require('./environment');

(async () => {
  const { bmApp, app } = await environment();
  // Order matters here!
  // Yoshi waits for 'app.start()', so it should be last
  await bmApp.start();
  await app.start();

  // We need to stop the testkit explicitly, since it's running in a different process
  const stopTestKit = () => {
    bmApp.stop();
    app.stop();
  };

  const signals = ['SIGINT', 'SIGUSR1', 'SIGUSR2'];

  signals.forEach((ev) => process.on(ev, stopTestKit));

  process.on('uncaughtException', stopTestKit);
  process.on('exit', stopTestKit);
})();
