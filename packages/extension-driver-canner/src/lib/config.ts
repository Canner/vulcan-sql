export interface IEnvConfig {
  // the host of the trino server
  trinoEndpoint?: string;
  // indicates whether the extension is running in k8s
  isOnKubernetes?: boolean;
  // the host of the web service
  webServiceHost?: string;
}

export const createEnvConfig = (): IEnvConfig => {
  return {
    // when integrate with the Canner Enterprise, the vulcan server and canner server will be deployed in k8s in the same cluster
    // so the protocol and host might be different from the user provided.
    // e.g. the user provided host is "my-canner.web.com" with "https", but the actual host is "vulcan-server:3000" with protocol "http"
    isOnKubernetes: Boolean(process.env['IS_ON_KUBERNETES']) || false,
    webServiceHost: process.env['WEB_SERVICE_HOST'],
    trinoEndpoint: process.env['TRINO_ENDPOINT'],
  } as IEnvConfig;
};
