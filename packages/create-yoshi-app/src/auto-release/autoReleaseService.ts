import { axios } from '../api';

const getUrl = (path: string) => {
  return `https://bo.wix.com/_serverless/app-service-autorelease/${path}`;
};

type IAppConfig = Record<string, string>;

export const generateAppModel = (
  artifactId: string,
  appDefinitionId: string,
): Promise<IAppConfig> => {
  return axios
    .get<IAppConfig>(getUrl(`peek/${appDefinitionId}/${artifactId}`))
    .then((response) => {
      return response.data;
    });
};

export const updateAppModel = (
  artifactId: string,
  config: IAppConfig,
): Promise<{}> => {
  return axios
    .post(getUrl(`upsert/`), { artifactId, config: JSON.stringify(config) })
    .then(() => ({}));
};
