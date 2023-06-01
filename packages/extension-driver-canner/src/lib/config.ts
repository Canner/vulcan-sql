export interface IEnvConfig {
  // indicates whether the extension is running in k8s
  isOnKubernetes?: boolean;
  // the host of the web service
  webServiceHost?: string;
}

export const createEnvConfig = (): IEnvConfig => {
  return {
    isOnKubernetes: Boolean(process.env['IS_ON_KUBERNETES']) || false,
    webServiceHost: process.env['WEB_SERVICE_HOST'],
  } as IEnvConfig;
};
