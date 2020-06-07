import { axios } from '../api';

const getUrl = (path: string): string => {
  return `https://www.wix.com/_api/app-service/v1/${path}`;
};

interface DevCenterResponseApp {
  appId: string;
  name: string;
  components: Array<DevCenterResponseComponent>;
}
export interface DevCenterApp {
  appId: string;
  components: Array<DevCenterComponent>;
  name: string;
}

interface DevCenterResponseComponent {
  compId: string;
  compName: string;
  compType: string;
}
export interface DevCenterComponent {
  id: string;
  type: string;
  name: string;
}

const formatComponent = (
  component: DevCenterResponseComponent,
): DevCenterComponent => ({
  name: component.compName,
  type: component.compType,
  id: component.compId,
});

export const createApp = ({
  name,
}: {
  name: string;
}): Promise<{ appId: string }> => {
  return axios
    .post<{ appId: string }>(getUrl('apps'), { name })
    .then((res) => res.data);
};

export const getApps = (): Promise<Array<{ appId: string }>> => {
  return axios
    .get<{ apps: Array<{ appId: string }> }>(getUrl('apps'))
    .then((res) => res.data.apps);
};

export const getApp = (appId: string): Promise<DevCenterApp> => {
  return axios
    .get<DevCenterResponseApp>(getUrl(`apps/${appId}`))
    .then(({ data }) => ({
      name: data.name,
      appId: data.appId,
      components: data.components.map(formatComponent),
    }));
};

export const createComponent = ({
  name,
  appId,
  type,
  data,
}: {
  name: string;
  appId: string;
  type: string;
  data?: Record<string, any>;
}): Promise<DevCenterComponent> => {
  return axios
    .post<{ compId: string }, { data: DevCenterResponseComponent }>(
      getUrl(`apps/${appId}/components`),
      {
        compName: name,
        compType: type,
        compData: data,
      },
    )
    .then((res) => ({
      id: res.data.compId,
      type,
      name,
    }));
};
