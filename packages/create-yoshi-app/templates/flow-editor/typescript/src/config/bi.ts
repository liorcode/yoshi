// This logger should be replaced with initSchema specific for your app
// Check out more: https://bo.wix.com/bi-catalog-webapp/#/sources/71/events/113/dev?artifactId=video.player.artifact.id

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (logger: any) {
  return {
    exampleBILog() {
      return null;
    },
  };
}

export interface IExampleBILogger {
  exampleBILog: () => void;
}
